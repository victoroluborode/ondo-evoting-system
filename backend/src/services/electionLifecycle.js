const pool = require("../config/database");

const ACTIVE_ELECTION_TYPE = "house_of_representatives";

/**
 * Returns the currently open House of Representatives election, if voting is active.
 */
async function getOpenElection(db = pool) {
  const result = await db.query(
    `SELECT *
     FROM elections
     WHERE election_type = $1
       AND status = 'open'
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at IS NULL OR ends_at > NOW())
     ORDER BY starts_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    [ACTIVE_ELECTION_TYPE],
  );

  return result.rows[0] || null;
}

/**
 * Returns an election that can still accept offline queued votes during sync.
 */
async function getElectionForOfflineSync(electionId, db = pool) {
  const result = await db.query(
    `SELECT *
     FROM elections
     WHERE id = $1
       AND election_type = $2
       AND status IN ('open', 'closed')
     LIMIT 1`,
    [electionId, ACTIVE_ELECTION_TYPE],
  );

  return result.rows[0] || null;
}

module.exports = {
  ACTIVE_ELECTION_TYPE,
  getElectionForOfflineSync,
  getOpenElection,
};
