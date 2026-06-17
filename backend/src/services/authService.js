const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const {
  MIN_PASSWORD_LENGTH,
  MAX_BIOMETRIC_ATTEMPTS,
  SUPPORTED_BIOMETRICS,
  createPartialVoterSession,
  getVoterForPartialSession,
  issueVotingToken,
  recordBiometricFailure,
  signVoterToken,
  validatePassword,
} = require("./authSessions");
const { sendPasswordResetEmail } = require("./email");
const {
  sendMockPasswordResetOtp,
  sendMockRegistrationSms,
} = require("./sms");
const { encrypt, sha256 } = require("../utils/encryption");

/**
 * Loads a VIN from the mock INEC voter register and checks whether it is eligible.
 */
async function getEligibleVinRecord(vin) {
  const result = await pool.query(
    `SELECT vin, full_name, lga_id, constituency_id, status
     FROM inec_voter_register
     WHERE vin = $1`,
    [String(vin).toUpperCase()],
  );

  if (result.rows.length === 0) {
    return { valid: false, error: "VIN was not found in the INEC voter register" };
  }

  const record = result.rows[0];

  if (record.status !== "eligible") {
    return { valid: false, error: "VIN is not eligible for registration" };
  }

  return { valid: true, record };
}

/**
 * Validates a VIN against the mock INEC voter register for officer registration checks.
 */
