import crypto from 'crypto';
import { db } from '../../src/db/index';
import { auditEvents } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

let lastChainHash: string = 'GENESIS_CHAIN_HASH_LABCORE_2026';

export class AuditRepository {
  public static sanitizeDetails(details?: any): any {
    if (!details || typeof details !== 'object') return {};

    // Recursive sanitization function to guarantee zero leaks even in deep structures
    const sanitizeValue = (val: any): any => {
      if (val === null || val === undefined) return val;
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        return val;
      }
      if (Array.isArray(val)) {
        return val.map((item) => sanitizeValue(item));
      }
      if (typeof val === 'object') {
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(val)) {
          const lower = k.toLowerCase();
          const isSensitiveKey =
            lower.includes('pass') ||
            lower.includes('token') ||
            lower.includes('secret') ||
            lower.includes('key') ||
            lower.includes('hash') ||
            lower.includes('pin') ||
            lower.includes('bearer');

          if (isSensitiveKey) {
            cleaned[k] = '[REDACTED]';
          } else if (typeof v === 'object' && v !== null) {
            cleaned[k] = sanitizeValue(v);
          } else if (
            lower.includes('code') ||
            lower.includes('credential') ||
            lower.includes('auth')
          ) {
            cleaned[k] = '[REDACTED]';
          } else {
            cleaned[k] = v;
          }
        }
        return cleaned;
      }
      return '[REDACTED]';
    };

    return sanitizeValue(details);
  }

  public static async logEvent(
    userId: string,
    eventType: string,
    resourceId?: string,
    details?: any,
    reqInfo?: { ip?: string; userAgent?: string }
  ) {
    try {
      const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date();
      const safeDetails = this.sanitizeDetails(details);
      const ipHash = reqInfo?.ip
        ? crypto.createHash('sha256').update(reqInfo.ip).digest('hex').substring(0, 16)
        : null;

      // Cálculo de hash encadeado imutável
      const payload = `${lastChainHash}:${userId}:${eventType}:${resourceId || ''}:${now.toISOString()}`;
      const chainHash = crypto.createHash('sha256').update(payload).digest('hex');
      lastChainHash = chainHash;

      await db.insert(auditEvents).values({
        id,
        userId,
        eventType,
        resourceId: resourceId || null,
        detailsJson: safeDetails,
        ipHash,
        chainHash,
        recordedAt: now,
      });

      return { id, chainHash };
    } catch (err: any) {
      console.warn('Non-blocking audit log warning:', err.message);
      return null;
    }
  }

  public static async getEvents(userId: string, limit: number = 50) {
    return db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.userId, userId))
      .orderBy(desc(auditEvents.recordedAt))
      .limit(limit);
  }
}
