const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const SUPPORTED_BIOMETRICS = new Set(["fingerprint", "face"]);
const MIN_PASSWORD_LENGTH = 8;
const MAX_BIOMETRIC_ATTEMPTS = 3;

/**
 * Signs the temporary token used after password login but before biometric verification.
 */
function signPartialSession(voter, sessionTokenId) {
  return jwt.sign(
    {
      type: "partial_voter",
      sessionTokenId,
      voterId: voter.id,
      constituencyId: voter.constituency_id,
      vin: voter.vin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );
}

/**
 * Signs the final voter token that can fetch ballots and submit one vote.
 */
function signVoterToken(voter, tokenId, authMethod) {
  return jwt.sign(
    {
      type: "voter",
      tokenId,
      voterId: voter.id,
      constituencyId: voter.constituency_id,
      vin: voter.vin,
      authMethod,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30m" },
  );
}

/**
 * Verifies that a submitted token is a valid partial voter session token.
 */
function verifyPartialSessionToken(sessionToken) {
  const payload = jwt.verify(sessionToken, process.env.JWT_SECRET);

  if (payload.type !== "partial_voter") {
    throw new Error("Invalid session token scope");
  }

  return payload;
}

/**
 * Checks the current minimum password rule used during registration and reset.
 */
function validatePassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

/**
 * Stores a 5-minute partial voter session and returns the signed session token.
 */
async function createPartialVoterSession(voter) {
  const sessionTokenId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO voter_auth_sessions
      (voter_id, constituency_id, session_token_id, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
    [voter.id, voter.constituency_id, sessionTokenId],
  );

  return signPartialSession(voter, sessionTokenId);
}

/**
 * Loads the voter tied to a partial session and rejects expired, reused, or ineligible sessions.
 */
async function getVoterForPartialSession(sessionToken) {
  const session = verifyPartialSessionToken(sessionToken);
  const result = await pool.query(
    `SELECT s.id AS auth_session_id,
            s.expires_at,
            s.biometric_verified_at,
            s.biometric_attempt_count,
            s.biometric_locked_at,
            v.id,
            v.vin,
            v.full_name,
            v.email,
            v.password_hash,
            v.constituency_id,
            v.fingerprint_enrolled,
            v.face_enrolled,
            v.has_voted,
            v.status,
            v.offline_auth_hash
     FROM voter_auth_sessions s
     JOIN voters v ON v.id = s.voter_id AND v.constituency_id = s.constituency_id
     WHERE s.session_token_id = $1
       AND s.voter_id = $2
       AND s.constituency_id = $3`,
    [session.sessionTokenId, session.voterId, session.constituencyId],
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid or expired session");
  }

  const voter = result.rows[0];

  if (new Date(voter.expires_at).getTime() < Date.now()) {
    throw new Error("Session token has expired");
  }

  if (voter.biometric_verified_at) {
    throw new Error("Session has already been used");
  }

  if (voter.biometric_locked_at) {
    throw new Error("Biometric verification is locked for this session");
  }

  if (voter.status !== "registered" || voter.has_voted) {
    throw new Error("Voter is not eligible to continue");
  }

  return voter;
}

/**
 * Records a failed biometric attempt and locks the partial session after too many failures.
 */
async function recordBiometricFailure(voter) {
  const result = await pool.query(
    `UPDATE voter_auth_sessions
     SET biometric_attempt_count = biometric_attempt_count + 1,
         last_biometric_attempt_at = NOW(),
         biometric_locked_at = CASE
           WHEN biometric_attempt_count + 1 >= $1 THEN NOW()
           ELSE biometric_locked_at
         END
     WHERE id = $2
     RETURNING biometric_attempt_count, biometric_locked_at`,
    [MAX_BIOMETRIC_ATTEMPTS, voter.auth_session_id],
  );

  const attempt = result.rows[0];
  return {
    attempts: Number(attempt.biometric_attempt_count),
    locked: Boolean(attempt.biometric_locked_at),
  };
}

/**
 * Marks biometric verification complete and returns the final voting JWT.
 */
async function issueVotingToken(voter, method) {
  const votingTokenId = crypto.randomUUID();

  await pool.query(
    `UPDATE voter_auth_sessions
     SET voting_token_id = $1,
         auth_method = $2,
         last_biometric_attempt_at = NOW(),
         biometric_verified_at = NOW()
     WHERE id = $3`,
    [votingTokenId, method, voter.auth_session_id],
  );

  return {
    token: signVoterToken(voter, votingTokenId, method),
    tokenId: votingTokenId,
  };
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  MAX_BIOMETRIC_ATTEMPTS,
  SUPPORTED_BIOMETRICS,
  createPartialVoterSession,
  getVoterForPartialSession,
  issueVotingToken,
  recordBiometricFailure,
  signVoterToken,
  validatePassword,
};
