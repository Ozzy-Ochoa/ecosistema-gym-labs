/**
 * GYM LABS - DATA PROVENANCE & TRUTHFULNESS ENGINE
 * Immutable rule: Never present assumed, estimated or invented data as verified reality.
 */

export type ProvenanceType = 
  | 'REAL'         // Measured directly by hardware, verified test, or manual user true entry
  | 'CALCULATED'   // Deterministically derived from mathematical formulas with verified inputs
  | 'ESTIMATED'    // Statistical or population-based algorithmic estimate
  | 'INFERRED'     // Deduced via correlational patterns
  | 'SIMULATED'    // Artificial scenario testing
  | 'DEMO'         // Explicit educational / sandbox demonstration data
  | 'UNKNOWN';     // Missing or insufficient data

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export interface DataProvenance {
  type: ProvenanceType;
  source: string;              // e.g. "Smart Scale (BLE)", "DEXA Scan", "Mifflin-St Jeor Formula", "User Log", "Demo Sandbox"
  provider?: string;            // e.g. "Gym Labs Core", "Garmin Health", "InBody 770", "Self-Report"
  device?: string;
  recordedAt: string;          // ISO Timestamp
  importedAt?: string;
  calculationMethod?: string;  // e.g. "Tanaka 2001", "ACWR 7:28 Coupled"
  formula?: string;
  confidence: ConfidenceLevel;
  limitations?: string[];
  isVerified?: boolean;
}

export interface MetricValue<T = number> {
  value: T | null;
  unit: string;
  provenance: DataProvenance;
  historicalDelta?: number;    // % change from baseline
}
