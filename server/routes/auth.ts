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
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  readUsersIndex,
  writeUsersIndex,
  readUserPartition,
  writeUserPartition,
} from '../database/db';

const router = Router();

export function getAuthenticatedToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
}

export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const token = getAuthenticatedToken(req);
  if (!token) return null;

  // 1. PostgreSQL Session
  const session = await SessionRepository.validateSession(token);
  if (session) return session.userId;

  // 2. Cryptographic Fallback
  return verifySessionToken(token);
}

// 1. Register Athlete / Operator
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'ATHLETE' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios ausentes: email, senha, nome' },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'A senha deve conter no mínimo 8 caracteres' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Checagem no PostgreSQL (Fonte oficial da verdade)
    const existingPgUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingPgUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Identidade já provisionada no enclave' },
      });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);
    const { plainTextKey, keyHash } = generateRecoveryKey();

    const requestedRole = (role || 'USER').toUpperCase();
    const normalizedRole = requestedRole === 'ATHLETE' ? 'USER' : requestedRole;
    const finalRole = ['USER', 'COACH', 'NUTRITIONIST', 'GYM', 'ADMIN'].includes(normalizedRole)
      ? normalizedRole
      : 'USER';

    // 2. Persistência Principal: PostgreSQL
    await UserRepository.createUser({
      id: userId,
      email: normalizedEmail,
      name,
      passwordHash,
      recoveryKeyHash: keyHash,
      role: finalRole,
      isDemo: false,
    });

    // 3. Criação de Sessão Persistente no PostgreSQL
    const sessionToken = createSessionToken(userId);
    await SessionRepository.createSession({
      userId,
      token: sessionToken,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      deviceName: 'Web Browser Session',
    });

    // 4. Auditoria Centralizada no PostgreSQL
    await AuditRepository.logEvent(userId, 'AUTH_LOGIN_SUCCESS', userId, { action: 'INITIAL_REGISTRATION' }, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    // 5. Cache local / Fallback compatibilidade (não-bloqueante)
    try {
      const index = readUsersIndex();
      index.push({ id: userId, email: normalizedEmail, createdAt: new Date().toISOString() });
      writeUsersIndex(index);
      writeUserPartition(userId, {
        user: {
          id: userId,
          email: normalizedEmail,
          name,
          passwordHash,
          recoveryKeyHash: keyHash,
          twoFactorEnabled: false,
          role: finalRole as any,
          isDemo: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        workouts: [],
        nutrition: [],
        sleep: [],
        body: [],
        auditLogs: [],
        vault: {},
      });
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'Atleta inicializado com sucesso no enclave com KDF scrypt',
      sessionToken,
      recoveryKey: plainTextKey,
      user: {
        id: userId,
        email: normalizedEmail,
        name,
        role: finalRole,
        twoFactorEnabled: false,
      },
    });
  } catch (err: any) {
    console.error('Registration failed:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Falha ao registrar identidade no banco relacional' },
    });
  }
});

// 2. Login
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email e senha são obrigatórios' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Busca no PostgreSQL
    let user = await UserRepository.findByEmail(normalizedEmail);

    // Fallback de transição: se não achou no PG, checar partição local e migrar on-the-fly
    if (!user) {
      const index = readUsersIndex();
      const localEntry = index.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (localEntry) {
        const localPart = readUserPartition(localEntry.id);
        if (localPart?.user) {
          await UserRepository.createUser({
            id: localPart.user.id,
            email: localPart.user.email,
            name: localPart.user.name,
            passwordHash: localPart.user.passwordHash,
            recoveryKeyHash: localPart.user.recoveryKeyHash,
            role: localPart.user.role,
            isDemo: localPart.user.isDemo,
          });
          user = await UserRepository.findById(localPart.user.id);
        }
      }
    }

    if (!user || !user.passwordHash) {
      await new Promise((r) => setTimeout(r, 200));
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Credenciais inválidas' },
      });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await AuditRepository.logEvent(user.id, 'AUTH_LOGIN_FAILURE', user.id, { reason: 'PASSWORD_MISMATCH' }, {
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Credenciais inválidas' },
      });
    }

    // 2. Verificação de 2FA
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!totpCode) {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          message: 'Código RFC 6238 TOTP de 6 dígitos obrigatório',
        });
      }

      const totpValid = verifyTotpCode(user.twoFactorSecret, totpCode);
      if (!totpValid) {
        await AuditRepository.logEvent(user.id, 'AUTH_LOGIN_FAILURE', user.id, { reason: 'TOTP_MISMATCH' }, {
          ip: req.ip,
          userAgent: req.headers['user-agent'] as string,
        });
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Código de autenticação em 2 fatores inválido' },
        });
      }
    }

    // 3. Criação de Sessão no PostgreSQL
    const sessionToken = createSessionToken(user.id);
    await SessionRepository.createSession({
      userId: user.id,
      token: sessionToken,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      deviceName: 'Web Browser Login',
    });

    await AuditRepository.logEvent(user.id, 'AUTH_LOGIN_SUCCESS', user.id, {
      method: user.twoFactorEnabled ? 'PASSWORD_AND_2FA' : 'PASSWORD_ONLY',
    }, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    const roles = await UserRepository.getUserRoles(user.id);
    const primaryRole = roles[0] || 'USER';

    return res.json({
      success: true,
      message: 'Sessão do enclave estabelecida',
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: primaryRole,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Falha de autenticação no banco' },
    });
  }
});

