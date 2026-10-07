import { Router, Request, Response } from 'express';
import { getAuthenticatedUserId } from './auth';
import { readUserPartition, writeUserPartition } from '../database/db';
import { validateWorkoutSessionInput } from '../validators/schemaValidators';
import { dbServices } from '../services/dbServices';

const router = Router();

// 1. Get Workout Sessions
router.get('/', async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const targetUserId = (req.query.studentId as string) || userId;
    const dbWorkouts = await dbServices.getWorkoutsForUser(userId, targetUserId);
    if (dbWorkouts && dbWorkouts.length > 0) {
      return res.json({ workouts: dbWorkouts });
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Acesso negado')) {
      return res.status(403).json({ error: err.message });
    }
  }

  // Local fallback
  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  return res.json({ workouts: partition.workouts || [] });
});

// 2. Log Workout Session
router.post('/', async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const validation = validateWorkoutSessionInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed', details: validation.errors });
  }

  const payload = req.body.workout && typeof req.body.workout === 'object' ? req.body.workout : req.body;
  const sessionId = payload.id || `wkt-${Date.now()}`;
  const newSession = {
    id: sessionId,
    userId,
    startedAt: payload.startedAt || new Date().toISOString(),
    completedAt: payload.completedAt || new Date().toISOString(),
    name: payload.name || payload.title,
    durationMinutes: Number(payload.durationMinutes) || 60,
    sessionRpe: Number(payload.sessionRpe) || 8,
    // Workload units = Duration * RPE (Foster et al., 2001)
    workloadUnits: (Number(payload.durationMinutes) || 60) * (Number(payload.sessionRpe) || 8),
    exercises: payload.exercises || [],
    notes: payload.notes || '',
    recordedAt: new Date().toISOString(),
  };

  // 1. Persistência relacional no Cloud SQL
  try {
    await dbServices.createWorkoutSession({
      id: sessionId,
      userId,
      title: newSession.name,
      startedAt: new Date(newSession.startedAt),
      endedAt: new Date(newSession.completedAt),
      durationMinutes: newSession.durationMinutes,
      sessionRpe: newSession.sessionRpe,
      workloadUnits: newSession.workloadUnits,
      exercisesJson: newSession.exercises,
      notes: newSession.notes,
      provenanceType: 'REAL',
    });
  } catch (err) {
    console.warn('Fallback: Cloud SQL insert failed, preserving in local partition:', err);
  }

  // 2. Persistência local (Write-Through)
  const partition = readUserPartition(userId);
  if (partition) {
    if (!partition.workouts) partition.workouts = [];
    partition.workouts.unshift(newSession);
    writeUserPartition(userId, partition);
  }

  return res.status(201).json({ workout: newSession });
});

