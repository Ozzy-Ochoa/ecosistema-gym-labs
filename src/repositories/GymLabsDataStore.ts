import { UserIdentity, UserProfile, SavedUserAccount, RegisterUserData } from '../types/user';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';
import { Exercise, TrainingSession } from '../types/training';
import { MealEntry, HydrationLog, FoodItem } from '../types/nutrition';
import { SleepSession, SubjectiveWellnessLog } from '../types/recovery';
import { ConsentGrant } from '../types/consent';
import { AuditRecord, AuditEventType } from '../types/audit';
import { STANDARD_EXERCISES, STANDARD_FOODS, DEMO_PROFESSIONALS, DEMO_ORGANIZATIONS, DEFAULT_SAVED_ACCOUNTS } from '../data/seedData';
import { ProfessionalProfile } from '../types/professional';
import { Organization } from '../types/organization';

const STORAGE_KEYS = {
  USER_IDENTITY: 'gymlabs_user_identity_v1',
  USER_PROFILE: 'gymlabs_user_profile_v1',
  BODY_RECORDS: 'gymlabs_body_records_v1',
  CIRCUMFERENCES: 'gymlabs_circumferences_v1',
  TRAINING_SESSIONS: 'gymlabs_training_sessions_v1',
  CUSTOM_EXERCISES: 'gymlabs_custom_exercises_v1',
  MEALS: 'gymlabs_meals_v1',
  HYDRATION: 'gymlabs_hydration_v1',
  SLEEP_SESSIONS: 'gymlabs_sleep_sessions_v1',
  WELLNESS_LOGS: 'gymlabs_wellness_logs_v1',
  CONSENTS: 'gymlabs_consents_v1',
  AUDIT_LOGS: 'gymlabs_audit_logs_v1',
  DEMO_MODE: 'gymlabs_demo_mode_v1',
  SAVED_ACCOUNTS: 'gymlabs_saved_accounts_v1',
  ACTIVE_ACCOUNT_ID: 'gymlabs_active_account_id_v1',
  SESSION_ACTIVE: 'gymlabs_session_active_v1',
};

// Default clean production user
const INITIAL_IDENTITY: UserIdentity = {
  id: 'usr_gymlabs_master',
  email: 'athlete@gymlabs.global',
  name: 'Alex Vance',
  preferredName: 'Alex',
  dateOfBirth: '1996-05-14',
  biologicalSex: 'MALE',
  jurisdiction: 'US',
  language: 'en',
  timezone: 'America/New_York',
  unitSystem: 'METRIC',
  role: 'USER',
  createdAt: '2026-01-01T00:00:00Z',
};

const INITIAL_PROFILE: UserProfile = {
  userId: 'usr_gymlabs_master',
  activityLevel: 'VERY_ACTIVE',
  primaryGoal: 'HYPERTROPHY',
  experienceYears: 4,
  trainingDaysPerWeekTarget: 5,
  dietaryRestrictions: [],
  provenance: {
    type: 'REAL',
    source: 'User Self-Configuration',
    recordedAt: '2026-01-01T00:00:00Z',
    confidence: 'HIGH',
  },
};

export class GymLabsDataStore {
  private static instance: GymLabsDataStore;

  private isDemoMode: boolean = false;
  private identity: UserIdentity = INITIAL_IDENTITY;
  private profile: UserProfile = INITIAL_PROFILE;
  private bodyRecords: BodyCompositionRecord[] = [];
  private circumferences: CircumferenceRecord[] = [];
  private trainingSessions: TrainingSession[] = [];
  private exercises: Exercise[] = [...STANDARD_EXERCISES];
  private meals: MealEntry[] = [];
  private foods: FoodItem[] = [...STANDARD_FOODS];
  private hydration: HydrationLog[] = [];
  private sleepSessions: SleepSession[] = [];
  private wellnessLogs: SubjectiveWellnessLog[] = [];
  private consents: ConsentGrant[] = [];
  private auditLogs: AuditRecord[] = [];
  private professionals: ProfessionalProfile[] = [...DEMO_PROFESSIONALS];
  private organizations: Organization[] = [...DEMO_ORGANIZATIONS];
  private savedAccounts: SavedUserAccount[] = [...DEFAULT_SAVED_ACCOUNTS];
  private activeAccountId: string = 'usr_gymlabs_master';
  private isAuthenticated: boolean = false;

