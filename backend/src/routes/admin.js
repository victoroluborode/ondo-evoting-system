const express = require("express");
const { authenticateAdmin } = require("../middleware/auth");
const {
  createCandidate,
  createElection,
  createLga,
  createOfficer,
  createParty,
  deleteCandidate,
  deleteElection,
  deleteLga,
  deleteParty,
  disableOfficer,
  getDashboard,
  getResults,
  listCandidates,
  listConstituencies,
  listElections,
  listLgas,
  listOfficers,
  listParties,
  login,
  closeElection,
  openElection,
  publishElection,
  archiveElection,
  updateCandidate,
  updateConstituency,
  updateElection,
  updateLga,
  updateOfficer,
  updateParty,
  listVoters,
  listAuditLogs,
  getElection,
  verifyOtp,
  listPendingVoters,
  approveVoter,
  rejectVoter,
  reinstateVoter,
} = require("../services/adminService");

const router = express.Router();

/**
 * POST /api/admin/login
 * Authenticates a senior INEC administrator.
 */
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/voters", authenticateAdmin, listVoters);

// routes/admin.js
router.get("/voters/pending", authenticateAdmin, listPendingVoters);
router.post("/voters/:id/approve", authenticateAdmin, approveVoter);
router.post("/voters/:id/reject", authenticateAdmin, rejectVoter);
// routes/admin.js
router.post("/voters/:id/reinstate", authenticateAdmin, reinstateVoter);
router.get("/audit-logs", authenticateAdmin, listAuditLogs);
router.get("/election", authenticateAdmin, getElection);
/**
 * GET /api/admin/dashboard
 * Returns state-wide registration and turnout metrics.
 */
router.get("/dashboard", authenticateAdmin, getDashboard);

/**
 * GET /api/admin/results/:constituencyId
 * Returns aggregated results for one constituency.
 */
router.get("/results/:constituencyId", authenticateAdmin, getResults);

/**
 * Constituency metadata and LGA mapping management.
 */
router.get("/constituencies", authenticateAdmin, listConstituencies);
router.patch("/constituencies/:id", authenticateAdmin, updateConstituency);
router.get("/lgas", authenticateAdmin, listLgas);
router.post("/lgas", authenticateAdmin, createLga);
router.patch("/lgas/:id", authenticateAdmin, updateLga);
router.delete("/lgas/:id", authenticateAdmin, deleteLga);

/**
 * Election setup and lifecycle management.
 */
router.get("/elections", authenticateAdmin, listElections);
router.post("/elections", authenticateAdmin, createElection);
router.patch("/elections/:id", authenticateAdmin, updateElection);
router.post("/elections/:id/open", authenticateAdmin, openElection);
router.post("/elections/:id/close", authenticateAdmin, closeElection);
router.post("/elections/:id/publish", authenticateAdmin, publishElection);
router.post("/elections/:id/archive", authenticateAdmin, archiveElection);
router.delete("/elections/:id", authenticateAdmin, deleteElection);

/**
 * Political party management.
 */
router.get("/parties", authenticateAdmin, listParties);
router.post("/parties", authenticateAdmin, createParty);
router.patch("/parties/:id", authenticateAdmin, updateParty);
router.delete("/parties/:id", authenticateAdmin, deleteParty);

/**
 * Candidate management by constituency.
 */
router.get("/candidates", authenticateAdmin, listCandidates);
router.post("/candidates", authenticateAdmin, createCandidate);
router.patch(
  "/candidates/:constituencyId/:candidateId",
  authenticateAdmin,
  updateCandidate,
);
router.delete(
  "/candidates/:constituencyId/:candidateId",
  authenticateAdmin,
  deleteCandidate,
);

/**
 * INEC officer account management.
 * Delete is a soft-disable so historical registration records remain intact.
 */
router.get("/officers", authenticateAdmin, listOfficers);
router.post("/officers", authenticateAdmin, createOfficer);
router.patch("/officers/:id", authenticateAdmin, updateOfficer);
router.delete("/officers/:id", authenticateAdmin, disableOfficer);

module.exports = router;
