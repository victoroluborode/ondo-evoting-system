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

/**
 * Returns only the authenticated voter's constituency ballot.
 */
async function getBallot(req, res) {
  try {
    const { constituencyId } = req.params;
    const election = await getOpenElection();

    if (!election) {
      return res.status(403).json({
        error: "No election is currently open for voting",
      });
    }

    // Prevents a voter from manually requesting another constituency's ballot.
    if (parseInt(constituencyId, 10) !== req.user.constituencyId) {
      return res.status(403).json({
        error: "Access denied: You can only view your own constituency ballot",
      });
    }

    // Fetches only the candidate list for the approved constituency.
    const result = await pool.query(
      `SELECT id, name, party, photo_url
       FROM candidates
       WHERE constituency_id = $1
       ORDER BY party, name`,
      [constituencyId],
    );

    res.json({
      success: true,
      election: {
        id: election.id,
        name: election.name,
        status: election.status,
      },
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
