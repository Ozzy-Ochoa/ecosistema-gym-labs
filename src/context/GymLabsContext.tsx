import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dataStore } from '../repositories/GymLabsDataStore';
import { UserIdentity, UserProfile, CountryConfiguration, SavedUserAccount, RegisterUserData } from '../types/user';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';
import { Exercise, TrainingSession, ACWRResult } from '../types/training';
import { MealEntry, HydrationLog, FoodItem } from '../types/nutrition';
import { SleepSession, SubjectiveWellnessLog, GLRecoveryScore } from '../types/recovery';
import { ConsentGrant } from '../types/consent';
import { AuditRecord } from '../types/audit';
import { ProfessionalProfile } from '../types/professional';
import { Organization } from '../types/organization';
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

  // Multi-Account Switcher State
  const [savedAccounts, setSavedAccounts] = useState<SavedUserAccount[]>(dataStore.getSavedAccounts());
  const [activeAccountId, setActiveAccountId] = useState<string>(dataStore.getActiveAccountId());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Authentication & Presentation State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(dataStore.getIsAuthenticated());
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'app'>(
    dataStore.getIsAuthenticated() ? 'app' : 'landing'
  );

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
    setMeals(dataStore.getMeals());
    setHydration(dataStore.getHydration());
    setSleepSessions(dataStore.getSleepSessions());
    setWellnessLogs(dataStore.getWellnessLogs());
    setConsents(dataStore.getConsents());
    setAuditLogs(dataStore.getAuditLogs());
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
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    dataStore.updateProfile(updates);
    setProfileState(dataStore.getProfile());
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
    setAuditLogs(dataStore.getAuditLogs());
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
