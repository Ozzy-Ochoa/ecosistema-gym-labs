import { DataProvenance, MetricValue } from './provenance';

export interface BodyCompositionRecord {
  id: string;
  userId: string;
  timestamp: string;
  weightKg: MetricValue<number>;
  heightCm?: MetricValue<number>;
  bodyFatPercent?: MetricValue<number>;
  leanMassKg?: MetricValue<number>;
  fatMassKg?: MetricValue<number>;
  visceralFatRating?: MetricValue<number>;
  skeletalMuscleMassKg?: MetricValue<number>;
  method: 'DEXA' | 'HYDROSTATIC' | 'BIA_PROFESSIONAL' | 'BIA_HOME' | 'SKINFOLD_7_SITE' | 'CALCULATED_NAVY' | 'SELF_REPORT';
  provenance: DataProvenance;
}

export interface CircumferenceRecord {
  id: string;
  userId: string;
  timestamp: string;
  waistCm?: MetricValue<number>;
  hipCm?: MetricValue<number>;
  chestCm?: MetricValue<number>;
  leftArmCm?: MetricValue<number>;
  rightArmCm?: MetricValue<number>;
  leftThighCm?: MetricValue<number>;
  rightThighCm?: MetricValue<number>;
  neckCm?: MetricValue<number>;
  provenance: DataProvenance;
}
