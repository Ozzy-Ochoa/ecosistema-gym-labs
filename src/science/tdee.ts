import { DeterministicCalculationResult } from '../types/science';
import { calculateBMR, BMRInput } from './bmr';
import { EVIDENCE_REGISTRY } from './citations';

export type PhysicalActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';

const ACTIVITY_MULTIPLIERS: Record<PhysicalActivityLevel, number> = {
  SEDENTARY: 1.2,          // Little or no exercise, desk work
  LIGHTLY_ACTIVE: 1.375,   // Light exercise 1-3 days/week
  MODERATELY_ACTIVE: 1.55, // Moderate exercise 3-5 days/week
  VERY_ACTIVE: 1.725,      // Hard exercise 6-7 days/week
  EXTREMELY_ACTIVE: 1.9,   // Very hard daily exercise or physical labor
};

export function calculateTDEE(
  bmrInput: BMRInput,
  activityLevel: PhysicalActivityLevel | undefined | null
): DeterministicCalculationResult<number> {
  const bmrResult = calculateBMR(bmrInput);
  
  if (!bmrResult.result) {
    return {
      result: null,
      unit: 'kcal/day',
      formulaName: 'Total Daily Energy Expenditure (TDEE)',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'TDEE = BMR * PhysicalActivityMultiplier',
      inputs: { bmrInput, activityLevel },
      provenance: {
        type: 'UNKNOWN',
        source: 'TDEE Engine v1',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
        limitations: ['Underlying BMR could not be computed due to missing data.'],
      },
      evidenceCitation: EVIDENCE_REGISTRY.MIFFLIN_1990,
      confidence: 'INSUFFICIENT_DATA',
      clinicalBoundaryDisclaimer: 'Requires verified BMR baseline to calculate maintenance energy expenditure.',
    };
  }

  if (!activityLevel || !ACTIVITY_MULTIPLIERS[activityLevel]) {
    return {
      result: null,
      unit: 'kcal/day',
      formulaName: 'Total Daily Energy Expenditure (TDEE)',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'TDEE = BMR * PhysicalActivityMultiplier',
      inputs: { calculatedBMR: bmrResult.result, activityLevel },
      provenance: {
        type: 'UNKNOWN',
        source: 'TDEE Engine v1',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
        limitations: ['Nível de atividade física diária (PAL) não informado. Não assumimos rotinas arbitrárias.'],
      },
      evidenceCitation: EVIDENCE_REGISTRY.MIFFLIN_1990,
      confidence: 'INSUFFICIENT_DATA',
      clinicalBoundaryDisclaimer: 'Necessário informar o nível de atividade física diária para calcular o gasto energético total.',
    };
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = Math.round(bmrResult.result * multiplier);

  return {
    result: tdee,
    unit: 'kcal/day',
    formulaName: 'Total Daily Energy Expenditure (TDEE)',
    formulaVersion: '1.0.0',
    mathematicalExpression: `TDEE = ${bmrResult.result} kcal * ${multiplier} (${activityLevel})`,
    inputs: {
      calculatedBMR: bmrResult.result,
      activityLevel,
      multiplier,
    },
    provenance: {
      type: 'CALCULATED',
      source: 'Gym Labs TDEE Engine v1',
      recordedAt: new Date().toISOString(),
      calculationMethod: 'Factorial Method (BMR * PAL)',
      confidence: 'MEDIUM',
      limitations: ['Non-Exercise Activity Thermogenesis (NEAT) may vary by up to 800 kcal/day between individuals.'],
    },
    evidenceCitation: EVIDENCE_REGISTRY.MIFFLIN_1990,
    confidence: 'MEDIUM',
    clinicalBoundaryDisclaimer: 'TDEE is a calculated starting point. True maintenance calories require 2-3 weeks of weight trend logging and caloric intake observation.',
  };
}