// 3. Current Session Check
router.get('/session', async (req: Request, res: Response) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  const user = await UserRepository.findById(userId);
  if (!user) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  const roles = await UserRepository.getUserRoles(userId);

  return res.json({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roles[0] || 'USER',
      twoFactorEnabled: user.twoFactorEnabled,
    },
  });
});

// 4. Logout (Revoga sessão específica)
router.post('/logout', async (req: Request, res: Response) => {
  const token = getAuthenticatedToken(req);
  const userId = await getAuthenticatedUserId(req);

  if (token) {
    await SessionRepository.revokeSession(token);
  }

  if (userId) {
    await AuditRepository.logEvent(userId, 'AUTH_LOGOUT', userId, {}, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
  }

  return res.json({ success: true, message: 'Sessão revogada com sucesso' });
});

// 5. Logout de Todas as Sessões
router.post('/logout-all', async (req: Request, res: Response) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
    });
  }

  const count = await SessionRepository.revokeAllForUser(userId);
  await AuditRepository.logEvent(userId, 'AUTH_LOGOUT_ALL', userId, { revokedCount: count }, {
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
  });

  return res.json({
    success: true,
    message: `${count} sessões ativas foram revogadas com sucesso`,
  });
});

// 6. Generate 2FA Secret
router.post('/2fa/generate', async (req: Request, res: Response) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Não autorizado' },
    });
  }

  const user = await UserRepository.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' },
    });
  }

  const secret = generateTotpSecret();
  await UserRepository.updateUser(userId, { twoFactorSecret: secret });

  const otpAuthUrl = `otpauth://totp/GymLabs:${user.email}?secret=${secret}&issuer=GymLabs`;

  return res.json({
    success: true,
    secret,
    otpAuthUrl,
    stepSeconds: 30,
    algorithm: 'HMAC-SHA1',
  });
});

// 7. Verify & Enable 2FA
router.post('/2fa/verify', async (req: Request, res: Response) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Não autorizado' },
    });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Código de 6 dígitos obrigatório' },
    });
  }

  const user = await UserRepository.findById(userId);
  if (!user || !user.twoFactorSecret) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Nenhum segredo 2FA aguardando verificação' },
    });
  }

  const valid = verifyTotpCode(user.twoFactorSecret, code);
  if (!valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Código 2FA inválido' },
    });
  }

  await UserRepository.updateUser(userId, { twoFactorEnabled: true });
  await AuditRepository.logEvent(userId, 'AUTH_2FA_ENABLED', userId, {}, {
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
  });

  return res.json({
    success: true,
    message: '2FA ativado com sucesso no enclave do atleta',
  });
});

// 8. Recovery Key Password Reset
router.post('/recover', async (req: Request, res: Response) => {
  const { email, recoveryKey, newPassword } = req.body;
  if (!email || !recoveryKey || !newPassword) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email, chave de recuperação e nova senha são obrigatórios' },
    });
  }

  const user = await UserRepository.findByEmail(email);
  if (!user || !user.recoveryKeyHash) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Identidade não encontrada' },
    });
  }

  const validKey = verifyRecoveryKey(recoveryKey, user.recoveryKeyHash);
  if (!validKey) {
    await AuditRepository.logEvent(user.id, 'AUTH_LOGIN_FAILURE', user.id, { reason: 'INVALID_RECOVERY_KEY' }, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Chave de recuperação inválida' },
    });
  }

  const newHash = hashPassword(newPassword);
  const { plainTextKey: newKey, keyHash: newRecoveryHash } = generateRecoveryKey();

  await UserRepository.updateUser(user.id, {
    passwordHash: newHash,
    recoveryKeyHash: newRecoveryHash,
  });

  await AuditRepository.logEvent(user.id, 'AUTH_PASSWORD_RESET', user.id, { method: 'RECOVERY_KEY' }, {
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
  });

  return res.json({
    success: true,
    message: 'Senha redefinida com sucesso. Guarde com segurança a nova chave de recuperação.',
    newRecoveryKey: newKey,
  });
});

export default router;
