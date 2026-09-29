import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dataStore } from '../repositories/GymLabsDataStore';
import { UserIdentity, UserProfile, CountryConfiguration, SavedUserAccount, RegisterUserData } from '../types/user';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';
import { Exercise, TrainingSession, ACWRResult, DayAttendance } from '../types/training';
import { SystemNotification } from '../types/notification';
import { MealEntry, HydrationLog, FoodItem } from '../types/nutrition';
import { SleepSession, SubjectiveWellnessLog, GLRecoveryScore } from '../types/recovery';
import { ConsentGrant } from '../types/consent';
import { AuditRecord } from '../types/audit';
import { ProfessionalProfile } from '../types/professional';
import { Organization } from '../types/organization';
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
import { JURISDICTIONS } from '../data/seedData';
import { calculateACWR, DailyLoadRecord } from '../science/trainingLoad';
import { computeGLRecoveryScore } from '../science/recoveryScore';
import { calculateBMR } from '../science/bmr';
import { calculateTDEE } from '../science/tdee';
import { calculateBMI } from '../science/bmi';
import { calculateKarvonenZones, HeartRateZonesResult } from '../science/heartRate';
import {
  calculateDynamicHydration,
  DynamicHydrationResult,
  ARMSTRONG_URINE_SCALE,
  ArmstrongLevel,
} from '../science/hydration';
import {
  buildPRVault,
  PRVaultEntry,
  evaluateProgressiveOverload,
  OverloadAnalysisResult,
  ExerciseSessionOccurrence,
} from '../science/overload';
import { DeterministicCalculationResult } from '../types/science';

export type NavigationTab = 
  | 'today' 
  | 'training' 
  | 'health'
  | 'body' 
  | 'nutrition' 
  | 'recovery' 
  | 'datalab' 
  | 'intelligence' 
  | 'professionals' 
  | 'organizations' 
  | 'trust' 
  | 'settings';

interface GymLabsContextType {
  // Navigation
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;

