import { Router, Request, Response } from 'express';
import { getAuthenticatedUserId } from './auth';
import { readUserPartition, writeUserPartition } from '../database/db';
import { validateSleepLogInput } from '../validators/schemaValidators';

const router = Router();

// 1. Get Sleep Logs
router.get('/', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  return res.json({ sleepLogs: partition.sleep || [] });
});

// 2. Log Sleep Telemetry
router.post('/', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const validation = validateSleepLogInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed', details: validation.errors });
  }

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const newLog = {
    id: `slp-${Date.now()}`,
    userId,
    bedtime: req.body.bedtime || new Date().toISOString(),
    wakeTime: req.body.wakeTime || new Date().toISOString(),
    durationMinutes: Number(req.body.durationMinutes) || 450, // 7.5 hours default
    efficiencyPct: Number(req.body.efficiencyPct) || 88,
    deepSleepMinutes: Number(req.body.deepSleepMinutes) || 90,
    remSleepMinutes: Number(req.body.remSleepMinutes) || 105,
    sleepQualityRpe: Number(req.body.sleepQualityRpe) || 8, // 1 to 10
    nocturnalHrvRmsddMs: Number(req.body.nocturnalHrvRmsddMs) || 62,
    restingHeartRateBpm: Number(req.body.restingHeartRateBpm) || 54,
    domsScore: Number(req.body.domsScore) || 3, // 1 to 10 Delayed Onset Muscle Soreness
    perceivedStressScore: Number(req.body.perceivedStressScore) || 3, // 1 to 10
    recordedAt: new Date().toISOString(),
  };

  if (!partition.sleep) partition.sleep = [];
  partition.sleep.unshift(newLog);
  writeUserPartition(userId, partition);

  return res.status(201).json({ sleep: newLog });
});

// 3. Integrative Readiness Score Engine
// Integrates sleep duration & quality (40%), autonomic tone/HRV (25%), perceived stress & DOMS (20%), and 7-day workload (15%)
router.get('/readiness-score', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const sleepLogs = partition.sleep || [];
  const workouts = partition.workouts || [];

  if (sleepLogs.length === 0) {
    return res.json({
      score: null,
      status: 'DADOS INSUFICIENTES',
      confidence: 'INSUFICIENTES',
      message: 'Nenhum registro de sono encontrado. Registre ao menos uma noite para calcular a prontidão fisiológica.',
    });
  }

  const latestSleep = sleepLogs[0];

  // Component 1: Sleep Duration & Efficiency (0-100)
  const durationScore = Math.min(100, Math.max(0, ((latestSleep.durationMinutes || 420) / 480) * 100));
  const efficiencyScore = latestSleep.efficiencyPct || 85;
  const sleepComp = durationScore * 0.5 + efficiencyScore * 0.5;

  // Component 2: Autonomic Tone (HRV vs normal athletic baseline 50-70 ms)
  const hrv = latestSleep.nocturnalHrvRmsddMs || 60;
  const hrvComp = Math.min(100, Math.max(20, (hrv / 65) * 85));

  // Component 3: Stress & DOMS Inverted (Lower is better for recovery)
  const doms = latestSleep.domsScore || 3;
  const stress = latestSleep.perceivedStressScore || 3;
  const fatiguePenalty = (doms * 5) + (stress * 5); // 0 to 100 penalty
  const recoverySubjectiveComp = Math.max(10, 100 - fatiguePenalty);

  // Component 4: 7-day Accumulated Workload balance
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentWorkouts = workouts.filter((w: any) => new Date(w.startedAt).getTime() >= sevenDaysAgo);
  const totalWeeklyLoad = recentWorkouts.reduce((sum: number, w: any) => sum + (w.workloadUnits || 400), 0);
  // Optimal weekly athletic load window: 1500 - 3000 AU
  let workloadComp = 85;
  if (totalWeeklyLoad > 3500) {
    workloadComp = 65; // High acute fatigue
  } else if (totalWeeklyLoad < 800) {
    workloadComp = 75; // Detraining or fresh
  }

  // Weighted Integrated Score
  const rawScore = Math.round(
    sleepComp * 0.40 +
    hrvComp * 0.25 +
    recoverySubjectiveComp * 0.20 +
    workloadComp * 0.15
  );
  const readinessScore = Math.min(99, Math.max(1, rawScore));

  let statusLabel: 'PRONTIDÃO MÁXIMA' | 'PRONTIDÃO OTIMIZADA' | 'RECUPERAÇÃO MODERADA' | 'FADIGA ACUMULADA ALTA' = 'PRONTIDÃO OTIMIZADA';
  let directive = '';

  if (readinessScore >= 85) {
    statusLabel = 'PRONTIDÃO MÁXIMA';
    directive = 'Sistema nervoso autônomo e muscular plenamente restaurados. Sessão de alta intensidade e cargas máximas liberada.';
  } else if (readinessScore >= 70) {
    statusLabel = 'PRONTIDÃO OTIMIZADA';
    directive = 'Recuperação satisfatória. Executar periodização planejada com autoregulação padrão de RPE/RIR.';
  } else if (readinessScore >= 50) {
    statusLabel = 'RECUPERAÇÃO MODERADA';
    directive = 'Tensão residual observada. Recomenda-se manter RIR >= 2 ou reduzir volume total de séries em 20%.';
  } else {
    statusLabel = 'FADIGA ACUMULADA ALTA';
    directive = 'Alerta de sobrecarga aguda: priorizar sono, hidratação ativa e realizar apenas recuperação ativa em Zona 1.';
  }

  return res.json({
    score: readinessScore,
    status: statusLabel,
    actionableDirective: directive,
    confidence: 'ALTA',
    metrics: {
      sleepDurationMinutes: latestSleep.durationMinutes,
      sleepEfficiencyPct: latestSleep.efficiencyPct,
      nocturnalHrvMs: hrv,
      domsLevel: doms,
      perceivedStress: stress,
      sevenDayWorkloadUnits: totalWeeklyLoad,
    },
    statisticalHonestyNotice: 'Associação temporal observada entre telemetria de sono e tônus vagal; não implica causação mecânica isolada.',
  });
});

export default router;
