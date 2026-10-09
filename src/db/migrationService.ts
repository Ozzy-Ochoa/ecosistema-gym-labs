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
  conversations,
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
    conversations: number;
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
      conversations: 0,
      messages: 0,
      auditEvents: 0,
    },
    errors: [],
  };

  try {
    const userIndex = readUsersIndex();

    for (const indexEntry of userIndex) {
      try {
        const partition = readUserPartition(indexEntry.id);
        if (!partition || !partition.user) {
          summary.recordsSkipped++;
          continue;
        }

        const u = partition.user;

        // Buffers locais para contagem pós-confirmação real da transação
        const pendingCounts = {
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
          conversations: 0,
          messages: 0,
          auditEvents: 0,
        };
        let pendingMigrated = 0;
        let pendingSkipped = 0;
        let pendingFound = 1; // O próprio usuário

        // Migração transacional ACID por partição de usuário
        await db.transaction(async (tx) => {
          // 1. Migrar Usuário (Idempotente, sem sobrescrever registros PostgreSQL existentes)
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
            pendingMigrated++;
            pendingCounts.users++;
          } else {
            pendingSkipped++;
          }

          // 2. Perfil Inicial (garante integridade referencial mesmo para usuários preexistentes)
          const existingProfile = await tx.select().from(profiles).where(eq(profiles.userId, u.id)).limit(1);
          if (existingProfile.length === 0) {
            await tx.insert(profiles).values({
              id: `prf-${u.id}`,
              userId: u.id,
              provenanceType: u.isDemo ? 'DEMO' : 'REAL',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            pendingMigrated++;
            pendingCounts.profiles++;
          } else {
            pendingSkipped++;
          }

          // 3. Papel de Acesso (RBAC obrigatório para usuário completo)
          const existingRoles = await tx.select().from(userRoles).where(eq(userRoles.userId, u.id)).limit(1);
          if (existingRoles.length === 0) {
            const roleName = (u.role || 'USER').toUpperCase();
            await tx.insert(userRoles).values({
              id: `ur-${u.id}-${Date.now()}`,
              userId: u.id,
              roleName: ['USER', 'COACH', 'NUTRITIONIST', 'GYM', 'ADMIN'].includes(roleName) ? roleName : 'USER',
              assignedAt: new Date(),
            });
            pendingMigrated++;
            pendingCounts.roles++;
          } else {
            pendingSkipped++;
          }

          // 4. Workouts
          if (Array.isArray(partition.workouts)) {
            pendingFound += partition.workouts.length;
            for (const w of partition.workouts) {
              const wktId = w.id || `wkt-${u.id}-${w.startedAt || w.recordedAt || Date.now()}`;
              const existingWkt = await tx.select().from(workoutSessions).where(eq(workoutSessions.id, wktId)).limit(1);
              if (existingWkt.length === 0) {
                await tx.insert(workoutSessions).values({
                  id: wktId,
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
                pendingMigrated++;
                pendingCounts.workouts++;
              } else {
                pendingSkipped++;
              }
            }
          }

          // 5. Nutrição / Meals
          if (Array.isArray(partition.nutrition)) {
            pendingFound += partition.nutrition.length;
            for (const m of partition.nutrition) {
              const mealId = m.id || `nut-${u.id}-${m.timestamp || Date.now()}`;
              const existingMeal = await tx.select().from(meals).where(eq(meals.id, mealId)).limit(1);
              if (existingMeal.length === 0) {
                await tx.insert(meals).values({
                  id: mealId,
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
                pendingMigrated++;
                pendingCounts.meals++;
              } else {
                pendingSkipped++;
              }
            }
          }

          // 6. Sono
          if (Array.isArray(partition.sleep)) {
            pendingFound += partition.sleep.length;
            for (const s of partition.sleep) {
              const sleepId = s.id || `slp-${u.id}-${s.bedtime || Date.now()}`;
              const existingSleep = await tx.select().from(sleepSessions).where(eq(sleepSessions.id, sleepId)).limit(1);
              if (existingSleep.length === 0) {
                await tx.insert(sleepSessions).values({
                  id: sleepId,
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
                pendingMigrated++;
                pendingCounts.sleep++;
              } else {
                pendingSkipped++;
              }
            }
          }

          // 7. Biometria e Antropometria (bodyRecords e circumferences com idempotência)
          if (Array.isArray(partition.body)) {
            pendingFound += partition.body.length;
            for (const b of partition.body) {
              const bId = b.id || `bdy-${u.id}-${b.recordedAt || b.timestamp || Date.now()}`;
              if (b.weightKg !== undefined || b.weight !== undefined) {
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
                  pendingMigrated++;
                  pendingCounts.bodyRecords++;
                } else {
                  pendingSkipped++;
                }
              }

              if (b.circumferences && typeof b.circumferences === 'object') {
                const cId = `circ-${bId}`;
                const existingCirc = await tx.select().from(circumferences).where(eq(circumferences.id, cId)).limit(1);
                if (existingCirc.length === 0) {
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
                  pendingMigrated++;
                  pendingCounts.circumferences++;
                } else {
                  pendingSkipped++;
                }
              }
            }
          }

          // 8. Relacionamentos
          if (Array.isArray(partition.relationships)) {
            pendingFound += partition.relationships.length;
            for (const r of partition.relationships) {
              const rId = r.id || `rel-${r.userId || u.id}-${r.professionalId || r.targetUserId || u.id}`;
              const existingRel = await tx.select().from(relationships).where(eq(relationships.id, rId)).limit(1);
              if (existingRel.length === 0) {
                await tx.insert(relationships).values({
                  id: rId,
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
                pendingMigrated++;
                pendingCounts.relationships++;
              } else {
                pendingSkipped++;
              }
            }
          }

          // 9. Convites
          if (Array.isArray(partition.invitations)) {
            pendingFound += partition.invitations.length;
            for (const inv of partition.invitations) {
              const invId = inv.id || `inv-${u.id}-${inv.code || inv.targetEmail || Date.now()}`;
              const existingInv = await tx.select().from(invitations).where(eq(invitations.id, invId)).limit(1);
              if (existingInv.length === 0) {
                await tx.insert(invitations).values({
                  id: invId,
                  senderId: inv.senderId || u.id,
                  targetEmail: inv.targetEmail || 'atleta@gymlabs.com',
                  targetName: inv.targetName,
                  targetRole: inv.targetRole || 'COACH',
                  code: inv.code || `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                  status: inv.status || 'PENDING',
                  notes: inv.notes,
                  createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
                });
                pendingMigrated++;
                pendingCounts.invitations++;
              } else {
                pendingSkipped++;
              }
            }
          }

          // 10. Mensagens e Conversas (Garantir integridade referencial de chave estrangeira)
          if (Array.isArray(partition.messages)) {
            pendingFound += partition.messages.length;
            for (const msg of partition.messages) {
              const convId = msg.conversationId || `conv_default_${u.id}`;
              const existingConv = await tx.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
              if (existingConv.length === 0) {
                await tx.insert(conversations).values({
                  id: convId,
                  type: 'DIRECT',
                  studentContextId: u.id,
                  createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                  updatedAt: new Date(),
                });
                pendingMigrated++;
                pendingCounts.conversations++;
              }

              const msgId = msg.id || `msg-${convId}-${msg.timestamp || Date.now()}`;
              const existingMsg = await tx.select().from(messages).where(eq(messages.id, msgId)).limit(1);
              if (existingMsg.length === 0) {
                await tx.insert(messages).values({
                  id: msgId,
                  conversationId: convId,
                  senderId: msg.senderId || u.id,
                  recipientId: msg.receiverId || u.id,
                  content: msg.text || msg.content || '',
                  read: Boolean(msg.read),
                  createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                });
                pendingMigrated++;
                pendingCounts.messages++;
              } else {
                pendingSkipped++;
              }
            }
          }

          // 11. Trilha de Auditoria Histórica
          if (Array.isArray(partition.auditLogs)) {
            pendingFound += partition.auditLogs.length;
            for (const aud of partition.auditLogs) {
              const audId = aud.id || `aud-${u.id}-${aud.timestamp || aud.recordedAt || Date.now()}`;
              const existingAud = await tx.select().from(auditEvents).where(eq(auditEvents.id, audId)).limit(1);
              if (existingAud.length === 0) {
                await tx.insert(auditEvents).values({
                  id: audId,
                  userId: u.id,
                  eventType: aud.eventType || 'LEGACY_LOG',
                  resourceId: aud.resourceId || null,
                  detailsJson: aud.metadata || aud.details || {},
                  ipHash: aud.ipAddress || aud.ipHash || null,
                  chainHash: aud.chainHash || 'LEGACY_MIGRATION_CHAIN_HASH',
                  recordedAt: aud.timestamp ? new Date(aud.timestamp) : new Date(),
                });
                pendingMigrated++;
                pendingCounts.auditEvents++;
              } else {
                pendingSkipped++;
              }
            }
          }
        });

        // Contabiliza com precisão SOMENTE após a transação ser concluída e validada
        summary.recordsFound += pendingFound;
        summary.recordsMigrated += pendingMigrated;
        summary.recordsSkipped += pendingSkipped;
        for (const [key, val] of Object.entries(pendingCounts)) {
          (summary.details as any)[key] = ((summary.details as any)[key] || 0) + val;
        }
      } catch (err: any) {
        // Se a transação falhou e sofreu rollback, nenhum registro pendente é contabilizado como migrado!
        summary.recordsFailed++;
        const safeErrMsg = String(err.message || 'Erro desconhecido')
          .replace(/(password|token|secret|key|pin|hash)[=:][^\s,]+/gi, '$1=[REDACTED]');
        summary.errors.push(`[USER: ${indexEntry.id}] ${safeErrMsg}`);
      }
    }
  } catch (err: any) {
    summary.errors.push(`Global migration error: ${err.message}`);
  }

  return summary;
}
