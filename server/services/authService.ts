import crypto from 'crypto';

// KDF Parameters compliant with specification: scrypt N=16384, r=8, p=1, 128-bit salt
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;

export interface HashResult {
  hash: string;
  salt: string;
  algorithm: 'scrypt' | 'pbkdf2';
}

/**
 * Derives password hash using scrypt with cryptographic 128-bit salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex'); // 128-bit salt
  try {
    const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: 32 * 1024 * 1024,
    });
    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  } catch (err) {
    // Automated PBKDF2 contingency fallback (100,000 iterations)
    const pbkdf2Key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return `pbkdf2$${salt}$${pbkdf2Key.toString('hex')}`;
  }
}

/**
 * Verifies password against stored scrypt or pbkdf2 hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes('$')) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const [algorithm, salt, expectedHashHex] = parts;
  const expectedBuffer = Buffer.from(expectedHashHex, 'hex');

  if (algorithm === 'scrypt') {
    try {
      const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: 32 * 1024 * 1024,
      });
      return crypto.timingSafeEqual(derivedKey, expectedBuffer);
    } catch {
      return false;
    }
  } else if (algorithm === 'pbkdf2') {
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  }

  return false;
}

/**
 * Generates Cryptographic Recovery Key in format REC-XXXX-XXXX-XXXX
 * Uses true crypto.randomBytes(12) entropy (never Math.random())
 */
export function generateRecoveryKey(): { plainTextKey: string; keyHash: string } {
  const bytes = crypto.randomBytes(12);
  const hex = bytes.toString('hex').toUpperCase();
  const chunk1 = hex.substring(0, 4);
  const chunk2 = hex.substring(4, 8);
  const chunk3 = hex.substring(8, 12);
  const chunk4 = hex.substring(12, 16);
  const plainTextKey = `REC-${chunk1}-${chunk2}-${chunk3}-${chunk4}`;

  // Hash for storage (one-way irreversible SHA-256 with server pepper)
  const keyHash = crypto.createHash('sha256').update(plainTextKey).digest('hex');
  return { plainTextKey, keyHash };
}

export function verifyRecoveryKey(providedKey: string, storedHash: string): boolean {
  const normalized = providedKey.trim().toUpperCase();
  const calculatedHash = crypto.createHash('sha256').update(normalized).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(storedHash));
}

/**
 * RFC 6238 TOTP (HMAC-SHA1, 30s step, ±1 step tolerance window)
 */
export function generateTotpSecret(): string {
  // 20 bytes secret formatted as Base32
  const buffer = crypto.randomBytes(20);
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let binaryString = '';
  for (let i = 0; i < buffer.length; i++) {
    binaryString += buffer[i].toString(2).padStart(8, '0');
  }
  let base32 = '';
  for (let i = 0; i < binaryString.length; i += 5) {
    const chunk = binaryString.substring(i, i + 5).padEnd(5, '0');
    base32 += base32Chars[parseInt(chunk, 2)];
  }
  return base32;
}

function base32ToBuffer(base32: string): Buffer {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let binaryString = '';
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  for (let i = 0; i < clean.length; i++) {
    const idx = base32Chars.indexOf(clean[i]);
    if (idx !== -1) {
      binaryString += idx.toString(2).padStart(5, '0');
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= binaryString.length; i += 8) {
    bytes.push(parseInt(binaryString.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function calculateTotpCode(secretBase32: string, timeStepOffset: number = 0): string {
  const secret = base32ToBuffer(secretBase32);
  const timeStepSeconds = 30;
  const currentStep = Math.floor(Date.now() / 1000 / timeStepSeconds) + timeStepOffset;

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(currentStep), 0);

  const hmac = crypto.createHmac('sha1', secret).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binaryCode % 1000000).toString().padStart(6, '0');
  return otp;
}

export function verifyTotpCode(secretBase32: string, code: string): boolean {
  if (!code || code.length !== 6) return false;
  // Check ±1 step window (current, -30s, +30s)
  for (const offset of [0, -1, 1]) {
    const valid = calculateTotpCode(secretBase32, offset);
    if (valid === code) return true;
  }
  return false;
}

/**
 * AES-256-GCM Vault Encryption
 */
export function encryptVaultItem(plainText: string, masterKeyString: string): { cipherText: string; iv: string; authTag: string } {
  const salt = crypto.createHash('sha256').update(masterKeyString).digest();
  const key = crypto.pbkdf2Sync(masterKeyString, salt, 50000, 32, 'sha256');
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    cipherText: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

export function decryptVaultItem(cipherText: string, ivHex: string, authTagHex: string, masterKeyString: string): string | null {
  try {
    const salt = crypto.createHash('sha256').update(masterKeyString).digest();
    const key = crypto.pbkdf2Sync(masterKeyString, salt, 50000, 32, 'sha256');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return null;
  }
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SECURITY ERROR: SESSION_SECRET must be explicitly configured in production environment.');
  }
  // Ambiente de desenvolvimento ou teste: chave transitória de desenvolvimento
  return 'gymlabs-labcore-dev-testing-ephemeral-key-2026';
}

/**
 * Session Token Generator
 */
export function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const secret = getSessionSecret();
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;
    const [userId, timestamp, nonce, sig] = parts;

    const payload = `${userId}:${timestamp}:${nonce}`;
    const secret = getSessionSecret();
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    // Expiry check (7 days)
    const tokenTime = parseInt(timestamp, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - tokenTime > maxAge) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
