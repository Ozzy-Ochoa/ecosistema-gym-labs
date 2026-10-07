import { db } from '../../src/db/index';
import { workouts, workoutSessions, exercises, attendanceLogs, workoutExercises, workoutSets } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

export class WorkoutRepository {
  public static async getSessions(userId: string) {
    return db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startedAt));
  }

  public static async createSession(data: {
    id?: string;
    userId: string;
    workoutId?: string;
    title: string;
    startedAt: Date;
    endedAt?: Date;
    durationMinutes?: number;
    sessionRpe?: number;
    workloadUnits?: number;
    exercisesJson?: any;
    notes?: string;
    provenanceType?: string;
  }) {
    const id = data.id || `wkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    await db.insert(workoutSessions).values({
      id,
      userId: data.userId,
      workoutId: data.workoutId || null,
      title: data.title,
      startedAt: data.startedAt,
      endedAt: data.endedAt || now,
      durationMinutes: data.durationMinutes || 60,
      sessionRpe: data.sessionRpe || 8,
      workloadUnits: data.workloadUnits || 480,
      exercisesJson: data.exercisesJson || [],
      notes: data.notes || '',
      provenanceType: data.provenanceType || 'REAL',
      createdAt: now,
    });

    // Auto-registrar log de presença diário
    const dateString = data.startedAt.toISOString().split('T')[0];
    await this.logAttendance(data.userId, dateString);

    const list = await db.select().from(workoutSessions).where(eq(workoutSessions.id, id)).limit(1);
    return list[0];
  }

  public static async getWorkouts(userId: string) {
    return db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.createdAt));
  }

  public static async createWorkout(data: {
    id?: string;
    userId: string;
    prescribedById?: string;
    name: string;
    description?: string;
    daysPerWeek?: number;
  }) {
    const id = data.id || `wplan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(workouts).values({
      id,
      userId: data.userId,
      prescribedById: data.prescribedById || null,
      name: data.name,
      description: data.description || '',
      daysPerWeek: data.daysPerWeek || 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const list = await db.select().from(workouts).where(eq(workouts.id, id)).limit(1);
    return list[0];
  }

  public static async getExercises() {
    return db.select().from(exercises).orderBy(exercises.name);
  }

  public static async createExercise(data: {
    id?: string;
    name: string;
    pattern: string;
    primaryMuscles: string[];
    secondaryMuscles?: string[];
    equipment: string;
    evidenceNotes?: string;
    isStandard?: boolean;
    createdByUserId?: string;
  }) {
    const id = data.id || `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(exercises).values({
      id,
      name: data.name,
      pattern: data.pattern,
      primaryMuscles: data.primaryMuscles,
      secondaryMuscles: data.secondaryMuscles || [],
      equipment: data.equipment,
      evidenceNotes: data.evidenceNotes || null,
      isStandard: Boolean(data.isStandard),
      createdByUserId: data.createdByUserId || null,
      createdAt: new Date(),
    });

    const list = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return list[0];
  }

  public static async getAttendance(userId: string) {
    return db
      .select()
      .from(attendanceLogs)
      .where(eq(attendanceLogs.userId, userId))
      .orderBy(desc(attendanceLogs.recordedAt));
  }

  public static async logAttendance(userId: string, dateString: string) {
    const id = `att-${userId}-${dateString}`;
    await db
      .insert(attendanceLogs)
      .values({
        id,
        userId,
        dateString,
        status: 'ATTENDED',
        recordedAt: new Date(),
      })
      .onConflictDoNothing();
  }
}
