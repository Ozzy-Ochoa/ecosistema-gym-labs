import { DeterministicCalculationResult } from '../types/science';

export interface BMIOutput {
  bmi: number;
  category: 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE_I' | 'OBESE_II' | 'OBESE_III';
  limitations: string[];
}

export function calculateBMI(weightKg: number | null, heightCm: number | null): DeterministicCalculationResult<BMIOutput> {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return {
      result: null,
      unit: 'kg/m²',
      formulaName: 'Quetelet Index (Body Mass Index)',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'BMI = WeightKg / (HeightM)²',
      inputs: { weightKg, heightCm },
      provenance: {
        type: 'UNKNOWN',
        source: 'WHO Anthropometry Standard',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
        limitations: ['Height or weight missing.'],
      },
      evidenceCitation: {
        citationId: 'WHO_2000',
        shortCitation: 'WHO (2000)',
        fullTitle: 'Obesity: preventing and managing the global epidemic',
        journal: 'WHO Technical Report Series, 894',
        year: 2000,
        evidenceLevel: 'EXPERT_CONSENSUS',
        keyFinding: 'BMI is an epidemiological population screening tool, not a direct measurement of body composition or visceral fat.',
        limitations: ['Does not differentiate between skeletal muscle and adipose tissue'],
      },
      confidence: 'INSUFFICIENT_DATA',
      clinicalBoundaryDisclaimer: 'BMI does not diagnose metabolic health or muscularity. Athletic individuals frequently classify as overweight despite low body fat.',
    };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category: BMIOutput['category'] = 'NORMAL';
  if (bmi < 18.5) category = 'UNDERWEIGHT';
  else if (bmi < 25) category = 'NORMAL';
  else if (bmi < 30) category = 'OVERWEIGHT';
  else if (bmi < 35) category = 'OBESE_I';
  else if (bmi < 40) category = 'OBESE_II';
  else category = 'OBESE_III';

  return {
    result: {
      bmi,
      category,
      limitations: [
        'Overestimates fatness in individuals with high muscularity/bone density.',
        'Underestimates fatness in older persons who have lost muscle mass (sarcopenia).',
      ],
    },
    unit: 'kg/m²',
    formulaName: 'Quetelet Index (Body Mass Index)',
    formulaVersion: '1.0.0',
    mathematicalExpression: `BMI = ${weightKg} / (${heightM})² = ${bmi}`,
    inputs: { weightKg, heightCm },
    provenance: {
      type: 'CALCULATED',
      source: 'WHO Standard Anthropometry',
      recordedAt: new Date().toISOString(),
      calculationMethod: 'Quetelet Index (1832 / WHO 2000)',
      confidence: 'HIGH',
    },
    evidenceCitation: {
      citationId: 'WHO_2000',
      shortCitation: 'WHO (2000)',
      fullTitle: 'Obesity: preventing and managing the global epidemic',
      journal: 'WHO Technical Report Series, 894',
      year: 2000,
      evidenceLevel: 'EXPERT_CONSENSUS',
      keyFinding: 'Epidemiological cutoffs: <18.5 Underweight, 18.5-24.9 Normal, 25-29.9 Overweight, 30+ Obese.',
      limitations: ['Does not measure body fat percentage'],
    },
    confidence: 'HIGH',
    clinicalBoundaryDisclaimer: 'BMI is purely an anthropometric ratio. Combine with waist circumference and body composition (DEXA/skinfold) for comprehensive evaluation.',
  };
}
