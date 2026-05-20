const express = require("express");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/ballots/constituencies
 * Returns constituencies and LGAs for registration screens.
 */
router.get("/constituencies", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.code,
              COALESCE(
                json_agg(
                  json_build_object('id', l.id, 'name', l.name)
                  ORDER BY l.name
                ) FILTER (WHERE l.id IS NOT NULL),
                '[]'
              ) AS lgas
       FROM constituencies c
       LEFT JOIN local_government_areas l ON l.constituency_id = c.id
       GROUP BY c.id
       ORDER BY c.id`,
    );

    res.json({ success: true, constituencies: result.rows });
  } catch (error) {
    console.error("Constituency fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/ballots/:constituencyId
 * Returns candidates for a specific constituency
 */
router.get("/:constituencyId", authenticateToken, async (req, res) => {
  try {
    const { constituencyId } = req.params;

    // Verify voter belongs to this constituency
    if (parseInt(constituencyId) !== req.user.constituencyId) {
      return res.status(403).json({
        error: "Access denied: You can only view your own constituency ballot",
      });
    }

    // Fetch candidates for this constituency
    const result = await pool.query(
      `SELECT id, name, party, photo_url
       FROM candidates
       WHERE constituency_id = $1
       ORDER BY party, name`,
      [constituencyId],
    );

    res.json({
      success: true,
      constituencyId: parseInt(constituencyId),
      candidates: result.rows,
    });
  } catch (error) {
    console.error("Ballot fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
