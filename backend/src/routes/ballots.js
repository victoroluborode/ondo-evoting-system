const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getBallot, listConstituencies, getElectionStatus } = require("../services/ballotService");

const router = express.Router();

/**
 * GET /api/ballots/constituencies
 * Returns constituencies and LGAs for registration screens.
 */
router.get("/constituencies", listConstituencies);

/**
 * GET /api/ballots/election-status
 * Returns the current election status.
 */
router.get("/election-status", getElectionStatus);

/**
 * GET /api/ballots/:constituencyId
 * Returns candidates for the authenticated voter's constituency.
 */
router.get("/:constituencyId", authenticateToken, getBallot);


module.exports = router;
