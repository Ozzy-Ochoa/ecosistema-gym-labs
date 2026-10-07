import { db } from '../../src/db/index';
import {
  relationships,
  relationshipHistory,
  invitations,
  consents,
  consentHistory,
  users,
} from '../../src/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { AuditRepository } from './AuditRepository';

export class RelationshipRepository {
  public static async getRelationships(userId: string) {
    return db
      .select()
      .from(relationships)
      .where(or(eq(relationships.sourceUserId, userId), eq(relationships.targetUserId, userId)));
  }

  public static async getActiveRelationship(userA: string, userB: string) {
    const list = await db
      .select()
      .from(relationships)
      .where(
        and(
          eq(relationships.status, 'ACTIVE'),
          or(
            and(eq(relationships.sourceUserId, userA), eq(relationships.targetUserId, userB)),
            and(eq(relationships.sourceUserId, userB), eq(relationships.targetUserId, userA))
          )
        )
      )
      .limit(1);
    return list[0] || null;
  }

  public static async createRelationship(data: {
    sourceUserId: string;
    targetUserId: string;
    relationshipType: string;
    organizationId?: string;
    canViewWorkouts?: boolean;
    canViewDiet?: boolean;
    canViewBodyMetrics?: boolean;
    canViewHydrationSleep?: boolean;
    canPrescribeWorkouts?: boolean;
    canPrescribeDiet?: boolean;
  }) {
    const id = `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(relationships).values({
      id,
      sourceUserId: data.sourceUserId,
      targetUserId: data.targetUserId,
      relationshipType: data.relationshipType,
      organizationId: data.organizationId || null,
      status: 'ACTIVE',
      canViewWorkouts: data.canViewWorkouts ?? true,
      canViewDiet: data.canViewDiet ?? false,
      canViewBodyMetrics: data.canViewBodyMetrics ?? true,
      canViewHydrationSleep: data.canViewHydrationSleep ?? false,
      canPrescribeWorkouts: data.canPrescribeWorkouts ?? false,
      canPrescribeDiet: data.canPrescribeDiet ?? false,
      requestedAt: now,
      acceptedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Registrar no histórico
    await db.insert(relationshipHistory).values({
      id: `rh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      relationshipId: id,
      sourceUserId: data.sourceUserId,
      targetUserId: data.targetUserId,
      oldStatus: 'NONE',
      newStatus: 'ACTIVE',
      reason: 'Relacionamento estabelecido',
      changedByUserId: data.sourceUserId,
      recordedAt: now,
    });

    const list = await db.select().from(relationships).where(eq(relationships.id, id)).limit(1);
    return list[0];
  }

  public static async terminateRelationship(
    relationshipId: string,
    changedByUserId: string,
    reason: string = 'Encerramento solicitado'
  ) {
    const list = await db.select().from(relationships).where(eq(relationships.id, relationshipId)).limit(1);
    if (list.length === 0) return null;

    const rel = list[0];
    const now = new Date();

    // Executa em transação para garantir integridade
    return await db.transaction(async (tx) => {
      await tx
        .update(relationships)
        .set({
          status: 'TERMINATED',
          terminatedAt: now,
          terminationReason: reason,
          updatedAt: now,
        })
        .where(eq(relationships.id, relationshipId));

      await tx.insert(relationshipHistory).values({
        id: `rh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        relationshipId,
        sourceUserId: rel.sourceUserId,
        targetUserId: rel.targetUserId,
        oldStatus: rel.status,
        newStatus: 'TERMINATED',
        reason,
        changedByUserId,
        recordedAt: now,
      });

      return { success: true, terminatedAt: now };
    });
  }

  // --- Convites ---
  public static async getInvitations(userId: string, targetEmail?: string) {
    if (targetEmail) {
      return db
        .select()
        .from(invitations)
        .where(or(eq(invitations.senderId, userId), eq(invitations.targetEmail, targetEmail.toLowerCase())));
    }
    return db.select().from(invitations).where(eq(invitations.senderId, userId));
  }

  public static async createInvitation(data: {
    senderId: string;
    targetEmail: string;
    targetName?: string;
    targetRole?: string;
    notes?: string;
  }) {
    const code = `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(invitations).values({
      id,
      senderId: data.senderId,
      targetEmail: data.targetEmail.toLowerCase().trim(),
      targetName: data.targetName || null,
      targetRole: data.targetRole || 'COACH',
      code,
      status: 'PENDING',
      notes: data.notes || '',
      createdAt: now,
    });

    const list = await db.select().from(invitations).where(eq(invitations.id, id)).limit(1);
    return list[0];
  }

  public static async acceptInvitation(code: string, acceptingUserId: string) {
    const list = await db.select().from(invitations).where(eq(invitations.code, code.trim().toUpperCase())).limit(1);
    if (list.length === 0) {
      throw new Error('Convite não encontrado ou código inválido');
    }

    const inv = list[0];
    if (inv.status !== 'PENDING') {
      throw new Error(`Convite já processado anteriormente (${inv.status})`);
    }

    const acceptingUserList = await db.select().from(users).where(eq(users.id, acceptingUserId)).limit(1);
    if (acceptingUserList.length === 0) {
      throw new Error('Usuário que está aceitando não foi encontrado');
    }
    const acceptingUser = acceptingUserList[0];

    // Validação estrita: convite deve corresponder ao e-mail se especificado
    if (inv.targetEmail && acceptingUser.email.toLowerCase() !== inv.targetEmail.toLowerCase()) {
      throw new Error('Este convite foi emitido para outro endereço de e-mail');
    }

    const now = new Date();
    const relId = `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Transação ACID de Aceite de Relacionamento
    return await db.transaction(async (tx) => {
      // 1. Atualizar convite para ACCEPTED
      await tx
        .update(invitations)
        .set({ status: 'ACCEPTED', respondedAt: now })
        .where(eq(invitations.id, inv.id));

      // 2. Criar relationship ativo
      const relType =
        inv.targetRole === 'NUTRITIONIST'
          ? 'USER_NUTRITIONIST'
          : inv.targetRole === 'GYM'
          ? 'USER_ACADEMY'
          : 'USER_PERSONAL';

      await tx.insert(relationships).values({
        id: relId,
        sourceUserId: inv.senderId,
        targetUserId: acceptingUserId,
        relationshipType: relType,
        status: 'ACTIVE',
        canViewWorkouts: true,
        canViewDiet: inv.targetRole === 'NUTRITIONIST',
        canViewBodyMetrics: true,
        canViewHydrationSleep: true,
        canPrescribeWorkouts: inv.targetRole === 'COACH',
        canPrescribeDiet: inv.targetRole === 'NUTRITIONIST',
        requestedAt: inv.createdAt,
        acceptedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      // 3. Registrar no histórico de relacionamentos
      await tx.insert(relationshipHistory).values({
        id: `rh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        relationshipId: relId,
        sourceUserId: inv.senderId,
        targetUserId: acceptingUserId,
        oldStatus: 'INVITATION_PENDING',
        newStatus: 'ACTIVE',
        reason: 'Convite aceito com sucesso',
        changedByUserId: acceptingUserId,
        recordedAt: now,
      });

      // 4. Registrar Consentimento LGPD
      const consentId = `cst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await tx.insert(consents).values({
        id: consentId,
        userId: inv.senderId,
        granteeId: acceptingUserId,
        scope: 'TRAINING_AND_HEALTH_ACCESS',
        status: 'ACTIVE',
        grantedAt: now,
      });

      await tx.insert(consentHistory).values({
        id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        consentId,
        userId: inv.senderId,
        granteeId: acceptingUserId,
        action: 'GRANTED',
        scope: 'TRAINING_AND_HEALTH_ACCESS',
        recordedAt: now,
      });

      return {
        success: true,
        relationshipId: relId,
        invitation: inv,
      };
    });
  }

  public static async rejectInvitation(code: string, rejectingUserId: string) {
    const list = await db.select().from(invitations).where(eq(invitations.code, code.trim().toUpperCase())).limit(1);
    if (list.length === 0) throw new Error('Convite não encontrado');

    const inv = list[0];
    if (inv.status !== 'PENDING') throw new Error('Convite já finalizado');

    await db
      .update(invitations)
      .set({ status: 'REJECTED', respondedAt: new Date() })
      .where(eq(invitations.id, inv.id));

    return { success: true };
  }

  // --- Consentimentos LGPD ---
  public static async getConsents(userId: string) {
    return db
      .select()
      .from(consents)
      .where(or(eq(consents.userId, userId), eq(consents.granteeId, userId)));
  }

  public static async revokeConsent(consentId: string, revokingUserId: string) {
    const list = await db.select().from(consents).where(eq(consents.id, consentId)).limit(1);
    if (list.length === 0) return null;

    const c = list[0];
    const now = new Date();

    return await db.transaction(async (tx) => {
      await tx
        .update(consents)
        .set({ status: 'REVOKED', revokedAt: now })
        .where(eq(consents.id, consentId));

      await tx.insert(consentHistory).values({
        id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        consentId,
        userId: c.userId,
        granteeId: c.granteeId,
        action: 'REVOKED',
        scope: c.scope,
        recordedAt: now,
      });

      return { success: true, revokedAt: now };
    });
  }
}
