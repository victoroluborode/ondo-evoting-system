const express = require("express");
const { authenticateToken, authenticateAdmin } = require("../middleware/auth");
const {
  castVote,
  getConstituencyResults,
  getOfflineVotingPackage,
  syncOfflineVotes,
} = require("../services/voteService");

const router = express.Router();

/**
 * POST /api/votes
 * Records one encrypted vote and permanently invalidates the voter's voting token.
 */
router.post("/", authenticateToken, castVote);

/**
 * GET /api/votes/offline-package/:constituencyId
 * Downloads a signed offline voting package while an election is open.
 */
router.get(
  "/offline-package/:constituencyId",
  authenticateToken,
  getOfflineVotingPackage,
);

/**
 * POST /api/votes/sync
 * Reconciles queued offline votes when connectivity returns.
 */
router.post("/sync", syncOfflineVotes);

/**
 * GET /api/votes/results/:constituencyId
 * Returns vote counts for a constituency; admin-only until public results are enabled.
 */
router.get("/results/:constituencyId", authenticateAdmin, getConstituencyResults);

module.exports = router;
