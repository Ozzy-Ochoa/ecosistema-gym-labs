/**
 * GYM LABS — RELATIONAL DATABASE SCHEMA MAPPING SPECIFICATION (FASE 02)
 * 
 * Mapeamento das 19 entidades centrais do domínio para futura persistência
 * relacional (PostgreSQL / Cloud SQL com Drizzle ou Prisma ORM).
 * 
 * Este arquivo define a arquitetura de tabelas, chaves primárias/estrangeiras,
 * índices recomendados e classificação LGPD de dados sensíveis.
 */

export interface DbUserTable {
  id: string; // UUID v4 / PK
  email: string; // UNIQUE INDEX
  name: string;
  preferred_name?: string;
  password_hash: string; // scrypt/argon2id
  pin_hash?: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'ARCHIVED';
  jurisdiction_code: 'BR' | 'US' | 'EU' | 'MX' | 'GLOBAL';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  unit_system: 'METRIC' | 'IMPERIAL';
  is_demo: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  recovery_key_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface DbRoleTable {
  id: string; // PK
  code: 'USER' | 'PERSONAL_TRAINER' | 'NUTRITIONIST' | 'ACADEMY_ADMIN' | 'ACADEMY_STAFF' | 'SUPPORT' | 'ADMIN';
  description: string;
  created_at: string;
}

export interface DbUserRoleTable {
  user_id: string; // FK -> DbUserTable.id
  role_id: string; // FK -> DbRoleTable.id
  assigned_at: string;
}

export interface DbPermissionTable {
  id: string; // PK
  code: string; // e.g. 'WORKOUT:READ', 'WORKOUT:WRITE', 'DIET:READ', 'DIET:WRITE'
  description: string;
}

export interface DbProfileTable {
  id: string; // PK
  user_id: string; // UNIQUE FK -> DbUserTable.id
  date_of_birth?: string; // YYYY-MM-DD
  biological_sex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED'; // LGPD Sensível
  activity_level?: string;
  primary_goal?: string;
  experience_years?: number;
  dietary_restrictions?: string[];
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface DbHealthProfileTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  blood_type?: string;
  known_allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
  clinical_clearance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DbBodyMeasurementTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  recorded_at: string; // INDEX
  weight_kg?: number;
  height_cm?: number;
  body_fat_pct?: number;
  skeletal_muscle_mass_kg?: number;
  fat_mass_kg?: number;
  waist_cm?: number;
  hip_cm?: number;
  chest_cm?: number;
  arm_cm?: number;
  thigh_cm?: number;
  calf_cm?: number;
  provenance_type: 'REAL' | 'CALCULATED' | 'ESTIMATED' | 'INFERRED' | 'DEMO';
  created_at: string;
}

export interface DbWorkoutTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id (Atleta proprietário)
  prescribed_by_id?: string; // FK -> DbUserTable.id (Personal criador, se houver)
  name: string;
  description?: string;
  days_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbExerciseTable {
  id: string; // PK
  name: string; // INDEX
  category: string;
  primary_muscle: string;
  movement_pattern: string;
  equipment: string;
  instruction_notes?: string;
  is_standard: boolean; // Padrão de fábrica vs Customizado pelo usuário
  created_by_user_id?: string; // FK -> DbUserTable.id (opcional)
  created_at: string;
}

export interface DbWorkoutSessionTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  workout_id?: string; // FK -> DbWorkoutTable.id
  name: string;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  session_rpe: number; // CR-10 (Foster)
  workload_units: number; // Foster Load (duração * rpe)
  tonnage_kg: number;
  total_sets: number;
  total_reps: number;
  concentric_failures: number;
  calories_burned_kcal: number;
  notes?: string;
  provenance_type: 'REAL' | 'DEMO';
  created_at: string;
}

