const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { sha256 } = require("./encryption");

const MAX_OTP_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 5;

function signPendingAdminToken(adminId, sessionTokenId) {
  return jwt.sign(
    { type: "pending_admin", adminId, sessionTokenId },
    process.env.JWT_SECRET,
    { expiresIn: `${OTP_EXPIRY_MINUTES}m` },
  );
}

function verifyPendingAdminToken(pendingToken) {
  const payload = jwt.verify(pendingToken, process.env.JWT_SECRET);
  if (payload.type !== "pending_admin") {
    throw new Error("Invalid session token scope");
  }
  return payload;
}

/**
 * Generates and stores a hashed OTP for an admin login, returning the plaintext
 * OTP (for sending) and a pending token the admin must submit alongside it.
 */
async function createAdminOtpSession(adminId) {
  const sessionTokenId = crypto.randomUUID();
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = sha256(`admin-otp:${sessionTokenId}:${otp}`);

  await pool.query(
    `INSERT INTO admin_otp_sessions (admin_id, session_token_id, otp_hash, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '${OTP_EXPIRY_MINUTES} minutes')`,
    [adminId, sessionTokenId, otpHash],
  );

  return {
    otp,
    pendingToken: signPendingAdminToken(adminId, sessionTokenId),
  };
}

/**
 * Loads and validates an OTP session, rejecting expired, locked, or already-used ones.
 */
async function getOtpSession(pendingToken) {
  const payload = verifyPendingAdminToken(pendingToken);

  const result = await pool.query(
    `SELECT id, admin_id, otp_hash, attempt_count, locked_at, expires_at, verified_at
     FROM admin_otp_sessions
     WHERE session_token_id = $1 AND admin_id = $2`,
    [payload.sessionTokenId, payload.adminId],
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid or expired session");
  }

  const session = result.rows[0];

  if (new Date(session.expires_at).getTime() < Date.now()) {
    throw new Error("OTP has expired. Please sign in again.");
  }

  if (session.verified_at) {
    throw new Error("This OTP has already been used");
  }

  if (session.locked_at) {
    throw new Error("Too many incorrect attempts. Please sign in again.");
  }

  return session;
}

async function recordOtpFailure(sessionId) {
  const result = await pool.query(
    `UPDATE admin_otp_sessions
     SET attempt_count = attempt_count + 1,
         locked_at = CASE WHEN attempt_count + 1 >= $1 THEN NOW() ELSE locked_at END
     WHERE id = $2
     RETURNING attempt_count, locked_at`,
    [MAX_OTP_ATTEMPTS, sessionId],
  );

  const row = result.rows[0];
  return {
    attempts: Number(row.attempt_count),
    locked: Boolean(row.locked_at),
  };
}

async function markOtpVerified(sessionId) {
  await pool.query(
    "UPDATE admin_otp_sessions SET verified_at = NOW() WHERE id = $1",
    [sessionId],
  );
}

module.exports = {
  MAX_OTP_ATTEMPTS,
  createAdminOtpSession,
  getOtpSession,
  recordOtpFailure,
  markOtpVerified,
};
