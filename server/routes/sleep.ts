import { Router, Request, Response } from 'express';
import { requireAuth, authorizeResource, AuthenticatedRequest } from '../middleware/auth';
import { SleepRepository } from '../repositories/SleepRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { validateSleepLogInput } from '../validators/schemaValidators';

const router = Router();

// 1. Get Sleep Logs
router.get('/', requireAuth, authorizeResource('SLEEP'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const targetUserId = (req.query.studentId as string) || (req.query.userId as string) || callerId;

    const [sessions, wellnessList] = await Promise.all([
      SleepRepository.getSessions(targetUserId),
      SleepRepository.getWellness(targetUserId),
    ]);

    return res.json({
      success: true,
      sleepLogs: sessions,
      wellnessLogs: wellnessList,
    });
  } catch (err: any) {
    console.error('Error fetching sleep logs:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar registros de sono no banco relacional' },
    });
  }
});

// 2. Log Sleep Telemetry
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const validation = validateSleepLogInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dados de sono inválidos', details: validation.errors },
      });
    }

    const targetUserId = req.body.studentId || req.body.userId || callerId;

    const durationMinutes = Number(req.body.durationMinutes) || 450;
    const efficiencyPct = Number(req.body.efficiencyPct) || 88;
    const deepSleepMinutes = Number(req.body.deepSleepMinutes) || 90;
    const remSleepMinutes = Number(req.body.remSleepMinutes) || 105;
    const sleepQualityRpe = Number(req.body.sleepQualityRpe) || 8;
    const restingHrvRmssd = Number(req.body.nocturnalHrvRmsddMs || req.body.restingHrvRmssd) || 62;
    const restingHeartRateBpm = Number(req.body.restingHeartRateBpm) || 54;

    const newLog = await SleepRepository.createSession({
      id: req.body.id,
      userId: targetUserId,
      bedtime: req.body.bedtime ? new Date(req.body.bedtime) : new Date(Date.now() - durationMinutes * 60000),
      wakeTime: req.body.wakeTime ? new Date(req.body.wakeTime) : new Date(),
      durationMinutes,
      efficiencyPct,
      deepSleepMinutes,
      remSleepMinutes,
      sleepQualityRpe,
      restingHrvRmssd,
      restingHeartRateBpm,
      provenanceType: req.body.isDemo ? 'DEMO' : 'REAL',
    });

    // Se informou DOMS ou estresse, registrar log de bem-estar integrado
    if (req.body.domsScore !== undefined || req.body.perceivedStressScore !== undefined) {
      await SleepRepository.logWellness({
        userId: targetUserId,
        sorenessScore: Number(req.body.domsScore) || 3,
        stressScore: Number(req.body.perceivedStressScore) || 3,
        fatigueScore: Math.round(10 - sleepQualityRpe),
        moodScore: Math.round(efficiencyPct / 10),
        notes: req.body.notes || '',
      });
    }

    await AuditRepository.logEvent(
      callerId,
      'DATA_CREATED',
      newLog.id,
      { targetUserId, durationMinutes, sleepQualityRpe },
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.status(201).json({
      success: true,
      sleep: newLog,
      log: newLog,
    });
  } catch (err: any) {
    console.error('Error logging sleep:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao registrar sono no banco' },
    });
  }
});

// 3. Integrative Readiness Score Engine
router.get('/readiness-score', requireAuth, authorizeResource('SLEEP'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const targetUserId = (req.query.studentId as string) || (req.query.userId as string) || callerId;

    const [sleepLogs, workouts, wellnessList] = await Promise.all([
      SleepRepository.getSessions(targetUserId),
      WorkoutRepository.getSessions(targetUserId),
      SleepRepository.getWellness(targetUserId),
    ]);

    if (sleepLogs.length === 0) {
      return res.json({
        success: true,
        score: null,
        status: 'DADOS INSUFICIENTES',
        confidence: 'INSUFICIENTES',
        message: 'Nenhum registro de sono encontrado. Registre ao menos uma noite para calcular a prontidão fisiológica.',
      });
    }

    const latestSleep = sleepLogs[0];
    const latestWellness = wellnessList[0];

    // Component 1: Sleep Duration & Efficiency (0-100)
    const durationScore = Math.min(100, Math.max(0, ((latestSleep.durationMinutes || 420) / 480) * 100));
    const efficiencyScore = latestSleep.efficiencyPct || 85;
    const sleepComp = durationScore * 0.5 + efficiencyScore * 0.5;

    // Component 2: Autonomic Tone (HRV vs baseline 50-70 ms)
    const hrv = latestSleep.restingHrvRmssd || 60;
    const hrvComp = Math.min(100, Math.max(20, (hrv / 65) * 85));

    // Component 3: Stress & DOMS Inverted (Lower is better for recovery)
    const doms = latestWellness?.sorenessScore || 3;
    const stress = latestWellness?.stressScore || 3;
    const fatiguePenalty = (doms * 5) + (stress * 5);
    const recoverySubjectiveComp = Math.max(10, 100 - fatiguePenalty);

    // Component 4: 7-day Accumulated Workload balance
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentWorkouts = workouts.filter((w) => w.startedAt.getTime() >= sevenDaysAgo);
    const totalWeeklyLoad = recentWorkouts.reduce((sum, w) => sum + (w.workloadUnits || 400), 0);

    let workloadComp = 85;
    if (totalWeeklyLoad > 3500) {
      workloadComp = 65;
    } else if (totalWeeklyLoad < 800) {
      workloadComp = 75;
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
      directive = 'Sistema nervoso autônomo e muscular plenamente restaurados. Sessão de alta intensidade liberada.';
    } else if (readinessScore >= 70) {
      statusLabel = 'PRONTIDÃO OTIMIZADA';
      directive = 'Recuperação satisfatória. Executar periodização planejada com autoregulação padrão.';
    } else if (readinessScore >= 50) {
      statusLabel = 'RECUPERAÇÃO MODERADA';
      directive = 'Tensão residual observada. Recomenda-se manter RIR >= 2 ou reduzir volume total de séries em 20%.';
    } else {
      statusLabel = 'FADIGA ACUMULADA ALTA';
      directive = 'Alerta de sobrecarga aguda: priorizar sono, hidratação ativa e realizar recuperação ativa.';
    }

    return res.json({
      success: true,
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
  } catch (err: any) {
    console.error('Readiness engine error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro no cálculo de prontidão' },
    });
  }
});

export default router;