  private constructor() {
    this.loadState();
  }

  public static getInstance(): GymLabsDataStore {
    if (!GymLabsDataStore.instance) {
      GymLabsDataStore.instance = new GymLabsDataStore();
    }
    return GymLabsDataStore.instance;
  }

  private loadState(): void {
    try {
      const demoVal = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      this.isDemoMode = demoVal === 'true';

      const sessionVal = localStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE);
      this.isAuthenticated = sessionVal === 'true';

      // Load Saved Accounts (Strictly REAL data: filter out any legacy fake accounts)
      const accountsVal = localStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
      if (accountsVal) {
        try {
          const parsed = JSON.parse(accountsVal);
          this.savedAccounts = Array.isArray(parsed)
            ? parsed.filter(
                (a: SavedUserAccount) =>
                  !a.id.startsWith('usr_gymlabs_master') &&
                  !a.id.startsWith('pro_coach_') &&
                  !a.id.startsWith('pro_nutri_') &&
                  !a.id.startsWith('admin_system_') &&
                  !a.id.startsWith('usr_mariana_') &&
                  !a.id.startsWith('usr_carlos_')
              )
            : [];
        } catch {
          this.savedAccounts = [];
        }
      } else {
        this.savedAccounts = [];
        localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify([]));
      }

