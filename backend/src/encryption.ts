import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY environment variable is not set');
  const buf = Buffer.from(key, 'hex');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  return buf;
}

/** Encrypt plaintext → "base64iv:base64tag:base64ciphertext" */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

/** Decrypt ciphertext produced by encrypt() */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('Invalid ciphertext format');
  const iv = Buffer.from(parts[0], 'base64');
  const tag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

/** HMAC-SHA256 of lowercase-trimmed email — used as a searchable, non-reversible index */
export function hmacEmail(email: string): string {
  const key = process.env.ENCRYPTION_KEY ?? '';
  return createHmac('sha256', Buffer.from(key, 'hex')).update(email.toLowerCase().trim()).digest('hex');
}

/** Encrypt if value is truthy, otherwise null */
export function encryptNullable(value: string | null | undefined): string | null {
  return value ? encrypt(value) : null;
}

/** Decrypt if value is truthy, otherwise null. Gracefully returns raw value on failure (pre-encryption data). */
export function decryptNullable(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return decrypt(value);
  } catch {
    return value;
  }
}
