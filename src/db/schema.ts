import { pgTable, text, timestamp, boolean, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Identidade Central do Usuário (Multi-tenant & Multi-role)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // 'usr-...'
  uid: text('uid').unique(), // Firebase Auth UID (opcional/link)
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  preferredName: text('preferred_name'),
  passwordHash: text('password_hash'),
  pinHash: text('pin_hash'),
  recoveryKeyHash: text('recovery_key_hash'),
  status: text('status').default('ACTIVE').notNull(),
  jurisdiction: text('jurisdiction').default('BR').notNull(),
  language: text('language').default('pt').notNull(),
  timezone: text('timezone').default('America/Sao_Paulo').notNull(),
  unitSystem: text('unit_system').default('METRIC').notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  twoFactorSecret: text('two_factor_secret'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Perfil Fisiológico e Metas
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  dateOfBirth: text('date_of_birth'), // YYYY-MM-DD
  biologicalSex: text('biological_sex'), // 'MALE' | 'FEMALE' | 'NOT_SPECIFIED'
  weightKg: real('weight_kg'),
  heightCm: real('height_cm'),
  activityLevel: text('activity_level'),
  primaryGoal: text('primary_goal'),
  experienceYears: integer('experience_years'),
  dietaryRestrictions: jsonb('dietary_restrictions').$type<string[]>(),
  provenanceType: text('provenance_type').default('REAL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Papéis (Multi-Role Support)
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(), // 'USER' | 'PERSONAL_TRAINER' | 'NUTRITIONIST' | 'ACADEMY_ADMIN' | 'ADMIN'
  description: text('description'),
});

export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roleName: text('role_name').notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

// 4. Organizações e Academias (Multi-Tenant Org Hub)
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tradeName: text('trade_name'),
  legalNumber: text('legal_number'), // CNPJ
  ownerId: text('owner_id').references(() => users.id),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const organizationMembers = pgTable('organization_members', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'OWNER' | 'ADMIN' | 'COACH' | 'STAFF' | 'STUDENT'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 5. Profissionais Habilitados (CREF / CRN)
export const professionals = pgTable('professionals', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  professionalType: text('professional_type').notNull(), // 'PERSONAL_TRAINER' | 'NUTRITIONIST'
  councilRegistration: text('council_registration').notNull(), // CREF ou CRN
  jurisdictionState: text('jurisdiction_state').default('SP').notNull(),
  verificationStatus: text('verification_status').default('UNVERIFIED').notNull(),
  verifiedAt: timestamp('verified_at'),
  specialties: jsonb('specialties').$type<string[]>(),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Relacionamentos Inter-Usuários & Autorizações (Isolation & RBAC)
export const relationships = pgTable('relationships', {
  id: text('id').primaryKey(),
  sourceUserId: text('source_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetUserId: text('target_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  relationshipType: text('relationship_type').notNull(), // 'USER_PERSONAL' | 'USER_NUTRITIONIST' | 'USER_ACADEMY' | etc.
  organizationId: text('organization_id').references(() => organizations.id),
  status: text('status').default('PENDING').notNull(), // 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED' | 'TERMINATED'
  canViewWorkouts: boolean('can_view_workouts').default(true).notNull(),
  canViewDiet: boolean('can_view_diet').default(false).notNull(),
  canViewBodyMetrics: boolean('can_view_body_metrics').default(true).notNull(),
  canViewHydrationSleep: boolean('can_view_hydration_sleep').default(false).notNull(),
  canPrescribeWorkouts: boolean('can_prescribe_workouts').default(false).notNull(),
  canPrescribeDiet: boolean('can_prescribe_diet').default(false).notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  terminatedAt: timestamp('terminated_at'),
  terminationReason: text('termination_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invitations = pgTable('invitations', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetEmail: text('target_email').notNull(),
  targetName: text('target_name'),
  targetRole: text('target_role').default('COACH').notNull(),
  code: text('code').notNull().unique(), // GL-XXXXXX
  status: text('status').default('PENDING').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
});

// 7. Consentimentos LGPD
export const consents = pgTable('consents', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  granteeId: text('grantee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  scope: text('scope').notNull(), // 'TRAINING_READ' | 'BODY_READ' | 'NUTRITION_READ' | 'ALL_DATA'
  status: text('status').default('ACTIVE').notNull(),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
});

// 8. Treinamento
export const workouts = pgTable('workouts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  prescribedById: text('prescribed_by_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  daysPerWeek: integer('days_per_week').default(3).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workoutSessions = pgTable('workout_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  workoutId: text('workout_id').references(() => workouts.id),
  title: text('title').notNull(),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at').notNull(),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  sessionRpe: real('session_rpe').default(8).notNull(),
  workloadUnits: real('workload_units').default(480).notNull(),
  exercisesJson: jsonb('exercises_json').notNull(),
  notes: text('notes'),
  provenanceType: text('provenance_type').default('REAL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exercises = pgTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  pattern: text('pattern').notNull(),
  primaryMuscles: jsonb('primary_muscles').$type<string[]>().notNull(),
  secondaryMuscles: jsonb('secondary_muscles').$type<string[]>(),
  equipment: text('equipment').notNull(),
  evidenceNotes: text('evidence_notes'),
  isStandard: boolean('is_standard').default(true).notNull(),
  createdByUserId: text('created_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const attendanceLogs = pgTable('attendance_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dateString: text('date_string').notNull(), // YYYY-MM-DD
  status: text('status').default('ATTENDED').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 9. Nutrição
export const nutritionPlans = pgTable('nutrition_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  prescribedById: text('prescribed_by_id').references(() => users.id),
  title: text('title').notNull(),
  calorieTargetKcal: integer('calorie_target_kcal').notNull(),
  proteinTargetGrams: integer('protein_target_grams').notNull(),
  carbsTargetGrams: integer('carbs_target_grams').notNull(),
  fatsTargetGrams: integer('fats_target_grams').notNull(),
  waterTargetMl: integer('water_target_ml').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const meals = pgTable('meals', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: text('plan_id').references(() => nutritionPlans.id),
  name: text('name').notNull(),
  consumedAt: timestamp('consumed_at').defaultNow().notNull(),
  calories: integer('calories').default(0).notNull(),
  proteinGrams: integer('protein_grams').default(0).notNull(),
  carbsGrams: integer('carbs_grams').default(0).notNull(),
  fatsGrams: integer('fats_grams').default(0).notNull(),
  itemsJson: jsonb('items_json'),
  provenanceType: text('provenance_type').default('REAL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hydrationLogs = pgTable('hydration_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amountMl: integer('amount_ml').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 10. Sono e Prontidão
export const sleepSessions = pgTable('sleep_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bedtime: timestamp('bedtime').notNull(),
  wakeTime: timestamp('wake_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  efficiencyPct: integer('efficiency_pct').notNull(),
  deepSleepMinutes: integer('deep_sleep_minutes'),
  remSleepMinutes: integer('rem_sleep_minutes'),
  sleepQualityRpe: integer('sleep_quality_rpe').notNull(),
  restingHrvRmssd: real('resting_hrv_rmssd'),
  restingHeartRateBpm: integer('resting_heart_rate_bpm'),
  provenanceType: text('provenance_type').default('REAL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wellnessLogs = pgTable('wellness_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sorenessScore: integer('soreness_score').notNull(),
  stressScore: integer('stress_score').notNull(),
  fatigueScore: integer('fatigue_score').notNull(),
  moodScore: integer('mood_score').notNull(),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 11. Biometria e Antropometria
export const bodyRecords = pgTable('body_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  weightKg: real('weight_kg').notNull(),
  heightCm: real('height_cm'),
  bodyFatPct: real('body_fat_pct'),
  skeletalMuscleKg: real('skeletal_muscle_kg'),
  provenanceType: text('provenance_type').default('REAL').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const circumferences = pgTable('circumferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  waistCm: real('waist_cm'),
  hipCm: real('hip_cm'),
  chestCm: real('chest_cm'),
  armCm: real('arm_cm'),
  thighCm: real('thigh_cm'),
  calfCm: real('calf_cm'),
  provenanceType: text('provenance_type').default('REAL').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Mensageria Relacional (Chat)
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  type: text('type').default('DIRECT').notNull(), // 'DIRECT' | 'INTER_PROFESSIONAL'
  studentContextId: text('student_context_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversationParticipants = pgTable('conversation_participants', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  unreadCount: integer('unread_count').default(0).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  senderId: text('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  recipientId: text('recipient_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  attachmentName: text('attachment_name'),
  attachmentType: text('attachment_type'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Trilha de Auditoria Criptográfica
export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  eventType: text('event_type').notNull(),
  resourceId: text('resource_id'),
  detailsJson: jsonb('details_json'),
  ipHash: text('ip_hash'),
  chainHash: text('chain_hash').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 14. Sessões de Autenticação Seguras
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  deviceId: text('device_id'),
  ipHash: text('ip_hash'),
  userAgentHash: text('user_agent_hash'),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessionDevices = pgTable('session_devices', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceName: text('device_name').notNull(),
  deviceType: text('device_type').default('BROWSER').notNull(),
  ipHash: text('ip_hash'),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
});

// 15. Permissões e RBAC Granular
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // 'WORKOUT_READ' | 'WORKOUT_WRITE' | 'BODY_READ' | etc.
  description: text('description'),
});

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleName: text('role_name').notNull(),
  permissionCode: text('permission_code').notNull(),
});

// 16. Histórico de Relacionamentos e Consentimentos
export const relationshipHistory = pgTable('relationship_history', {
  id: text('id').primaryKey(),
  relationshipId: text('relationship_id').references(() => relationships.id, { onDelete: 'cascade' }).notNull(),
  sourceUserId: text('source_user_id').notNull(),
  targetUserId: text('target_user_id').notNull(),
  oldStatus: text('old_status').notNull(),
  newStatus: text('new_status').notNull(),
  reason: text('reason'),
  changedByUserId: text('changed_by_user_id').references(() => users.id).notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

export const consentHistory = pgTable('consent_history', {
  id: text('id').primaryKey(),
  consentId: text('consent_id').references(() => consents.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  granteeId: text('grantee_id').notNull(),
  action: text('action').notNull(), // 'GRANTED' | 'REVOKED' | 'MODIFIED'
  scope: text('scope').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 17. Credenciais Profissionais e Equipe de Academia
export const professionalCredentials = pgTable('professional_credentials', {
  id: text('id').primaryKey(),
  professionalId: text('professional_id').references(() => professionals.id, { onDelete: 'cascade' }).notNull(),
  councilType: text('council_type').notNull(), // 'CREF' | 'CRN'
  councilNumber: text('council_number').notNull(),
  state: text('state').notNull(),
  verificationStatus: text('verification_status').default('UNVERIFIED').notNull(),
  documentUrl: text('document_url'),
  verifiedAt: timestamp('verified_at'),
  verifiedByUserId: text('verified_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const academyStaff = pgTable('academy_staff', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'COACH' | 'STAFF' | 'MANAGER'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 18. Leitura de Mensagens & Detalhes de Exercício / Itens de Refeição
export const messageReads = pgTable('message_reads', {
  id: text('id').primaryKey(),
  messageId: text('message_id').references(() => messages.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  readAt: timestamp('read_at').defaultNow().notNull(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => workoutSessions.id, { onDelete: 'cascade' }).notNull(),
  exerciseId: text('exercise_id').references(() => exercises.id),
  orderIndex: integer('order_index').default(0).notNull(),
  notes: text('notes'),
});

export const workoutSets = pgTable('workout_sets', {
  id: text('id').primaryKey(),
  workoutExerciseId: text('workout_exercise_id').references(() => workoutExercises.id, { onDelete: 'cascade' }).notNull(),
  setNumber: integer('set_number').notNull(),
  weightKg: real('weight_kg').default(0).notNull(),
  reps: integer('reps').default(0).notNull(),
  rpe: real('rpe'),
  rir: integer('rir'),
  isFailure: boolean('is_failure').default(false).notNull(),
});

export const mealItems = pgTable('meal_items', {
  id: text('id').primaryKey(),
  mealId: text('meal_id').references(() => meals.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  amountGrams: real('amount_grams').default(100).notNull(),
  calories: integer('calories').default(0).notNull(),
  proteinGrams: real('protein_grams').default(0).notNull(),
  carbsGrams: real('carbs_grams').default(0).notNull(),
  fatsGrams: real('fats_grams').default(0).notNull(),
});

// Relacionamentos Drizzle
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  roles: many(userRoles),
  sessions: many(sessions),
  workoutSessions: many(workoutSessions),
  meals: many(meals),
  sleepSessions: many(sleepSessions),
  bodyRecords: many(bodyRecords),
  auditEvents: many(auditEvents),
}));