export interface DbNutritionPlanTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  prescribed_by_id?: string; // FK -> DbUserTable.id (Nutricionista)
  title: string;
  calorie_target_kcal: number;
  protein_target_grams: number;
  carbs_target_grams: number;
  fats_target_grams: number;
  water_target_ml: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbMealTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  nutrition_plan_id?: string; // FK -> DbNutritionPlanTable.id
  name: string;
  consumed_at: string; // INDEX
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  items_json: string;
  provenance_type: 'REAL' | 'ESTIMATED' | 'DEMO';
  created_at: string;
}

export interface DbSleepRecordTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  bedtime: string;
  wake_time: string;
  duration_minutes: number;
  efficiency_pct: number;
  deep_sleep_minutes?: number;
  rem_sleep_minutes?: number;
  sleep_quality_rpe: number;
  resting_hrv_rmssd?: number;
  resting_heart_rate_bpm?: number;
  doms_score?: number;
  perceived_stress_score?: number;
  provenance_type: 'REAL' | 'ESTIMATED' | 'DEMO';
  created_at: string;
}

export interface DbProfessionalTable {
  id: string; // PK
  user_id: string; // UNIQUE FK -> DbUserTable.id
  professional_type: 'PERSONAL_TRAINER' | 'NUTRITIONIST';
  council_registration: string; // CREF ou CRN
  jurisdiction_state: string; // e.g. SP, RJ, MG
  verification_status: 'UNVERIFIED' | 'PENDING_DOCS' | 'VERIFIED' | 'SUSPENDED';
  verified_at?: string;
  specialties: string[];
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface DbAcademyTable {
  id: string; // PK
  owner_user_id: string; // FK -> DbUserTable.id
  trade_name: string;
  legal_entity_number?: string; // CNPJ
  address_street?: string;
  address_city?: string;
  address_state?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface DbRelationshipTable {
  id: string; // PK
  source_user_id: string; // FK -> DbUserTable.id
  target_user_id: string; // FK -> DbUserTable.id
  relationship_type: 
    | 'USER_PERSONAL' 
    | 'USER_NUTRITIONIST' 
    | 'USER_ACADEMY' 
    | 'PERSONAL_NUTRITIONIST' 
    | 'PERSONAL_ACADEMY' 
    | 'NUTRITIONIST_ACADEMY';
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED' | 'TERMINATED';
  requested_at: string;
  accepted_at?: string;
  terminated_at?: string;
  termination_reason?: string;
  consent_id?: string; // FK -> DbConsentTable.id
  created_at: string;
  updated_at: string;
}

export interface DbConversationTable {
  id: string; // PK
  type: 'DIRECT' | 'INTER_PROFESSIONAL' | 'ORGANIZATION_BROADCAST';
  created_at: string;
  updated_at: string;
}

export interface DbMessageTable {
  id: string; // PK
  conversation_id: string; // FK -> DbConversationTable.id
  sender_user_id: string; // FK -> DbUserTable.id
  recipient_user_id: string; // FK -> DbUserTable.id
  content_ciphertext: string; // Conteúdo cifrado em repouso
  read_at?: string;
  attachment_url?: string;
  created_at: string; // INDEX
}

export interface DbConsentTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id (Titular dos dados)
  grantee_user_id: string; // FK -> DbUserTable.id (Profissional/Academia autorizado)
  scope: 'TRAINING_READ' | 'BODY_READ' | 'NUTRITION_READ' | 'ALL_DATA';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  granted_at: string;
  revoked_at?: string;
  ip_address_hash?: string;
  user_agent_hash?: string;
  created_at: string;
}

export interface DbAuditEventTable {
  id: string; // PK
  user_id: string; // FK -> DbUserTable.id
  event_type: string; // 'LOGIN', 'RELATIONSHIP_INVITED', 'CONSENT_GRANTED', etc.
  ip_hash: string;
  resource_id?: string;
  previous_state_hash?: string;
  current_state_hash?: string;
  tamper_proof_chain_hash: string; // SHA-256 encadeado
  recorded_at: string; // INDEX
}
