import { Router, Request, Response } from 'express';
import { getAuthenticatedUserId } from './auth';
import { readUserPartition, writeUserPartition } from '../database/db';
import { validateNutritionLogInput } from '../validators/schemaValidators';

const router = Router();

// 1. Get Nutrition Telemetry
router.get('/', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  return res.json({ nutritionLogs: partition.nutrition || [] });
});

// 2. Log Meal / Daily Nutrition
router.post('/', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const validation = validateNutritionLogInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed', details: validation.errors });
  }

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const newLog = {
    id: `nut-${Date.now()}`,
    userId,
    timestamp: req.body.timestamp || new Date().toISOString(),
    name: req.body.name || 'Registro Nutricional',
    calories: Number(req.body.calories) || 0,
    proteinGrams: Number(req.body.proteinGrams) || 0,
    carbsGrams: Number(req.body.carbsGrams) || 0,
    fatsGrams: Number(req.body.fatsGrams) || 0,
    waterMl: Number(req.body.waterMl) || 0,
    urineScaleArmstrong: Number(req.body.urineScaleArmstrong) || 2, // 1 to 5
    creatineSupplementationGrams: Number(req.body.creatineSupplementationGrams) || 0,
    notes: req.body.notes || '',
  };

  if (!partition.nutrition) partition.nutrition = [];
  partition.nutrition.unshift(newLog);
  writeUserPartition(userId, partition);

  return res.status(201).json({ log: newLog });
});

// 3. Dynamic Hydration Calculation Engine (35-45 ml/kg + Thermal + Exercise + Creatine)
router.post('/dynamic-hydration', (req: Request, res: Response) => {
  const weightKg = Number(req.body.weightKg) || 80;
  const ambientTempC = Number(req.body.ambientTempC) || 24;
  const trainingMinutes = Number(req.body.trainingMinutes) || 60;
  const sweatRate = req.body.sweatRate || 'MODERATE'; // 'LOW' | 'MODERATE' | 'HIGH'
  const takingCreatine = Boolean(req.body.takingCreatine);

  // 1. Base hydration: 35-45 ml/kg (mean = 40 ml/kg)
  const baseMl = Math.round(weightKg * 40);

  // 2. Ambient temperature delta (>25°C adds extra fluid)
  let thermalMl = 0;
  if (ambientTempC > 25) {
    const degreesAbove = ambientTempC - 25;
    thermalMl = Math.round(degreesAbove * 120); // 120ml per °C above 25°C
  }

  // 3. Training & Sweat rate delta (Sawka et al., 2007)
  const sweatMultipliers: Record<string, number> = {
    LOW: 8, // ~500 ml/hr
    MODERATE: 12, // ~750 ml/hr
    HIGH: 18, // ~1100 ml/hr
  };
  const sweatFactor = sweatMultipliers[sweatRate] || 12;
  const exerciseMl = Math.round(trainingMinutes * sweatFactor);

  // 4. Creatine Monohydrate osmotic uptake compensation
  const creatineMl = takingCreatine ? 600 : 0;

  const totalRecommendedMl = baseMl + thermalMl + exerciseMl + creatineMl;

  return res.json({
    recommendedTotalMl: totalRecommendedMl,
    components: {
      baselineFluidMl: baseMl,
      thermalStressMl: thermalMl,
      exerciseSweatReplacementMl: exerciseMl,
      creatineOsmoticBufferMl: creatineMl,
    },
    inputs: {
      weightKg,
      ambientTempC,
      trainingMinutes,
      sweatRate,
      takingCreatine,
    },
    formula: 'Dynamic Physiological Hydration [Base(40ml/kg) + ThermalDelta + ExerciseSweat + CreatineOsmotic]',
    clinicalCitations: ['Sawka et al. (2007) Med Sci Sports Exerc', 'Armstrong et al. (1994) Int J Sport Nutr'],
  });
});

// 4. Armstrong Urine Color Scale (5 clinical levels with immediate directives)
router.get('/armstrong-scale', (req: Request, res: Response) => {
  const scale = [
    {
      level: 1,
      colorHex: '#F6F9D6',
      label: 'Hidratado (Ótimo)',
      classification: 'HIDRATADO',
      usgEstimate: '< 1.010',
      actionDirective: 'Equilíbrio hídrico ideal mantido. Ingestão voluntária contínua conforme sede.',
    },
    {
      level: 2,
      colorHex: '#EDEB87',
      label: 'Euidratado (Normal)',
      classification: 'EUIDRATADO',
      usgEstimate: '1.010 - 1.015',
      actionDirective: 'Euidratação confirmada. Manter taxa de hidratação habitual ao longo do dia.',
    },
    {
      level: 3,
      colorHex: '#E5D64B',
      label: 'Levemente Desidratado',
      classification: 'LEVEMENTE_DESIDRATADO',
      usgEstimate: '1.016 - 1.020',
      actionDirective: 'Ingerir 250 a 500 ml de água pura imediatamente antes da próxima sessão de esforço.',
    },
    {
      level: 4,
      colorHex: '#C59A26',
      label: 'Desidratado',
      classification: 'DESIDRATADO',
      usgEstimate: '1.021 - 1.025',
      actionDirective: 'Ingerir 500 a 750 ml de água associada a eletrólitos (sódio 300-500mg). Monitorar perda de rendimento.',
    },
    {
      level: 5,
      colorHex: '#8B5B13',
      label: 'Severamente Desidratado',
      classification: 'SEVERAMENTE_DESIDRATADO',
      usgEstimate: '> 1.026',
      actionDirective: 'Atenção clínica imediata: reidratação ativa (1000ml com reposição hidroeletrolítica) e cessação de esforço em altas temperaturas.',
    },
  ];

  return res.json({
    scale,
    reference: 'Armstrong LE et al. (1994) Urinary indices of hydration status. Int J Sport Nutr.',
  });
});

export default router;
