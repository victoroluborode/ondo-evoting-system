const pool = require("../config/database");
const { getOpenElection } = require("./electionLifecycle");

/**
 * Returns all constituencies with their LGAs for officer registration screens.
 */
async function listConstituencies(req, res) {
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
}

// ballotService.js — getBallot, add a vote-status check before returning candidates
async function getBallot(req, res) {
  try {
    const { constituencyId } = req.params;
    const election = await getOpenElection();

    if (!election) {
      return res.status(403).json({ error: "No election is currently open for voting" });
    }

    if (parseInt(constituencyId, 10) !== req.user.constituencyId) {
      return res.status(403).json({
        error: "Access denied: You can only view your own constituency ballot",
      });
    }

    // Re-check vote status fresh, here — not just at login — since an offline
    // sync may have recorded this voter's vote at any point after they logged in.
    const existingVote = await pool.query(
      `SELECT receipt_code FROM votes WHERE voter_id = $1 AND constituency_id = $2 AND election_id = $3 LIMIT 1`,
      [req.user.voterId, constituencyId, election.id],
    );

    if (existingVote.rows.length > 0) {
      return res.status(403).json({
        error: "You have already voted in this election",
        alreadyVoted: true,
        receiptCode: existingVote.rows[0].receipt_code,
      });
    }

    const result = await pool.query(
      `SELECT id, name, party, photo_url FROM candidates WHERE constituency_id = $1 ORDER BY party, name`,
      [constituencyId],
    );

    res.json({
      success: true,
      election: { id: election.id, name: election.name, status: election.status },
      constituencyId: parseInt(constituencyId, 10),
      candidates: result.rows,
    });
  } catch (error) {
    console.error("Ballot fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Returns whether a House of Representatives election is currently open for voting.
 * Used by voter-facing screens to avoid sending someone through accreditation
 * only to discover voting isn't open yet.
 */
async function getElectionStatus(req, res) {
  try {
    const election = await getOpenElection();
    res.json({
      success: true,
      isOpen: Boolean(election),
      election: election ? { id: election.id, name: election.name } : null,
    });
  } catch (error) {
    console.error("Election status fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getBallot, listConstituencies, getElectionStatus };
