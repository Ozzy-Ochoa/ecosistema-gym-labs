import { DataProvenance, MetricValue } from './provenance';
import { SyncStatus } from './api';

export interface SleepSession {
  id: string;
  userId: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  efficiencyPct?: number;
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  lightSleepMinutes?: number;
  awakeMinutes?: number;
  restingHeartRateBpm?: MetricValue<number>;
  nocturnalHrvRmsddMs?: MetricValue<number>;
  subjectiveQualityScore?: number; // 1-5
  provenance: DataProvenance;
  syncStatus?: SyncStatus;
}

export interface SubjectiveWellnessLog {
  id: string;
  userId: string;
  date: string;
  muscleSoreness: number; // 1 (None) to 5 (Severe)
  energyLevel: number;    // 1 (Exhausted) to 5 (Peak)
  stressLevel: number;    // 1 (Zen) to 5 (High)
  sleepPerception: number;// 1 to 5
  notes?: string;
  provenance: DataProvenance;
  syncStatus?: SyncStatus;
}

export interface GLRecoveryScore {
  score: number | null; // 0-100 or null if insufficient
  status: 'EXCELLENT' | 'ADEQUATE' | 'REDUCED' | 'INSUFFICIENT_DATA';
  components: {
    hrvComponentScore: number | null;
    sleepDurationScore: number | null;
    subjectiveReadinessScore: number | null;
    trainingStrainBalance: number | null;
  };
  provenance: DataProvenance;
  disclaimer: string;
}