// 3. Deterministic Progressive Overload Engine
// Scientific constraint: Compares consecutive sessions of the same exercise.
// Requires >= 2 sessions or states "DADOS INSUFICIENTES" (NO fake charts or synthetic guesses!)
router.get('/progressive-overload/:exerciseName', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const targetExercise = decodeURIComponent(req.params.exerciseName).trim().toLowerCase();
  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const workouts = partition.workouts || [];

  // Filter workouts that contain this exercise
  const occurrences: {
    workoutDate: string;
    sets: { loadKg: number; reps: number; rir: number; failed: boolean }[];
    maxLoad: number;
    totalTonnage: number;
    avgReps: number;
  }[] = [];

  for (const wkt of workouts) {
    if (!Array.isArray(wkt.exercises)) continue;
    const match = wkt.exercises.find((ex: any) => ex.name?.toLowerCase() === targetExercise);
    if (match && Array.isArray(match.sets) && match.sets.length > 0) {
      let maxLoad = 0;
      let totalTonnage = 0;
      let totalReps = 0;

      const setsData = match.sets.map((s: any) => {
        const load = Number(s.loadKg) || 0;
        const reps = Number(s.reps) || 0;
        const rir = Number(s.rir) || 0;
        const failed = Boolean(s.failed);
        if (load > maxLoad) maxLoad = load;
        totalTonnage += load * reps;
        totalReps += reps;
        return { loadKg: load, reps, rir, failed };
      });

      occurrences.push({
        workoutDate: wkt.startedAt,
        sets: setsData,
        maxLoad,
        totalTonnage,
        avgReps: match.sets.length > 0 ? totalReps / match.sets.length : 0,
      });
    }
  }

  // Sort chronological
  occurrences.sort((a, b) => new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime());

  // Trava de segurança científica: mínimo 2 treinos para emitir parecer
  if (occurrences.length < 2) {
    return res.json({
      exerciseName: req.params.exerciseName,
      status: 'DADOS INSUFICIENTES',
      message: 'Mínimo de 2 sessões registradas com o mesmo exercício é requerido para avaliar a sobrecarga progressiva com rigor.',
      confidence: 'INSUFICIENTES',
      occurrencesRecorded: occurrences.length,
      historicalData: occurrences,
    });
  }

  // Compare the last two consecutive sessions
  const prev = occurrences[occurrences.length - 2];
  const current = occurrences[occurrences.length - 1];

  let classification: 'PROGRESSÃO' | 'MANUTENÇÃO' | 'ESTAGNAÇÃO' | 'REGRESSÃO' = 'MANUTENÇÃO';
  let reasoning = '';

  const loadDelta = current.maxLoad - prev.maxLoad;
  const tonnageDelta = current.totalTonnage - prev.totalTonnage;

  if (loadDelta > 0 || (loadDelta === 0 && tonnageDelta > 0)) {
    classification = 'PROGRESSÃO';
    reasoning = `Aumento verificado na carga de trabalho (+${loadDelta}kg no pico ou +${tonnageDelta}kg na tonelagem total da sessão).`;
  } else if (loadDelta === 0 && tonnageDelta === 0) {
    classification = 'MANUTENÇÃO';
    reasoning = 'Cargas e repetições idênticas à sessão imediatamente anterior mantidas sob controle.';
  } else if (loadDelta < 0 || tonnageDelta < 0) {
    // Check if regression is persistent
    if (occurrences.length >= 3) {
      const prev2 = occurrences[occurrences.length - 3];
      if (current.totalTonnage <= prev.totalTonnage && prev.totalTonnage <= prev2.totalTonnage) {
        classification = 'ESTAGNAÇÃO';
        reasoning = 'Volumes ou intensidades estagnadas ou em declínio por 3 sessões consecutivas. Recomenda-se deload programado.';
      } else {
        classification = 'REGRESSÃO';
        reasoning = `Redução observada na capacidade de trabalho (${loadDelta}kg no pico). Avalie fadiga acumulada e sono.`;
      }
    } else {
      classification = 'REGRESSÃO';
      reasoning = `Redução observada na capacidade de trabalho (${loadDelta}kg no pico).`;
    }
  }

  return res.json({
    exerciseName: req.params.exerciseName,
    status: classification,
    reasoning,
    confidence: 'ALTA',
    loadDeltaKg: loadDelta,
    tonnageDeltaKg: tonnageDelta,
    sessionsEvaluated: occurrences.length,
    recentComparison: {
      previousSession: prev,
      currentSession: current,
    },
  });
});

