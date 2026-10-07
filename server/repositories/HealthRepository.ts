import { db } from '../../src/db/index';
import { bodyRecords, circumferences } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

export class HealthRepository {
  public static async getBodyRecords(userId: string) {
    return db
      .select()
      .from(bodyRecords)
      .where(eq(bodyRecords.userId, userId))
      .orderBy(desc(bodyRecords.recordedAt));
  }

  public static async logBodyRecord(data: {
    id?: string;
    userId: string;
    weightKg: number;
    heightCm?: number;
    bodyFatPct?: number;
    skeletalMuscleKg?: number;
    provenanceType?: string;
    recordedAt?: Date;
  }) {
    const id = data.id || `bdy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(bodyRecords).values({
      id,
      userId: data.userId,
      weightKg: data.weightKg,
      heightCm: data.heightCm || null,
      bodyFatPct: data.bodyFatPct || null,
      skeletalMuscleKg: data.skeletalMuscleKg || null,
      provenanceType: data.provenanceType || 'REAL',
      recordedAt: data.recordedAt || now,
      createdAt: now,
    });

    const list = await db.select().from(bodyRecords).where(eq(bodyRecords.id, id)).limit(1);
    return list[0];
  }

  public static async getCircumferences(userId: string) {
    return db
      .select()
      .from(circumferences)
      .where(eq(circumferences.userId, userId))
      .orderBy(desc(circumferences.recordedAt));
  }

  public static async logCircumferences(data: {
    id?: string;
    userId: string;
    waistCm?: number;
    hipCm?: number;
    chestCm?: number;
    armCm?: number;
    thighCm?: number;
    calfCm?: number;
    provenanceType?: string;
    recordedAt?: Date;
  }) {
    const id = data.id || `cir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(circumferences).values({
      id,
      userId: data.userId,
      waistCm: data.waistCm || null,
      hipCm: data.hipCm || null,
      chestCm: data.chestCm || null,
      armCm: data.armCm || null,
      thighCm: data.thighCm || null,
      calfCm: data.calfCm || null,
      provenanceType: data.provenanceType || 'REAL',
      recordedAt: data.recordedAt || now,
      createdAt: now,
    });

    const list = await db.select().from(circumferences).where(eq(circumferences.id, id)).limit(1);
    return list[0];
  }
}
