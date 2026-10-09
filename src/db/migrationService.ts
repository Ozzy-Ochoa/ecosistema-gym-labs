import fs from 'fs';
import path from 'path';
import { db } from './index.ts';
import {
  users,
  profiles,
  userRoles,
  workoutSessions,
  meals,
  sleepSessions,
  bodyRecords,
  circumferences,
  relationships,
  invitations,
  messages,
  auditEvents,
} from './schema.ts';
import { eq } from 'drizzle-orm';
import { readUsersIndex, readUserPartition } from '../../server/database/db';

export interface MigrationSummary {
  recordsFound: number;
  recordsMigrated: number;
  recordsSkipped: number;
  recordsFailed: number;
  details: {
    users: number;
    profiles: number;
    roles: number;
    workouts: number;
    meals: number;
    sleep: number;
    bodyRecords: number;
    circumferences: number;
    relationships: number;
    invitations: number;
    messages: number;
    auditEvents: number;
  };
  errors: string[];
}

export async function runLocalToPostgresMigration(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    recordsFound: 0,
    recordsMigrated: 0,
    recordsSkipped: 0,
    recordsFailed: 0,
    details: {
      users: 0,
      profiles: 0,
      roles: 0,
      workouts: 0,
      meals: 0,
      sleep: 0,
      bodyRecords: 0,
      circumferences: 0,
      relationships: 0,
      invitations: 0,
      messages: 0,
      auditEvents: 0,
    },
    errors: [],
  };

  try {
    const userIndex = readUsersIndex();
    summary.recordsFound += userIndex.length;

    for (const indexEntry of userIndex) {
      try {
        const partition = readUserPartition(indexEntry.id);
        if (!partition || !partition.user) {
          summary.recordsSkipped++;
          continue;
        }

        const u = partition.user;

        // Migração transacional por partição de usuário para evitar estados parciais inconsistentes
        await db.transaction(async (tx) => {
          // 1. Migrar Usuário (Upsert idempotente)
          const existingUser = await tx.select().from(users).where(eq(users.id, u.id)).limit(1);
          if (existingUser.length === 0) {
            await tx.insert(users).values({
              id: u.id,
              email: u.email.toLowerCase(),
              name: u.name,
              passwordHash: u.passwordHash,
              pinHash: u.pinHash,
              recoveryKeyHash: u.recoveryKeyHash,
              status: 'ACTIVE',
              jurisdiction: 'BR',
              language: 'pt',
              timezone: 'America/Sao_Paulo',
              unitSystem: 'METRIC',
              isDemo: Boolean(u.isDemo),
              twoFactorEnabled: Boolean(u.twoFactorEnabled),
              twoFactorSecret: u.twoFactorSecret,
              createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
              updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
            });
            summary.recordsMigrated++;
            summary.details.users++;

            // 2. Perfil Inicial
            await tx.insert(profiles).values({
              id: `prf-${u.id}`,
              userId: u.id,
              provenanceType: u.isDemo ? 'DEMO' : 'REAL',
              createdAt: new Date(),
              updatedAt: new Date(),
            }).catch(() => {});
            summary.recordsMigrated++;
            summary.details.profiles++;

            // 3. Papel de Acesso (RBAC)
            const roleName = (u.role || 'USER').toUpperCase();
            await tx.insert(userRoles).values({
              id: `ur-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              userId: u.id,
              roleName: ['USER', 'COACH', 'NUTRITIONIST', 'GYM', 'ADMIN'].includes(roleName) ? roleName : 'USER',
              assignedAt: new Date(),
            }).catch(() => {});
            summary.recordsMigrated++;
            summary.details.roles++;
          } else {
            summary.recordsSkipped++;
          }

          // 4. Workouts
          if (Array.isArray(partition.workouts)) {
            summary.recordsFound += partition.workouts.length;
            for (const w of partition.workouts) {
              const existingWkt = await tx.select().from(workoutSessions).where(eq(workoutSessions.id, w.id)).limit(1);
              if (existingWkt.length === 0) {
                await tx.insert(workoutSessions).values({
                  id: w.id || `wkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  userId: u.id,
                  title: w.name || w.title || 'Treino Registrado',
                  startedAt: w.startedAt ? new Date(w.startedAt) : new Date(),
                  endedAt: w.completedAt ? new Date(w.completedAt) : new Date(),
                  durationMinutes: Number(w.durationMinutes) || 60,
                  sessionRpe: Number(w.sessionRpe) || 8,
                  workloadUnits: Number(w.workloadUnits) || 480,
                  exercisesJson: w.exercises || [],
                  notes: w.notes || '',
                  provenanceType: u.isDemo ? 'DEMO' : 'REAL',
                  createdAt: w.recordedAt ? new Date(w.recordedAt) : new Date(),
                });
                summary.recordsMigrated++;
                summary.details.workouts++;
              }
            }
          }

          // 5. Nutrição / Meals
          if (Array.isArray(partition.nutrition)) {
            summary.recordsFound += partition.nutrition.length;
            for (const m of partition.nutrition) {
              const existingMeal = await tx.select().from(meals).where(eq(meals.id, m.id)).limit(1);
              if (existingMeal.length === 0) {
                await tx.insert(meals).values({
                  id: m.id || `nut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  userId: u.id,
                  name: m.name || 'Refeição',
                  consumedAt: m.timestamp ? new Date(m.timestamp) : new Date(),
                  calories: Number(m.calories) || 0,
                  proteinGrams: Number(m.proteinGrams) || 0,
                  carbsGrams: Number(m.carbsGrams) || 0,
                  fatsGrams: Number(m.fatsGrams) || 0,
                  itemsJson: m.items || [],
                  provenanceType: u.isDemo ? 'DEMO' : 'REAL',
                  createdAt: new Date(),
                });
                summary.recordsMigrated++;
                summary.details.meals++;
              }
            }
          }

          // 6. Sono
          if (Array.isArray(partition.sleep)) {
            summary.recordsFound += partition.sleep.length;
            for (const s of partition.sleep) {
              const existingSleep = await tx.select().from(sleepSessions).where(eq(sleepSessions.id, s.id)).limit(1);
              if (existingSleep.length === 0) {
                await tx.insert(sleepSessions).values({
                  id: s.id || `slp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  userId: u.id,
                  bedtime: s.bedtime ? new Date(s.bedtime) : new Date(),
                  wakeTime: s.wakeTime ? new Date(s.wakeTime) : new Date(),
                  durationMinutes: Number(s.durationMinutes) || 450,
                  efficiencyPct: Number(s.efficiencyPct) || 88,
                  deepSleepMinutes: Number(s.deepSleepMinutes) || 90,
                  remSleepMinutes: Number(s.remSleepMinutes) || 105,
                  sleepQualityRpe: Number(s.sleepQualityRpe) || 8,
                  restingHrvRmssd: Number(s.nocturnalHrvRmsddMs) || 60,
                  restingHeartRateBpm: Number(s.restingHeartRateBpm) || 55,
                  provenanceType: u.isDemo ? 'DEMO' : 'REAL',
                  createdAt: new Date(),
                });
                summary.recordsMigrated++;
                summary.details.sleep++;
              }
            }
          }

          // 7. Biometria e Antropometria (bodyRecords e circumferences)
          if (Array.isArray(partition.body)) {
            summary.recordsFound += partition.body.length;
            for (const b of partition.body) {
              if (b.weightKg !== undefined || b.weight !== undefined) {
                const bId = b.id || `bdy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                const existingBody = await tx.select().from(bodyRecords).where(eq(bodyRecords.id, bId)).limit(1);
                if (existingBody.length === 0) {
                  await tx.insert(bodyRecords).values({
                    id: bId,
                    userId: u.id,
                    weightKg: Number(b.weightKg ?? b.weight) || 75,
                    heightCm: b.heightCm ? Number(b.heightCm) : null,
                    bodyFatPct: b.bodyFatPct ? Number(b.bodyFatPct) : null,
                    skeletalMuscleKg: b.skeletalMuscleKg ? Number(b.skeletalMuscleKg) : null,
                    provenanceType: u.isDemo ? 'DEMO' : 'REAL',
                    recordedAt: b.recordedAt || b.timestamp ? new Date(b.recordedAt || b.timestamp) : new Date(),
                    createdAt: new Date(),
                  });
                  summary.recordsMigrated++;
                  summary.details.bodyRecords++;
                }
              }

              if (b.circumferences && typeof b.circumferences === 'object') {
                const cId = `circ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                await tx.insert(circumferences).values({
                  id: cId,
                  userId: u.id,
                  waistCm: b.circumferences.waistCm ? Number(b.circumferences.waistCm) : null,
                  hipCm: b.circumferences.hipCm ? Number(b.circumferences.hipCm) : null,
                  chestCm: b.circumferences.chestCm ? Number(b.circumferences.chestCm) : null,
                  armCm: b.circumferences.armCm ? Number(b.circumferences.armCm) : null,
                  thighCm: b.circumferences.thighCm ? Number(b.circumferences.thighCm) : null,
                  calfCm: b.circumferences.calfCm ? Number(b.circumferences.calfCm) : null,
                  provenanceType: u.isDemo ? 'DEMO' : 'REAL',
                  recordedAt: b.recordedAt || b.timestamp ? new Date(b.recordedAt || b.timestamp) : new Date(),
                  createdAt: new Date(),
                });
                summary.recordsMigrated++;
                summary.details.circumferences++;
              }
            }
          }

          // 8. Relacionamentos
          if (Array.isArray(partition.relationships)) {
            summary.recordsFound += partition.relationships.length;
            for (const r of partition.relationships) {
              const existingRel = await tx.select().from(relationships).where(eq(relationships.id, r.id)).limit(1);
              if (existingRel.length === 0) {
                await tx.insert(relationships).values({
                  id: r.id || `rel-${Date.now()}`,
                  sourceUserId: r.userId || u.id,
                  targetUserId: r.professionalId || r.targetUserId || u.id,
                  relationshipType: r.relationshipType || 'USER_PERSONAL',
                  organizationId: r.organizationId,
                  status: r.status || 'ACTIVE',
                  canViewWorkouts: Boolean(r.permissions?.canViewWorkouts ?? true),
                  canViewDiet: Boolean(r.permissions?.canViewDiet ?? false),
                  canViewBodyMetrics: Boolean(r.permissions?.canViewBodyMetrics ?? true),
                  canViewHydrationSleep: Boolean(r.permissions?.canViewHydrationAndSleep ?? false),
                  canPrescribeWorkouts: Boolean(r.permissions?.canPrescribeWorkouts ?? false),
                  canPrescribeDiet: Boolean(r.permissions?.canPrescribeDiet ?? false),
                  requestedAt: r.requestedAt ? new Date(r.requestedAt) : new Date(),
                  acceptedAt: r.acceptedAt ? new Date(r.acceptedAt) : new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                summary.recordsMigrated++;
                summary.details.relationships++;
              }
            }
          }

          // 9. Convites
          if (Array.isArray(partition.invitations)) {
            summary.recordsFound += partition.invitations.length;
            for (const inv of partition.invitations) {
              const existingInv = await tx.select().from(invitations).where(eq(invitations.id, inv.id)).limit(1);
              if (existingInv.length === 0) {
                await tx.insert(invitations).values({
                  id: inv.id || `inv-${Date.now()}`,
                  senderId: inv.senderId || u.id,
                  targetEmail: inv.targetEmail || 'atleta@gymlabs.com',
                  targetName: inv.targetName,
                  targetRole: inv.targetRole || 'COACH',
                  code: inv.code || `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                  status: inv.status || 'PENDING',
                  notes: inv.notes,
                  createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
                });
                summary.recordsMigrated++;
                summary.details.invitations++;
              }
            }
          }

          // 10. Mensagens
          if (Array.isArray(partition.messages)) {
            summary.recordsFound += partition.messages.length;
            for (const msg of partition.messages) {
              const existingMsg = await tx.select().from(messages).where(eq(messages.id, msg.id)).limit(1);
              if (existingMsg.length === 0) {
                await tx.insert(messages).values({
                  id: msg.id || `msg-${Date.now()}`,
                  conversationId: msg.conversationId || 'conv_default',
                  senderId: msg.senderId || u.id,
                  recipientId: msg.receiverId || u.id,
                  content: msg.text || msg.content || '',
                  read: Boolean(msg.read),
                  createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                });
                summary.recordsMigrated++;
                summary.details.messages++;
              }
            }
          }

          // 11. Trilha de Auditoria Histórica
          if (Array.isArray(partition.auditLogs)) {
            summary.recordsFound += partition.auditLogs.length;
            for (const aud of partition.auditLogs) {
              const existingAud = await tx.select().from(auditEvents).where(eq(auditEvents.id, aud.id)).limit(1);
              if (existingAud.length === 0) {
                await tx.insert(auditEvents).values({
                  id: aud.id || `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  userId: u.id,
                  eventType: aud.eventType || 'LEGACY_LOG',
                  resourceId: aud.resourceId || null,
                  detailsJson: aud.metadata || aud.details || {},
                  ipHash: aud.ipAddress || aud.ipHash || null,
                  chainHash: aud.chainHash || 'LEGACY_MIGRATION_CHAIN_HASH',
                  recordedAt: aud.timestamp ? new Date(aud.timestamp) : new Date(),
                });
                summary.recordsMigrated++;
                summary.details.auditEvents++;
              }
            }
          }
        });
      } catch (err: any) {
        summary.recordsFailed++;
        summary.errors.push(`User partition error for ${indexEntry.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    summary.errors.push(`Global migration error: ${err.message}`);
  }

  return summary;
}
