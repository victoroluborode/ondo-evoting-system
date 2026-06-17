const crypto = require("crypto");

/**
 * Creates the legacy SHA-256 vote hash from voter, candidate, and timestamp values.
 */
function hashVote(voterId, candidateId, timestamp) {
  const data = `${voterId}:${candidateId}:${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Creates a deterministic SHA-256 hash of the full vote payload for integrity checking.
 */
function hashVotePayload(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

/**
 * Creates a non-revealing receipt code that proves a vote was recorded without exposing choice.
 */
function createReceiptCode(voterId, candidateId, constituencyId, timestamp) {
  const salt = crypto.randomBytes(16).toString("hex");
  const data = `${voterId}:${candidateId}:${constituencyId}:${timestamp}:${salt}`;

  return crypto.createHash("sha256").update(data).digest("hex");
}

module.exports = { hashVote, hashVotePayload, createReceiptCode };
