const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * Derives the AES-256 key from ENCRYPTION_KEY or falls back to JWT_SECRET for local demos.
 */
function getKey() {
  const configuredKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (!configuredKey) {
    throw new Error("ENCRYPTION_KEY or JWT_SECRET must be configured");
  }

  if (/^[a-f0-9]{64}$/i.test(configuredKey)) {
    return Buffer.from(configuredKey, "hex");
  }

  return crypto.createHash("sha256").update(configuredKey).digest();
}

/**
 * Encrypts text with AES-256-GCM and returns iv:tag:ciphertext for storage.
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

/**
 * Decrypts a value produced by encrypt and verifies the GCM authentication tag.
 */
function decrypt(text) {
  const [ivHex, tagHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Serializes and encrypts a JavaScript object.
 */
function encryptJson(payload) {
  return encrypt(JSON.stringify(payload));
}

/**
 * Decrypts and parses an encrypted JSON payload.
 */
function decryptJson(payload) {
  return JSON.parse(decrypt(payload));
}

/**
 * Produces a SHA-256 hex digest for integrity checks and token hashes.
 */
function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

module.exports = { encrypt, decrypt, encryptJson, decryptJson, sha256 };