async function validateVin(req, res) {
  try {
    const { vin, lgaId, constituencyId } = req.body;

    if (!vin) {
      return res.status(400).json({ error: "VIN is required" });
    }

    const validation = await getEligibleVinRecord(vin);

    if (!validation.valid) {
      return res.status(404).json({ error: validation.error });
    }

    const record = validation.record;

    if (lgaId && Number(lgaId) !== Number(record.lga_id)) {
      return res.status(400).json({ error: "VIN does not belong to the selected LGA" });
    }

    if (constituencyId && Number(constituencyId) !== Number(record.constituency_id)) {
      return res.status(400).json({
        error: "VIN does not belong to the selected constituency",
      });
    }

    const existing = await pool.query(
      "SELECT id FROM voters WHERE vin = $1 LIMIT 1",
      [record.vin],
    );

    res.json({
      success: true,
      vin: record.vin,
      fullName: record.full_name,
      lgaId: record.lga_id,
      constituencyId: record.constituency_id,
      alreadyRegistered: existing.rows.length > 0,
    });
  } catch (error) {
    console.error("VIN validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Logs an INEC officer in and issues an officer-scoped JWT for registration work.
 */
async function officerLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role, status FROM election_officers WHERE email = $1",
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid officer credentials" });
    }

    const officer = result.rows[0];
    if (officer.status !== "active") {
      return res.status(403).json({ error: "Officer account is disabled" });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      officer.password_hash,
    );

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid officer credentials" });
    }

    const token = jwt.sign(
      {
        type: "officer",
        officerId: officer.id,
        role: officer.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      success: true,
      token,
      officer: {
        id: officer.id,
        fullName: officer.full_name,
        email: officer.email,
        role: officer.role,
      },
    });
  } catch (error) {
    console.error("Officer login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates a voter record from officer-entered details and encrypted biometric enrollment values.
 */
async function registerVoter(req, res) {
  try {
    const {
      vin,
      fullName,
      email,
      phoneNumber,
      password,
      constituencyId,
      lgaId,
      fingerprintTemplate,
      faceTemplate,
    } = req.body;

    if (!vin || !fullName || !password || !constituencyId || !lgaId) {
      return res.status(400).json({
        error:
          "VIN, full name, password, constituency, and LGA are required",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (!fingerprintTemplate || !faceTemplate) {
      return res.status(400).json({
        error: "Fingerprint and face biometrics are both required",
      });
    }

    const lgaCheck = await pool.query(
      "SELECT id FROM local_government_areas WHERE id = $1 AND constituency_id = $2",
      [lgaId, constituencyId],
    );

    if (lgaCheck.rows.length === 0) {
      return res.status(400).json({
        error: "Selected LGA does not belong to the selected constituency",
      });
    }

    const vinValidation = await getEligibleVinRecord(vin);

    if (!vinValidation.valid) {
      return res.status(400).json({ error: vinValidation.error });
    }

    const vinRecord = vinValidation.record;

    if (
      Number(vinRecord.lga_id) !== Number(lgaId) ||
      Number(vinRecord.constituency_id) !== Number(constituencyId)
    ) {
      return res.status(400).json({
        error: "VIN does not match the selected LGA and constituency",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const normalizedEmail = email ? String(email).toLowerCase() : null;
    const offlineAuthHash = sha256(
      `${vin}:${normalizedEmail || phoneNumber || "no-contact"}:${constituencyId}`,
    );

    // Biometric values are stored as enrollment artifacts for now.
    // Fingerprint and face matching are planned for a later project phase.
    const result = await pool.query(
      `INSERT INTO voters
        (vin, full_name, email, phone_number, password_hash, constituency_id, lga_id,
         fingerprint_template_encrypted, face_template_encrypted,
         fingerprint_enrolled, face_enrolled, biometric_enrolled_at,
         offline_auth_hash, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, TRUE, NOW(), $10, $11)
       RETURNING id, vin, full_name, email, phone_number, constituency_id, lga_id,
                 fingerprint_enrolled, face_enrolled, biometric_enrolled_at, created_at`,
      [
        vin.toUpperCase(),
        fullName,
        normalizedEmail,
        phoneNumber || null,
        passwordHash,
        constituencyId,
        lgaId,
        fingerprintTemplate ? encrypt(fingerprintTemplate) : null,
        faceTemplate ? encrypt(faceTemplate) : null,
        offlineAuthHash,
        req.user.officerId,
      ],
    );

    const voter = result.rows[0];

    await sendMockRegistrationSms({
      to: voter.phone_number,
      vin: voter.vin,
    });

    res.status(201).json({
      success: true,
      voter,
      offlineAuthHash,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A voter with this VIN or email already exists in the constituency",
      });
    }

    console.error("Voter registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Verifies a voter's VIN/email and password, then returns a short-lived partial session.
 */
async function voterLogin(req, res) {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = String(identifier || email || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        error: "VIN or email and password are required",
      });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();
    const normalizedVin = loginIdentifier.toUpperCase();

    const result = await pool.query(
      `SELECT id, vin, full_name, email, password_hash, constituency_id,
              fingerprint_enrolled, face_enrolled, has_voted, status, offline_auth_hash
       FROM voters
       WHERE email = $1 OR vin = $2`,
      [normalizedIdentifier, normalizedVin],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid voter credentials" });
    }

    const voter = result.rows[0];

    if (voter.status !== "registered") {
      return res.status(403).json({ error: "Voter account is not active" });
    }

    if (voter.has_voted) {
      return res.status(403).json({ error: "Voter has already voted" });
    }

    const passwordMatches = await bcrypt.compare(password, voter.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid voter credentials" });
    }

    const sessionToken = await createPartialVoterSession(voter);

    res.json({
      success: true,
      sessionToken,
      constituencyId: voter.constituency_id,
      fullName: voter.full_name,
      biometricEnrollment: {
        fingerprint: Boolean(voter.fingerprint_enrolled),
        face: Boolean(voter.face_enrolled),
      },
      message: "Proceed to biometric verification",
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("Password login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Converts a partial login session into a final voting JWT after biometric confirmation.
 */
async function verifyBiometric(req, res) {
  try {
    const { sessionToken, method, biometricVerified } = req.body;

    if (!sessionToken || !method) {
      return res.status(400).json({
        error: "Session token and biometric method are required",
      });
    }

    if (!SUPPORTED_BIOMETRICS.has(method)) {
      return res.status(400).json({ error: "Unsupported biometric method" });
    }

    const voter = await getVoterForPartialSession(sessionToken);

    const methodEnrollmentField =
      method === "fingerprint" ? "fingerprint_enrolled" : "face_enrolled";

    if (!voter[methodEnrollmentField]) {
      return res.status(403).json({
        error: `Voter has not enrolled ${method} biometric data`,
      });
    }

    if (biometricVerified !== true) {
      const failure = await recordBiometricFailure(voter);
      return res.status(401).json({
        error: "Biometric verification was not confirmed",
        attemptsRemaining: Math.max(0, MAX_BIOMETRIC_ATTEMPTS - failure.attempts),
        locked: failure.locked,
      });
    }

    const votingSession = await issueVotingToken(voter, method);

    res.json({
      success: true,
      token: votingSession.token,
      constituencyId: voter.constituency_id,
      fullName: voter.full_name,
      authMethod: method,
      message: "Voting authentication complete",
    });
  } catch (error) {
    console.error("Biometric verification error:", error);
    res.status(401).json({ error: error.message || "Biometric verification failed" });
  }
}

/**
 * Sends a mock SMS OTP for VIN-based password reset when the voter has a phone number.
 */
async function requestPasswordOtp(req, res) {
  try {
    const { vin } = req.body;
    let debugOtp;

    if (vin) {
      const voterResult = await pool.query(
        `SELECT id, constituency_id, phone_number
         FROM voters
         WHERE vin = $1 AND status = 'registered'
         LIMIT 1`,
        [String(vin).toUpperCase()],
      );

      if (voterResult.rows.length > 0 && voterResult.rows[0].phone_number) {
        const voter = voterResult.rows[0];
        const otp = String(crypto.randomInt(100000, 1000000));
        const tokenHash = sha256(`otp:${voter.id}:${otp}`);

        await pool.query(
          `INSERT INTO password_reset_tokens
            (voter_id, constituency_id, token_hash, expires_at)
           VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
          [voter.id, voter.constituency_id, tokenHash],
        );

        if (process.env.NODE_ENV !== "production") {
          console.log(`Password reset OTP for ${vin}: ${otp}`);
          debugOtp = otp;
        }

        await sendMockPasswordResetOtp({
          to: voter.phone_number,
          otp,
        });
      }
    }

    res.json({
      success: true,
      message: "If that VIN has a phone number, a reset OTP has been sent.",
      ...(debugOtp ? { debugOtp } : {}),
    });
  } catch (error) {
    console.error("Password OTP request error:", error);
    res.json({
      success: true,
      message: "If that VIN has a phone number, a reset OTP has been sent.",
    });
  }
}

/**
 * Completes VIN + OTP password reset and marks the OTP as used in one transaction.
 */
async function resetPasswordOtp(req, res) {
  const client = await pool.connect();

  try {
    const { vin, otp, password } = req.body;

    if (!vin || !otp || !password) {
      return res.status(400).json({ error: "VIN, OTP, and password are required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    await client.query("BEGIN");

    const voterResult = await client.query(
      `SELECT id, constituency_id
       FROM voters
       WHERE vin = $1 AND status = 'registered'
       LIMIT 1
       FOR UPDATE`,
      [String(vin).toUpperCase()],
    );

    if (voterResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const voter = voterResult.rows[0];
    const tokenHash = sha256(`otp:${voter.id}:${otp}`);
    const tokenResult = await client.query(
      `SELECT id
       FROM password_reset_tokens
       WHERE voter_id = $1
         AND constituency_id = $2
         AND token_hash = $3
         AND used_at IS NULL
         AND expires_at > NOW()
       FOR UPDATE`,
      [voter.id, voter.constituency_id, tokenHash],
    );

    if (tokenResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await client.query(
      `UPDATE voters
       SET password_hash = $1
       WHERE id = $2 AND constituency_id = $3`,
      [passwordHash, voter.id, voter.constituency_id],
    );

    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
      [tokenResult.rows[0].id],
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("OTP password reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Sends an email password reset link for voters who registered with an email address.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (email) {
      const voterResult = await pool.query(
        `SELECT id, constituency_id, vin
         FROM voters
         WHERE email = $1 AND status = 'registered'`,
        [String(email).toLowerCase()],
      );

      if (voterResult.rows.length > 0) {
        const voter = voterResult.rows[0];
        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = sha256(resetToken);

        await pool.query(
          `INSERT INTO password_reset_tokens
            (voter_id, constituency_id, token_hash, expires_at)
           VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
          [voter.id, voter.constituency_id, tokenHash],
        );

        if (process.env.NODE_ENV !== "production") {
          console.log(`Password reset token for ${email}: ${resetToken}`);
        }

        const resetBaseUrl =
          process.env.RESET_PASSWORD_BASE_URL || "http://localhost:8081/voter/reset-password";
        await sendPasswordResetEmail({
          to: String(email).toLowerCase(),
          resetUrl: `${resetBaseUrl}?token=${resetToken}`,
        });
      }
    }

    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  }
}

/**
 * Completes email-token password reset and invalidates the reset token after use.
 */
async function resetPassword(req, res) {
  const client = await pool.connect();

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    await client.query("BEGIN");

    const tokenHash = sha256(token);
    const tokenResult = await client.query(
      `SELECT id, voter_id, constituency_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash],
    );

    if (tokenResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const reset = tokenResult.rows[0];
    const passwordHash = await bcrypt.hash(password, 12);

    await client.query(
      `UPDATE voters
       SET password_hash = $1
       WHERE id = $2 AND constituency_id = $3`,
      [passwordHash, reset.voter_id, reset.constituency_id],
    );

    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
      [reset.id],
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Maintains backward-compatible VIN authentication for older seeded/demo clients.
 */
async function legacyAuthenticate(req, res) {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({ error: "VIN is required" });
    }

    const result = await pool.query(
      "SELECT id, vin, constituency_id, has_voted FROM voters WHERE vin = $1",
      [vin.toUpperCase()],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Voter not found" });
    }

    const voter = result.rows[0];

    if (voter.has_voted) {
      return res.status(403).json({ error: "Voter has already voted" });
    }

    const sessionTokenId = crypto.randomUUID();
    const votingTokenId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO voter_auth_sessions
        (voter_id, constituency_id, session_token_id, voting_token_id,
         auth_method, expires_at, biometric_verified_at)
       VALUES ($1, $2, $3, $4, 'fingerprint', NOW() + INTERVAL '30 minutes', NOW())`,
      [voter.id, voter.constituency_id, sessionTokenId, votingTokenId],
    );

    res.json({
      success: true,
      token: signVoterToken(voter, votingTokenId, "fingerprint"),
      constituencyId: voter.constituency_id,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  forgotPassword,
  legacyAuthenticate,
  officerLogin,
  registerVoter,
  requestPasswordOtp,
  resetPassword,
  resetPasswordOtp,
  validateVin,
  verifyBiometric,
  voterLogin,
};
