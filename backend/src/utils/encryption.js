const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

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

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

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

function encryptJson(payload) {
  return encrypt(JSON.stringify(payload));
}

function decryptJson(payload) {
  return JSON.parse(decrypt(payload));
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

module.exports = { encrypt, decrypt, encryptJson, decryptJson, sha256 };
