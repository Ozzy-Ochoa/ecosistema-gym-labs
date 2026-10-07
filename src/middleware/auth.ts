import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { verifySessionToken } from '../../server/services/authService';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email?: string; role?: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Tenta verificar como Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch {
    // 2. Se falhar, tenta verificar como Session Token do Enclave Gym Labs (compatibilidade reversa)
    const localUserId = verifySessionToken(token);
    if (localUserId) {
      req.user = { uid: localUserId };
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
