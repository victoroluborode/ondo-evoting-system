// services/electionScheduler.js — new
const pool = require("../config/database");
const { recordAuditLog } = require("../utils/auditLog");

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute

async function autoCloseExpiredElections() {
  try {
    const result = await pool.query(
      `UPDATE elections
       SET status = 'closed', updated_at = NOW()
       WHERE status = 'open'
         AND ends_at IS NOT NULL
         AND ends_at <= NOW()
       RETURNING id, name`,
    );

    for (const election of result.rows) {
      console.log(`Auto-closed expired election: ${election.name}`);
      recordAuditLog({
        actorType: "system",
        actorId: null,
        action: "election.auto_closed",
        targetSummary: election.name,
        metadata: {
          electionId: election.id,
          reason: "scheduled end time reached",
        },
      });
    }
  } catch (error) {
    console.error("Auto-close election check failed:", error);
  }
}

function startElectionScheduler() {
  setInterval(autoCloseExpiredElections, CHECK_INTERVAL_MS);
  autoCloseExpiredElections(); // run once immediately on boot too
}

module.exports = { startElectionScheduler };
