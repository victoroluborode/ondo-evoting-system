const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { authenticateOfficer } = require("../middleware/auth");
const { encrypt, sha256 } = require("../utils/encryption");
const {
  MIN_PASSWORD_LENGTH,
  SUPPORTED_BIOMETRICS,
  createPartialVoterSession,
  getVoterForPartialSession,
  issueVotingToken,
  signVoterToken,
  validatePassword,
} = require("../services/authSessions");
const { sendPasswordResetEmail } = require("../services/email");
const {
  sendMockPasswordResetOtp,
  sendMockRegistrationSms,
} = require("../services/sms");

const router = express.Router();

/**
 * POST /api/auth/officers/login
 * Authenticates an INEC officer for voter registration work.
 */
router.post("/officers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role FROM election_officers WHERE email = $1",
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid officer credentials" });
    }

    const officer = result.rows[0];
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
});

/**
 * POST /api/auth/register-voter
 * Registers a voter account and encrypted biometric templates.
 */
router.post("/register-voter", authenticateOfficer, async (req, res) => {
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

    const passwordHash = await bcrypt.hash(password, 12);
    const normalizedEmail = email ? String(email).toLowerCase() : null;
    const offlineAuthHash = sha256(
      `${vin}:${normalizedEmail || phoneNumber || "no-contact"}:${constituencyId}`,
    );

    // Biometric values are stored as enrollment artifacts for now.
    // Fingerprint and face matching are planned for a later project phase;
    // this backend currently keeps the API flow ready without doing matching.
    const result = await pool.query(
      `INSERT INTO voters
        (vin, full_name, email, phone_number, password_hash, constituency_id, lga_id,
         fingerprint_template_encrypted, face_template_encrypted,
         offline_auth_hash, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, vin, full_name, email, phone_number, constituency_id, lga_id, created_at`,
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
});

/**
 * POST /api/auth/login
 * Password-verifies a voter by VIN or email and returns a 5-minute partial session token.
 */
router.post("/login", async (req, res) => {
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
              has_voted, status, offline_auth_hash
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
      message: "Proceed to biometric verification",
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("Password login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/verify-biometric
 * Upgrades a partial session into the final voting JWT.
 *
 * Important boundary:
 * Fingerprint and face matching are deferred to a later project phase.
 * For now, tests and prototype clients submit `biometricVerified: true`
 * after the biometric step is considered successful.
 * This route only validates the staged session, records the selected method,
 * and issues the final voting JWT.
 */
router.post("/verify-biometric", async (req, res) => {
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

    if (biometricVerified !== true) {
      return res.status(401).json({
        error: "Biometric verification was not confirmed",
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
});

/**
 * POST /api/auth/request-password-otp
 * Sends a mock SMS OTP for voters who reset password with VIN + phone number.
 */
router.post("/request-password-otp", async (req, res) => {
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
});

/**
 * POST /api/auth/reset-password-otp
 * Completes password reset using VIN + SMS OTP.
 */
router.post("/reset-password-otp", async (req, res) => {
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
});

/**
 * POST /api/auth/forgot-password
 * Generic reset response to avoid account enumeration.
 */
router.post("/forgot-password", async (req, res) => {
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
});

/**
 * POST /api/auth/reset-password
 * Completes a password reset using a one-time reset token.
 */
router.post("/reset-password", async (req, res) => {
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
});

/**
 * POST /api/auth/voters/login
 * Backward-compatible alias for the new password-only login step.
 */
router.post("/voters/login", async (req, res) => {
  req.url = "/login";
  router.handle(req, res);
});

/**
 * POST /api/auth/authenticate
 * Backward-compatible VIN lookup for seeded roll checks.
 */
router.post("/authenticate", async (req, res) => {
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
});

module.exports = router;
