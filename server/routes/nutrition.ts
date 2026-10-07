import { Router, Request, Response } from 'express';
import { requireAuth, authorizeResource, AuthenticatedRequest } from '../middleware/auth';
import { NutritionRepository } from '../repositories/NutritionRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { validateNutritionLogInput } from '../validators/schemaValidators';

const router = Router();

// 1. Get Nutrition Telemetry
router.get('/', requireAuth, authorizeResource('DIET'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const targetUserId = (req.query.studentId as string) || (req.query.userId as string) || callerId;

    const [mealsList, hydrationList, plansList] = await Promise.all([
      NutritionRepository.getMeals(targetUserId),
      NutritionRepository.getHydration(targetUserId),
      NutritionRepository.getPlans(targetUserId),
    ]);

    return res.json({
      success: true,
      meals: mealsList,
      hydrationLogs: hydrationList,
      plans: plansList,
      nutritionLogs: mealsList,
    });
  } catch (err: any) {
    console.error('Error fetching nutrition logs:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao carregar dados nutricionais do banco' },
    });
  }
});

// 2. Log Meal
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const validation = validateNutritionLogInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dados de refeição inválidos', details: validation.errors },
      });
    }

    const targetUserId = req.body.studentId || req.body.userId || callerId;

    const newMeal = await NutritionRepository.createMeal({
      id: req.body.id,
      userId: targetUserId,
      planId: req.body.planId,
      name: req.body.name || 'Refeição Registrada',
      consumedAt: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      calories: Number(req.body.calories) || 0,
      proteinGrams: Number(req.body.proteinGrams) || 0,
      carbsGrams: Number(req.body.carbsGrams) || 0,
      fatsGrams: Number(req.body.fatsGrams) || 0,
      itemsJson: req.body.items || [],
      provenanceType: req.body.isDemo ? 'DEMO' : 'REAL',
    });

    if (Number(req.body.waterMl) > 0) {
      await NutritionRepository.logHydration(targetUserId, Number(req.body.waterMl));
    }

    await AuditRepository.logEvent(
      callerId,
      'DATA_CREATED',
      newMeal.id,
      { targetUserId, calories: newMeal.calories },
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.status(201).json({
      success: true,
      meal: newMeal,
      log: newMeal,
    });
  } catch (err: any) {
    console.error('Error logging meal:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao registrar refeição no banco' },
    });
  }
});

// 3. Log Hydration
router.post('/hydration', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const { amountMl, studentId, userId } = req.body;
    const targetUserId = studentId || userId || callerId;

    if (!amountMl || Number(amountMl) <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'amountMl deve ser um valor positivo' },
      });
    }

    const log = await NutritionRepository.logHydration(targetUserId, Number(amountMl));

    return res.status(201).json({
      success: true,
      hydration: log,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao registrar hidratação' },
    });
  }
});

// 4. Dynamic Hydration Engine (35-45 ml/kg + Thermal + Exercise + Creatine)
router.post('/dynamic-hydration', (req: Request, res: Response) => {
  const weightKg = Number(req.body.weightKg) || 80;
  const ambientTempC = Number(req.body.ambientTempC) || 24;
  const trainingMinutes = Number(req.body.trainingMinutes) || 60;
  const sweatRate = req.body.sweatRate || 'MODERATE';
  const takingCreatine = Boolean(req.body.takingCreatine);

  // 1. Base hydration: 35-45 ml/kg (mean = 40 ml/kg)
  const baseMl = Math.round(weightKg * 40);

  // 2. Ambient temperature delta (>25°C adds extra fluid)
  let thermalMl = 0;
  if (ambientTempC > 25) {
    const degreesAbove = ambientTempC - 25;
    thermalMl = Math.round(degreesAbove * 120);
  }

  // 3. Training & Sweat rate delta (Sawka et al., 2007)
  const sweatMultipliers: Record<string, number> = {
    LOW: 8,
    MODERATE: 12,
    HIGH: 18,
  };
  const sweatFactor = sweatMultipliers[sweatRate] || 12;
  const exerciseMl = Math.round(trainingMinutes * sweatFactor);

  // 4. Creatine Monohydrate osmotic uptake compensation
  const creatineMl = takingCreatine ? 600 : 0;

  const totalRecommendedMl = baseMl + thermalMl + exerciseMl + creatineMl;

  return res.json({
    success: true,
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

// 5. Armstrong Urine Color Scale
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
    success: true,
    scale,
    reference: 'Armstrong LE et al. (1994) Urinary indices of hydration status. Int J Sport Nutr.',
  });
});

export default router;
