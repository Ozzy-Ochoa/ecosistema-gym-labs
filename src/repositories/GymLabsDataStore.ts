import { UserIdentity, UserProfile, SavedUserAccount, RegisterUserData, UserRole } from '../types/user';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';
import { Exercise, TrainingSession, DayAttendance, UserWorkoutRoutine } from '../types/training';
import { createSuggestedWorkoutRoutine } from '../data/defaultUserRoutines';
import { MealEntry, HydrationLog, FoodItem } from '../types/nutrition';
import { SleepSession, SubjectiveWellnessLog } from '../types/recovery';
import { ConsentGrant } from '../types/consent';
import { AuditRecord, AuditEventType } from '../types/audit';
import { STANDARD_EXERCISES, STANDARD_FOODS, DEMO_PROFESSIONALS, DEMO_ORGANIZATIONS, DEFAULT_SAVED_ACCOUNTS, DEFAULT_DEMO_ACCOUNTS } from '../data/seedData';
import { ProfessionalProfile } from '../types/professional';
import { Organization } from '../types/organization';
import { SystemNotification } from '../types/notification';
import {
  NutriPatient,
  NutriConsultation,
  NutriAssessment,
  NutriMealPlan,
  NutriFinanceTransaction,
  NutriLibraryItem,
} from '../types/nutri';
import {
  TrainerStudent,
  TrainerWorkoutPlan,
  TrainerAssessment,
  TrainerScheduleAppointment,
  TrainerFinanceTransaction,
} from '../types/trainer';
import {
  HealthTeamMember,
  InterProfessionalConsent,
  ChatMessage,
  ProfessionalInvitation,
} from '../types/ecosystem';
import {
  DEFAULT_NUTRI_PATIENTS,
  DEFAULT_NUTRI_CONSULTATIONS,
  DEFAULT_NUTRI_ASSESSMENTS,
  DEFAULT_NUTRI_MEAL_PLANS,
  DEFAULT_NUTRI_FINANCES,
  DEFAULT_NUTRI_LIBRARY,
  DEFAULT_TRAINER_STUDENTS,
  DEFAULT_TRAINER_WORKOUT_PLANS,
  DEFAULT_TRAINER_ASSESSMENTS,
  DEFAULT_TRAINER_APPOINTMENTS,
  DEFAULT_TRAINER_FINANCES,
  DEFAULT_HEALTH_TEAM,
  DEFAULT_INTER_PROFESSIONAL_CONSENTS,
  DEFAULT_CHAT_MESSAGES,
} from '../data/professionalSeedData';

const STORAGE_KEYS = {
  USER_IDENTITY: 'gymlabs_user_identity_v1',
  USER_PROFILE: 'gymlabs_user_profile_v1',
  BODY_RECORDS: 'gymlabs_body_records_v1',
  CIRCUMFERENCES: 'gymlabs_circumferences_v1',
  TRAINING_SESSIONS: 'gymlabs_training_sessions_v1',
  ATTENDANCE_LOGS: 'gymlabs_attendance_logs_v1',
  SCHEDULED_DAYS: 'gymlabs_scheduled_days_v1',
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
  NOTIFICATIONS: 'gymlabs_notifications_v1',
  LAST_DATA_VERIFICATION: 'gymlabs_last_data_verification_v1',
  NUTRI_PATIENTS: 'gymlabs_nutri_patients_v1',
  NUTRI_CONSULTATIONS: 'gymlabs_nutri_consultations_v1',
  NUTRI_ASSESSMENTS: 'gymlabs_nutri_assessments_v1',
  NUTRI_MEAL_PLANS: 'gymlabs_nutri_meal_plans_v1',
  NUTRI_FINANCES: 'gymlabs_nutri_finances_v1',
  NUTRI_LIBRARY: 'gymlabs_nutri_library_v1',
  TRAINER_STUDENTS: 'gymlabs_trainer_students_v1',
  TRAINER_WORKOUT_PLANS: 'gymlabs_trainer_workout_plans_v1',
  TRAINER_ASSESSMENTS: 'gymlabs_trainer_assessments_v1',
  TRAINER_APPOINTMENTS: 'gymlabs_trainer_appointments_v1',
  TRAINER_FINANCES: 'gymlabs_trainer_finances_v1',
  HEALTH_TEAM: 'gymlabs_health_team_v1',
  INTER_CONSENTS: 'gymlabs_inter_consents_v1',
  CHAT_MESSAGES: 'gymlabs_chat_messages_v1',
  INVITATIONS: 'gymlabs_invitations_v1',
  USER_WORKOUT_ROUTINE: 'gymlabs_user_workout_routine_v1',
};

