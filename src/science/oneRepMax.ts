import { DeterministicCalculationResult } from '../types/science';
import { EVIDENCE_REGISTRY } from './citations';

export interface OneRepMaxCalculation {
  estimated1RmKg: number;
  epleyEstimate: number;
  brzyckiEstimate: number;
  repsPerformed: number;
  loadLiftedKg: number;
}

export function calculateEstimated1RM(
  loadKg: number,
  reps: number
): DeterministicCalculationResult<OneRepMaxCalculation> {
  if (loadKg <= 0 || reps <= 0) {
    return {
      result: null,
      unit: 'kg',
      formulaName: 'Epley & Brzycki Submaximal 1RM Equations',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'Epley: Load * (1 + 0.0333 * Reps) | Brzycki: Load / (1.0278 - 0.0278 * Reps)',
      inputs: { loadKg, reps },
      provenance: {
        type: 'UNKNOWN',
        source: 'Submaximal Strength Estimator',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
        limitations: ['Load or reps must be greater than zero.'],
      },
      evidenceCitation: EVIDENCE_REGISTRY.EPLEY_1985_1RM,
      confidence: 'INSUFFICIENT_DATA',
      clinicalBoundaryDisclaimer: 'Submaximal 1RM estimation cannot replace true autoregulation and technical competency.',
    };
  }

  if (reps === 1) {
    return {
      result: {
        estimated1RmKg: loadKg,
        epleyEstimate: loadKg,
        brzyckiEstimate: loadKg,
        repsPerformed: 1,
        loadLiftedKg: loadKg,
      },
      unit: 'kg',
      formulaName: 'Direct 1-Repetition Maximum',
      formulaVersion: '1.0.0',
      mathematicalExpression: '1RM = Tested Load',
      inputs: { loadKg, reps: 1 },
      provenance: {
        type: 'REAL',
        source: 'Tested 1RM Single',
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
      evidenceCitation: EVIDENCE_REGISTRY.EPLEY_1985_1RM,
      confidence: 'HIGH',
      clinicalBoundaryDisclaimer: 'Maximal single repetition attempts require thorough warm-up, spotters, and appropriate lifting environment.',
    };
  }

  // Epley formula: Load * (1 + 0.0333 * Reps)
  const epley = Math.round(loadKg * (1 + 0.0333 * reps));
  // Brzycki formula: Load / (1.0278 - 0.0278 * Reps)
  const brzycki = Math.round(loadKg / (1.0278 - 0.0278 * reps));

  // Average of both validated formulas
  const avg = Math.round((epley + brzycki) / 2);
  const confidence = reps <= 5 ? 'HIGH' : reps <= 10 ? 'MEDIUM' : 'LOW';

  return {
    result: {
      estimated1RmKg: avg,
      epleyEstimate: epley,
      brzyckiEstimate: brzycki,
      repsPerformed: reps,
      loadLiftedKg: loadKg,
    },
    unit: 'kg',
    formulaName: 'Epley & Brzycki Composite 1RM Model',
    formulaVersion: '1.0.0',
    mathematicalExpression: `Epley: ${loadKg} * (1 + 0.0333 * ${reps}) = ${epley} kg; Brzycki = ${brzycki} kg; Composite = ${avg} kg`,
    inputs: { loadKg, reps },
    provenance: {
      type: 'CALCULATED',
      source: 'Gym Labs Strength Engine',
      recordedAt: new Date().toISOString(),
      calculationMethod: 'Composite Epley/Brzycki (1985/1993)',
      confidence,
      limitations: reps > 10 ? ['Reps exceed 10. Metabolic fatigue causes overestimation of neural 1RM.'] : undefined,
    },
    evidenceCitation: EVIDENCE_REGISTRY.EPLEY_1985_1RM,
    confidence,
    clinicalBoundaryDisclaimer: 'Calculated 1RM is a submaximal estimate. Do not attempt true 1RM without appropriate progression and safety spotters.',
  };
}
