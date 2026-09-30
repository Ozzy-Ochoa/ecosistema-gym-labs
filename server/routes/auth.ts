import { Router, Request, Response } from 'express';
import {
  hashPassword,
  verifyPassword,
  generateRecoveryKey,
  verifyRecoveryKey,
  generateTotpSecret,
  verifyTotpCode,
  createSessionToken,
  verifySessionToken,
} from '../services/authService';
import { logAuditEvent } from '../services/auditService';
import {
  readUsersIndex,
  writeUsersIndex,
  readUserPartition,
  writeUserPartition,
  UserRecord,
  UserDatabasePartition,
} from '../database/db';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Helper to extract authenticated user
export function getAuthenticatedUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifySessionToken(token);
}

// 1. Register Athlete / Operator
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'ATHLETE' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing mandatory fields (email, password, name)' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must have minimum 8 characters for cryptographic strength' });
    }

    const index = readUsersIndex();
    const existing = index.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Identity already provisioned in enclave' });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);
    const { plainTextKey, keyHash } = generateRecoveryKey();

    const requestedRole = (role || 'USER').toUpperCase();
    const normalizedRole = requestedRole === 'ATHLETE' ? 'USER' : requestedRole;
    const finalRole = ['USER', 'COACH', 'NUTRITIONIST', 'GYM', 'ADMIN'].includes(normalizedRole) ? normalizedRole : 'USER';

    const newUser: UserRecord = {
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      recoveryKeyHash: keyHash,
      twoFactorEnabled: false,
      role: finalRole as any,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPartition: UserDatabasePartition = {
      user: newUser,
      workouts: [],
      nutrition: [],
      sleep: [],
      body: [],
      auditLogs: [],
      vault: {},
    };

    writeUserPartition(userId, newPartition);

    index.push({
      id: userId,
      email: newUser.email,
      createdAt: newUser.createdAt,
    });
    writeUsersIndex(index);

    logAuditEvent(userId, 'AUTH_LOGIN_SUCCESS', 'SUCCESS', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }, { action: 'INITIAL_REGISTRATION' });

    const sessionToken = createSessionToken(userId);

    return res.status(201).json({
      message: 'Athlete enclave successfully initialized with scrypt KDF',
      sessionToken,
      recoveryKey: plainTextKey, // Shown ONLY ONCE to user upon registration
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        twoFactorEnabled: false,
      },
    });
  } catch (err: any) {
    console.error('Registration failed:', err);
    return res.status(500).json({ error: 'Registration failed in cryptographic enclave' });
  }
});

// 2. Login (Protected by authRateLimiter: 5 attempts/min with 15-min lockout)
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const index = readUsersIndex();
    const entry = index.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!entry) {
      // Artificial delay to prevent timing side-channel attacks
      await new Promise((r) => setTimeout(r, 200));
      return res.status(401).json({ error: 'Invalid cryptographic credentials' });
    }

    const partition = readUserPartition(entry.id);
    if (!partition) {
      return res.status(401).json({ error: 'User partition missing or unreadable' });
    }

    const isValid = verifyPassword(password, partition.user.passwordHash);
    if (!isValid) {
      logAuditEvent(entry.id, 'AUTH_LOGIN_FAILURE', 'DENIED', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }, { reason: 'PASSWORD_MISMATCH' });
      return res.status(401).json({ error: 'Invalid cryptographic credentials' });
    }

    // Check 2FA if enabled
    if (partition.user.twoFactorEnabled && partition.user.twoFactorSecret) {
      if (!totpCode) {
        return res.status(200).json({
          requires2FA: true,
          message: 'RFC 6238 TOTP 6-digit code required',
        });
      }

      const totpValid = verifyTotpCode(partition.user.twoFactorSecret, totpCode);
      if (!totpValid) {
        logAuditEvent(entry.id, 'AUTH_LOGIN_FAILURE', 'DENIED', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }, { reason: 'TOTP_MISMATCH' });
        return res.status(401).json({ error: 'Invalid 2FA authentication code' });
      }
    }

    const sessionToken = createSessionToken(entry.id);

    logAuditEvent(entry.id, 'AUTH_LOGIN_SUCCESS', 'SUCCESS', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }, { method: partition.user.twoFactorEnabled ? 'PASSWORD_AND_2FA' : 'PASSWORD_ONLY' });

    return res.json({
      message: 'Enclave session established',
      sessionToken,
      user: {
        id: partition.user.id,
        email: partition.user.email,
        name: partition.user.name,
        role: partition.user.role,
        twoFactorEnabled: partition.user.twoFactorEnabled,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication enclave failure' });
  }
});

