import { DataProvenance, MetricValue } from './provenance';

export type MovementPattern = 
  | 'SQUAT' 
  | 'HINGE' 
  | 'HORIZONTAL_PUSH' 
  | 'VERTICAL_PUSH' 
  | 'HORIZONTAL_PULL' 
  | 'VERTICAL_PULL' 
  | 'LUNGE' 
  | 'CARRY' 
  | 'ISOLATION' 
  | 'CARDIO';

export type MuscleGroup = 
  | 'CHEST' 
  | 'BACK' 
  | 'QUADRICEPS' 
  | 'HAMSTRINGS' 
  | 'GLUTES' 
  | 'SHOULDERS' 
  | 'BICEPS' 
  | 'TRICEPS' 
  | 'CORE' 
  | 'CALVES';

export interface Exercise {
  id: string;
  name: string;
  aliases: string[];
  pattern: MovementPattern;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: 'BARBELL' | 'DUMBBELL' | 'CABLE' | 'MACHINE' | 'BODYWEIGHT' | 'KETTLEBELL';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  evidenceNotes: string;
}

export interface TrainingSet {
  setNumber: number;
  reps: number;
  loadKg: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  rir?: number; // Reps in Reserve
  restSeconds?: number;
  isWarmup?: boolean;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: TrainingSet[];
  notes?: string;
}

export interface TrainingSession {
  id: string;
  userId: string;
  title: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  sessionRpe: number; // 1-10
  calculatedVolumeKg: MetricValue<number>;
  calculatedLoadUnits: MetricValue<number>; // Session RPE * Duration
  provenance: DataProvenance;
}

export interface ACWRResult {
  ratio: number | null;
  acuteLoad7d: number;
  chronicLoad28d: number;
  status: 'OPTIMAL' | 'UNDERLOAD' | 'OVERLOAD' | 'SPIKE_WARNING' | 'INSUFFICIENT_DATA';
  scientificNote: string;
  dataSufficient: boolean;
  daysRecorded: number;
}

export type AttendanceStatus = 'ATTENDED' | 'MISSED' | 'INCOMPLETE' | 'REST' | 'PLANNED';

export type WorkoutSplitType =
  | 'PUSH'
  | 'PULL'
  | 'LEGS'
  | 'UPPER'
  | 'LOWER'
  | 'FULL_BODY'
  | 'CARDIO_MOBILITY'
  | 'REST_DAY';

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  workoutType: WorkoutSplitType;
  title: string;
  notes?: string;
  durationMinutes?: number;
  volumeKg?: number;
  updatedAt?: string;
}

export interface MonthAttendanceSummary {
  year: number;
  month: number; // 0-11
  totalPlannedDays: number;
  attendedDays: number;
  missedDays: number;
  incompleteDays: number;
  restDays: number;
  attendanceRatePct: number;
  currentStreak: number;
}
