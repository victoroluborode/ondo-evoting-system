const express = require("express");
const pool = require("../config/database");
const { authenticateToken, authenticateAdmin } = require("../middleware/auth");
const { encryptJson } = require("../utils/encryption");
const { createReceiptCode, hashVotePayload } = require("../utils/hashing");

const router = express.Router();

/**
 * POST /api/votes
 * Records a vote
 */
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { candidateId, deviceId } = req.body;
    const { voterId, constituencyId, vin, authMethod, tokenId } = req.user;

    if (!candidateId) {
      return res.status(400).json({ error: "Candidate ID is required" });
    }

    await client.query("BEGIN");

    // Check if voter has already voted
    const voterCheck = await client.query(
      `SELECT has_voted, status
       FROM voters
       WHERE id = $1 AND constituency_id = $2
       FOR UPDATE`,
      [voterId, constituencyId],
    );

    if (voterCheck.rows.length === 0 || voterCheck.rows[0].status !== "registered") {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Voter account is not active" });
    }

    if (voterCheck.rows[0].has_voted) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You have already voted" });
    }

    // Verify candidate belongs to voter's constituency
    const candidateCheck = await client.query(
      "SELECT id FROM candidates WHERE id = $1 AND constituency_id = $2",
      [candidateId, constituencyId],
    );

    if (candidateCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error:
          "Invalid candidate: Candidate does not belong to your constituency",
      });
    }

    const timestamp = new Date().toISOString();
    const votePayload = {
      voterId,
      candidateId,
      constituencyId,
      timestamp,
      deviceId: deviceId || null,
    };
    const encryptedPayload = encryptJson(votePayload);
    const integrityHash = hashVotePayload(votePayload);
    const receiptCode = createReceiptCode(
      voterId,
      candidateId,
      constituencyId,
      timestamp,
    );

    // Insert vote
    await client.query(
      `INSERT INTO votes
        (voter_id, candidate_id, constituency_id, encrypted_payload,
         integrity_hash, receipt_code, biometric_method, device_id, token_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        voterId,
        candidateId,
        constituencyId,
        encryptedPayload,
        integrityHash,
        receiptCode,
        authMethod,
        deviceId || null,
        tokenId,
        timestamp,
      ],
    );

    // Mark voter as having voted
    await client.query(
      "UPDATE voters SET has_voted = TRUE WHERE id = $1 AND constituency_id = $2",
      [voterId, constituencyId],
    );

    await client.query(
      `UPDATE voter_auth_sessions
       SET voting_token_invalidated_at = NOW()
       WHERE voting_token_id = $1 AND voter_id = $2 AND constituency_id = $3`,
      [tokenId, voterId, constituencyId],
    );

    // Update results table
    await client.query(
      `INSERT INTO results (constituency_id, candidate_id, vote_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (constituency_id, candidate_id)
       DO UPDATE SET vote_count = results.vote_count + 1, last_updated = NOW()`,
      [constituencyId, candidateId],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Vote recorded successfully",
      receiptCode,
      integrityHash,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Vote submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

/**
 * GET /api/votes/results/:constituencyId
 * Returns vote counts for a constituency (admin only for now)
 */
router.get("/results/:constituencyId", authenticateAdmin, async (req, res) => {
  try {
    const { constituencyId } = req.params;

    const result = await pool.query(
      `SELECT c.name, c.party, r.vote_count
       FROM results r
       JOIN candidates c ON r.candidate_id = c.id AND c.constituency_id = r.constituency_id
       WHERE r.constituency_id = $1
       ORDER BY r.vote_count DESC`,
      [constituencyId],
    );

    res.json({
      success: true,
      constituencyId: parseInt(constituencyId),
      results: result.rows,
    });
  } catch (error) {
    console.error("Results fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
