export interface TrainerStudent {
  id: string;
  userId?: string; // linked Aluno user ID
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  dateOfBirth: string;
  biologicalSex: 'MALE' | 'FEMALE';
  weightKg: number;
  heightCm: number;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  primaryGoal: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'REHABILITATION';
  trainingDaysPerWeekTarget: number;
  injuriesAndLimitations: string[];
  medicalClearance: boolean;
  trainingPreferences: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastWorkoutCompletedAt?: string;
  activeWorkoutPlanTitle?: string;
  totalWorkoutsLoggedCount: number;
  acwrRatio?: number;
  registeredAt: string;
  timeline: TrainerTimelineEvent[];
}

export interface TrainerTimelineEvent {
  id: string;
  date: string;
  type: 'WORKOUT_COMPLETED' | 'PLAN_PRESCRIBED' | 'ASSESSMENT' | 'INJURY_LOG' | 'NOTE' | 'PAYMENT';
  title: string;
  description: string;
  authorName: string;
}

export interface TrainerPrescribedExercise {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: string; // e.g. "8-10", "12", "FALHA"
  loadKg?: number;
  restSeconds: number;
  rpeTarget?: number;
  tempo?: string; // e.g. "3-0-1-0"
  notes?: string;
  supersetWithId?: string;
}

export interface TrainerWorkoutSession {
  id: string;
  name: string;
  splitLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'FULL_BODY';
  focusMuscleGroups: string[];
  description?: string;
  estimatedDurationMinutes: number;
  exercises: TrainerPrescribedExercise[];
}

export interface TrainerWorkoutPlan {
  id: string;
  studentId: string;
  studentName: string;
  authorId: string;
  authorName: string;
  title: string;
  goal: string;
  splitType: 'ABC' | 'AB' | 'UPPER_LOWER' | 'PUSH_PULL_LEGS' | 'FULL_BODY' | 'CUSTOM';
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sessions: TrainerWorkoutSession[];
  weeklyFrequencyDays: number;
  generalInstructions: string;
  createdAt: string;
  publishedAt?: string;
}

export interface TrainerAssessment {
  id: string;
  studentId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  circumferencesCm?: {
    chest?: number;
    waist?: number;
    abdomen?: number;
    hip?: number;
    rightArmFlexed?: number;
    leftArmFlexed?: number;
    rightThigh?: number;
    leftThigh?: number;
    rightCalf?: number;
    leftCalf?: number;
    shoulders?: number;
  };
  mobilityScore?: {
    shoulderMobility?: 'EXCELLENT' | 'ADEQUATE' | 'RESTRICTED';
    hipMobility?: 'EXCELLENT' | 'ADEQUATE' | 'RESTRICTED';
    ankleDorsiflexion?: 'EXCELLENT' | 'ADEQUATE' | 'RESTRICTED';
    notes?: string;
  };
  strengthBenchmarks?: {
    squat1RMKg?: number;
    benchPress1RMKg?: number;
    deadlift1RMKg?: number;
    pullUpsMaxReps?: number;
  };
  evaluatorNotes: string;
  recordedBy: string;
}

export interface TrainerScheduleAppointment {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'IN_PERSON_TRAINING' | 'ONLINE_CONSULTATION' | 'PHYSICAL_ASSESSMENT' | 'REASSESSMENT';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  location: string;
  notes?: string;
  feeAmount?: number;
  createdAt: string;
}

export interface TrainerFinanceTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'AULA_AVULSA' | 'MENSALIDADE' | 'PACOTE_AULAS' | 'CONSULTORIA_ONLINE' | 'AVALIACAO' | 'ACADEMIA' | 'EQUIPAMENTOS' | 'TRANSPORTE' | 'SISTEMAS' | 'MARKETING' | 'IMPOSTOS' | 'OUTROS';
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  studentId?: string;
  studentName?: string;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'TRANSFER';
}
