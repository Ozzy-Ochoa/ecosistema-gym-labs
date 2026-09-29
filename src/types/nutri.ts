export interface NutriPatient {
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
  primaryGoal: 'FAT_LOSS' | 'HYPERTROPHY' | 'PERFORMANCE' | 'HEALTH' | 'RECOMPOSITION';
  activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  dietaryRestrictions: string[];
  allergies: string[];
  foodPreferences: string[];
  foodDislikes: string[];
  sleepHoursDaily: number;
  waterIntakeGoalMl: number;
  clinicalObservations: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastConsultationDate?: string;
  nextAppointmentDate?: string;
  registeredAt: string;
  timeline: NutriTimelineEvent[];
}

export interface NutriTimelineEvent {
  id: string;
  date: string;
  type: 'CONSULTATION' | 'ASSESSMENT' | 'MEAL_PLAN' | 'EXAM' | 'NOTE' | 'PAYMENT';
  title: string;
  description: string;
  authorName: string;
}

export interface NutriConsultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'FIRST_VISIT' | 'FOLLOW_UP' | 'ASSESSMENT' | 'ONLINE_TELEHEALTH';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  durationMinutes: number;
  anamnesisNotes: string;
  dietaryFeedback: string;
  nextReturnDays?: number;
  prescriptions: string;
  attachedExams?: string[];
  createdAt: string;
}

export interface NutriAssessment {
  id: string;
  patientId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  fatMassKg?: number;
  visceralFatLevel?: number;
  skinfoldsMm?: {
    triceps?: number;
    subscapular?: number;
    suprailiac?: number;
    abdominal?: number;
    thigh?: number;
    chest?: number;
  };
  circumferencesCm?: {
    waist?: number;
    abdomen?: number;
    hip?: number;
    chest?: number;
    rightArm?: number;
    leftArm?: number;
    rightThigh?: number;
    leftThigh?: number;
    calf?: number;
    neck?: number;
  };
  hydrationLevelPercentage?: number;
  clinicalNotes: string;
  recordedBy: string;
}

export interface NutriFoodItem {
  id: string;
  name: string;
  portion: string;
  quantity: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  substitutions?: string[];
}

export interface NutriMeal {
  id: string;
  name: string;
  time: string;
  notes?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  items: NutriFoodItem[];
}

export interface NutriMealPlan {
  id: string;
  patientId: string;
  patientName: string;
  authorId: string;
  authorName: string;
  title: string;
  objective: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalCaloriesTarget: number;
  totalProteinGTarget: number;
  totalCarbsGTarget: number;
  totalFatGTarget: number;
  waterIntakeMlTarget: number;
  meals: NutriMeal[];
  guidanceNotes: string;
  supplements?: string[];
  createdAt: string;
  publishedAt?: string;
}

export interface NutriFinanceTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'CONSULTA' | 'PACOTE' | 'MENSALIDADE' | 'PLANO_ALIMENTAR' | 'ALUGUEL' | 'SISTEMAS' | 'MARKETING' | 'EQUIPAMENTOS' | 'IMPOSTOS' | 'OUTROS';
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  patientId?: string;
  patientName?: string;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER';
}

export interface NutriLibraryItem {
  id: string;
  type: 'RECIPE' | 'MEAL_TEMPLATE' | 'PLAN_TEMPLATE' | 'EDUCATION' | 'GUIDE';
  title: string;
  category: string;
  description: string;
  prepTimeMinutes?: number;
  calories?: number;
  macros?: { protein: number; carbs: number; fat: number };
  ingredients?: string[];
  instructions?: string;
  tags: string[];
}