  // Authentication & View Management
  isAuthenticated: boolean;
  authView: 'landing' | 'login' | 'register' | 'app';
  setAuthView: (view: 'landing' | 'login' | 'register' | 'app') => void;
  authProduct: 'USER' | 'PROFESSIONAL' | 'GYM';
  setAuthProduct: (product: 'USER' | 'PROFESSIONAL' | 'GYM') => void;
  goToLoginWithProduct: (product?: 'USER' | 'PROFESSIONAL' | 'GYM') => void;
  goToRegisterWithProduct: (product?: 'USER' | 'PROFESSIONAL' | 'GYM') => void;
  quickAccessSampleAccount: (role: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM') => boolean;
  login: (credentials: { email?: string; password?: string; pin?: string; accountId?: string }) => { success: boolean; error?: string };
  register: (data: RegisterUserData) => { success: boolean; error?: string };
  logout: () => void;

  // Global mode
  isDemoMode: boolean;
  toggleDemoMode: () => void;

  // Multi-Account & Login Switcher
  savedAccounts: SavedUserAccount[];
  activeAccountId: string;
  activeAccount: SavedUserAccount | undefined;
  switchAccount: (accountId: string) => boolean;
  addSavedAccount: (account: SavedUserAccount) => void;
  removeSavedAccount: (accountId: string) => boolean;
  isAccountModalOpen: boolean;
  openAccountModal: () => void;
  closeAccountModal: () => void;

  // Identity & Profile
  identity: UserIdentity;
  updateIdentity: (updates: Partial<UserIdentity>) => void;
  updateAccountEmail: (newEmail: string, currentPassword?: string) => { success: boolean; error?: string };
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  activeJurisdiction: CountryConfiguration;

  // Domain Telemetry
  bodyRecords: BodyCompositionRecord[];
  addBodyRecord: (record: BodyCompositionRecord) => void;
  latestBodyRecord: BodyCompositionRecord | null;
  circumferences: CircumferenceRecord[];
  addCircumference: (record: CircumferenceRecord) => void;

  exercises: Exercise[];
  addCustomExercise: (exercise: Exercise) => void;
  trainingSessions: TrainingSession[];
  addTrainingSession: (session: TrainingSession) => void;
  attendanceLogs: DayAttendance[];
  setDayAttendance: (attendance: DayAttendance) => void;
  scheduledDaysOfWeek: number[];
  setScheduledDaysOfWeek: (days: number[]) => void;
  acwrMetrics: ACWRResult;

  // PR Vault & Progressive Overload Engine
  prVault: PRVaultEntry[];
  evaluateOverload: (exerciseName: string) => OverloadAnalysisResult;
  tanakaKarvonen: DeterministicCalculationResult<HeartRateZonesResult>;

  // Nutrition & Dynamic Hydration Engine
  foods: FoodItem[];
  meals: MealEntry[];
  addMeal: (meal: MealEntry) => void;
  hydration: HydrationLog[];
  logWater: (ml: number) => void;
  todayWaterMl: number;
  ambientTempC: number;
  setAmbientTempC: (temp: number) => void;
  sweatRate: 'LOW' | 'MODERATE' | 'HIGH';
  setSweatRate: (rate: 'LOW' | 'MODERATE' | 'HIGH') => void;
  takingCreatine: boolean;
  setTakingCreatine: (taking: boolean) => void;
  dynamicHydration: DynamicHydrationResult;
  armstrongUrineLevel: number;
  setArmstrongUrineLevel: (level: number) => void;
  currentArmstrongDetails: ArmstrongLevel;

  // Sleep & Recovery
  sleepSessions: SleepSession[];
  addSleepSession: (session: SleepSession) => void;
  latestSleep: SleepSession | null;
  wellnessLogs: SubjectiveWellnessLog[];
  addWellnessLog: (log: SubjectiveWellnessLog) => void;
  todayWellness: SubjectiveWellnessLog | null;
  glRecoveryScore: GLRecoveryScore;

  // Scientific Calculated Baselines
  bmrCalculation: DeterministicCalculationResult<number>;
  tdeeCalculation: DeterministicCalculationResult<number>;
  bmiCalculation: DeterministicCalculationResult<any>;

  // Trust, Consents & Audit (LGPD & Security Enclave)
  consents: ConsentGrant[];
  grantConsent: (grant: ConsentGrant) => void;
  revokeConsent: (id: string, reason: string) => void;
  auditLogs: AuditRecord[];
  exportUserDataJson: () => string;
  purgeAllUserData: () => void;

  // Security Visor Lock Screen & 2FA
  isEnclaveLocked: boolean;
  lockEnclave: () => void;
  unlockWithPin: (pin: string) => boolean;
  enclavePin: string;
  setEnclavePin: (pin: string) => void;
  twoFactorEnabled: boolean;
  toggleTwoFactor: () => void;

  // Network & Ecosystem
  professionals: ProfessionalProfile[];
  organizations: Organization[];

  // Transparent Calculation Graph Modal Inspector
  inspectionModal: DeterministicCalculationResult<any> | null;
  openCalculationInspector: (calc: DeterministicCalculationResult<any>) => void;
  closeCalculationInspector: () => void;

  // System Notifications & Periodic Compatibility Verification
  notifications: SystemNotification[];
  unreadNotificationsCount: number;
  activePopupNotification: SystemNotification | null;
  dismissPopupNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  isQuickVerifyModalOpen: boolean;
  setIsQuickVerifyModalOpen: (open: boolean) => void;
  confirmDataCompatibility: (updates?: {
    weightKg?: number;
    heightCm?: number;
    biologicalSex?: 'MALE' | 'FEMALE';
    activityLevel?: any;
  }) => void;
  triggerPeriodicCheckSimulation: () => void;

  // Gym Labs Nutri Professional System
  nutriPatients: NutriPatient[];
  saveNutriPatient: (p: NutriPatient) => void;
  deleteNutriPatient: (id: string) => void;
  nutriConsultations: NutriConsultation[];
  saveNutriConsultation: (cst: NutriConsultation) => void;
  nutriAssessments: NutriAssessment[];
  saveNutriAssessment: (as: NutriAssessment) => void;
  nutriMealPlans: NutriMealPlan[];
  saveNutriMealPlan: (plan: NutriMealPlan) => void;
  publishNutriMealPlan: (id: string) => void;
  nutriFinances: NutriFinanceTransaction[];
  saveNutriFinance: (tx: NutriFinanceTransaction) => void;
  deleteNutriFinance: (id: string) => void;
  nutriLibrary: NutriLibraryItem[];
  saveNutriLibraryItem: (item: NutriLibraryItem) => void;

  // Gym Labs Trainer Professional System
  trainerStudents: TrainerStudent[];
  saveTrainerStudent: (s: TrainerStudent) => void;
  deleteTrainerStudent: (id: string) => void;
  trainerWorkoutPlans: TrainerWorkoutPlan[];
  saveTrainerWorkoutPlan: (plan: TrainerWorkoutPlan) => void;
  publishTrainerWorkoutPlan: (id: string) => void;
  trainerAssessments: TrainerAssessment[];
  saveTrainerAssessment: (as: TrainerAssessment) => void;
  trainerAppointments: TrainerScheduleAppointment[];
  saveTrainerAppointment: (app: TrainerScheduleAppointment) => void;
  trainerFinances: TrainerFinanceTransaction[];
  saveTrainerFinance: (tx: TrainerFinanceTransaction) => void;
  deleteTrainerFinance: (id: string) => void;

  // Ecosystem, Health Team & Chat Communication
  healthTeamMembers: HealthTeamMember[];
  saveHealthTeamMember: (m: HealthTeamMember) => void;
  removeHealthTeamMember: (id: string) => void;
  interProfessionalConsents: InterProfessionalConsent[];
  saveInterProfessionalConsent: (c: InterProfessionalConsent) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  markChatAsRead: (conversationId: string, currentUserId: string) => void;
  invitations: ProfessionalInvitation[];
  createInvitation: (inv: Omit<ProfessionalInvitation, 'id' | 'createdAt' | 'code' | 'status'>) => ProfessionalInvitation;
  acceptInvitation: (codeOrId: string) => boolean;
  activePrescribedMealPlan: NutriMealPlan | undefined;
  activePrescribedWorkoutPlan: TrainerWorkoutPlan | undefined;
  activeChatRecipient: { id: string; name: string; role: string } | null;
  setActiveChatRecipient: (r: { id: string; name: string; role: string } | null) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const GymLabsContext = createContext<GymLabsContextType | null>(null);

export const GymLabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('today');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(dataStore.getIsDemoMode());

  const [identity, setIdentityState] = useState<UserIdentity>(dataStore.getIdentity());
  const [profile, setProfileState] = useState<UserProfile>(dataStore.getProfile());
  const [bodyRecords, setBodyRecords] = useState<BodyCompositionRecord[]>(dataStore.getBodyRecords());
  const [circumferences, setCircumferences] = useState<CircumferenceRecord[]>(dataStore.getCircumferences());
  const [exercises, setExercises] = useState<Exercise[]>(dataStore.getExercises());
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(dataStore.getTrainingSessions());
  const [attendanceLogs, setAttendanceLogs] = useState<DayAttendance[]>(dataStore.getAttendanceLogs());
  const [scheduledDaysOfWeek, setScheduledDaysOfWeekState] = useState<number[]>(dataStore.getScheduledDaysOfWeek());
  const [meals, setMeals] = useState<MealEntry[]>(dataStore.getMeals());
  const [foods] = useState<FoodItem[]>(dataStore.getFoods());
  const [hydration, setHydration] = useState<HydrationLog[]>(dataStore.getHydration());
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>(dataStore.getSleepSessions());
  const [wellnessLogs, setWellnessLogs] = useState<SubjectiveWellnessLog[]>(dataStore.getWellnessLogs());
  const [consents, setConsents] = useState<ConsentGrant[]>(dataStore.getConsents());
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(dataStore.getAuditLogs());
  const [professionals] = useState<ProfessionalProfile[]>(dataStore.getProfessionals());
  const [organizations] = useState<Organization[]>(dataStore.getOrganizations());

  // Dynamic Hydration State
  const [ambientTempC, setAmbientTempC] = useState<number>(26);
  const [sweatRate, setSweatRate] = useState<'LOW' | 'MODERATE' | 'HIGH'>('MODERATE');
  const [takingCreatine, setTakingCreatine] = useState<boolean>(true);
  const [armstrongUrineLevel, setArmstrongUrineLevel] = useState<number>(2);

  // Security Visor Lock Screen & 2FA State
  const [isEnclaveLocked, setIsEnclaveLocked] = useState<boolean>(false);
  const [enclavePin, setEnclavePin] = useState<string>('2026');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);

