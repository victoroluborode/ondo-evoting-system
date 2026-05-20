const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const SUPPORTED_BIOMETRICS = new Set(["fingerprint", "face"]);
const MIN_PASSWORD_LENGTH = 8;

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

function verifyPartialSessionToken(sessionToken) {
  const payload = jwt.verify(sessionToken, process.env.JWT_SECRET);

  if (payload.type !== "partial_voter") {
    throw new Error("Invalid session token scope");
  }

  return payload;
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

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

async function getVoterForPartialSession(sessionToken) {
  const session = verifyPartialSessionToken(sessionToken);
  const result = await pool.query(
    `SELECT s.id AS auth_session_id,
            s.expires_at,
            s.biometric_verified_at,
            v.id,
            v.vin,
            v.full_name,
            v.email,
            v.password_hash,
            v.constituency_id,
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

  if (voter.status !== "registered" || voter.has_voted) {
    throw new Error("Voter is not eligible to continue");
  }

  return voter;
}

async function issueVotingToken(voter, method) {
  const votingTokenId = crypto.randomUUID();

  await pool.query(
    `UPDATE voter_auth_sessions
     SET voting_token_id = $1,
         auth_method = $2,
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
  SUPPORTED_BIOMETRICS,
  createPartialVoterSession,
  getVoterForPartialSession,
  issueVotingToken,
  signVoterToken,
  validatePassword,
};
