import { DeterministicCalculationResult } from '../types/science';
import { EVIDENCE_REGISTRY } from './citations';

export interface BMRInput {
  weightKg: number;
  heightCm?: number;
  ageYears?: number;
  biologicalSex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  leanMassKg?: number; // For Katch-McArdle
}

export function calculateBMR(input: BMRInput): DeterministicCalculationResult<number> {
  // If verified lean mass is provided, prefer Katch-McArdle (Science-first)
  if (input.leanMassKg && input.leanMassKg > 20) {
    const bmr = Math.round(370 + 21.6 * input.leanMassKg);
    return {
      result: bmr,
      unit: 'kcal/day',
      formulaName: 'Katch-McArdle Formula',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'BMR = 370 + (21.6 * FatFreeMassKg)',
      inputs: { leanMassKg: input.leanMassKg },
      provenance: {
        type: 'CALCULATED',
        source: 'Katch-McArdle Engine v1',
        recordedAt: new Date().toISOString(),
        calculationMethod: 'Katch-McArdle (1996)',
        confidence: 'HIGH',
        limitations: ['Requires verified lean mass assessment (e.g. DEXA / Hydrostatic).'],
      },
      evidenceCitation: EVIDENCE_REGISTRY.KATCH_MCARDLE_1996,
      confidence: 'HIGH',
      clinicalBoundaryDisclaimer: 'Basal Metabolic Rate is an estimated baseline expenditure at complete physical and thermal rest, not an individual clinical prescription.',
    };
  }

  // Fallback to Mifflin-St Jeor if weight, height, age and biologicalSex ('MALE' | 'FEMALE') provided
  if (
    input.weightKg &&
    input.heightCm &&
    input.ageYears &&
    (input.biologicalSex === 'MALE' || input.biologicalSex === 'FEMALE')
  ) {
    const isMale = input.biologicalSex === 'MALE';
    const sexConstant = isMale ? 5 : -161;
    const bmr = Math.round(10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears + sexConstant);

    return {
      result: bmr,
      unit: 'kcal/day',
      formulaName: 'Mifflin-St Jeor Predictive Equation',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'BMR = (10 * WeightKg) + (6.25 * HeightCm) - (5 * Age) + S [Male=+5, Female=-161]',
      inputs: {
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        ageYears: input.ageYears,
        biologicalSex: input.biologicalSex,
      },
      provenance: {
        type: 'CALCULATED',
        source: 'Mifflin-St Jeor Engine v1',
        recordedAt: new Date().toISOString(),
        calculationMethod: 'Mifflin et al. (1990)',
        confidence: 'MEDIUM',
        limitations: ['Standard error of estimation +/- 10% in healthy adults.'],
      },
      evidenceCitation: EVIDENCE_REGISTRY.MIFFLIN_1990,
      confidence: 'MEDIUM',
      clinicalBoundaryDisclaimer: 'Predictive equation for resting metabolic expenditure in healthy adults. Metabolic adaptation may occur during sustained deficits.',
    };
  }

  // Insufficient data
  const missingInputs: string[] = [];
  if (!input.weightKg) missingInputs.push('peso corporal');
  if (!input.heightCm) missingInputs.push('altura');
  if (!input.ageYears) missingInputs.push('idade');
  if (!input.biologicalSex || input.biologicalSex === 'NOT_SPECIFIED') missingInputs.push('sexo biológico');

  return {
    result: null,
    unit: 'kcal/day',
    formulaName: 'Mifflin-St Jeor Predictive Equation',
    formulaVersion: '1.0.0',
    mathematicalExpression: 'BMR = (10 * WeightKg) + (6.25 * HeightCm) - (5 * Age) + S',
    inputs: input,
    provenance: {
      type: 'UNKNOWN',
      source: 'Mifflin-St Jeor Engine v1',
      recordedAt: new Date().toISOString(),
      confidence: 'INSUFFICIENT_DATA',
      limitations: [`Parâmetros fisiológicos obrigatórios ausentes: ${missingInputs.join(', ')}`],
    },
    evidenceCitation: EVIDENCE_REGISTRY.MIFFLIN_1990,
    confidence: 'INSUFFICIENT_DATA',
    clinicalBoundaryDisclaimer: 'Não é possível calcular a TMB sem os parâmetros basais (peso, altura, idade e sexo biológico). Parâmetros não informados não são assumidos arbitrariamente.',
  };
}
