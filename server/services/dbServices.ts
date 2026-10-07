import { db } from '../../src/db/index.ts';
import {
  users,
  profiles,
  workoutSessions,
  meals,
  sleepSessions,
  relationships,
  invitations,
  messages,
  consents,
  auditEvents,
  bodyRecords,
  circumferences,
} from '../../src/db/schema.ts';
import { eq, and, or, desc } from 'drizzle-orm';

/**
 * GYM LABS — MULTI-TENANT & RELATIONAL DOMAIN SERVICES (FASE 03)
 */

export const dbServices = {
  // --- Usuários e Perfis ---
  async getUserById(userId: string) {
    try {
      const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return result[0] || null;
    } catch (err) {
      console.error('dbServices.getUserById error:', err);
      return null;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      return result[0] || null;
    } catch (err) {
      console.error('dbServices.getUserByEmail error:', err);
      return null;
    }
  },

  async createUser(data: typeof users.$inferInsert, profileData?: Partial<typeof profiles.$inferInsert>) {
    return db.transaction(async (tx) => {
      const insertedUsers = await tx.insert(users).values(data).returning();
      const user = insertedUsers[0];

      await tx.insert(profiles).values({
        id: `prf-${user.id}`,
        userId: user.id,
        provenanceType: user.isDemo ? 'DEMO' : 'REAL',
        ...profileData,
      });

      return user;
    });
  },

  // --- Treinos com Isolamento Multi-Tenant ---
  async getWorkoutsForUser(requestingUserId: string, targetUserId: string) {
    // 1. O próprio usuário tem acesso irrestrito
    if (requestingUserId === targetUserId) {
      return db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, targetUserId))
        .orderBy(desc(workoutSessions.startedAt));
    }

    // 2. Terceiro (Personal/Academia): Checagem estrita de relacionamento e escopo
    const activeRel = await db
      .select()
      .from(relationships)
      .where(
        and(
          eq(relationships.sourceUserId, targetUserId),
          eq(relationships.targetUserId, requestingUserId),
          eq(relationships.status, 'ACTIVE'),
          eq(relationships.canViewWorkouts, true)
        )
      )
      .limit(1);

    if (activeRel.length === 0) {
      throw new Error('Acesso negado: vínculo ativo ou permissão de visualização de treinos inexistente.');
    }

    return db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, targetUserId))
      .orderBy(desc(workoutSessions.startedAt));
  },

  async createWorkoutSession(sessionData: typeof workoutSessions.$inferInsert) {
    const inserted = await db.insert(workoutSessions).values(sessionData).returning();
    return inserted[0];
  },

  // --- Nutrição com Isolamento de Prontuário ---
  async getMealsForUser(requestingUserId: string, targetUserId: string) {
    if (requestingUserId === targetUserId) {
      return db
        .select()
        .from(meals)
        .where(eq(meals.userId, targetUserId))
        .orderBy(desc(meals.consumedAt));
    }

    // Checagem de consentimento da Nutricionista
    const activeRel = await db
      .select()
      .from(relationships)
      .where(
        and(
          eq(relationships.sourceUserId, targetUserId),
          eq(relationships.targetUserId, requestingUserId),
          eq(relationships.status, 'ACTIVE'),
          eq(relationships.canViewDiet, true)
        )
      )
      .limit(1);

    if (activeRel.length === 0) {
      throw new Error('Acesso negado: consentimento nutricional inexistente para este prontuário.');
    }

    return db
      .select()
      .from(meals)
      .where(eq(meals.userId, targetUserId))
      .orderBy(desc(meals.consumedAt));
  },

  async createMeal(mealData: typeof meals.$inferInsert) {
    const inserted = await db.insert(meals).values(mealData).returning();
    return inserted[0];
  },

  // --- Sono e Prontidão ---
  async getSleepForUser(requestingUserId: string, targetUserId: string) {
    if (requestingUserId === targetUserId) {
      return db
        .select()
        .from(sleepSessions)
        .where(eq(sleepSessions.userId, targetUserId))
        .orderBy(desc(sleepSessions.bedtime));
    }

    const activeRel = await db
      .select()
      .from(relationships)
      .where(
        and(
          eq(relationships.sourceUserId, targetUserId),
          eq(relationships.targetUserId, requestingUserId),
          eq(relationships.status, 'ACTIVE'),
          eq(relationships.canViewHydrationSleep, true)
        )
      )
      .limit(1);

    if (activeRel.length === 0) {
      throw new Error('Acesso negado: permissão de telemetria de sono e recuperação inexistente.');
    }

    return db
      .select()
      .from(sleepSessions)
      .where(eq(sleepSessions.userId, targetUserId))
      .orderBy(desc(sleepSessions.bedtime));
  },

  async createSleepSession(sleepData: typeof sleepSessions.$inferInsert) {
    const inserted = await db.insert(sleepSessions).values(sleepData).returning();
    return inserted[0];
  },

  // --- Relacionamentos e Convites com Transações ACID ---
  async getRelationshipsForUser(userId: string) {
    return db
      .select()
      .from(relationships)
      .where(or(eq(relationships.sourceUserId, userId), eq(relationships.targetUserId, userId)));
  },

  async createInvitation(data: typeof invitations.$inferInsert) {
    const inserted = await db.insert(invitations).values(data).returning();
    return inserted[0];
  },

  async respondInvitation(invitationId: string, currentUserId: string, accept: boolean, rejectionReason?: string) {
    return db.transaction(async (tx) => {
      const invList = await tx.select().from(invitations).where(eq(invitations.id, invitationId)).limit(1);
      if (invList.length === 0) {
        throw new Error('Convite não localizado');
      }

      const inv = invList[0];
      const newStatus = accept ? 'ACCEPTED' : 'REJECTED';

      await tx
        .update(invitations)
        .set({
          status: newStatus,
          respondedAt: new Date(),
        })
        .where(eq(invitations.id, invitationId));

      let relationship = null;
      if (accept) {
        const insertedRels = await tx
          .insert(relationships)
          .values({
            id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sourceUserId: currentUserId,
            targetUserId: inv.senderId,
            relationshipType: 'USER_PERSONAL',
            status: 'ACTIVE',
            canViewWorkouts: true,
            canViewDiet: true,
            canViewBodyMetrics: true,
            canViewHydrationSleep: true,
            canPrescribeWorkouts: true,
            canPrescribeDiet: true,
            requestedAt: inv.createdAt,
            acceptedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        relationship = insertedRels[0];
      }

      return { invitation: inv, relationship };
    });
  },

  async terminateRelationship(relationshipId: string, requestingUserId: string, reason?: string) {
    const relList = await db.select().from(relationships).where(eq(relationships.id, relationshipId)).limit(1);
    if (relList.length === 0) {
      throw new Error('Relacionamento não encontrado');
    }

    const rel = relList[0];
    if (rel.sourceUserId !== requestingUserId && rel.targetUserId !== requestingUserId) {
      throw new Error('Não autorizado a encerrar este relacionamento');
    }

    await db
      .update(relationships)
      .set({
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminationReason: reason || 'Encerramento solicitado pelo participante',
        updatedAt: new Date(),
      })
      .where(eq(relationships.id, relationshipId));

    return true;
  },

  // --- Mensageria / Chat ---
  async getMessagesForUser(userId: string, conversationId?: string) {
    if (conversationId) {
      return db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversationId),
            or(eq(messages.senderId, userId), eq(messages.recipientId, userId))
          )
        )
        .orderBy(messages.createdAt);
    }

    return db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
      .orderBy(messages.createdAt);
  },

  async sendMessage(data: typeof messages.$inferInsert) {
    const inserted = await db.insert(messages).values(data).returning();
    return inserted[0];
  },

  // --- Trilha de Auditoria Criptográfica Centralizada ---
  async recordAuditEvent(eventData: typeof auditEvents.$inferInsert) {
    try {
      const inserted = await db.insert(auditEvents).values(eventData).returning();
      return inserted[0];
    } catch (err) {
      console.error('Failed to record audit event in PostgreSQL:', err);
      return null;
    }
  },

  async getAuditEvents(userId: string) {
    return db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.userId, userId))
      .orderBy(desc(auditEvents.recordedAt));
  },
};