// 3. Current Session Check
router.get('/session', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ authenticated: false });
  }

  const partition = readUserPartition(userId);
  if (!partition) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: {
      id: partition.user.id,
      email: partition.user.email,
      name: partition.user.name,
      role: partition.user.role,
      twoFactorEnabled: partition.user.twoFactorEnabled,
    },
  });
});

// 4. Logout
router.post('/logout', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (userId) {
    logAuditEvent(userId, 'AUTH_LOGOUT', 'SUCCESS', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
  return res.json({ message: 'Session terminated' });
});

// 5. Generate 2FA Secret (RFC 6238 TOTP)
router.post('/2fa/generate', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'Tenant not found' });

  const secret = generateTotpSecret();
  // Temporarily store pending secret
  partition.user.twoFactorSecret = secret;
  writeUserPartition(userId, partition);

  const otpAuthUrl = `otpauth://totp/GymLabs:${partition.user.email}?secret=${secret}&issuer=GymLabs`;

  return res.json({
    secret,
    otpAuthUrl,
    stepSeconds: 30,
    algorithm: 'HMAC-SHA1',
  });
});

// 6. Verify & Enable 2FA
router.post('/2fa/verify', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: '6-digit code required' });

  const partition = readUserPartition(userId);
  if (!partition || !partition.user.twoFactorSecret) {
    return res.status(400).json({ error: 'No 2FA secret staged' });
  }

  const valid = verifyTotpCode(partition.user.twoFactorSecret, code);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid 2FA code' });
  }

  partition.user.twoFactorEnabled = true;
  writeUserPartition(userId, partition);

  logAuditEvent(userId, 'AUTH_2FA_ENABLED', 'SUCCESS', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json({ message: '2FA successfully activated on athlete enclave' });
});

// 7. Cryptographic Recovery Key Password Reset
router.post('/recover', (req: Request, res: Response) => {
  const { email, recoveryKey, newPassword } = req.body;
  if (!email || !recoveryKey || !newPassword) {
    return res.status(400).json({ error: 'Email, recovery key, and new password required' });
  }

  const index = readUsersIndex();
  const entry = index.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!entry) return res.status(404).json({ error: 'Identity not located' });

  const partition = readUserPartition(entry.id);
  if (!partition) return res.status(404).json({ error: 'Partition not located' });

  const validKey = verifyRecoveryKey(recoveryKey, partition.user.recoveryKeyHash);
  if (!validKey) {
    logAuditEvent(entry.id, 'AUTH_LOGIN_FAILURE', 'DENIED', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }, { reason: 'INVALID_RECOVERY_KEY' });
    return res.status(401).json({ error: 'Invalid Cryptographic Recovery Key' });
  }

  // Generate new password hash via scrypt
  partition.user.passwordHash = hashPassword(newPassword);
  // Regenerate new recovery key to prevent replay
  const { plainTextKey: newKey, keyHash: newHash } = generateRecoveryKey();
  partition.user.recoveryKeyHash = newHash;
  writeUserPartition(entry.id, partition);

  logAuditEvent(entry.id, 'AUTH_PASSWORD_RESET', 'SUCCESS', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, { method: 'RECOVERY_KEY' });

  return res.json({
    message: 'Password successfully reset. Store your replacement recovery key safely.',
    newRecoveryKey: newKey,
  });
});

export default router;
