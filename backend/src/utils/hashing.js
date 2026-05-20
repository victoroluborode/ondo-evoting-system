const crypto = require("crypto");

/**
 * Create SHA-256 hash for vote integrity
 */
function hashVote(voterId, candidateId, timestamp) {
  const data = `${voterId}:${candidateId}:${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hashVotePayload(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function createReceiptCode(voterId, candidateId, constituencyId, timestamp) {
  const salt = crypto.randomBytes(16).toString("hex");
  const data = `${voterId}:${candidateId}:${constituencyId}:${timestamp}:${salt}`;

  return crypto.createHash("sha256").update(data).digest("hex");
}

module.exports = { hashVote, hashVotePayload, createReceiptCode };
