require("dotenv").config();

const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"];

/**
 * Fails fast when critical secrets or database settings are missing or too weak.
 */
function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  if (process.env.ENCRYPTION_KEY) {
    const isHexKey = /^[a-f0-9]{64}$/i.test(process.env.ENCRYPTION_KEY);
    const isStrongPassphrase = process.env.ENCRYPTION_KEY.length >= 32;

    if (!isHexKey && !isStrongPassphrase) {
      throw new Error(
        "ENCRYPTION_KEY must be a 64-character hex key or a 32+ character secret",
      );
    }
  }
}

module.exports = { validateEnv };