// Default clean initial user (DEMO environment default)
const INITIAL_IDENTITY: UserIdentity = {
  id: 'usr_sample_athlete',
  email: 'alex.atleta@gymlabs.com',
  name: 'Alex Vance',
  preferredName: 'Alex',
  dateOfBirth: '1998-05-20',
  biologicalSex: 'MALE',
  jurisdiction: 'BR',
  language: 'pt',
  timezone: 'America/Sao_Paulo',
  unitSystem: 'METRIC',
  role: 'USER',
  isDemo: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const INITIAL_PROFILE: UserProfile = {
  userId: 'usr_sample_athlete',
  activityLevel: 'VERY_ACTIVE',
  primaryGoal: 'HYPERTROPHY',
  experienceYears: 4,
  trainingDaysPerWeekTarget: 5,
  dietaryRestrictions: [],
  provenance: {
    type: 'DEMO',
    source: 'Demo Seed Profile',
    recordedAt: '2026-01-01T00:00:00Z',
    confidence: 'HIGH',
  },
};

export class GymLabsDataStore {
  private static instance: GymLabsDataStore;

  private isDemoMode: boolean = true;
  private identity: UserIdentity = INITIAL_IDENTITY;
  private profile: UserProfile = INITIAL_PROFILE;
  private bodyRecords: BodyCompositionRecord[] = [];
  private circumferences: CircumferenceRecord[] = [];
  private trainingSessions: TrainingSession[] = [];
  private attendanceLogs: DayAttendance[] = [];
  private scheduledDaysOfWeek: number[] = [1, 2, 3, 4, 5];
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
  private activeAccountId: string = 'usr_sample_athlete';
  private isAuthenticated: boolean = false;
  private notifications: SystemNotification[] = [];
  private lastDataVerificationDate: string = '';

  // Nutri Professional State
  private nutriPatients: NutriPatient[] = [...DEFAULT_NUTRI_PATIENTS];
  private nutriConsultations: NutriConsultation[] = [...DEFAULT_NUTRI_CONSULTATIONS];
  private nutriAssessments: NutriAssessment[] = [...DEFAULT_NUTRI_ASSESSMENTS];
  private nutriMealPlans: NutriMealPlan[] = [...DEFAULT_NUTRI_MEAL_PLANS];
  private nutriFinances: NutriFinanceTransaction[] = [...DEFAULT_NUTRI_FINANCES];
  private nutriLibrary: NutriLibraryItem[] = [...DEFAULT_NUTRI_LIBRARY];

  // Trainer Professional State
  private trainerStudents: TrainerStudent[] = [...DEFAULT_TRAINER_STUDENTS];
  private trainerWorkoutPlans: TrainerWorkoutPlan[] = [...DEFAULT_TRAINER_WORKOUT_PLANS];
  private trainerAssessments: TrainerAssessment[] = [...DEFAULT_TRAINER_ASSESSMENTS];
  private trainerAppointments: TrainerScheduleAppointment[] = [...DEFAULT_TRAINER_APPOINTMENTS];
  private trainerFinances: TrainerFinanceTransaction[] = [...DEFAULT_TRAINER_FINANCES];

  // Cross-Ecosystem Connections & Communication State
  private healthTeamMembers: HealthTeamMember[] = [...DEFAULT_HEALTH_TEAM];
  private interProfessionalConsents: InterProfessionalConsent[] = [...DEFAULT_INTER_PROFESSIONAL_CONSENTS];
  private chatMessages: ChatMessage[] = [...DEFAULT_CHAT_MESSAGES];
  private invitations: ProfessionalInvitation[] = [];
  private userWorkoutRoutine: UserWorkoutRoutine | null = null;

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
      }

      // Always guarantee the 5 canonical demo accounts are available in savedAccounts with correct roles
      DEFAULT_DEMO_ACCOUNTS.forEach((demoAcc) => {
        const idx = this.savedAccounts.findIndex((a) => a.id === demoAcc.id || (a.role === demoAcc.role && a.isDemo));
        if (idx >= 0) {
          this.savedAccounts[idx] = { ...this.savedAccounts[idx], ...demoAcc, isDemo: true };
        } else {
          this.savedAccounts.push(demoAcc);
        }
      });
      localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));

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
          const isAccDemo = Boolean(activeAcc.isDemo);
          this.identity = {
            id: activeAcc.id,
            name: activeAcc.name,
            preferredName: activeAcc.preferredName || activeAcc.name.split(' ')[0],
            email: activeAcc.email,
            biologicalSex: isAccDemo ? (activeAcc.biologicalSex ?? 'MALE') : (activeAcc.biologicalSex ?? undefined),
            dateOfBirth: isAccDemo ? (activeAcc.dateOfBirth ?? '1996-05-14') : (activeAcc.dateOfBirth ?? undefined),
            weightKg: isAccDemo ? (activeAcc.weightKg ?? 82.5) : (activeAcc.weightKg ?? undefined),
            heightCm: isAccDemo ? (activeAcc.heightCm ?? 180) : (activeAcc.heightCm ?? undefined),
            role: activeAcc.role || 'USER',
            isDemo: isAccDemo,
            jurisdiction: 'BR',
            language: 'pt',
            timezone: 'America/Sao_Paulo',
            unitSystem: 'METRIC',
            createdAt: activeAcc.createdAt || INITIAL_IDENTITY.createdAt,
          };
          localStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(this.identity));
        }
      }

      const profVal = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profVal) {
        this.profile = JSON.parse(profVal);
      } else {
        const activeAcc = this.savedAccounts.find((a) => a.id === this.activeAccountId);
        const isAccDemo = activeAcc ? Boolean(activeAcc.isDemo) : Boolean(this.identity.isDemo);
        this.profile = {
          userId: this.identity.id,
          activityLevel: isAccDemo ? (activeAcc?.activityLevel ?? 'VERY_ACTIVE') : (activeAcc?.activityLevel ?? undefined),
          primaryGoal: isAccDemo ? (activeAcc?.primaryGoal ?? 'HYPERTROPHY') : (activeAcc?.primaryGoal ?? undefined),
          experienceYears: isAccDemo ? 4 : undefined,
          trainingDaysPerWeekTarget: isAccDemo ? 5 : undefined,
          dietaryRestrictions: [],
          provenance: {
            type: isAccDemo ? 'DEMO' : 'REAL',
            source: isAccDemo ? 'Demo Seed Profile' : 'User Registration',
            recordedAt: new Date().toISOString(),
            confidence: 'HIGH',
          },
        };
      }

      const bodyVal = localStorage.getItem(STORAGE_KEYS.BODY_RECORDS);
      if (bodyVal) this.bodyRecords = JSON.parse(bodyVal);

      const circVal = localStorage.getItem(STORAGE_KEYS.CIRCUMFERENCES);
      if (circVal) this.circumferences = JSON.parse(circVal);

      const trainVal = localStorage.getItem(STORAGE_KEYS.TRAINING_SESSIONS);
      if (trainVal) this.trainingSessions = JSON.parse(trainVal);

      const attVal = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOGS);
      if (attVal) this.attendanceLogs = JSON.parse(attVal);

      const schedVal = localStorage.getItem(STORAGE_KEYS.SCHEDULED_DAYS);
      if (schedVal) this.scheduledDaysOfWeek = JSON.parse(schedVal);

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

      const notifsVal = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (notifsVal) {
        try {
          this.notifications = JSON.parse(notifsVal);
        } catch {
          this.notifications = [];
        }
      }

      const lastVerifVal = localStorage.getItem(STORAGE_KEYS.LAST_DATA_VERIFICATION);
      if (lastVerifVal) {
        this.lastDataVerificationDate = lastVerifVal;
      } else {
        // Default to 16 days ago so periodic verification prompt is active and ready to test
        const initialDate = new Date(Date.now() - 16 * 86400000).toISOString();
        this.lastDataVerificationDate = initialDate;
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_DATA_VERIFICATION, initialDate);
        } catch {}
      }

      // Load Nutri Professional data
      const nutriPatientsVal = localStorage.getItem(STORAGE_KEYS.NUTRI_PATIENTS);
      if (nutriPatientsVal) {
        try { this.nutriPatients = JSON.parse(nutriPatientsVal); } catch {}
      }
      const nutriCstVal = localStorage.getItem(STORAGE_KEYS.NUTRI_CONSULTATIONS);
      if (nutriCstVal) {
        try { this.nutriConsultations = JSON.parse(nutriCstVal); } catch {}
      }
      const nutriAssessVal = localStorage.getItem(STORAGE_KEYS.NUTRI_ASSESSMENTS);
      if (nutriAssessVal) {
        try { this.nutriAssessments = JSON.parse(nutriAssessVal); } catch {}
      }
      const nutriPlansVal = localStorage.getItem(STORAGE_KEYS.NUTRI_MEAL_PLANS);
      if (nutriPlansVal) {
        try { this.nutriMealPlans = JSON.parse(nutriPlansVal); } catch {}
      }
      const nutriFinVal = localStorage.getItem(STORAGE_KEYS.NUTRI_FINANCES);
      if (nutriFinVal) {
        try { this.nutriFinances = JSON.parse(nutriFinVal); } catch {}
      }
      const nutriLibVal = localStorage.getItem(STORAGE_KEYS.NUTRI_LIBRARY);
      if (nutriLibVal) {
        try { this.nutriLibrary = JSON.parse(nutriLibVal); } catch {}
      }

      // Load Trainer Professional data
      const trainerStdVal = localStorage.getItem(STORAGE_KEYS.TRAINER_STUDENTS);
      if (trainerStdVal) {
        try { this.trainerStudents = JSON.parse(trainerStdVal); } catch {}
      }
      const trainerPlansVal = localStorage.getItem(STORAGE_KEYS.TRAINER_WORKOUT_PLANS);
      if (trainerPlansVal) {
        try { this.trainerWorkoutPlans = JSON.parse(trainerPlansVal); } catch {}
      }
      const trainerAssessVal = localStorage.getItem(STORAGE_KEYS.TRAINER_ASSESSMENTS);
      if (trainerAssessVal) {
        try { this.trainerAssessments = JSON.parse(trainerAssessVal); } catch {}
      }
      const trainerAppVal = localStorage.getItem(STORAGE_KEYS.TRAINER_APPOINTMENTS);
      if (trainerAppVal) {
        try { this.trainerAppointments = JSON.parse(trainerAppVal); } catch {}
      }
      const trainerFinVal = localStorage.getItem(STORAGE_KEYS.TRAINER_FINANCES);
      if (trainerFinVal) {
        try { this.trainerFinances = JSON.parse(trainerFinVal); } catch {}
      }

      // Load Ecosystem data
      const teamVal = localStorage.getItem(STORAGE_KEYS.HEALTH_TEAM);
      if (teamVal) {
        try { this.healthTeamMembers = JSON.parse(teamVal); } catch {}
      }
      const interVal = localStorage.getItem(STORAGE_KEYS.INTER_CONSENTS);
      if (interVal) {
        try { this.interProfessionalConsents = JSON.parse(interVal); } catch {}
      }
      const chatVal = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (chatVal) {
        try { this.chatMessages = JSON.parse(chatVal); } catch {}
      }
      const invVal = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
      if (invVal) {
        try { this.invitations = JSON.parse(invVal); } catch {}
      }

      // Load User Workout Routine (conventional athlete)
      const routineVal = localStorage.getItem(STORAGE_KEYS.USER_WORKOUT_ROUTINE);
      if (routineVal) {
        try { this.userWorkoutRoutine = JSON.parse(routineVal); } catch { this.userWorkoutRoutine = null; }
      }
      if (!this.userWorkoutRoutine) {
        this.userWorkoutRoutine = createSuggestedWorkoutRoutine(this.identity.id, this.profile.primaryGoal, 4);
      }

      // Check and update system notifications based on physiological parameters and periodic rules
      this.checkAndGenerateSystemNotifications();

      // Set demo mode strictly in sync with active identity
      this.isDemoMode = Boolean(this.identity.isDemo);
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

    const isTargetDemo = Boolean(target.isDemo);
    this.isDemoMode = isTargetDemo;
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(isTargetDemo));
    } catch {}

    // Sync Identity: Real accounts must NOT inherit fake body defaults
    this.identity = {
      id: target.id,
      name: target.name,
      preferredName: target.preferredName || target.name.split(' ')[0],
      email: target.email,
      biologicalSex: isTargetDemo ? (target.biologicalSex ?? 'MALE') : (target.biologicalSex ?? undefined),
      dateOfBirth: isTargetDemo ? (target.dateOfBirth ?? '1998-05-20') : (target.dateOfBirth ?? undefined),
      weightKg: isTargetDemo ? (target.weightKg ?? 82.5) : (target.weightKg ?? undefined),
      heightCm: isTargetDemo ? (target.heightCm ?? 180) : (target.heightCm ?? undefined),
      role: target.role || 'USER',
      isDemo: isTargetDemo,
      jurisdiction: 'BR',
      language: 'pt',
      timezone: 'America/Sao_Paulo',
      unitSystem: 'METRIC',
      createdAt: target.createdAt || this.identity.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(this.identity));

    // Sync Profile: Real accounts must NOT inherit fake activityLevel, primaryGoal or experience
    this.profile = {
      userId: target.id,
      activityLevel: isTargetDemo ? (target.activityLevel ?? 'MODERATELY_ACTIVE') : (target.activityLevel ?? undefined),
      primaryGoal: isTargetDemo ? (target.primaryGoal ?? 'HYPERTROPHY') : (target.primaryGoal ?? undefined),
      experienceYears: isTargetDemo ? 4 : undefined,
      trainingDaysPerWeekTarget: isTargetDemo ? 5 : undefined,
      dietaryRestrictions: isTargetDemo ? [] : [],
      provenance: {
        type: isTargetDemo ? 'DEMO' : 'REAL',
        source: isTargetDemo ? 'Demo Seed Profile' : 'User Registration',
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));

    // Update lastActiveAt
    target.lastActiveAt = 'Agora';
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));

    this.logAudit(
      'LOGIN_SUCCESS',
      'USER_ACCOUNT_SWITCHED',
      `Switched active athlete profile to: ${target.name} (${target.email}) [DEMO: ${isTargetDemo}]`
    );

    this.checkAndGenerateSystemNotifications();

    return true;
  }

  public addSavedAccount(account: SavedUserAccount): void {
    const existingIndex = this.savedAccounts.findIndex(
      (a) => a.id === account.id || (Boolean(a.email) && Boolean(account.email) && a.email.toLowerCase() === account.email.toLowerCase())
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
      const inputEmail = (credentials.email || '').toLowerCase().trim();
      let acc = this.savedAccounts.find((a) => a.email && a.email.toLowerCase() === inputEmail);
      if (!acc) {
        const em = inputEmail;
        if (em.includes('alex') || em === 'atleta@gymlabs.com' || em === 'alex.atleta@gymlabs.com') {
          const res = this.quickAccessSampleAccount('USER');
          acc = res.account;
        } else if (em.includes('lucas') || em === 'coach@gymlabs.pro' || em === 'lucas.personal@gymlabs.pro') {
          const res = this.quickAccessSampleAccount('COACH');
          acc = res.account;
        } else if (em.includes('elena') || em === 'nutri@gymlabs.pro' || em === 'elena.nutri@gymlabs.pro') {
          const res = this.quickAccessSampleAccount('NUTRITIONIST');
          acc = res.account;
        } else if (em.includes('gestao') || em === 'gym@gymlabs.com' || em === 'gestao@gymlabssp.com.br') {
          const res = this.quickAccessSampleAccount('GYM');
          acc = res.account;
        }
      }

      if (acc) {
        if (credentials.password && acc.password && credentials.password !== acc.password) {
          return { success: false, error: 'Senha incorreta.' };
        }
        this.switchAccount(acc.id);
        this.setAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Usuário não localizado no enclave local. Verifique o e-mail ou crie uma conta.' };
    }

    return { success: false, error: 'Informe um login ou credenciais.' };
  }

  public quickAccessSampleAccount(roleOrId: string): { success: boolean; account: SavedUserAccount } {
    const cleanKey = (roleOrId || '').trim().toLowerCase();
    let targetRole: UserRole = 'USER';
    if (
      cleanKey.includes('coach') ||
      cleanKey.includes('trainer') ||
      cleanKey.includes('personal') ||
      cleanKey.includes('pt') ||
      cleanKey === 'pro_sample_coach'
    ) {
      targetRole = 'COACH';
    } else if (
      cleanKey.includes('nutri') ||
      cleanKey.includes('nutritionist') ||
      cleanKey.includes('crn') ||
      cleanKey === 'pro_sample_nutri'
    ) {
      targetRole = 'NUTRITIONIST';
    } else if (
      cleanKey.includes('gym') ||
      cleanKey.includes('academia') ||
      cleanKey.includes('unidade') ||
      cleanKey.includes('studio') ||
      cleanKey === 'gym_sample_club'
    ) {
      targetRole = 'GYM';
    } else if (
      cleanKey.includes('admin') ||
      cleanKey.includes('auditor') ||
      cleanKey === 'admin_sample_audit'
    ) {
      targetRole = 'ADMIN';
    } else {
      targetRole = 'USER';
    }

    const demoAccount = DEFAULT_DEMO_ACCOUNTS.find((d) => d.role === targetRole);
    let target = this.savedAccounts.find((a) => (a.role === targetRole && a.isDemo) || (demoAccount && a.id === demoAccount.id));

    if (!target) {
      target = demoAccount || {
        id: `usr_sample_athlete`,
        name: 'Alex Vance (Aluno)',
        email: 'alex.atleta@gymlabs.com',
        preferredName: 'Alex',
        role: 'USER',
        isDemo: true,
      };
      this.addSavedAccount(target);
    } else {
      target.role = targetRole;
      target.isDemo = true;
      const idx = this.savedAccounts.findIndex((a) => a.id === target!.id);
      if (idx >= 0) this.savedAccounts[idx] = { ...this.savedAccounts[idx], role: targetRole, isDemo: true };
      localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));
    }

    this.switchAccount(target.id);
    this.setAuthenticated(true);
    return { success: true, account: target };
  }

  public register(data: RegisterUserData): { success: boolean; error?: string; account?: SavedUserAccount } {
    if (!data.name || !data.email) {
      return { success: false, error: 'Nome e E-mail são obrigatórios.' };
    }

    const targetEmail = (data.email || '').toLowerCase().trim();
    const existing = this.savedAccounts.find((a) => a.email && a.email.toLowerCase() === targetEmail);
    if (existing) {
      return { success: false, error: 'Já existe um cadastro com este e-mail neste dispositivo.' };
    }

    if (!data.password || data.password.trim().length < 6) {
      return { success: false, error: 'A senha de acesso é obrigatória (mínimo de 6 caracteres).' };
    }

    const newId = `usr_${Date.now()}`;
    const newAccount: SavedUserAccount = {
      id: newId,
      name: data.name.trim(),
      email: data.email.trim(),
      preferredName: data.name.trim().split(' ')[0],
      role: data.role || 'USER',
      biologicalSex: data.biologicalSex ? data.biologicalSex : undefined,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
      activityLevel: data.activityLevel ? data.activityLevel : undefined,
      primaryGoal: data.primaryGoal ? data.primaryGoal : undefined,
      pin: data.pin && data.pin.trim().length === 4 ? data.pin.trim() : undefined,
      password: data.password.trim(),
      weightKg: data.weightKg !== undefined && !isNaN(data.weightKg) ? data.weightKg : undefined,
      heightCm: data.heightCm !== undefined && !isNaN(data.heightCm) ? data.heightCm : undefined,
      tagline:
        data.role === 'COACH'
          ? `Personal Trainer (${data.professionalLicense || 'CREF'})`
          : data.role === 'NUTRITIONIST'
          ? `Nutricionista (${data.professionalLicense || 'CRN'})`
          : data.role === 'GYM'
          ? `Academia / Unidade (${data.organizationName || 'CNPJ Registrado'})`
          : data.role === 'ADMIN'
          ? 'Administrador do Sistema'
          : 'Usuário Convencional // Atleta',
      lastActiveAt: 'Agora',
      isCurrent: true,
      isDemo: false,
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

    // Optional circumferences if provided at registration (medidas opcionais)
    if (data.measurements) {
      const m = data.measurements;
      const hasAnyMeasurement = Boolean(
        m.waistCm || m.hipCm || m.chestCm || m.armCm || m.thighCm || m.neckCm
      );
      if (hasAnyMeasurement) {
        const nowIso = new Date().toISOString();
        this.addCircumference({
          id: `circ_${Date.now()}`,
          userId: newId,
          timestamp: nowIso,
          waistCm: m.waistCm
            ? {
                value: m.waistCm,
                unit: 'cm',
                provenance: {
                  type: 'REAL',
                  source: 'Cadastro Inicial (Opcional)',
                  recordedAt: nowIso,
                  confidence: 'HIGH',
                },
              }
            : undefined,
          hipCm: m.hipCm
            ? {
                value: m.hipCm,
                unit: 'cm',
                provenance: {
                  type: 'REAL',
                  source: 'Cadastro Inicial (Opcional)',
                  recordedAt: nowIso,
                  confidence: 'HIGH',
                },
              }
            : undefined,
          chestCm: m.chestCm
            ? {
                value: m.chestCm,
                unit: 'cm',
                provenance: {
                  type: 'REAL',
                  source: 'Cadastro Inicial (Opcional)',
                  recordedAt: nowIso,
                  confidence: 'HIGH',
                },
              }
            : undefined,
          leftArmCm: m.armCm
            ? {
                value: m.armCm,
                unit: 'cm',
                provenance: {
                  type: 'REAL',
                  source: 'Cadastro Inicial (Opcional)',
                  recordedAt: nowIso,
                  confidence: 'HIGH',
                },
              }
            : undefined,
          leftThighCm: m.thighCm
            ? {
                value: m.thighCm,
                unit: 'cm',
                provenance: {
                  type: 'REAL',
                  source: 'Cadastro Inicial (Opcional)',
                  recordedAt: nowIso,
                  confidence: 'HIGH',
                },
              }
            : undefined,
          neckCm: m.neckCm
            ? {
                value: m.neckCm,
                unit: 'cm',
                provenance: {
                  type: 'REAL',
                  source: 'Cadastro Inicial (Opcional)',
                  recordedAt: nowIso,
                  confidence: 'HIGH',
                },
              }
            : undefined,
          provenance: {
            type: 'REAL',
            source: 'Cadastro Inicial (Opcional)',
            recordedAt: nowIso,
            confidence: 'HIGH',
          },
        });
      }
    }

    this.setAuthenticated(true);
    return { success: true, account: newAccount };
  }

  public logout(): void {
    const wasDemo = Boolean(this.identity.isDemo);
    this.isAuthenticated = false;
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'false');
    } catch {}
    this.logAudit(
      'LOGIN_SUCCESS',
      wasDemo ? 'DEMO_SESSION_LOGOUT' : 'REAL_SESSION_LOGOUT',
      wasDemo
        ? 'Sessão demonstrativa finalizada localmente no navegador.'
        : 'Sessão de usuário real finalizada localmente na interface.'
    );
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

  public updateAccountEmail(accountId: string, newEmail: string, currentPassword?: string): { success: boolean; error?: string } {
    const acc = this.savedAccounts.find((a) => a.id === accountId);
    if (!acc) {
      return { success: false, error: 'Perfil de usuário não localizado neste dispositivo.' };
    }
    if (acc.password && currentPassword && acc.password !== currentPassword) {
      return { success: false, error: 'Senha atual incorreta. A alteração de e-mail foi bloqueada pelo enclave de segurança.' };
    }
    const cleanEmail = (newEmail || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Informe um e-mail válido com formato nome@dominio.com.' };
    }
    const emailInUse = this.savedAccounts.some((a) => a.id !== accountId && a.email && a.email.toLowerCase() === cleanEmail);
    if (emailInUse) {
      return { success: false, error: 'Este e-mail já está associado a outro perfil neste dispositivo.' };
    }

    acc.email = cleanEmail;
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(this.savedAccounts));

    if (this.activeAccountId === accountId) {
      this.identity = { ...this.identity, email: cleanEmail };
      localStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(this.identity));
    }

    this.logAudit(
      'SECURITY_SCOPE_ESCALATION_PREVENTED',
      'EMAIL_CREDENTIAL_ROTATED',
      `E-mail de acesso da conta atualizado com segurança para: ${cleanEmail}`
    );

    return { success: true };
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
    if (this.identity.isDemo) {
      return this.bodyRecords.filter((r) => !r.userId || r.userId === this.identity.id || r.provenance?.type === 'DEMO');
    }
    return this.bodyRecords.filter((r) => r.userId === this.identity.id && r.provenance?.type === 'REAL');
  }

  public addBodyRecord(record: BodyCompositionRecord): void {
    if (!record.userId) record.userId = this.identity.id;
    this.bodyRecords.unshift(record);
    localStorage.setItem(STORAGE_KEYS.BODY_RECORDS, JSON.stringify(this.bodyRecords));
    this.logAudit('CALCULATION_EXECUTED', 'BODY_RECORD_ADDED', `Weight: ${record.weightKg.value} kg, Method: ${record.method}`);
  }

  public getCircumferences(): CircumferenceRecord[] {
    if (this.identity.isDemo) {
      return this.circumferences.filter((c) => !c.userId || c.userId === this.identity.id || c.provenance?.type === 'DEMO');
    }
    return this.circumferences.filter((c) => c.userId === this.identity.id && c.provenance?.type === 'REAL');
  }

  public addCircumference(record: CircumferenceRecord): void {
    if (!record.userId) record.userId = this.identity.id;
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
    if (this.identity.isDemo) {
      return this.trainingSessions.filter((s) => !s.userId || s.userId === this.identity.id || s.provenance?.type === 'DEMO');
    }
    return this.trainingSessions.filter((s) => s.userId === this.identity.id && s.provenance?.type === 'REAL');
  }

  public addTrainingSession(session: TrainingSession): void {
    if (!session.userId) session.userId = this.identity.id;
    this.trainingSessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.TRAINING_SESSIONS, JSON.stringify(this.trainingSessions));
    this.logAudit('CALCULATION_EXECUTED', 'TRAINING_SESSION_RECORDED', `Title: ${session.title}, Volume: ${session.calculatedVolumeKg.value} kg`);

    // Auto sync attendance for the session date
    const sessionDate = session.startedAt.split('T')[0];
    this.setDayAttendance({
      date: sessionDate,
      userId: this.identity.id,
      status: 'ATTENDED',
      workoutType: session.title.toLowerCase().includes('push')
        ? 'PUSH'
        : session.title.toLowerCase().includes('pull')
        ? 'PULL'
        : session.title.toLowerCase().includes('leg') || session.title.toLowerCase().includes('inferior')
        ? 'LEGS'
        : session.title.toLowerCase().includes('upper') || session.title.toLowerCase().includes('superior')
        ? 'UPPER'
        : session.title.toLowerCase().includes('lower')
        ? 'LOWER'
        : 'FULL_BODY',
      title: session.title,
      durationMinutes: session.durationMinutes,
      volumeKg: session.calculatedVolumeKg.value,
      notes: `Sessão concluída com RPE ${session.sessionRpe}/10`,
    });
  }

  // Conventional Athlete Workout Routine Methods
  public getUserWorkoutRoutine(): UserWorkoutRoutine {
    if (!this.userWorkoutRoutine || this.userWorkoutRoutine.userId !== this.identity.id) {
      this.userWorkoutRoutine = createSuggestedWorkoutRoutine(this.identity.id, this.profile.primaryGoal, 4);
      this.persistUserWorkoutRoutine();
    }
    return { ...this.userWorkoutRoutine };
  }

  public saveUserWorkoutRoutine(routine: UserWorkoutRoutine): void {
    this.userWorkoutRoutine = { ...routine, userId: this.identity.id, updatedAt: new Date().toISOString() };
    this.persistUserWorkoutRoutine();
    this.logAudit('CALCULATION_EXECUTED', 'ROUTINE_UPDATED', `Rotina: ${routine.title}, Sessões: ${routine.sessions.length}`);
  }

  public resetToSuggestedRoutine(goal?: string, days?: number): UserWorkoutRoutine {
    const chosenGoal = goal || this.profile.primaryGoal || 'HYPERTROPHY';
    const chosenDays = days || 4;
    this.userWorkoutRoutine = createSuggestedWorkoutRoutine(this.identity.id, chosenGoal, chosenDays);
    this.persistUserWorkoutRoutine();
    this.logAudit('CALCULATION_EXECUTED', 'ROUTINE_RESET_SUGGESTED', `Meta: ${chosenGoal}, Dias: ${chosenDays}`);
    return { ...this.userWorkoutRoutine };
  }

  private persistUserWorkoutRoutine(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_WORKOUT_ROUTINE, JSON.stringify(this.userWorkoutRoutine));
    } catch {}
  }

  // Gym Attendance & Planning
  public getAttendanceLogs(): DayAttendance[] {
    if (this.identity.isDemo) {
      return [...this.attendanceLogs];
    }
    return this.attendanceLogs.filter((a) => !a.userId || a.userId === this.identity.id);
  }

  public setDayAttendance(attendance: DayAttendance): void {
    if (!attendance.userId) attendance.userId = this.identity.id;
    const idx = this.attendanceLogs.findIndex((a) => a.date === attendance.date && (a.userId === this.identity.id || !a.userId));
    if (idx >= 0) {
      this.attendanceLogs[idx] = {
        ...this.attendanceLogs[idx],
        ...attendance,
        userId: this.identity.id,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.attendanceLogs.push({
        ...attendance,
        userId: this.identity.id,
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOGS, JSON.stringify(this.attendanceLogs));
    this.logAudit(
      'CALCULATION_EXECUTED',
      'ATTENDANCE_RECORDED',
      `Data: ${attendance.date}, Status: ${attendance.status}, Tipo: ${attendance.workoutType}`
    );
  }

  public getScheduledDaysOfWeek(): number[] {
    return [...this.scheduledDaysOfWeek];
  }

  public setScheduledDaysOfWeek(days: number[]): void {
    this.scheduledDaysOfWeek = [...days];
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_DAYS, JSON.stringify(this.scheduledDaysOfWeek));
  }

  // Nutrition
  public getFoods(): FoodItem[] {
    return [...this.foods];
  }

  public addFood(food: FoodItem): void {
    this.foods.push(food);
  }

  public getMeals(): MealEntry[] {
    if (this.identity.isDemo) {
      return this.meals.filter((m) => !m.userId || m.userId === this.identity.id || m.totalCalories?.provenance?.type === 'DEMO');
    }
    return this.meals.filter((m) => m.userId === this.identity.id && m.totalCalories?.provenance?.type === 'REAL');
  }

  public addMeal(meal: MealEntry): void {
    if (!meal.userId) meal.userId = this.identity.id;
    this.meals.unshift(meal);
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(this.meals));
  }

  public getHydration(): HydrationLog[] {
    if (this.identity.isDemo) {
      return this.hydration.filter((h) => !h.userId || h.userId === this.identity.id || h.estimatedTargetMl?.provenance?.type === 'DEMO' || h.estimatedTargetMl?.provenance?.type === 'ESTIMATED');
    }
    return this.hydration.filter((h) => h.userId === this.identity.id);
  }

  public logWater(ml: number): void {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.hydration.find((h) => h.date === today && (h.userId === this.identity.id || !h.userId));
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
    if (this.identity.isDemo) {
      return this.sleepSessions.filter((s) => !s.userId || s.userId === this.identity.id || s.provenance?.type === 'DEMO');
    }
    return this.sleepSessions.filter((s) => s.userId === this.identity.id && s.provenance?.type === 'REAL');
  }

  public addSleepSession(session: SleepSession): void {
    if (!session.userId) session.userId = this.identity.id;
    this.sleepSessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(this.sleepSessions));
  }

  public getWellnessLogs(): SubjectiveWellnessLog[] {
    if (this.identity.isDemo) {
      return this.wellnessLogs.filter((w) => !w.userId || w.userId === this.identity.id || w.provenance?.type === 'DEMO');
    }
    return this.wellnessLogs.filter((w) => w.userId === this.identity.id && w.provenance?.type === 'REAL');
  }

  public addWellnessLog(log: SubjectiveWellnessLog): void {
    if (!log.userId) log.userId = this.identity.id;
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

  // System Notifications & Data Compatibility Checks
  public getNotifications(): SystemNotification[] {
    return [...this.notifications];
  }

  public checkAndGenerateSystemNotifications(): void {
    const hasWeight = (this.identity.weightKg !== undefined && this.identity.weightKg > 0) || this.bodyRecords.length > 0;
    const hasHeight = this.identity.heightCm !== undefined && this.identity.heightCm > 0;
    const hasSex = this.identity.biologicalSex === 'MALE' || this.identity.biologicalSex === 'FEMALE';
    const hasDob = !!this.identity.dateOfBirth;
    const hasActivity = !!this.profile.activityLevel;

    const isMissingMandatory = !hasWeight || !hasHeight || !hasSex || !hasDob || !hasActivity;

    // 1. Mandatory Data Verification Check
    const existingMandatoryIdx = this.notifications.findIndex((n) => n.type === 'MANDATORY_DATA');
    if (isMissingMandatory) {
      const missingList: string[] = [];
      if (!hasWeight) missingList.push('Peso corporal');
      if (!hasHeight) missingList.push('Altura');
      if (!hasSex) missingList.push('Sexo biológico');
      if (!hasDob) missingList.push('Data de nascimento');
      if (!hasActivity) missingList.push('Nível de atividade');

      if (existingMandatoryIdx >= 0) {
        this.notifications[existingMandatoryIdx].metadata = {
          ...this.notifications[existingMandatoryIdx].metadata,
          missingFields: missingList,
        };
      } else {
        this.notifications.unshift({
          id: 'notif_mandatory_data',
          type: 'MANDATORY_DATA',
          title: 'Aviso: Dados Fisiológicos Obrigatórios Pendentes',
          message: `O sistema identificou a ausência de dados obrigatórios (${missingList.join(', ')}). Para que os motores científicos de TDEE, BMR e hidratação dinâmica funcionem com acurácia, seus dados precisam ser informados.`,
          timestamp: new Date().toISOString(),
          read: false,
          dismissedPopup: false,
          severity: 'urgent',
          actionLabel: 'Preencher Dados Agora',
          actionType: 'OPEN_VERIFY_MODAL',
          metadata: { missingFields: missingList },
        });
      }
    } else {
      if (existingMandatoryIdx >= 0 && !this.notifications[existingMandatoryIdx].read) {
        this.notifications[existingMandatoryIdx].read = true;
      }
    }

    // 2. Periodic Compatibility Verification (a cada X tempo)
    const lastCheckMs = this.lastDataVerificationDate ? new Date(this.lastDataVerificationDate).getTime() : 0;
    const daysSince = lastCheckMs > 0 ? Math.floor((Date.now() - lastCheckMs) / (1000 * 60 * 60 * 24)) : 16;
    const checkFrequencyDays = 14;

    const existingPeriodicIdx = this.notifications.findIndex((n) => n.type === 'PERIODIC_CHECK');
    if (daysSince >= checkFrequencyDays) {
      if (existingPeriodicIdx === -1) {
        const currentWeight = this.identity.weightKg || (this.bodyRecords[0]?.weightKg?.value ?? 70);
        const currentHeight = this.identity.heightCm || 175;
        this.notifications.unshift({
          id: `notif_periodic_${Date.now()}`,
          type: 'PERIODIC_CHECK',
          title: 'Verificação Periódica: Seus dados ainda são compatíveis?',
          message: `Já faz ${daysSince} dias desde sua última confirmação cadastral. O organismo oscila com frequência. Confirme se seu peso (${currentWeight} kg) e altura (${currentHeight} cm) continuam fiéis à sua realidade física atual.`,
          timestamp: new Date().toISOString(),
          read: false,
          dismissedPopup: false,
          severity: 'warning',
          actionLabel: 'Verificar & Confirmar Dados',
          actionType: 'OPEN_VERIFY_MODAL',
          metadata: {
            daysSinceLastCheck: daysSince,
            lastCheckedDate: this.lastDataVerificationDate,
            checkFrequencyDays,
          },
        });
      }
    }

    // 3. News & System Updates
    const hasNewsCalendar = this.notifications.some((n) => n.id === 'notif_news_calendar');
    if (!hasNewsCalendar) {
      this.notifications.push({
        id: 'notif_news_calendar',
        type: 'NEWS',
        title: 'Novidade: Calendário Mensal de Frequência e Treinos',
        message: 'Acompanhe dia a dia sua assiduidade e planejamento mensal de treinos diretamente na aba Treino, com contagem de presenças e faltas.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        read: false,
        dismissedPopup: true, // starts in the bell without blocking popup
        severity: 'info',
        actionLabel: 'Ver no Treino',
        actionType: 'NAVIGATE_TAB',
        actionTargetTab: 'training',
      });
    }

    const hasSysHydration = this.notifications.some((n) => n.id === 'notif_sys_hydration');
    if (!hasSysHydration) {
      this.notifications.push({
        id: 'notif_sys_hydration',
        type: 'SYSTEM_UPDATE',
        title: 'Boletim do Sistema: Monitoramento de Hidratação e Carga ACWR',
        message: 'A ingestão hídrica agora é monitorada via Escala Cromática de Armstrong e a fadiga acumulada utiliza o índice ACWR (Acute:Chronic Workload Ratio).',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        read: true,
        dismissedPopup: true,
        severity: 'info',
        actionLabel: 'Ver Métricas no Início',
        actionType: 'NAVIGATE_TAB',
        actionTargetTab: 'today',
      });
    }

    this.saveNotifications();
  }

  public addNotification(notif: SystemNotification): void {
    this.notifications.unshift(notif);
    this.saveNotifications();
  }

  public dismissNotificationPopup(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.dismissedPopup = true;
      this.saveNotifications();
      this.logAudit('CONSENT_GRANTED', 'NOTIFICATION_POPUP_DISMISSED', `Popup dispensado para "${notif.title}". Notificação mantida no sino.`);
    }
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.saveNotifications();
  }

  public removeNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveNotifications();
    this.logAudit('DATA_DELETED', 'NOTIFICATION_REMOVED', `Notificação ${id} removida.`);
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    this.logAudit('DATA_DELETED', 'NOTIFICATIONS_CLEARED', 'Caixa de notificações esvaziada pelo usuário.');
  }

  public getLastDataVerificationDate(): string {
    return this.lastDataVerificationDate;
  }

  public confirmDataCompatibility(updates?: {
    weightKg?: number;
    heightCm?: number;
    biologicalSex?: 'MALE' | 'FEMALE';
    activityLevel?: any;
  }): void {
    const nowIso = new Date().toISOString();
    this.lastDataVerificationDate = nowIso;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_DATA_VERIFICATION, nowIso);
    } catch {}

    if (updates) {
      const idUpdates: Partial<UserIdentity> = {};
      if (updates.weightKg) idUpdates.weightKg = updates.weightKg;
      if (updates.heightCm) idUpdates.heightCm = updates.heightCm;
      if (updates.biologicalSex) idUpdates.biologicalSex = updates.biologicalSex;

      if (Object.keys(idUpdates).length > 0) {
        this.updateIdentity(idUpdates);
      }

      if (updates.weightKg) {
        this.addBodyRecord({
          id: `body_${Date.now()}`,
          userId: this.identity.id,
          timestamp: nowIso,
          weightKg: {
            value: updates.weightKg,
            unit: 'kg',
            provenance: {
              type: 'REAL',
              source: 'Revalidação Periódica de Dados (Atleta)',
              recordedAt: nowIso,
              confidence: 'HIGH',
              isVerified: true,
            },
          },
          method: 'SELF_REPORT',
          provenance: {
            type: 'REAL',
            source: 'Revalidação Periódica de Dados',
            recordedAt: nowIso,
            confidence: 'HIGH',
            isVerified: true,
          },
        });
      }

      if (updates.activityLevel) {
        this.updateProfile({ activityLevel: updates.activityLevel });
      }
    }

    // Dismiss popups and mark periodic / mandatory checks as resolved
    this.notifications.forEach((n) => {
      if (n.type === 'PERIODIC_CHECK' || n.type === 'MANDATORY_DATA') {
        n.read = true;
        n.dismissedPopup = true;
      }
    });
    this.saveNotifications();

    this.logAudit(
      'CALCULATION_EXECUTED',
      'DATA_COMPATIBILITY_REVALIDATED',
      `Dados fisiológicos revalidados com sucesso em ${nowIso}. Próxima checagem agendada em 14 dias.`
    );
  }

  public triggerPeriodicCheckSimulation(): void {
    const simulatedOldDate = new Date(Date.now() - 20 * 86400000).toISOString();
    this.lastDataVerificationDate = simulatedOldDate;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_DATA_VERIFICATION, simulatedOldDate);
    } catch {}

    // Remove previous periodic checks
    this.notifications = this.notifications.filter((n) => n.type !== 'PERIODIC_CHECK');

    const curWeight = this.identity.weightKg || (this.bodyRecords[0]?.weightKg?.value ?? 70);
    const curHeight = this.identity.heightCm || 175;

    const newNotif: SystemNotification = {
      id: `notif_periodic_${Date.now()}`,
      type: 'PERIODIC_CHECK',
      title: 'Verificação Periódica: Seus dados ainda são compatíveis?',
      message: `Já faz 20 dias desde a última conferência. O corpo humano passa por oscilações constantes de peso e rotina. Confirme se seu peso (${curWeight} kg) e altura (${curHeight} cm) continuam fiéis à sua realidade física atual.`,
      timestamp: new Date().toISOString(),
      read: false,
      dismissedPopup: false,
      severity: 'warning',
      actionLabel: 'Verificar & Confirmar Dados',
      actionType: 'OPEN_VERIFY_MODAL',
      metadata: {
        daysSinceLastCheck: 20,
        lastCheckedDate: simulatedOldDate,
        checkFrequencyDays: 14,
      },
    };

    this.notifications.unshift(newNotif);
    this.saveNotifications();
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch {}
  }

  // ==========================================
  // GYM LABS NUTRI — PROFESSIONAL CRUD METHODS
  // ==========================================

  public getNutriPatients(): NutriPatient[] {
    return [...this.nutriPatients];
  }

  public getNutriPatientById(id: string): NutriPatient | undefined {
    return this.nutriPatients.find((p) => p.id === id);
  }

  public saveNutriPatient(patient: NutriPatient): void {
    const idx = this.nutriPatients.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      this.nutriPatients[idx] = { ...patient };
    } else {
      this.nutriPatients.unshift({ ...patient });
    }
    this.persistNutriPatients();
    this.logAudit('CALCULATION_EXECUTED', 'NUTRI_PATIENT_SAVED', `Prontuário do paciente ${patient.name} atualizado.`);
  }

  public deleteNutriPatient(id: string): void {
    this.nutriPatients = this.nutriPatients.filter((p) => p.id !== id);
    this.persistNutriPatients();
    this.logAudit('DATA_DELETED', 'NUTRI_PATIENT_REMOVED', `Paciente ${id} removido da carteira.`);
  }

  public getNutriConsultations(patientId?: string): NutriConsultation[] {
    if (patientId) {
      return this.nutriConsultations.filter((c) => c.patientId === patientId);
    }
    return [...this.nutriConsultations];
  }

  public saveNutriConsultation(cst: NutriConsultation): void {
    const idx = this.nutriConsultations.findIndex((c) => c.id === cst.id);
    if (idx >= 0) {
      this.nutriConsultations[idx] = { ...cst };
    } else {
      this.nutriConsultations.unshift({ ...cst });
    }
    this.persistNutriConsultations();

    // Update patient next appointment or last consultation
    const patient = this.nutriPatients.find((p) => p.id === cst.patientId);
    if (patient) {
      if (cst.status === 'COMPLETED') {
        patient.lastConsultationDate = cst.date;
      }
      patient.timeline.unshift({
        id: `time_${Date.now()}`,
        date: cst.date,
        type: 'CONSULTATION',
        title: `Consulta (${cst.type === 'FIRST_VISIT' ? 'Primeira Consulta' : cst.type === 'FOLLOW_UP' ? 'Retorno' : 'Avaliação'})`,
        description: cst.anamnesisNotes || 'Consulta registrada no prontuário.',
        authorName: this.identity.name,
      });
      this.persistNutriPatients();
    }

    this.logAudit('CALCULATION_EXECUTED', 'NUTRI_CONSULTATION_SAVED', `Consulta com paciente ${cst.patientName} registrada.`);
  }

  public getNutriAssessments(patientId?: string): NutriAssessment[] {
    if (patientId) {
      return this.nutriAssessments.filter((a) => a.patientId === patientId);
    }
    return [...this.nutriAssessments];
  }

  public saveNutriAssessment(as: NutriAssessment): void {
    const idx = this.nutriAssessments.findIndex((a) => a.id === as.id);
    if (idx >= 0) {
      this.nutriAssessments[idx] = { ...as };
    } else {
      this.nutriAssessments.unshift({ ...as });
    }
    this.persistNutriAssessments();

    // Sync weight and body composition with patient profile
    const patient = this.nutriPatients.find((p) => p.id === as.patientId);
    if (patient) {
      patient.weightKg = as.weightKg;
      patient.heightCm = as.heightCm;
      patient.timeline.unshift({
        id: `time_as_${Date.now()}`,
        date: as.date,
        type: 'ASSESSMENT',
        title: `Avaliação Antropométrica (IMC ${as.bmi})`,
        description: `Peso: ${as.weightKg}kg, % Gordura: ${as.bodyFatPercentage || '--'}%, Massa Magra: ${as.muscleMassKg || '--'}kg`,
        authorName: this.identity.name,
      });
      this.persistNutriPatients();
    }

    this.logAudit('CALCULATION_EXECUTED', 'NUTRI_ASSESSMENT_RECORDED', `Avaliação antropométrica registrada para paciente ${as.patientId}.`);
  }

  public getNutriMealPlans(patientId?: string): NutriMealPlan[] {
    if (patientId) {
      return this.nutriMealPlans.filter((p) => p.patientId === patientId);
    }
    return [...this.nutriMealPlans];
  }

  public saveNutriMealPlan(plan: NutriMealPlan): void {
    const idx = this.nutriMealPlans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      this.nutriMealPlans[idx] = { ...plan };
    } else {
      this.nutriMealPlans.unshift({ ...plan });
    }
    this.persistNutriMealPlans();

    const patient = this.nutriPatients.find((p) => p.id === plan.patientId);
    if (patient && plan.status === 'PUBLISHED') {
      patient.timeline.unshift({
        id: `time_mp_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'MEAL_PLAN',
        title: `Plano Alimentar "${plan.title}" Publicado`,
        description: `Meta: ${plan.totalCaloriesTarget} kcal (${plan.totalProteinGTarget}g P, ${plan.totalCarbsGTarget}g C, ${plan.totalFatGTarget}g G).`,
        authorName: this.identity.name,
      });
      this.persistNutriPatients();
    }

    this.logAudit('CALCULATION_EXECUTED', 'NUTRI_MEAL_PLAN_SAVED', `Plano alimentar ${plan.title} salvo (Status: ${plan.status}).`);
  }

  public publishNutriMealPlan(id: string): void {
    const plan = this.nutriMealPlans.find((p) => p.id === id);
    if (plan) {
      // Archive other plans for same patient
      this.nutriMealPlans.forEach((p) => {
        if (p.patientId === plan.patientId && p.id !== id && p.status === 'PUBLISHED') {
          p.status = 'ARCHIVED';
        }
      });
      plan.status = 'PUBLISHED';
      plan.publishedAt = new Date().toISOString();
      this.persistNutriMealPlans();
      this.logAudit('CALCULATION_EXECUTED', 'NUTRI_MEAL_PLAN_PUBLISHED', `Plano "${plan.title}" publicado para o paciente.`);
    }
  }

  public getNutriFinances(): NutriFinanceTransaction[] {
    return [...this.nutriFinances];
  }

  public saveNutriFinance(tx: NutriFinanceTransaction): void {
    const idx = this.nutriFinances.findIndex((f) => f.id === tx.id);
    if (idx >= 0) {
      this.nutriFinances[idx] = { ...tx };
    } else {
      this.nutriFinances.unshift({ ...tx });
    }
    this.persistNutriFinances();
  }

  public deleteNutriFinance(id: string): void {
    this.nutriFinances = this.nutriFinances.filter((f) => f.id !== id);
    this.persistNutriFinances();
  }

  public getNutriLibrary(): NutriLibraryItem[] {
    return [...this.nutriLibrary];
  }

  public saveNutriLibraryItem(item: NutriLibraryItem): void {
    const idx = this.nutriLibrary.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      this.nutriLibrary[idx] = { ...item };
    } else {
      this.nutriLibrary.unshift({ ...item });
    }
    this.persistNutriLibrary();
  }

  // ============================================
  // GYM LABS TRAINER — PROFESSIONAL CRUD METHODS
  // ============================================

  public getTrainerStudents(): TrainerStudent[] {
    return [...this.trainerStudents];
  }

  public getTrainerStudentById(id: string): TrainerStudent | undefined {
    return this.trainerStudents.find((s) => s.id === id);
  }

  public saveTrainerStudent(student: TrainerStudent): void {
    const idx = this.trainerStudents.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      this.trainerStudents[idx] = { ...student };
    } else {
      this.trainerStudents.unshift({ ...student });
    }
    this.persistTrainerStudents();
    this.logAudit('CALCULATION_EXECUTED', 'TRAINER_STUDENT_SAVED', `Aluno ${student.name} atualizado no Trainer.`);
  }

  public deleteTrainerStudent(id: string): void {
    this.trainerStudents = this.trainerStudents.filter((s) => s.id !== id);
    this.persistTrainerStudents();
    this.logAudit('DATA_DELETED', 'TRAINER_STUDENT_REMOVED', `Aluno ${id} removido do Trainer.`);
  }

  public getTrainerWorkoutPlans(studentId?: string): TrainerWorkoutPlan[] {
    if (studentId) {
      return this.trainerWorkoutPlans.filter((p) => p.studentId === studentId);
    }
    return [...this.trainerWorkoutPlans];
  }

  public saveTrainerWorkoutPlan(plan: TrainerWorkoutPlan): void {
    const idx = this.trainerWorkoutPlans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      this.trainerWorkoutPlans[idx] = { ...plan };
    } else {
      this.trainerWorkoutPlans.unshift({ ...plan });
    }
    this.persistTrainerWorkoutPlans();

    const student = this.trainerStudents.find((s) => s.id === plan.studentId);
    if (student && plan.status === 'PUBLISHED') {
      student.activeWorkoutPlanTitle = plan.title;
      student.timeline.unshift({
        id: `time_tr_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'PLAN_PRESCRIBED',
        title: `Planilha de Treino "${plan.title}" Publicada`,
        description: `Divisão ${plan.splitType} com ${plan.sessions.length} sessões estruturadas.`,
        authorName: this.identity.name,
      });
      this.persistTrainerStudents();
    }

    this.logAudit('CALCULATION_EXECUTED', 'TRAINER_WORKOUT_PLAN_SAVED', `Treino ${plan.title} salvo (Status: ${plan.status}).`);
  }

  public publishTrainerWorkoutPlan(id: string): void {
    const plan = this.trainerWorkoutPlans.find((p) => p.id === id);
    if (plan) {
      this.trainerWorkoutPlans.forEach((p) => {
        if (p.studentId === plan.studentId && p.id !== id && p.status === 'PUBLISHED') {
          p.status = 'ARCHIVED';
        }
      });
      plan.status = 'PUBLISHED';
      plan.publishedAt = new Date().toISOString();
      this.persistTrainerWorkoutPlans();

      const student = this.trainerStudents.find((s) => s.id === plan.studentId);
      if (student) {
        student.activeWorkoutPlanTitle = plan.title;
        this.persistTrainerStudents();
      }
      this.logAudit('CALCULATION_EXECUTED', 'TRAINER_WORKOUT_PLAN_PUBLISHED', `Treino "${plan.title}" publicado para o aluno.`);
    }
  }

  public getTrainerAssessments(studentId?: string): TrainerAssessment[] {
    if (studentId) {
      return this.trainerAssessments.filter((a) => a.studentId === studentId);
    }
    return [...this.trainerAssessments];
  }

  public saveTrainerAssessment(as: TrainerAssessment): void {
    const idx = this.trainerAssessments.findIndex((a) => a.id === as.id);
    if (idx >= 0) {
      this.trainerAssessments[idx] = { ...as };
    } else {
      this.trainerAssessments.unshift({ ...as });
    }
    this.persistTrainerAssessments();

    const student = this.trainerStudents.find((s) => s.id === as.studentId);
    if (student) {
      student.weightKg = as.weightKg;
      student.heightCm = as.heightCm;
      student.timeline.unshift({
        id: `time_tas_${Date.now()}`,
        date: as.date,
        type: 'ASSESSMENT',
        title: `Avaliação Física Completa`,
        description: `1RM Supino: ${as.strengthBenchmarks?.benchPress1RMKg || '--'}kg, 1RM Agachamento: ${as.strengthBenchmarks?.squat1RMKg || '--'}kg`,
        authorName: this.identity.name,
      });
      this.persistTrainerStudents();
    }
    this.logAudit('CALCULATION_EXECUTED', 'TRAINER_ASSESSMENT_SAVED', `Avaliação física salva para aluno ${as.studentId}.`);
  }

  public getTrainerAppointments(studentId?: string): TrainerScheduleAppointment[] {
    if (studentId) {
      return this.trainerAppointments.filter((a) => a.studentId === studentId);
    }
    return [...this.trainerAppointments];
  }

  public saveTrainerAppointment(app: TrainerScheduleAppointment): void {
    const idx = this.trainerAppointments.findIndex((a) => a.id === app.id);
    if (idx >= 0) {
      this.trainerAppointments[idx] = { ...app };
    } else {
      this.trainerAppointments.unshift({ ...app });
    }
    this.persistTrainerAppointments();
  }

  public getTrainerFinances(): TrainerFinanceTransaction[] {
    return [...this.trainerFinances];
  }

  public saveTrainerFinance(tx: TrainerFinanceTransaction): void {
    const idx = this.trainerFinances.findIndex((f) => f.id === tx.id);
    if (idx >= 0) {
      this.trainerFinances[idx] = { ...tx };
    } else {
      this.trainerFinances.unshift({ ...tx });
    }
    this.persistTrainerFinances();
  }

  public deleteTrainerFinance(id: string): void {
    this.trainerFinances = this.trainerFinances.filter((f) => f.id !== id);
    this.persistTrainerFinances();
  }

  // ============================================
  // ECOSYSTEM, HEALTH TEAM & CHAT METHODS
  // ============================================

  public getHealthTeamMembers(): HealthTeamMember[] {
    return [...this.healthTeamMembers];
  }

  public saveHealthTeamMember(member: HealthTeamMember): void {
    const idx = this.healthTeamMembers.findIndex((m) => m.id === member.id);
    if (idx >= 0) {
      this.healthTeamMembers[idx] = { ...member };
    } else {
      this.healthTeamMembers.unshift({ ...member });
    }
    this.persistHealthTeam();
    this.logAudit('CONSENT_GRANTED', 'HEALTH_TEAM_MEMBER_UPDATED', `Membro da equipe ${member.name} (${member.role}) atualizado.`);
  }

  public removeHealthTeamMember(id: string): void {
    this.healthTeamMembers = this.healthTeamMembers.filter((m) => m.id !== id);
    this.persistHealthTeam();
    this.logAudit('DATA_DELETED', 'HEALTH_TEAM_MEMBER_REMOVED', `Profissional ${id} desvinculado da equipe de saúde.`);
  }

  public getInterProfessionalConsents(studentId?: string): InterProfessionalConsent[] {
    if (studentId) {
      return this.interProfessionalConsents.filter((c) => c.studentId === studentId);
    }
    return [...this.interProfessionalConsents];
  }

  public saveInterProfessionalConsent(consent: InterProfessionalConsent): void {
    const idx = this.interProfessionalConsents.findIndex((c) => c.id === consent.id);
    if (idx >= 0) {
      this.interProfessionalConsents[idx] = { ...consent };
    } else {
      this.interProfessionalConsents.unshift({ ...consent });
    }
    this.persistInterConsents();
    this.logAudit('CONSENT_GRANTED', 'INTER_PROFESSIONAL_CONSENT_SAVED', `Consentimento interprofissional configurado para aluno ${consent.studentName}.`);
  }

  public getChatMessages(conversationId?: string): ChatMessage[] {
    if (conversationId) {
      return this.chatMessages.filter((m) => m.conversationId === conversationId);
    }
    return [...this.chatMessages];
  }

  public sendChatMessage(msgData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.chatMessages.push(newMsg);
    this.persistChatMessages();
    return newMsg;
  }

  public markChatAsRead(conversationId: string, currentUserId: string): void {
    let changed = false;
    this.chatMessages.forEach((m) => {
      if (m.conversationId === conversationId && m.receiverId === currentUserId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.persistChatMessages();
    }
  }

  public getInvitations(): ProfessionalInvitation[] {
    return [...this.invitations];
  }

  public createInvitation(invData: Omit<ProfessionalInvitation, 'id' | 'createdAt' | 'code' | 'status'>): ProfessionalInvitation {
    const newInv: ProfessionalInvitation = {
      ...invData,
      id: `inv_${Date.now()}`,
      code: `GL-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.invitations.unshift(newInv);
    this.persistInvitations();
    this.logAudit('RELATIONSHIP_INVITED', 'INVITATION_CREATED', `Convite enviado para ${invData.targetEmail} por ${invData.senderName} (${invData.senderRole}). Código: ${newInv.code}`);
    return newInv;
  }

  public acceptInvitation(codeOrId: string, responder?: { id: string; name: string }): boolean {
    const inv = this.invitations.find((i) => i.code === codeOrId || i.id === codeOrId);
    if (!inv || inv.status !== 'PENDING') return false;
    inv.status = 'ACCEPTED';
    inv.acceptedAt = new Date().toISOString();
    inv.respondedAt = inv.acceptedAt;
    if (responder && !inv.targetName) {
      inv.targetName = responder.name;
    }
    this.persistInvitations();

    // If an invitation between user and professional is accepted, auto-create/activate HealthTeamMember
    if (inv.senderRole === 'COACH' || inv.senderRole === 'NUTRITIONIST' || inv.senderRole === 'GYM') {
      const existingTeam = this.healthTeamMembers.find((m) => m.professionalId === inv.senderId || m.email === inv.targetEmail);
      if (!existingTeam) {
        this.healthTeamMembers.unshift({
          id: `htm_${Date.now()}`,
          professionalId: inv.senderId,
          name: inv.senderName,
          role: inv.senderRole,
          credentialNumber: inv.senderRole === 'COACH' ? 'CREF Ativo' : inv.senderRole === 'NUTRITIONIST' ? 'CRN Ativo' : 'CNPJ Ativo',
          email: inv.targetEmail,
          phone: '',
          specialty: inv.senderRole === 'COACH' ? 'Treinamento Personalizado' : inv.senderRole === 'NUTRITIONIST' ? 'Nutrição Esportiva' : 'Centro de Treinamento',
          connectedSince: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          permissions: {
            canViewWorkouts: true,
            canViewDiet: inv.senderRole === 'NUTRITIONIST',
            canViewBodyMetrics: true,
            canViewHydrationAndSleep: true,
            canShareWithOtherProfessionals: false,
          },
        });
        this.persistHealthTeam();
      }
    }

    this.logAudit('RELATIONSHIP_ACCEPTED', 'INVITATION_ACCEPTED', `Convite ${inv.code} aceito por ${responder?.name || inv.targetEmail}. Vínculo estabelecido.`);
    return true;
  }

  public rejectInvitation(codeOrId: string, reason?: string): boolean {
    const inv = this.invitations.find((i) => i.code === codeOrId || i.id === codeOrId);
    if (!inv || inv.status !== 'PENDING') return false;
    inv.status = 'REJECTED';
    inv.respondedAt = new Date().toISOString();
    inv.rejectionReason = reason;
    this.persistInvitations();
    this.logAudit('RELATIONSHIP_REJECTED', 'INVITATION_REJECTED', `Convite ${inv.code} recusado. Motivo: ${reason || 'Não informado'}.`);
    return true;
  }

  public revokeInvitation(invitationId: string): boolean {
    const inv = this.invitations.find((i) => i.id === invitationId);
    if (!inv || inv.status !== 'PENDING') return false;
    inv.status = 'REVOKED';
    inv.respondedAt = new Date().toISOString();
    this.persistInvitations();
    this.logAudit('RELATIONSHIP_TERMINATED', 'INVITATION_REVOKED', `Convite ${inv.code} revogado pelo emissor.`);
    return true;
  }

  public terminateRelationship(healthTeamMemberId: string, reason?: string): boolean {
    const member = this.healthTeamMembers.find((m) => m.id === healthTeamMemberId);
    if (!member) return false;
    member.status = 'DISCONNECTED';
    this.persistHealthTeam();
    this.logAudit('RELATIONSHIP_TERMINATED', 'HEALTH_TEAM_DISCONNECTED', `Vínculo com ${member.name} (${member.role}) encerrado. Motivo: ${reason || 'Solicitação do usuário'}.`);
    return true;
  }

  // Cross-system getters for Student app:
  public getActivePrescribedMealPlanForStudent(studentUserIdOrId: string): NutriMealPlan | undefined {
    const patient = this.nutriPatients.find((p) => p.userId === studentUserIdOrId || p.id === studentUserIdOrId);
    const targetId = patient ? patient.id : studentUserIdOrId;
    return this.nutriMealPlans.find((p) => (p.patientId === targetId || p.patientId === 'pat_alex_vance') && p.status === 'PUBLISHED');
  }

  public getActivePrescribedWorkoutPlanForStudent(studentUserIdOrId: string): TrainerWorkoutPlan | undefined {
    const student = this.trainerStudents.find((s) => s.userId === studentUserIdOrId || s.id === studentUserIdOrId);
    const targetId = student ? student.id : studentUserIdOrId;
    return this.trainerWorkoutPlans.find((p) => (p.studentId === targetId || p.studentId === 'std_alex_vance') && p.status === 'PUBLISHED');
  }

  // Persistence helpers
  private persistNutriPatients() {
    try { localStorage.setItem(STORAGE_KEYS.NUTRI_PATIENTS, JSON.stringify(this.nutriPatients)); } catch {}
  }
  private persistNutriConsultations() {
    try { localStorage.setItem(STORAGE_KEYS.NUTRI_CONSULTATIONS, JSON.stringify(this.nutriConsultations)); } catch {}
  }
  private persistNutriAssessments() {
    try { localStorage.setItem(STORAGE_KEYS.NUTRI_ASSESSMENTS, JSON.stringify(this.nutriAssessments)); } catch {}
  }
  private persistNutriMealPlans() {
    try { localStorage.setItem(STORAGE_KEYS.NUTRI_MEAL_PLANS, JSON.stringify(this.nutriMealPlans)); } catch {}
  }
  private persistNutriFinances() {
    try { localStorage.setItem(STORAGE_KEYS.NUTRI_FINANCES, JSON.stringify(this.nutriFinances)); } catch {}
  }
  private persistNutriLibrary() {
    try { localStorage.setItem(STORAGE_KEYS.NUTRI_LIBRARY, JSON.stringify(this.nutriLibrary)); } catch {}
  }
  private persistTrainerStudents() {
    try { localStorage.setItem(STORAGE_KEYS.TRAINER_STUDENTS, JSON.stringify(this.trainerStudents)); } catch {}
  }
  private persistTrainerWorkoutPlans() {
    try { localStorage.setItem(STORAGE_KEYS.TRAINER_WORKOUT_PLANS, JSON.stringify(this.trainerWorkoutPlans)); } catch {}
  }
  private persistTrainerAssessments() {
    try { localStorage.setItem(STORAGE_KEYS.TRAINER_ASSESSMENTS, JSON.stringify(this.trainerAssessments)); } catch {}
  }
  private persistTrainerAppointments() {
    try { localStorage.setItem(STORAGE_KEYS.TRAINER_APPOINTMENTS, JSON.stringify(this.trainerAppointments)); } catch {}
  }
  private persistTrainerFinances() {
    try { localStorage.setItem(STORAGE_KEYS.TRAINER_FINANCES, JSON.stringify(this.trainerFinances)); } catch {}
  }
  private persistHealthTeam() {
    try { localStorage.setItem(STORAGE_KEYS.HEALTH_TEAM, JSON.stringify(this.healthTeamMembers)); } catch {}
  }
  private persistInterConsents() {
    try { localStorage.setItem(STORAGE_KEYS.INTER_CONSENTS, JSON.stringify(this.interProfessionalConsents)); } catch {}
  }
  private persistChatMessages() {
    try { localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(this.chatMessages)); } catch {}
  }
  private persistInvitations() {
    try { localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(this.invitations)); } catch {}
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