      if (this.savedAccounts.length === 0) {
        this.isAuthenticated = false;
        localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'false');
        this.activeAccountId = '';
      } else {
        // Load Active Account ID
        const activeIdVal = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
        if (activeIdVal && this.savedAccounts.some((a) => a.id === activeIdVal)) {
          this.activeAccountId = activeIdVal;
        } else {
          this.activeAccountId = this.savedAccounts[0]?.id || '';
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, this.activeAccountId);
        }
      }

      const identVal = localStorage.getItem(STORAGE_KEYS.USER_IDENTITY);
      if (identVal) {
        this.identity = JSON.parse(identVal);
      } else {
        // Sync with active account
        const activeAcc = this.savedAccounts.find((a) => a.id === this.activeAccountId);
        if (activeAcc) {
          this.identity = {
            ...INITIAL_IDENTITY,
            id: activeAcc.id,
            name: activeAcc.name,
            preferredName: activeAcc.preferredName || activeAcc.name.split(' ')[0],
            email: activeAcc.email,
            biologicalSex: activeAcc.biologicalSex || 'MALE',
          };
          localStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(this.identity));
        }
      }

      const profVal = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profVal) this.profile = JSON.parse(profVal);

      const bodyVal = localStorage.getItem(STORAGE_KEYS.BODY_RECORDS);
      if (bodyVal) this.bodyRecords = JSON.parse(bodyVal);

      const circVal = localStorage.getItem(STORAGE_KEYS.CIRCUMFERENCES);
      if (circVal) this.circumferences = JSON.parse(circVal);

      const trainVal = localStorage.getItem(STORAGE_KEYS.TRAINING_SESSIONS);
      if (trainVal) this.trainingSessions = JSON.parse(trainVal);

      const mealsVal = localStorage.getItem(STORAGE_KEYS.MEALS);
      if (mealsVal) this.meals = JSON.parse(mealsVal);

      const hydVal = localStorage.getItem(STORAGE_KEYS.HYDRATION);
      if (hydVal) this.hydration = JSON.parse(hydVal);

      const sleepVal = localStorage.getItem(STORAGE_KEYS.SLEEP_SESSIONS);
      if (sleepVal) this.sleepSessions = JSON.parse(sleepVal);

      const wellVal = localStorage.getItem(STORAGE_KEYS.WELLNESS_LOGS);
      if (wellVal) this.wellnessLogs = JSON.parse(wellVal);

      const consVal = localStorage.getItem(STORAGE_KEYS.CONSENTS);
      if (consVal) this.consents = JSON.parse(consVal);

      const auditVal = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (auditVal) this.auditLogs = JSON.parse(auditVal);

      // Strict Real-Data Mode: do NOT generate fictitious data
      this.isDemoMode = false;
    } catch (e) {
      console.warn('Could not load Gym Labs local state, starting clean:', e);
    }
  }

  public toggleDemoMode(): boolean {
    this.isDemoMode = !this.isDemoMode;
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(this.isDemoMode));

    if (this.isDemoMode) {
      this.seedDemoTelemetry();
      this.logAudit('SECURITY_SCOPE_ESCALATION_PREVENTED', 'DEMO_MODE_ACTIVATED', 'Switched to educational demo environment. Data marked as DEMO.');
    } else {
      // Return to real mode
      this.clearDemoData();
      this.logAudit('SECURITY_SCOPE_ESCALATION_PREVENTED', 'REAL_MODE_ACTIVATED', 'Switched back to verified real production data store.');
    }
    return this.isDemoMode;
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  // Multi-Account & Login Switcher
  public getSavedAccounts(): SavedUserAccount[] {
    return this.savedAccounts.map((acc) => ({
      ...acc,
      isCurrent: acc.id === this.activeAccountId,
    }));
  }

  public getActiveAccountId(): string {
    return this.activeAccountId;
  }

  public switchAccount(accountId: string): boolean {
    const target = this.savedAccounts.find((a) => a.id === accountId);
    if (!target) return false;

    this.activeAccountId = accountId;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, accountId);

    // Sync Identity
    this.identity = {
      ...this.identity,
      id: target.id,
      name: target.name,
      preferredName: target.preferredName || target.name.split(' ')[0],
      email: target.email,
      biologicalSex: target.biologicalSex || 'MALE',
      role: target.role || 'USER',
    };
    localStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(this.identity));

    // Sync Profile
    this.profile = {
      ...this.profile,
      userId: target.id,
      primaryGoal: target.primaryGoal || 'HYPERTROPHY',
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));

    // Update lastActiveAt
    target.lastActiveAt = 'Agora';
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));

    this.logAudit(
      'LOGIN_SUCCESS',
      'USER_ACCOUNT_SWITCHED',
      `Switched active athlete profile to: ${target.name} (${target.email})`
    );

    return true;
  }

  public addSavedAccount(account: SavedUserAccount): void {
    const existingIndex = this.savedAccounts.findIndex(
      (a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      this.savedAccounts[existingIndex] = { ...this.savedAccounts[existingIndex], ...account };
    } else {
      this.savedAccounts.unshift(account);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));
    this.logAudit(
      'SECURITY_SCOPE_ESCALATION_PREVENTED',
      'ACCOUNT_PROVISIONED',
      `Provisioned local athlete profile: ${account.name} (${account.email})`
    );
  }

  public removeSavedAccount(accountId: string): boolean {
    if (this.savedAccounts.length <= 1) return false; // Prevent removing last remaining account
    this.savedAccounts = this.savedAccounts.filter((a) => a.id !== accountId);
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));
    if (this.activeAccountId === accountId && this.savedAccounts.length > 0) {
      this.switchAccount(this.savedAccounts[0].id);
    }
    return true;
  }

  // Authentication & Session
  public getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public setAuthenticated(val: boolean): void {
    this.isAuthenticated = val;
    localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, String(val));
  }

  public login(credentials: { email?: string; password?: string; pin?: string; accountId?: string }): { success: boolean; error?: string } {
    if (credentials.accountId) {
      const acc = this.savedAccounts.find((a) => a.id === credentials.accountId);
      if (!acc) return { success: false, error: 'Conta não localizada neste dispositivo.' };
      if (credentials.pin && acc.pin && credentials.pin !== acc.pin) {
        return { success: false, error: 'PIN de segurança inválido.' };
      }
      this.switchAccount(acc.id);
      this.setAuthenticated(true);
      return { success: true };
    }

    if (credentials.email) {
      const acc = this.savedAccounts.find((a) => a.email.toLowerCase() === credentials.email?.toLowerCase());
      if (acc) {
        if (credentials.password && acc.password && credentials.password !== acc.password) {
          return { success: false, error: 'Senha incorreta.' };
        }
        this.switchAccount(acc.id);
        this.setAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Usuário não localizado no enclave local.' };
    }

    return { success: false, error: 'Informe um login ou credenciais.' };
  }

  public register(data: RegisterUserData): { success: boolean; error?: string; account?: SavedUserAccount } {
    if (!data.name || !data.email) {
      return { success: false, error: 'Nome e E-mail são obrigatórios.' };
    }

    const existing = this.savedAccounts.find((a) => a.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'Já existe um cadastro com este e-mail neste dispositivo.' };
    }

    const newId = `usr_${Date.now()}`;
    const newAccount: SavedUserAccount = {
      id: newId,
      name: data.name,
      email: data.email,
      preferredName: data.name.split(' ')[0],
      role: data.role || 'USER',
      biologicalSex: data.biologicalSex || 'MALE',
      primaryGoal: data.primaryGoal || 'HYPERTROPHY',
      pin: data.pin || '2026',
      password: data.password || 'password123',
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      tagline:
        data.role === 'COACH'
          ? `Personal Trainer (${data.professionalLicense || 'CREF'})`
          : data.role === 'NUTRITIONIST'
          ? `Nutricionista (${data.professionalLicense || 'CRN'})`
          : data.role === 'ADMIN'
          ? 'Administrador do Sistema'
          : 'Usuário Convencional // Atleta',
      lastActiveAt: 'Agora',
      isCurrent: true,
    };

    this.addSavedAccount(newAccount);
    this.switchAccount(newId);

    // Initial genuine body record if provided (NO FAKE DATA)
    if (data.weightKg) {
      const nowIso = new Date().toISOString();
      this.addBodyRecord({
        id: `bdy_${Date.now()}`,
        userId: newId,
        timestamp: nowIso,
        method: 'SELF_REPORT',
        weightKg: {
          value: data.weightKg,
          unit: 'kg',
          provenance: {
            type: 'REAL',
            source: 'Manual Baseline Registration',
            recordedAt: nowIso,
            confidence: 'HIGH',
          },
        },
        heightCm: data.heightCm
          ? {
              value: data.heightCm,
              unit: 'cm',
              provenance: {
                type: 'REAL',
                source: 'Manual Baseline Registration',
                recordedAt: nowIso,
                confidence: 'HIGH',
              },
            }
          : undefined,
        provenance: {
          type: 'REAL',
          source: 'Manual Baseline Registration',
          recordedAt: nowIso,
          confidence: 'HIGH',
        },
      });
    }

    this.setAuthenticated(true);
    return { success: true, account: newAccount };
  }

  public logout(): void {
    this.isAuthenticated = false;
    localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'false');
    this.logAudit('LOGIN_SUCCESS', 'AUTH_LOGOUT', 'Sessão encerrada com sucesso pelo operador.');
  }

  // Identity & Profile
  public getIdentity(): UserIdentity {
    return { ...this.identity };
  }

  public updateIdentity(updates: Partial<UserIdentity>): void {
    this.identity = { ...this.identity, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(this.identity));
    this.logAudit('SECURITY_SCOPE_ESCALATION_PREVENTED', 'USER_IDENTITY_UPDATED', `Updated identity fields: ${Object.keys(updates).join(', ')}`);
  }

  public getProfile(): UserProfile {
    return { ...this.profile };
  }

  public updateProfile(updates: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));
  }

  // Body Composition & Anthropometry
  public getBodyRecords(): BodyCompositionRecord[] {
    return [...this.bodyRecords];
  }

  public addBodyRecord(record: BodyCompositionRecord): void {
    this.bodyRecords.unshift(record);
    localStorage.setItem(STORAGE_KEYS.BODY_RECORDS, JSON.stringify(this.bodyRecords));
    this.logAudit('CALCULATION_EXECUTED', 'BODY_RECORD_ADDED', `Weight: ${record.weightKg.value} kg, Method: ${record.method}`);
  }

  public getCircumferences(): CircumferenceRecord[] {
    return [...this.circumferences];
  }

  public addCircumference(record: CircumferenceRecord): void {
    this.circumferences.unshift(record);
    localStorage.setItem(STORAGE_KEYS.CIRCUMFERENCES, JSON.stringify(this.circumferences));
  }

  // Training
  public getExercises(): Exercise[] {
    return [...this.exercises];
  }

  public addCustomExercise(exercise: Exercise): void {
    this.exercises.push(exercise);
  }

  public getTrainingSessions(): TrainingSession[] {
    return [...this.trainingSessions];
  }

  public addTrainingSession(session: TrainingSession): void {
    this.trainingSessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.TRAINING_SESSIONS, JSON.stringify(this.trainingSessions));
    this.logAudit('CALCULATION_EXECUTED', 'TRAINING_SESSION_RECORDED', `Title: ${session.title}, Volume: ${session.calculatedVolumeKg.value} kg`);
  }

  // Nutrition
  public getFoods(): FoodItem[] {
    return [...this.foods];
  }

  public addFood(food: FoodItem): void {
    this.foods.push(food);
  }

  public getMeals(): MealEntry[] {
    return [...this.meals];
  }

  public addMeal(meal: MealEntry): void {
    this.meals.unshift(meal);
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(this.meals));
  }

  public getHydration(): HydrationLog[] {
    return [...this.hydration];
  }

  public logWater(ml: number): void {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.hydration.find((h) => h.date === today);
    if (existing) {
      existing.consumedMl += ml;
    } else {
      this.hydration.unshift({
        id: `hyd-${Date.now()}`,
        userId: this.identity.id,
        date: today,
        consumedMl: ml,
        estimatedTargetMl: {
          value: 2800,
          unit: 'ml',
          provenance: {
            type: 'ESTIMATED',
            source: 'Population Hydration Baseline Guidance (35ml/kg)',
            recordedAt: new Date().toISOString(),
            confidence: 'MEDIUM',
            limitations: ['Individual fluid requirements vary significantly with sweat rate and climate.'],
          },
        },
      });
    }
    localStorage.setItem(STORAGE_KEYS.HYDRATION, JSON.stringify(this.hydration));
  }

  // Sleep & Recovery
  public getSleepSessions(): SleepSession[] {
    return [...this.sleepSessions];
  }

  public addSleepSession(session: SleepSession): void {
    this.sleepSessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(this.sleepSessions));
  }

  public getWellnessLogs(): SubjectiveWellnessLog[] {
    return [...this.wellnessLogs];
  }

  public addWellnessLog(log: SubjectiveWellnessLog): void {
    this.wellnessLogs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.WELLNESS_LOGS, JSON.stringify(this.wellnessLogs));
  }

  // Consents
  public getConsents(): ConsentGrant[] {
    return [...this.consents];
  }

  public grantConsent(grant: ConsentGrant): void {
    this.consents.unshift(grant);
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(this.consents));
    this.logAudit('CONSENT_GRANTED', grant.granteeName, `Scopes: ${grant.scopes.join(', ')} | Purpose: ${grant.purpose}`);
  }

  public revokeConsent(grantId: string, reason: string): void {
    const target = this.consents.find((c) => c.id === grantId);
    if (target) {
      target.status = 'REVOKED';
      target.revokedAt = new Date().toISOString();
      target.revocationReason = reason;
      localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(this.consents));
      this.logAudit('CONSENT_REVOKED', target.granteeName, `Revocation Reason: ${reason}`);
    }
  }

  // Professionals & Organizations
  public getProfessionals(): ProfessionalProfile[] {
    return [...this.professionals];
  }

  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  // Audit Engine
  public getAuditLogs(): AuditRecord[] {
    return [...this.auditLogs];
  }

  public logAudit(eventType: AuditEventType, resourceTarget: string, details: string): void {
    const record: AuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      eventType,
      userId: this.identity.id,
      actor: this.identity.name,
      ipAddress: 'UNAVAILABLE',
      resourceTarget,
      details,
      status: 'SUCCESS',
    };
    this.auditLogs.unshift(record);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch {}
  }

  // Privacy & Data Rights: JSON Export
  public exportUserDataJson(): string {
    const dataPackage = {
      format: 'GYM_LABS_CANONICAL_EXPORT_V1',
      exportedAt: new Date().toISOString(),
      dataController: 'Gym Labs Global Performance Infrastructure',
      privacyRegime: this.identity.jurisdiction,
      identity: this.identity,
      profile: this.profile,
      bodyComposition: this.bodyRecords,
      circumferences: this.circumferences,
      trainingSessions: this.trainingSessions,
      meals: this.meals,
      sleepSessions: this.sleepSessions,
      wellnessLogs: this.wellnessLogs,
      activeConsents: this.consents,
      auditHistory: this.auditLogs,
    };
    this.logAudit('DATA_EXPORTED', 'FULL_SYSTEM_JSON', 'User triggered complete GDPR/LGPD data portability archive download.');
    return JSON.stringify(dataPackage, null, 2);
  }

  // Privacy: Complete Deletion (Right to Erasure)
  public purgeAllUserData(): void {
    this.bodyRecords = [];
    this.circumferences = [];
    this.trainingSessions = [];
    this.meals = [];
    this.hydration = [];
    this.sleepSessions = [];
    this.wellnessLogs = [];
    this.consents = [];
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.logAudit('DATA_DELETED', 'USER_WORKSPACE', 'User invoked Right to be Forgotten. Local telemetry deleted.');
  }

  // Explicit Demo Data Seeding (All explicitly tagged with DEMO / SIMULATED provenance)
  private seedDemoTelemetry(): void {
    const now = new Date();
    const isoDaysAgo = (days: number) => {
      const d = new Date(now.getTime() - days * 86400000);
      return d.toISOString();
    };

    // 1. Demo Body Composition
    this.bodyRecords = [
      {
        id: 'body-demo-1',
        userId: this.identity.id,
        timestamp: isoDaysAgo(1),
        weightKg: {
          value: 82.4,
          unit: 'kg',
          provenance: {
            type: 'DEMO',
            source: 'BLE Multi-Frequency Scale (Simulation)',
            recordedAt: isoDaysAgo(1),
            confidence: 'HIGH',
            isVerified: true,
          },
        },
        heightCm: {
          value: 181,
          unit: 'cm',
          provenance: {
            type: 'DEMO',
            source: 'Stadiometer (Simulation)',
            recordedAt: isoDaysAgo(1),
            confidence: 'HIGH',
          },
        },
        bodyFatPercent: {
          value: 14.8,
          unit: '%',
          provenance: {
            type: 'DEMO',
            source: 'Multi-Frequency BIA (Simulation)',
            recordedAt: isoDaysAgo(1),
            confidence: 'MEDIUM',
            limitations: ['Hydration status significantly alters impedance.'],
          },
        },
        leanMassKg: {
          value: 70.2,
          unit: 'kg',
          provenance: {
            type: 'DEMO',
            source: 'Calculated FFM (Simulation)',
            recordedAt: isoDaysAgo(1),
            confidence: 'MEDIUM',
          },
        },
        method: 'BIA_HOME',
        provenance: {
          type: 'DEMO',
          source: 'Educational Sandbox Seed',
          recordedAt: isoDaysAgo(1),
          confidence: 'HIGH',
        },
      },
      {
        id: 'body-demo-2',
        userId: this.identity.id,
        timestamp: isoDaysAgo(14),
        weightKg: {
          value: 83.1,
          unit: 'kg',
          provenance: {
            type: 'DEMO',
            source: 'BLE Scale',
            recordedAt: isoDaysAgo(14),
            confidence: 'HIGH',
          },
        },
        bodyFatPercent: {
          value: 15.3,
          unit: '%',
          provenance: {
            type: 'DEMO',
            source: 'BIA Scale',
            recordedAt: isoDaysAgo(14),
            confidence: 'MEDIUM',
          },
        },
        method: 'BIA_HOME',
        provenance: {
          type: 'DEMO',
          source: 'Educational Sandbox Seed',
          recordedAt: isoDaysAgo(14),
          confidence: 'HIGH',
        },
      },
    ];

    // 2. Demo 28-day training load history for genuine ACWR calculation
    this.trainingSessions = [];
    for (let day = 28; day >= 1; day--) {
      // 4 days a week training
      if (day % 7 === 1 || day % 7 === 3 || day % 7 === 4 || day % 7 === 6) {
        const duration = 65;
        const rpe = 7 + (day % 3) * 0.5;
        const vol = 9500 + (day % 5) * 600;
        this.trainingSessions.push({
          id: `train-demo-${day}`,
          userId: this.identity.id,
          title: day % 2 === 0 ? 'Hypertrophy: Upper Body Power' : 'Lower Body Squat & Hinge',
          startedAt: isoDaysAgo(day),
          endedAt: isoDaysAgo(day),
          durationMinutes: duration,
          exercises: [
            {
              exerciseId: 'ex-squat',
              exerciseName: 'Barbell Back Squat',
              sets: [
                { setNumber: 1, reps: 6, loadKg: 130, rpe: 7.5, completed: true },
                { setNumber: 2, reps: 6, loadKg: 130, rpe: 8, completed: true },
                { setNumber: 3, reps: 6, loadKg: 130, rpe: 8.5, completed: true },
              ],
            },
            {
              exerciseId: 'ex-bench',
              exerciseName: 'Barbell Flat Bench Press',
              sets: [
                { setNumber: 1, reps: 8, loadKg: 95, rpe: 7.5, completed: true },
                { setNumber: 2, reps: 8, loadKg: 95, rpe: 8, completed: true },
                { setNumber: 3, reps: 7, loadKg: 95, rpe: 9, completed: true },
              ],
            },
          ],
          sessionRpe: rpe,
          calculatedVolumeKg: {
            value: vol,
            unit: 'kg',
            provenance: {
              type: 'DEMO',
              source: 'Sum(reps * load)',
              recordedAt: isoDaysAgo(day),
              confidence: 'HIGH',
            },
          },
          calculatedLoadUnits: {
            value: Math.round(duration * rpe),
            unit: 'AU (Arbitrary Units)',
            provenance: {
              type: 'DEMO',
              source: 'Foster Session-RPE (Duration * RPE)',
              recordedAt: isoDaysAgo(day),
              confidence: 'HIGH',
            },
          },
          provenance: {
            type: 'DEMO',
            source: 'Educational Sandbox Seed',
            recordedAt: isoDaysAgo(day),
            confidence: 'HIGH',
          },
        });
      }
    }

    // 3. Demo Nutrition Meals
    this.meals = [
      {
        id: 'meal-demo-1',
        userId: this.identity.id,
        mealType: 'BREAKFAST',
        name: 'Power Oats & Whey',
        loggedAt: isoDaysAgo(0),
        items: [
          { food: STANDARD_FOODS[3], quantity: 2 }, // 80g oats
          { food: STANDARD_FOODS[4], quantity: 1.5 }, // 45g whey
        ],
        totalCalories: { value: 469, unit: 'kcal', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
        totalProteinG: { value: 51.1, unit: 'g', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
        totalCarbsG: { value: 54.7, unit: 'g', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
        totalFatsG: { value: 5.5, unit: 'g', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
      },
      {
        id: 'meal-demo-2',
        userId: this.identity.id,
        mealType: 'LUNCH',
        name: 'Grilled Chicken & Jasmine Rice',
        loggedAt: isoDaysAgo(0),
        items: [
          { food: STANDARD_FOODS[0], quantity: 2 }, // 200g chicken
          { food: STANDARD_FOODS[1], quantity: 2.5 }, // 250g rice
        ],
        totalCalories: { value: 655, unit: 'kcal', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
        totalProteinG: { value: 68.7, unit: 'g', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
        totalCarbsG: { value: 70.5, unit: 'g', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
        totalFatsG: { value: 7.9, unit: 'g', provenance: { type: 'DEMO', source: 'Food Item Sum', recordedAt: isoDaysAgo(0), confidence: 'HIGH' } },
      },
    ];

    // 4. Demo Sleep & Recovery
    this.sleepSessions = [
      {
        id: 'sleep-demo-1',
        userId: this.identity.id,
        bedtime: isoDaysAgo(0),
        wakeTime: isoDaysAgo(0),
        durationMinutes: 465, // 7h 45m
        deepSleepMinutes: 105,
        remSleepMinutes: 110,
        lightSleepMinutes: 220,
        awakeMinutes: 30,
        restingHeartRateBpm: {
          value: 48,
          unit: 'bpm',
          provenance: { type: 'DEMO', source: 'Optical PPG (Simulation)', recordedAt: isoDaysAgo(0), confidence: 'HIGH' },
        },
        nocturnalHrvRmsddMs: {
          value: 68,
          unit: 'ms',
          provenance: { type: 'DEMO', source: 'Nightly rMSSD (Simulation)', recordedAt: isoDaysAgo(0), confidence: 'HIGH' },
        },
        subjectiveQualityScore: 4,
        provenance: {
          type: 'DEMO',
          source: 'Educational Sandbox Seed',
          recordedAt: isoDaysAgo(0),
          confidence: 'HIGH',
        },
      },
    ];

    this.wellnessLogs = [
      {
        id: 'well-demo-1',
        userId: this.identity.id,
        date: new Date().toISOString().split('T')[0],
        muscleSoreness: 2, // Mild
        energyLevel: 4,    // High
        stressLevel: 2,    // Low
        sleepPerception: 4,
        notes: 'Well rested, ready for heavy squat progression.',
        provenance: {
          type: 'DEMO',
          source: 'Self-Report Form',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
    ];

    // 5. Demo Consent
    this.consents = [
      {
        id: 'cst-demo-1',
        grantorUserId: this.identity.id,
        granteeId: 'pro-dr-silva',
        granteeName: 'Dr. Lucas Silva, PhD, CSCS',
        granteeType: 'PROFESSIONAL',
        scopes: ['TRAINING_READ', 'TRAINING_WRITE', 'RECOVERY_READ'],
        purpose: 'Workload tuning and progressive overload monitoring',
        grantedAt: isoDaysAgo(10),
        expiresAt: isoDaysAgo(-20),
        status: 'ACTIVE',
      },
    ];

    this.logAudit('LOGIN_SUCCESS', 'SYSTEM_CORE', 'Logged in to Gym Labs Global Infrastructure.');
  }

  private clearDemoData(): void {
    this.bodyRecords = this.bodyRecords.filter((r) => r.provenance.type !== 'DEMO');
    this.trainingSessions = this.trainingSessions.filter((s) => s.provenance.type !== 'DEMO');
    this.meals = this.meals.filter((m) => m.totalCalories.provenance.type !== 'DEMO');
    this.sleepSessions = this.sleepSessions.filter((s) => s.provenance.type !== 'DEMO');
    this.wellnessLogs = this.wellnessLogs.filter((w) => w.provenance.type !== 'DEMO');
    this.consents = this.consents.filter((c) => c.granteeId !== 'pro-dr-silva');
  }
}

export const dataStore = GymLabsDataStore.getInstance();
