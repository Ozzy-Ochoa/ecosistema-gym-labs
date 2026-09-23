export interface DynamicHydrationInputs {
  weightKg: number;
  ambientTempC: number;
  workoutDurationMinutes: number;
  sweatRate: 'LOW' | 'MODERATE' | 'HIGH';
  takingCreatine: boolean;
}

export interface DynamicHydrationResult {
  totalTargetMl: number;
  baselineMl: number;
  thermalAdditionMl: number;
  exerciseAdditionMl: number;
  creatineAdditionMl: number;
  formula: string;
  citations: string[];
}

export function calculateDynamicHydration(inputs: DynamicHydrationInputs): DynamicHydrationResult {
  // 1. Baseline: 40 ml per kg body weight (Armstrong et al., Sawka et al.)
  const baselineMl = Math.round(inputs.weightKg * 40);

  // 2. Thermal stress adjustment (>25°C adds extra fluid)
  let thermalAdditionMl = 0;
  if (inputs.ambientTempC > 25) {
    thermalAdditionMl = Math.round((inputs.ambientTempC - 25) * 120);
  }

  // 3. Exercise & sweat rate
  const sweatFactorMap = {
    LOW: 8, // ~480 ml/h
    MODERATE: 12, // ~720 ml/h
    HIGH: 18, // ~1080 ml/h
  };
  const exerciseAdditionMl = Math.round(inputs.workoutDurationMinutes * (sweatFactorMap[inputs.sweatRate] || 12));

  // 4. Creatine Monohydrate osmotic uptake compensation (+600 ml)
  const creatineAdditionMl = inputs.takingCreatine ? 600 : 0;

  const totalTargetMl = baselineMl + thermalAdditionMl + exerciseAdditionMl + creatineAdditionMl;

  return {
    totalTargetMl,
    baselineMl,
    thermalAdditionMl,
    exerciseAdditionMl,
    creatineAdditionMl,
    formula: 'VolTotal = (Peso * 40ml) + TempDelta(>25°C) + (MinTreino * FatorSudorese) + CreatinaBuffer',
    citations: [
      'Sawka MN et al. (2007) American College of Sports Medicine position stand: Exercise and fluid replacement. Med Sci Sports Exerc.',
      'Armstrong LE et al. (1994) Urinary indices of hydration status. Int J Sport Nutr.',
    ],
  };
}

export interface ArmstrongLevel {
  level: number;
  label: string;
  state: 'HIDRATADO' | 'EUIDRATADO' | 'LEVEMENTE_DESIDRATADO' | 'DESIDRATADO' | 'SEVERAMENTE_DESIDRATADO';
  colorHex: string;
  usgRange: string;
  actionText: string;
}

export const ARMSTRONG_URINE_SCALE: ArmstrongLevel[] = [
  {
    level: 1,
    label: 'Nível 1 — Hidratado Ótimo',
    state: 'HIDRATADO',
    colorHex: '#F6F9D6',
    usgRange: '< 1.010 USG',
    actionText: 'Euidratação ótima. Manter ingestão voluntária controlada por sede.',
  },
  {
    level: 2,
    label: 'Nível 2 — Euidratado',
    state: 'EUIDRATADO',
    colorHex: '#EDEB87',
    usgRange: '1.010 - 1.015 USG',
    actionText: 'Equilíbrio hidroeletrolítico normal. Continue consumindo água em pequenos goles.',
  },
  {
    level: 3,
    label: 'Nível 3 — Levemente Desidratado',
    state: 'LEVEMENTE_DESIDRATADO',
    colorHex: '#E5D64B',
    usgRange: '1.016 - 1.020 USG',
    actionText: 'Ingerir 250 a 500 ml de água antes do próximo esforço ou refeição.',
  },
  {
    level: 4,
    label: 'Nível 4 — Desidratado',
    state: 'DESIDRATADO',
    colorHex: '#C59A26',
    usgRange: '1.021 - 1.025 USG',
    actionText: 'Ingerir 500 a 750 ml de água com eletrólitos (sódio 300mg). Possível queda de 5-10% no rendimento.',
  },
  {
    level: 5,
    label: 'Nível 5 — Severamente Desidratado',
    state: 'SEVERAMENTE_DESIDRATADO',
    colorHex: '#8B5B13',
    usgRange: '> 1.026 USG',
    actionText: 'Protocolo urgente de reidratação ativa (1000ml fluidos + eletrólitos). Cessar esforço térmico extenuante.',
  },
];
