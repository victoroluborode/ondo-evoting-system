const jwt = require("jsonwebtoken");
const pool = require("../config/database");

/**
 * Verifies a Bearer JWT and optionally enforces the expected token type.
 */
function verifyToken(req, res, next, expectedType) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    if (expectedType && user.type !== expectedType) {
      return res.status(403).json({ error: "Invalid token scope" });
    }

    req.user = user; // { voterId, constituencyId }
    next();
  });
}

/**
 * Authenticates a voter JWT and ensures the voting session has not been invalidated.
 */
function authenticateToken(req, res, next) {
  verifyToken(req, res, async () => {
    try {
      if (!req.user.tokenId) {
        return res.status(403).json({ error: "Invalid voting token" });
      }

      const result = await pool.query(
        `SELECT voting_token_invalidated_at
         FROM voter_auth_sessions
         WHERE voting_token_id = $1 AND voter_id = $2 AND constituency_id = $3`,
        [req.user.tokenId, req.user.voterId, req.user.constituencyId],
      );

      if (
        result.rows.length === 0 ||
        result.rows[0].voting_token_invalidated_at
      ) {
        return res.status(403).json({ error: "Voting token has been invalidated" });
      }

      next();
    } catch (error) {
      console.error("Voting token session check error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }, "voter");
}

/**
 * Authenticates an officer JWT and confirms the officer account is still active.
 */
function authenticateOfficer(req, res, next) {
  verifyToken(req, res, async () => {
    try {
      const result = await pool.query(
        "SELECT status FROM election_officers WHERE id = $1",
        [req.user.officerId],
      );

      if (result.rows.length === 0 || result.rows[0].status !== "active") {
        return res.status(403).json({ error: "Officer account is disabled" });
      }

      next();
    } catch (error) {
      console.error("Officer token status check error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }, "officer");
}

/**
 * Authenticates a senior admin JWT.
 */
function authenticateAdmin(req, res, next) {
  verifyToken(req, res, next, "admin");
}

module.exports = { authenticateToken, authenticateOfficer, authenticateAdmin };
