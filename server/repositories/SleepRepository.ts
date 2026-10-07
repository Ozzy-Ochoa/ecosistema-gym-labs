import { db } from '../../src/db/index';
import { sleepSessions, wellnessLogs } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

export class SleepRepository {
  public static async getSessions(userId: string) {
    return db
      .select()
      .from(sleepSessions)
      .where(eq(sleepSessions.userId, userId))
      .orderBy(desc(sleepSessions.createdAt));
  }

  public static async createSession(data: {
    id?: string;
    userId: string;
    bedtime: Date;
    wakeTime: Date;
    durationMinutes: number;
    efficiencyPct: number;
    deepSleepMinutes?: number;
    remSleepMinutes?: number;
    sleepQualityRpe: number;
    restingHrvRmssd?: number;
    restingHeartRateBpm?: number;
    provenanceType?: string;
  }) {
    const id = data.id || `slp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(sleepSessions).values({
      id,
      userId: data.userId,
      bedtime: data.bedtime,
      wakeTime: data.wakeTime,
      durationMinutes: data.durationMinutes,
      efficiencyPct: data.efficiencyPct,
      deepSleepMinutes: data.deepSleepMinutes || null,
      remSleepMinutes: data.remSleepMinutes || null,
      sleepQualityRpe: data.sleepQualityRpe,
      restingHrvRmssd: data.restingHrvRmssd || null,
      restingHeartRateBpm: data.restingHeartRateBpm || null,
      provenanceType: data.provenanceType || 'REAL',
      createdAt: now,
    });

    const list = await db.select().from(sleepSessions).where(eq(sleepSessions.id, id)).limit(1);
    return list[0];
  }

  public static async getWellness(userId: string) {
    return db
      .select()
      .from(wellnessLogs)
      .where(eq(wellnessLogs.userId, userId))
      .orderBy(desc(wellnessLogs.recordedAt));
  }

  public static async logWellness(data: {
    id?: string;
    userId: string;
    sorenessScore: number;
    stressScore: number;
    fatigueScore: number;
    moodScore: number;
    notes?: string;
  }) {
    const id = data.id || `wln-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(wellnessLogs).values({
      id,
      userId: data.userId,
      sorenessScore: data.sorenessScore,
      stressScore: data.stressScore,
      fatigueScore: data.fatigueScore,
      moodScore: data.moodScore,
      notes: data.notes || '',
      recordedAt: new Date(),
    });

    const list = await db.select().from(wellnessLogs).where(eq(wellnessLogs.id, id)).limit(1);
    return list[0];
  }
}
