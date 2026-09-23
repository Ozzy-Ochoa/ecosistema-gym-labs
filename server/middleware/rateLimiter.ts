import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const generalAttempts = new Map<string, { count: number; resetTime: number }>();

/**
 * Strict Rate Limiter for Authentication (5 attempts/min with 15-minute progressive lockout)
 */
export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const lockoutMs = 15 * 60 * 1000; // 15 minute lockout
  const maxAttempts = 5;

  let record = loginAttempts.get(ip);

  if (!record) {
    record = { count: 1, firstAttempt: now };
    loginAttempts.set(ip, record);
    return next();
  }

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: 'SECURITY_LOCKOUT_ACTIVE',
      message: `Too many failed authentication attempts. Enclave locked for security. Try again in ${remainingSeconds} seconds.`,
      remainingSeconds,
      retryAfter: remainingSeconds,
    });
  }

  // Reset window if past 1 minute
  if (now - record.firstAttempt > windowMs) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = undefined;
    return next();
  }

  record.count += 1;

  if (record.count > maxAttempts) {
    record.lockedUntil = now + lockoutMs;
    const remainingSeconds = Math.ceil(lockoutMs / 1000);
    return res.status(429).json({
      error: 'BRUTE_FORCE_PROTECTION_TRIGGERED',
      message: `Maximum login attempts exceeded (${maxAttempts}/min). Host locked for 15 minutes.`,
      remainingSeconds,
      retryAfter: remainingSeconds,
    });
  }

  next();
}

/**
 * General API Rate Limiter (60 requests per minute)
 */
export function apiRateLimiter(maxReqPerMinute = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000;

    let record = generalAttempts.get(ip);
    if (!record || now > record.resetTime) {
      generalAttempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > maxReqPerMinute) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Telemetry ingestion threshold reached. Throttle requests to preserve enclave stability.',
      });
    }

    next();
  };
}
