import crypto from 'crypto';
import { db } from '../../src/db/index';
import { sessions, sessionDevices } from '../../src/db/schema';
import { eq, and, isNull, gt } from 'drizzle-orm';

export interface CreateSessionParams {
  userId: string;
  token: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
}

export class SessionRepository {
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public static hashString(val?: string): string {
    if (!val) return 'unknown';
    return crypto.createHash('sha256').update(val).digest('hex').substring(0, 32);
  }

  public static async createSession(params: CreateSessionParams): Promise<void> {
    const tokenHash = this.hashToken(params.token);
    const sessionId = `sess-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const ipHash = this.hashString(params.ip);
    const userAgentHash = this.hashString(params.userAgent);

    await db.insert(sessions).values({
      id: sessionId,
      userId: params.userId,
      tokenHash,
      deviceId: params.deviceId || `dev-${crypto.randomBytes(4).toString('hex')}`,
      ipHash,
      userAgentHash,
      expiresAt,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    });

    if (params.deviceName || params.deviceId) {
      await db.insert(sessionDevices).values({
        id: `sdev-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        sessionId,
        userId: params.userId,
        deviceName: params.deviceName || 'Web Browser',
        deviceType: params.deviceType || 'BROWSER',
        ipHash,
        lastActiveAt: new Date(),
      }).catch((err) => {
        console.warn('Non-blocking session device registration warning:', err.message);
      });
    }
  }

  public static async validateSession(token: string): Promise<{ userId: string; sessionId: string } | null> {
    try {
      const tokenHash = this.hashToken(token);
      const now = new Date();

      const results = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.tokenHash, tokenHash),
            isNull(sessions.revokedAt),
            gt(sessions.expiresAt, now)
          )
        )
        .limit(1);

      if (results.length === 0) {
        return null;
      }

      const session = results[0];

      // Atualiza lastSeenAt de forma assíncrona
      db.update(sessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(sessions.id, session.id))
        .catch(() => {});

      return {
        userId: session.userId,
        sessionId: session.id,
      };
    } catch (err) {
      console.error('Session validation error in PostgreSQL:', err);
      return null;
    }
  }

  public static async revokeSession(token: string): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(token);
      const res = await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.tokenHash, tokenHash))
        .returning();
      return res.length > 0;
    } catch (err) {
      console.error('Error revoking session:', err);
      return false;
    }
  }

  public static async revokeAllForUser(userId: string): Promise<number> {
    try {
      const res = await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
        .returning();
      return res.length;
    } catch (err) {
      console.error('Error revoking all user sessions:', err);
      return 0;
    }
  }
}