  // Modal Inspector
  const [inspectionModal, setInspectionModal] = useState<DeterministicCalculationResult<any> | null>(null);

  // System Notifications & Periodic Compatibility Verification State
  const [notifications, setNotifications] = useState<SystemNotification[]>(dataStore.getNotifications());
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [isQuickVerifyModalOpen, setIsQuickVerifyModalOpen] = useState<boolean>(false);

  const refreshNotifications = useCallback(() => {
    setNotifications(dataStore.getNotifications());
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Active popup notification (shown on screen if not dismissed)
  const activePopupNotification = useMemo(() => {
    const unDismissed = notifications.filter((n) => !n.dismissedPopup);
    const mandatory = unDismissed.find((n) => n.type === 'MANDATORY_DATA');
    if (mandatory) return mandatory;
    const periodic = unDismissed.find((n) => n.type === 'PERIODIC_CHECK');
    if (periodic) return periodic;
    return unDismissed[0] || null;
  }, [notifications]);

  const dismissPopupNotification = useCallback((id: string) => {
    dataStore.dismissNotificationPopup(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    dataStore.markNotificationAsRead(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    dataStore.markAllNotificationsAsRead();
    refreshNotifications();
  }, [refreshNotifications]);

  const removeNotification = useCallback((id: string) => {
    dataStore.removeNotification(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const clearAllNotifications = useCallback(() => {
    dataStore.clearAllNotifications();
    refreshNotifications();
  }, [refreshNotifications]);

  const confirmDataCompatibility = useCallback((updates?: {
    weightKg?: number;
    heightCm?: number;
    biologicalSex?: 'MALE' | 'FEMALE';
    activityLevel?: any;
  }) => {
    dataStore.confirmDataCompatibility(updates);
    setIdentityState(dataStore.getIdentity());
    setProfileState(dataStore.getProfile());
    setBodyRecords(dataStore.getBodyRecords());
    refreshNotifications();
  }, [refreshNotifications]);

  const triggerPeriodicCheckSimulation = useCallback(() => {
    dataStore.triggerPeriodicCheckSimulation();
    refreshNotifications();
  }, [refreshNotifications]);

  // Nutri State
  const [nutriPatients, setNutriPatients] = useState<NutriPatient[]>(dataStore.getNutriPatients());
  const [nutriConsultations, setNutriConsultations] = useState<NutriConsultation[]>(dataStore.getNutriConsultations());
  const [nutriAssessments, setNutriAssessments] = useState<NutriAssessment[]>(dataStore.getNutriAssessments());
  const [nutriMealPlans, setNutriMealPlans] = useState<NutriMealPlan[]>(dataStore.getNutriMealPlans());
  const [nutriFinances, setNutriFinances] = useState<NutriFinanceTransaction[]>(dataStore.getNutriFinances());
  const [nutriLibrary, setNutriLibrary] = useState<NutriLibraryItem[]>(dataStore.getNutriLibrary());

  // Trainer State
  const [trainerStudents, setTrainerStudents] = useState<TrainerStudent[]>(dataStore.getTrainerStudents());
  const [trainerWorkoutPlans, setTrainerWorkoutPlans] = useState<TrainerWorkoutPlan[]>(dataStore.getTrainerWorkoutPlans());
  const [trainerAssessments, setTrainerAssessments] = useState<TrainerAssessment[]>(dataStore.getTrainerAssessments());
  const [trainerAppointments, setTrainerAppointments] = useState<TrainerScheduleAppointment[]>(dataStore.getTrainerAppointments());
  const [trainerFinances, setTrainerFinances] = useState<TrainerFinanceTransaction[]>(dataStore.getTrainerFinances());

  // Ecosystem State
  const [healthTeamMembers, setHealthTeamMembers] = useState<HealthTeamMember[]>(dataStore.getHealthTeamMembers());
  const [interProfessionalConsents, setInterProfessionalConsents] = useState<InterProfessionalConsent[]>(dataStore.getInterProfessionalConsents());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(dataStore.getChatMessages());
  const [invitations, setInvitations] = useState<ProfessionalInvitation[]>(dataStore.getInvitations());
  const [activeChatRecipient, setActiveChatRecipient] = useState<{ id: string; name: string; role: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Sync callbacks - Nutri
  const saveNutriPatient = useCallback((p: NutriPatient) => {
    dataStore.saveNutriPatient(p);
    setNutriPatients(dataStore.getNutriPatients());
  }, []);

  const deleteNutriPatient = useCallback((id: string) => {
    dataStore.deleteNutriPatient(id);
    setNutriPatients(dataStore.getNutriPatients());
  }, []);

  const saveNutriConsultation = useCallback((c: NutriConsultation) => {
    dataStore.saveNutriConsultation(c);
    setNutriConsultations(dataStore.getNutriConsultations());
    setNutriPatients(dataStore.getNutriPatients());
  }, []);

  const saveNutriAssessment = useCallback((a: NutriAssessment) => {
    dataStore.saveNutriAssessment(a);
    setNutriAssessments(dataStore.getNutriAssessments());
    setNutriPatients(dataStore.getNutriPatients());
  }, []);

  const saveNutriMealPlan = useCallback((plan: NutriMealPlan) => {
    dataStore.saveNutriMealPlan(plan);
    setNutriMealPlans(dataStore.getNutriMealPlans());
    setNutriPatients(dataStore.getNutriPatients());
  }, []);

  const publishNutriMealPlan = useCallback((id: string) => {
    dataStore.publishNutriMealPlan(id);
    setNutriMealPlans(dataStore.getNutriMealPlans());
    setNutriPatients(dataStore.getNutriPatients());
  }, []);

  const saveNutriFinance = useCallback((tx: NutriFinanceTransaction) => {
    dataStore.saveNutriFinance(tx);
    setNutriFinances(dataStore.getNutriFinances());
  }, []);

  const deleteNutriFinance = useCallback((id: string) => {
    dataStore.deleteNutriFinance(id);
    setNutriFinances(dataStore.getNutriFinances());
  }, []);

  const saveNutriLibraryItem = useCallback((item: NutriLibraryItem) => {
    dataStore.saveNutriLibraryItem(item);
    setNutriLibrary(dataStore.getNutriLibrary());
  }, []);

  // Trainer Callbacks
  const saveTrainerStudent = useCallback((s: TrainerStudent) => {
    dataStore.saveTrainerStudent(s);
    setTrainerStudents(dataStore.getTrainerStudents());
  }, []);

  const deleteTrainerStudent = useCallback((id: string) => {
    dataStore.deleteTrainerStudent(id);
    setTrainerStudents(dataStore.getTrainerStudents());
  }, []);

  const saveTrainerWorkoutPlan = useCallback((p: TrainerWorkoutPlan) => {
    dataStore.saveTrainerWorkoutPlan(p);
    setTrainerWorkoutPlans(dataStore.getTrainerWorkoutPlans());
    setTrainerStudents(dataStore.getTrainerStudents());
  }, []);

  const publishTrainerWorkoutPlan = useCallback((id: string) => {
    dataStore.publishTrainerWorkoutPlan(id);
    setTrainerWorkoutPlans(dataStore.getTrainerWorkoutPlans());
    setTrainerStudents(dataStore.getTrainerStudents());
  }, []);

  const saveTrainerAssessment = useCallback((a: TrainerAssessment) => {
    dataStore.saveTrainerAssessment(a);
    setTrainerAssessments(dataStore.getTrainerAssessments());
    setTrainerStudents(dataStore.getTrainerStudents());
  }, []);

  const saveTrainerAppointment = useCallback((app: TrainerScheduleAppointment) => {
    dataStore.saveTrainerAppointment(app);
    setTrainerAppointments(dataStore.getTrainerAppointments());
  }, []);

  const saveTrainerFinance = useCallback((tx: TrainerFinanceTransaction) => {
    dataStore.saveTrainerFinance(tx);
    setTrainerFinances(dataStore.getTrainerFinances());
  }, []);

  const deleteTrainerFinance = useCallback((id: string) => {
    dataStore.deleteTrainerFinance(id);
    setTrainerFinances(dataStore.getTrainerFinances());
  }, []);

  // Ecosystem Callbacks
  const saveHealthTeamMember = useCallback((m: HealthTeamMember) => {
    dataStore.saveHealthTeamMember(m);
    setHealthTeamMembers(dataStore.getHealthTeamMembers());
  }, []);

  const removeHealthTeamMember = useCallback((id: string) => {
    dataStore.removeHealthTeamMember(id);
    setHealthTeamMembers(dataStore.getHealthTeamMembers());
  }, []);

  const saveInterProfessionalConsent = useCallback((c: InterProfessionalConsent) => {
    dataStore.saveInterProfessionalConsent(c);
    setInterProfessionalConsents(dataStore.getInterProfessionalConsents());
  }, []);

  const sendChatMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const sent = dataStore.sendChatMessage(msg);
    setChatMessages(dataStore.getChatMessages());
    return sent;
  }, []);

  const markChatAsRead = useCallback((convId: string, userId: string) => {
    dataStore.markChatAsRead(convId, userId);
    setChatMessages(dataStore.getChatMessages());
  }, []);

  const createInvitation = useCallback((inv: Omit<ProfessionalInvitation, 'id' | 'createdAt' | 'code' | 'status'>) => {
    const created = dataStore.createInvitation(inv);
    setInvitations(dataStore.getInvitations());
    return created;
  }, []);

  const acceptInvitation = useCallback((codeOrId: string) => {
    const accepted = dataStore.acceptInvitation(codeOrId);
    if (accepted) {
      setInvitations(dataStore.getInvitations());
    }
    return accepted;
  }, []);

  // Active Prescribed Plans for Aluno
  const activePrescribedMealPlan = useMemo(() => {
    return dataStore.getActivePrescribedMealPlanForStudent(identity.id);
  }, [identity.id, nutriMealPlans]);

  const activePrescribedWorkoutPlan = useMemo(() => {
    return dataStore.getActivePrescribedWorkoutPlanForStudent(identity.id);
  }, [identity.id, trainerWorkoutPlans]);

  // Multi-Account Switcher State
  const [savedAccounts, setSavedAccounts] = useState<SavedUserAccount[]>(dataStore.getSavedAccounts());
  const [activeAccountId, setActiveAccountId] = useState<string>(dataStore.getActiveAccountId());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Authentication & Presentation State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(dataStore.getIsAuthenticated());
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'app'>(
    dataStore.getIsAuthenticated() ? 'app' : 'landing'
  );
  const [authProduct, setAuthProduct] = useState<'USER' | 'PROFESSIONAL' | 'GYM'>('USER');

  const goToLoginWithProduct = (product?: 'USER' | 'PROFESSIONAL' | 'GYM') => {
    if (product) setAuthProduct(product);
    setAuthView('login');
  };

  const goToRegisterWithProduct = (product?: 'USER' | 'PROFESSIONAL' | 'GYM') => {
    if (product) setAuthProduct(product);
    setAuthView('register');
  };

  const quickAccessSampleAccount = (role: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM'): boolean => {
    const res = dataStore.quickAccessSampleAccount(role);
    if (res.success) {
      setIsAuthenticated(true);
      setAuthView('app');
      refreshAllState();
      return true;
    }
    return false;
  };

  const refreshAllState = useCallback(() => {
    setIsAuthenticated(dataStore.getIsAuthenticated());
    setSavedAccounts(dataStore.getSavedAccounts());
    setActiveAccountId(dataStore.getActiveAccountId());
    setIdentityState(dataStore.getIdentity());
    setProfileState(dataStore.getProfile());
    setBodyRecords(dataStore.getBodyRecords());
    setCircumferences(dataStore.getCircumferences());
    setExercises(dataStore.getExercises());
    setTrainingSessions(dataStore.getTrainingSessions());
    setAttendanceLogs(dataStore.getAttendanceLogs());
    setScheduledDaysOfWeekState(dataStore.getScheduledDaysOfWeek());
    setMeals(dataStore.getMeals());
    setHydration(dataStore.getHydration());
    setSleepSessions(dataStore.getSleepSessions());
    setWellnessLogs(dataStore.getWellnessLogs());
    setConsents(dataStore.getConsents());
    setAuditLogs(dataStore.getAuditLogs());
    setNotifications(dataStore.getNotifications());
    setNutriPatients(dataStore.getNutriPatients());
    setNutriConsultations(dataStore.getNutriConsultations());
    setNutriAssessments(dataStore.getNutriAssessments());
    setNutriMealPlans(dataStore.getNutriMealPlans());
    setNutriFinances(dataStore.getNutriFinances());
    setNutriLibrary(dataStore.getNutriLibrary());
    setTrainerStudents(dataStore.getTrainerStudents());
    setTrainerWorkoutPlans(dataStore.getTrainerWorkoutPlans());
    setTrainerAssessments(dataStore.getTrainerAssessments());
    setTrainerAppointments(dataStore.getTrainerAppointments());
    setTrainerFinances(dataStore.getTrainerFinances());
    setHealthTeamMembers(dataStore.getHealthTeamMembers());
    setInterProfessionalConsents(dataStore.getInterProfessionalConsents());
    setChatMessages(dataStore.getChatMessages());
    setInvitations(dataStore.getInvitations());
  }, []);

  const login = (credentials: { email?: string; password?: string; pin?: string; accountId?: string }) => {
    const res = dataStore.login(credentials);
    if (res.success) {
      setIsAuthenticated(true);
      setAuthView('app');
      refreshAllState();
    }
    return res;
  };

  const register = (data: RegisterUserData) => {
    const res = dataStore.register(data);
    if (res.success) {
      setIsAuthenticated(true);
      setAuthView('app');
      refreshAllState();
    }
    return res;
  };

  const logout = () => {
    dataStore.logout();
    setIsAuthenticated(false);
    setAuthView('landing');
    refreshAllState();
  };

  const switchAccount = (accountId: string): boolean => {
    const success = dataStore.switchAccount(accountId);
    if (success) {
      setSavedAccounts(dataStore.getSavedAccounts());
      setActiveAccountId(dataStore.getActiveAccountId());
      setIdentityState(dataStore.getIdentity());
      setProfileState(dataStore.getProfile());
      setNotifications(dataStore.getNotifications());
      const acc = dataStore.getSavedAccounts().find((a) => a.id === accountId);
      if (acc?.pin) {
        setEnclavePin(acc.pin);
      }
      setIsAccountModalOpen(false);
    }
    return success;
  };

  const addSavedAccount = (account: SavedUserAccount) => {
    dataStore.addSavedAccount(account);
    setSavedAccounts(dataStore.getSavedAccounts());
  };

  const removeSavedAccount = (accountId: string): boolean => {
    const success = dataStore.removeSavedAccount(accountId);
    if (success) {
      setSavedAccounts(dataStore.getSavedAccounts());
      setActiveAccountId(dataStore.getActiveAccountId());
      setIdentityState(dataStore.getIdentity());
      setProfileState(dataStore.getProfile());
    }
    return success;
  };

  const openAccountModal = () => setIsAccountModalOpen(true);
  const closeAccountModal = () => setIsAccountModalOpen(false);

  const activeAccount = useMemo(() => {
    return savedAccounts.find((a) => a.id === activeAccountId) || savedAccounts[0];
  }, [savedAccounts, activeAccountId]);

  const toggleDemoMode = () => {
    dataStore.toggleDemoMode();
    setIsDemoMode(dataStore.getIsDemoMode());
    // Refresh all state
    setIdentityState(dataStore.getIdentity());
    setProfileState(dataStore.getProfile());
    setBodyRecords(dataStore.getBodyRecords());
    setCircumferences(dataStore.getCircumferences());
    setExercises(dataStore.getExercises());
    setTrainingSessions(dataStore.getTrainingSessions());
    setMeals(dataStore.getMeals());
    setHydration(dataStore.getHydration());
    setSleepSessions(dataStore.getSleepSessions());
    setWellnessLogs(dataStore.getWellnessLogs());
    setConsents(dataStore.getConsents());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const updateIdentity = (updates: Partial<UserIdentity>) => {
    dataStore.updateIdentity(updates);
    setIdentityState(dataStore.getIdentity());
    dataStore.checkAndGenerateSystemNotifications();
    setNotifications(dataStore.getNotifications());
  };

  const updateAccountEmail = (newEmail: string, currentPassword?: string): { success: boolean; error?: string } => {
    const res = dataStore.updateAccountEmail(activeAccountId, newEmail, currentPassword);
    if (res.success) {
      setIdentityState(dataStore.getIdentity());
      setSavedAccounts(dataStore.getSavedAccounts());
      setAuditLogs(dataStore.getAuditLogs());
    }
    return res;
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    dataStore.updateProfile(updates);
    setProfileState(dataStore.getProfile());
    dataStore.checkAndGenerateSystemNotifications();
    setNotifications(dataStore.getNotifications());
  };

  const addBodyRecord = (record: BodyCompositionRecord) => {
    dataStore.addBodyRecord(record);
    setBodyRecords(dataStore.getBodyRecords());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const addCircumference = (record: CircumferenceRecord) => {
    dataStore.addCircumference(record);
    setCircumferences(dataStore.getCircumferences());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const addCustomExercise = (exercise: Exercise) => {
    dataStore.addCustomExercise(exercise);
    setExercises(dataStore.getExercises());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const addTrainingSession = (session: TrainingSession) => {
    dataStore.addTrainingSession(session);
    setTrainingSessions(dataStore.getTrainingSessions());
    setAttendanceLogs(dataStore.getAttendanceLogs());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const setDayAttendance = (attendance: DayAttendance) => {
    dataStore.setDayAttendance(attendance);
    setAttendanceLogs(dataStore.getAttendanceLogs());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const setScheduledDaysOfWeek = (days: number[]) => {
    dataStore.setScheduledDaysOfWeek(days);
    setScheduledDaysOfWeekState(dataStore.getScheduledDaysOfWeek());
  };

  const addMeal = (meal: MealEntry) => {
    dataStore.addMeal(meal);
    setMeals(dataStore.getMeals());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const logWater = (ml: number) => {
    dataStore.logWater(ml);
    setHydration(dataStore.getHydration());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const addSleepSession = (session: SleepSession) => {
    dataStore.addSleepSession(session);
    setSleepSessions(dataStore.getSleepSessions());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const addWellnessLog = (log: SubjectiveWellnessLog) => {
    dataStore.addWellnessLog(log);
    setWellnessLogs(dataStore.getWellnessLogs());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const grantConsent = (grant: ConsentGrant) => {
    dataStore.grantConsent(grant);
    setConsents(dataStore.getConsents());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const revokeConsent = (id: string, reason: string) => {
    dataStore.revokeConsent(id, reason);
    setConsents(dataStore.getConsents());
    setAuditLogs(dataStore.getAuditLogs());
  };

  const exportUserDataJson = (): string => {
    return dataStore.exportUserDataJson();
  };

  const purgeAllUserData = () => {
    dataStore.purgeAllUserData();
    setIdentityState(dataStore.getIdentity());
    setProfileState(dataStore.getProfile());
    setBodyRecords([]);
    setCircumferences([]);
    setTrainingSessions([]);
    setMeals([]);
    setHydration([]);
    setSleepSessions([]);
    setWellnessLogs([]);
    setAuditLogs(dataStore.getAuditLogs());
  };

  // Visor Lock Controls
  const lockEnclave = () => setIsEnclaveLocked(true);
  const unlockWithPin = (pin: string): boolean => {
    if (pin === enclavePin) {
      setIsEnclaveLocked(false);
      return true;
    }
    return false;
  };
  const toggleTwoFactor = () => setTwoFactorEnabled((prev) => !prev);

  // Calculations
  const latestBodyRecord = bodyRecords.length > 0 ? bodyRecords[0] : null;
  const latestSleep = sleepSessions.length > 0 ? sleepSessions[0] : null;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWellness = wellnessLogs.find((w) => w.date === todayStr) || (wellnessLogs.length > 0 ? wellnessLogs[0] : null);

  const todayHydration = hydration.find((h) => h.date === todayStr);
  const todayWaterMl = todayHydration ? todayHydration.consumedMl : 0;

  // Convert training sessions to exercise occurrences for overload analysis & PR Vault
  const exerciseOccurrences: ExerciseSessionOccurrence[] = useMemo(() => {
    const list: ExerciseSessionOccurrence[] = [];
    trainingSessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        let maxLoadKg = 0;
        let totalTonnageKg = 0;
        let totalReps = 0;

        const setsMapped = ex.sets.map((st, idx) => {
          const l = st.loadKg.value || 0;
          const r = st.reps.value || 0;
          if (l > maxLoadKg) maxLoadKg = l;
          totalTonnageKg += l * r;
          totalReps += r;
          return {
            setNumber: idx + 1,
            loadKg: l,
            reps: r,
            rir: st.repsInReserve?.value,
            failed: st.toFailure,
          };
        });

        list.push({
          sessionId: s.id,
          sessionDate: s.startedAt,
          exerciseName: ex.exerciseName,
          sets: setsMapped,
          maxLoadKg,
          totalTonnageKg,
          avgReps: ex.sets.length > 0 ? Math.round(totalReps / ex.sets.length) : 0,
        });
      });
    });
    return list;
  }, [trainingSessions]);

  // PR Vault
  const prVault = useMemo(() => buildPRVault(exerciseOccurrences), [exerciseOccurrences]);

  // Progressive Overload Evaluator
  const evaluateOverload = useCallback(
    (exerciseName: string): OverloadAnalysisResult => {
      return evaluateProgressiveOverload(exerciseName, exerciseOccurrences);
    },
    [exerciseOccurrences]
  );

  // Compute Daily Loads for ACWR
  const dailyLoadsMap: Record<string, number> = {};
  trainingSessions.forEach((s) => {
    const d = s.startedAt.split('T')[0];
    dailyLoadsMap[d] = (dailyLoadsMap[d] || 0) + (s.calculatedLoadUnits.value || 0);
  });
  const dailyLoads: DailyLoadRecord[] = Object.entries(dailyLoadsMap).map(([date, loadUnits]) => ({
    date,
    loadUnits,
    sessionCount: 1,
  }));
  const acwrMetrics = calculateACWR(dailyLoads);

  // Compute GL Recovery Score
  const glRecoveryScore = computeGLRecoveryScore({
    lastSleep: latestSleep || undefined,
    subjectiveWellness: todayWellness || undefined,
    baselineHrvRmsdd: 65,
    acuteLoadRatio: acwrMetrics.ratio,
  });

  // Calculate BMR, TDEE, BMI
  const currentWeightKg = latestBodyRecord?.weightKg?.value || 80;
  const currentHeightCm = latestBodyRecord?.heightCm?.value || (identity.biologicalSex === 'MALE' ? 180 : 165);
  const ageYears = identity.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(identity.dateOfBirth).getTime()) / (365.25 * 86400000))
    : 28;

  const bmrCalculation = calculateBMR({
    weightKg: currentWeightKg || 0,
    heightCm: currentHeightCm,
    ageYears,
    biologicalSex: identity.biologicalSex,
    leanMassKg: latestBodyRecord?.leanMassKg?.value || undefined,
  });

  const tdeeCalculation = calculateTDEE(
    {
      weightKg: currentWeightKg || 0,
      heightCm: currentHeightCm,
      ageYears,
      biologicalSex: identity.biologicalSex,
      leanMassKg: latestBodyRecord?.leanMassKg?.value || undefined,
    },
    profile.activityLevel
  );

  const bmiCalculation = calculateBMI(currentWeightKg, currentHeightCm);

  // Tanaka & Karvonen zones
  const tanakaKarvonen = useMemo(() => {
    const restHr = latestSleep?.restingHeartRateBpm?.value || 58;
    return calculateKarvonenZones(ageYears, restHr);
  }, [ageYears, latestSleep]);

  // Dynamic Hydration Engine calculation
  const dynamicHydration = useMemo(() => {
    const lastSession = trainingSessions[0];
    const duration = lastSession?.durationMinutes?.value || 60;
    return calculateDynamicHydration({
      weightKg: currentWeightKg,
      ambientTempC,
      workoutDurationMinutes: duration,
      sweatRate,
      takingCreatine,
    });
  }, [currentWeightKg, ambientTempC, trainingSessions, sweatRate, takingCreatine]);

  const currentArmstrongDetails = useMemo(() => {
    return (
      ARMSTRONG_URINE_SCALE.find((a) => a.level === armstrongUrineLevel) ||
      ARMSTRONG_URINE_SCALE[1]
    );
  }, [armstrongUrineLevel]);

  const activeJurisdiction = JURISDICTIONS.find((j) => j.code === identity.jurisdiction) || JURISDICTIONS[0];

  const openCalculationInspector = (calc: DeterministicCalculationResult<any>) => {
    setInspectionModal(calc);
  };

  const closeCalculationInspector = () => {
    setInspectionModal(null);
  };

  return (
    <GymLabsContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isAuthenticated,
        authView,
        setAuthView,
        authProduct,
        setAuthProduct,
        goToLoginWithProduct,
        goToRegisterWithProduct,
        quickAccessSampleAccount,
        login,
        register,
        logout,
        isDemoMode,
        toggleDemoMode,
        savedAccounts,
        activeAccountId,
        activeAccount,
        switchAccount,
        addSavedAccount,
        removeSavedAccount,
        isAccountModalOpen,
        openAccountModal,
        closeAccountModal,
        identity,
        updateIdentity,
        updateAccountEmail,
        profile,
        updateProfile,
        activeJurisdiction,
        bodyRecords,
        addBodyRecord,
        latestBodyRecord,
        circumferences,
        addCircumference,
        exercises,
        addCustomExercise,
        trainingSessions,
        addTrainingSession,
        attendanceLogs,
        setDayAttendance,
        scheduledDaysOfWeek,
        setScheduledDaysOfWeek,
        acwrMetrics,
        prVault,
        evaluateOverload,
        tanakaKarvonen,
        foods,
        meals,
        addMeal,
        hydration,
        logWater,
        todayWaterMl,
        ambientTempC,
        setAmbientTempC,
        sweatRate,
        setSweatRate,
        takingCreatine,
        setTakingCreatine,
        dynamicHydration,
        armstrongUrineLevel,
        setArmstrongUrineLevel,
        currentArmstrongDetails,
        sleepSessions,
        addSleepSession,
        latestSleep,
        wellnessLogs,
        addWellnessLog,
        todayWellness,
        glRecoveryScore,
        bmrCalculation,
        tdeeCalculation,
        bmiCalculation,
        consents,
        grantConsent,
        revokeConsent,
        auditLogs,
        exportUserDataJson,
        purgeAllUserData,
        isEnclaveLocked,
        lockEnclave,
        unlockWithPin,
        enclavePin,
        setEnclavePin,
        twoFactorEnabled,
        toggleTwoFactor,
        professionals,
        organizations,
        inspectionModal,
        openCalculationInspector,
        closeCalculationInspector,
        notifications,
        unreadNotificationsCount,
        activePopupNotification,
        dismissPopupNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        clearAllNotifications,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        isQuickVerifyModalOpen,
        setIsQuickVerifyModalOpen,
        confirmDataCompatibility,
        triggerPeriodicCheckSimulation,
        nutriPatients,
        saveNutriPatient,
        deleteNutriPatient,
        nutriConsultations,
        saveNutriConsultation,
        nutriAssessments,
        saveNutriAssessment,
        nutriMealPlans,
        saveNutriMealPlan,
        publishNutriMealPlan,
        nutriFinances,
        saveNutriFinance,
        deleteNutriFinance,
        nutriLibrary,
        saveNutriLibraryItem,
        trainerStudents,
        saveTrainerStudent,
        deleteTrainerStudent,
        trainerWorkoutPlans,
        saveTrainerWorkoutPlan,
        publishTrainerWorkoutPlan,
        trainerAssessments,
        saveTrainerAssessment,
        trainerAppointments,
        saveTrainerAppointment,
        trainerFinances,
        saveTrainerFinance,
        deleteTrainerFinance,
        healthTeamMembers,
        saveHealthTeamMember,
        removeHealthTeamMember,
        interProfessionalConsents,
        saveInterProfessionalConsent,
        chatMessages,
        sendChatMessage,
        markChatAsRead,
        invitations,
        createInvitation,
        acceptInvitation,
        activePrescribedMealPlan,
        activePrescribedWorkoutPlan,
        activeChatRecipient,
        setActiveChatRecipient,
        isChatOpen,
        setIsChatOpen,
      }}
    >
      {children}
    </GymLabsContext.Provider>
  );
};

export const useGymLabs = () => {
  const context = useContext(GymLabsContext);
  if (!context) {
    throw new Error('useGymLabs must be used within a GymLabsProvider');
  }
  return context;
};
