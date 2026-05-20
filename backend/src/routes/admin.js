const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role FROM election_admins WHERE email = $1",
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const admin = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      {
        type: "admin",
        adminId: admin.id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "4h" },
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.code,
              COUNT(DISTINCT v.id) AS registered_voters,
              COUNT(DISTINCT votes.voter_id) AS votes_cast,
              CASE
                WHEN COUNT(DISTINCT v.id) = 0 THEN 0
                ELSE ROUND((COUNT(DISTINCT votes.voter_id)::numeric / COUNT(DISTINCT v.id)::numeric) * 100, 2)
              END AS turnout_percentage
       FROM constituencies c
       LEFT JOIN voters v ON v.constituency_id = c.id
       LEFT JOIN votes ON votes.constituency_id = c.id
       GROUP BY c.id
       ORDER BY c.id`,
    );

    const totals = result.rows.reduce(
      (summary, row) => ({
        registeredVoters: summary.registeredVoters + Number(row.registered_voters),
        votesCast: summary.votesCast + Number(row.votes_cast),
      }),
      { registeredVoters: 0, votesCast: 0 },
    );

    res.json({
      success: true,
      summary: {
        ...totals,
        turnoutPercentage:
          totals.registeredVoters === 0
            ? 0
            : Number(((totals.votesCast / totals.registeredVoters) * 100).toFixed(2)),
      },
      constituencies: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        registeredVoters: Number(row.registered_voters),
        votesCast: Number(row.votes_cast),
        turnoutPercentage: Number(row.turnout_percentage),
      })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/results/:constituencyId", authenticateAdmin, async (req, res) => {
  try {
    const { constituencyId } = req.params;

    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.party,
              COALESCE(r.vote_count, 0) AS vote_count
       FROM candidates c
       LEFT JOIN results r
         ON r.candidate_id = c.id AND r.constituency_id = c.constituency_id
       WHERE c.constituency_id = $1
       ORDER BY COALESCE(r.vote_count, 0) DESC, c.party, c.name`,
      [constituencyId],
    );

    res.json({
      success: true,
      constituencyId: Number(constituencyId),
      results: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        party: row.party,
        voteCount: Number(row.vote_count),
      })),
    });
  } catch (error) {
    console.error("Admin results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
