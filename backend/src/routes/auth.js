const express = require("express");
const { authenticateOfficer } = require("../middleware/auth");
const {
  forgotPassword,
  legacyAuthenticate,
  officerLogin,
  registerVoter,
  requestPasswordOtp,
  resetPassword,
  resetPasswordOtp,
  validateVin,
  verifyBiometric,
  voterLogin,
} = require("../services/authService");

const router = express.Router();

/**
 * POST /api/auth/officers/login
 * Authenticates an INEC officer for voter registration work.
 */
router.post("/officers/login", officerLogin);

/**
 * POST /api/auth/validate-vin
 * Validates a VIN against the mock INEC voter register before registration.
 */
router.post("/validate-vin", authenticateOfficer, validateVin);

/**
 * POST /api/auth/register-voter
 * Registers a voter account and encrypted biometric enrollment values.
 */
router.post("/register-voter", authenticateOfficer, registerVoter);

/**
 * POST /api/auth/login
 * Password-verifies a voter by VIN or email and returns a 5-minute partial session token.
 */
router.post("/login", voterLogin);

/**
 * POST /api/auth/verify-biometric
 * Upgrades a partial session into the final voting JWT after biometric confirmation.
 */
router.post("/verify-biometric", verifyBiometric);

/**
 * POST /api/auth/request-password-otp
 * Sends a mock SMS OTP for voters who reset password with VIN + phone number.
 */
router.post("/request-password-otp", requestPasswordOtp);

/**
 * POST /api/auth/reset-password-otp
 * Completes password reset using VIN + SMS OTP.
 */
router.post("/reset-password-otp", resetPasswordOtp);

/**
 * POST /api/auth/forgot-password
 * Sends an email reset link when the voter has an email address.
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /api/auth/reset-password
 * Completes a password reset using a one-time email reset token.
 */
router.post("/reset-password", resetPassword);

/**
 * POST /api/auth/voters/login
 * Backward-compatible alias for the current voter login step.
 */
router.post("/voters/login", voterLogin);

/**
 * POST /api/auth/authenticate
 * Backward-compatible VIN lookup for seeded roll checks.
 */
router.post("/authenticate", legacyAuthenticate);

module.exports = router;