// 4. PR Vault (Personal Records - 4 Vectors)
router.get('/pr-vault', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const workouts = partition.workouts || [];
  const vault: Record<
    string,
    {
      exerciseName: string;
      maxAbsoluteLoadKg: { value: number; date: string };
      maxLoadByRep: Record<number, { loadKg: number; date: string }>;
      maxSetVolumeKg: { value: number; reps: number; loadKg: number; date: string };
      maxEstimated1RmKg: { value: number; formula: string; date: string };
    }
  > = {};

  for (const wkt of workouts) {
    if (!Array.isArray(wkt.exercises)) continue;
    for (const ex of wkt.exercises) {
      const name = ex.name || 'Unknown Exercise';
      if (!vault[name]) {
        vault[name] = {
          exerciseName: name,
          maxAbsoluteLoadKg: { value: 0, date: wkt.startedAt },
          maxLoadByRep: {},
          maxSetVolumeKg: { value: 0, reps: 0, loadKg: 0, date: wkt.startedAt },
          maxEstimated1RmKg: { value: 0, formula: 'Epley (1985)', date: wkt.startedAt },
        };
      }

      if (Array.isArray(ex.sets)) {
        for (const st of ex.sets) {
          const load = Number(st.loadKg) || 0;
          const reps = Number(st.reps) || 0;
          const setVolume = load * reps;

          // 1. Max Absolute Load
          if (load > vault[name].maxAbsoluteLoadKg.value) {
            vault[name].maxAbsoluteLoadKg = { value: load, date: wkt.startedAt };
          }

          // 2. Max Load by Repetition count
          if (reps > 0) {
            const currentRepRecord = vault[name].maxLoadByRep[reps];
            if (!currentRepRecord || load > currentRepRecord.loadKg) {
              vault[name].maxLoadByRep[reps] = { loadKg: load, date: wkt.startedAt };
            }
          }

          // 3. Max Single-Set Volume
          if (setVolume > vault[name].maxSetVolumeKg.value) {
            vault[name].maxSetVolumeKg = {
              value: setVolume,
              reps,
              loadKg: load,
              date: wkt.startedAt,
            };
          }

          // 4. Max Estimated 1RM (Epley formula: Load * (1 + 0.0333 * Reps))
          if (reps >= 1 && reps <= 12 && load > 0) {
            const epley1Rm = Math.round(load * (1 + 0.0333 * reps));
            if (epley1Rm > vault[name].maxEstimated1RmKg.value) {
              vault[name].maxEstimated1RmKg = {
                value: epley1Rm,
                formula: reps === 1 ? 'Direct 1RM Single' : 'Epley Submaximal Equation',
                date: wkt.startedAt,
              };
            }
          }
        }
      }
    }
  }

  return res.json({
    vault: Object.values(vault),
    recordedAt: new Date().toISOString(),
  });
});

// 5. Tanaka & Karvonen Cardiovascular Engine
router.get('/cardio-zones', (req: Request, res: Response) => {
  const age = Number(req.query.age) || 28;
  const restingHr = Number(req.query.restingHr) || 58;

  // Tanaka et al. (2001): HRmax = 208 - (0.7 * Age)
  const maxHr = Math.round(208 - 0.7 * age);
  const hrr = maxHr - restingHr; // Heart Rate Reserve

  const zones = [
    {
      zone: 'Z1',
      name: 'Recuperação Ativa & Base',
      minBpm: Math.round(restingHr + hrr * 0.50),
      maxBpm: Math.round(restingHr + hrr * 0.60),
      rangePct: '50-60%',
      metabolicFocus: 'Lipólise basal e biogênese mitocondrial lenta',
    },
    {
      zone: 'Z2',
      name: 'Base Aeróbica / Zona 2',
      minBpm: Math.round(restingHr + hrr * 0.60),
      maxBpm: Math.round(restingHr + hrr * 0.70),
      rangePct: '60-70%',
      metabolicFocus: 'Máxima oxidação lipídica e densidade capilar periférica',
    },
    {
      zone: 'Z3',
      name: 'Ritmo / Tempo Run',
      minBpm: Math.round(restingHr + hrr * 0.70),
      maxBpm: Math.round(restingHr + hrr * 0.80),
      rangePct: '70-80%',
      metabolicFocus: 'Consumo misto glicogênio/lipídios, transição aeróbica',
    },
    {
      zone: 'Z4',
      name: 'Limiar de Lactato',
      minBpm: Math.round(restingHr + hrr * 0.80),
      maxBpm: Math.round(restingHr + hrr * 0.90),
      rangePct: '80-90%',
      metabolicFocus: 'Tolerância ao acúmulo de íons H+ e depuração de lactato',
    },
    {
      zone: 'Z5',
      name: 'Potência Aeróbica Máxima (VO2 máx)',
      minBpm: Math.round(restingHr + hrr * 0.90),
      maxBpm: maxHr,
      rangePct: '90-100%',
      metabolicFocus: 'Recrutamento motor de alto limiar e débito cardíaco máximo',
    },
  ];

  return res.json({
    inputs: { ageYears: age, restingHrBpm: restingHr },
    tanakaMaxHrBpm: maxHr,
    heartRateReserveBpm: hrr,
    formula: 'Tanaka et al. (2001) [208 - 0.7*Age] & Karvonen Target Reserve',
    zones,
  });
});

export default router;
