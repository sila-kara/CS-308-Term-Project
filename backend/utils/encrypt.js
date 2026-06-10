const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || "bookworld-default-secret-key-cs308")
  .digest(); // 32 bytes

/**
 * Encrypt a plain-text string (e.g. Tax ID).
 * Returns "iv:ciphertext" as a hex string.
 */
function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypt a value previously encrypted with encrypt().
 * Returns the original plain-text string.
 */
function decrypt(value) {
  if (!value || !value.includes(":")) return value;
  try {
    const [ivHex, encHex] = value.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return value; // return as-is if decryption fails (e.g. legacy plain-text values)
  }
}

module.exports = { encrypt, decrypt };
