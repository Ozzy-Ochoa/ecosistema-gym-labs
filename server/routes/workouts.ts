import { Router, Request, Response } from 'express';
import { requireAuth, authorizeResource, AuthenticatedRequest } from '../middleware/auth';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { RelationshipRepository } from '../repositories/RelationshipRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { validateWorkoutSessionInput } from '../validators/schemaValidators';

const router = Router();

// 1. Get Workout Sessions
router.get('/', requireAuth, authorizeResource('WORKOUT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const targetUserId = (req.query.studentId as string) || (req.query.userId as string) || callerId;

    const sessions = await WorkoutRepository.getSessions(targetUserId);

    return res.json({
      success: true,
      workouts: sessions,
    });
  } catch (err: any) {
    console.error('Error fetching workouts:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar treinos no banco relacional' },
    });
  }
});

// 2. Log Workout Session
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const validation = validateWorkoutSessionInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dados de sessão inválidos', details: validation.errors },
      });
    }

    const payload = req.body.workout && typeof req.body.workout === 'object' ? req.body.workout : req.body;
    const targetUserId = payload.studentId || payload.userId || callerId;

    // Se estiver prescrevendo para aluno, validar autorização multi-tenant no PostgreSQL
    if (targetUserId !== callerId) {
      const rel = await RelationshipRepository.getActiveRelationship(callerId, targetUserId);
      if (!rel || (!rel.canPrescribeWorkouts && !rel.canViewWorkouts)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado: permissão para prescrever treinos a este aluno inexistente no relacionamento ativo',
          },
        });
      }
    }

    const durationMinutes = Number(payload.durationMinutes) || 60;
    const sessionRpe = Number(payload.sessionRpe) || 8;
    // Foster Session-RPE Workload Units = Duration * RPE (Foster et al., 2001)
    const workloadUnits = durationMinutes * sessionRpe;

    const newSession = await WorkoutRepository.createSession({
      id: payload.id,
      userId: targetUserId,
      workoutId: payload.workoutId,
      title: payload.name || payload.title || 'Treino Concluído',
      startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
      endedAt: payload.completedAt || payload.endedAt ? new Date(payload.completedAt || payload.endedAt) : new Date(),
      durationMinutes,
      sessionRpe,
      workloadUnits,
      exercisesJson: payload.exercises || [],
      notes: payload.notes || '',
      provenanceType: payload.isDemo ? 'DEMO' : 'REAL',
    });

    await AuditRepository.logEvent(
      callerId,
      'DATA_CREATED',
      newSession.id,
      { targetUserId, durationMinutes, workloadUnits },
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.status(201).json({
      success: true,
      workout: newSession,
    });
  } catch (err: any) {
    console.error('Error logging workout:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao registrar treino no banco' },
    });
  }
});

// 3. Progressive Overload Engine (Determinístico, sem alucinações de IA)
router.get('/progressive-overload/:exerciseName', requireAuth, authorizeResource('WORKOUT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const targetUserId = (req.query.studentId as string) || (req.query.userId as string) || callerId;
    const targetExercise = decodeURIComponent(req.params.exerciseName).trim().toLowerCase();

    const sessions = await WorkoutRepository.getSessions(targetUserId);

    const occurrences: {
      workoutDate: string;
      sets: { loadKg: number; reps: number; rir: number; failed: boolean }[];
      maxLoad: number;
      totalTonnage: number;
      avgReps: number;
    }[] = [];

    for (const wkt of sessions) {
      const exercisesList = (wkt.exercisesJson as any[]) || [];
      const match = exercisesList.find((ex: any) => ex.name?.toLowerCase() === targetExercise);
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
          workoutDate: wkt.startedAt.toISOString(),
          sets: setsData,
          maxLoad,
          totalTonnage,
          avgReps: match.sets.length > 0 ? totalReps / match.sets.length : 0,
        });
      }
    }

    occurrences.sort((a, b) => new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime());

    if (occurrences.length < 2) {
      return res.json({
        success: true,
        exerciseName: req.params.exerciseName,
        status: 'DADOS INSUFICIENTES',
        message: 'Mínimo de 2 sessões registradas com o mesmo exercício é requerido para avaliar a sobrecarga progressiva com rigor.',
        confidence: 'INSUFICIENTES',
        occurrences,
      });
    }

    const prev = occurrences[occurrences.length - 2];
    const curr = occurrences[occurrences.length - 1];

    const deltaLoad = curr.maxLoad - prev.maxLoad;
    const deltaTonnage = curr.totalTonnage - prev.totalTonnage;
    const deltaReps = curr.avgReps - prev.avgReps;

    let progressionType = 'MANUTENCAO';
    let recommendations: string[] = [];

    if (deltaLoad > 0) {
      progressionType = 'CARGA_AUMENTADA';
      recommendations.push(`Aumento de carga detectado: +${deltaLoad.toFixed(1)}kg.`);
    } else if (deltaLoad === 0 && deltaReps > 0) {
      progressionType = 'REPETICOES_AUMENTADAS';
      recommendations.push(`Volume por repetições aumentado (+${deltaReps.toFixed(1)} reps/série).`);
    } else if (deltaTonnage > 0) {
      progressionType = 'TONELAGEM_AUMENTADA';
      recommendations.push(`Tonelagem total ampliada (+${deltaTonnage.toFixed(0)}kg total).`);
    } else {
      progressionType = 'REGRESSAO_OU_FADIGA';
      recommendations.push('Queda ou estagnação detectada. Avaliar recuperação, sono e sono HRV antes de forçar carga.');
    }

    return res.json({
      success: true,
      exerciseName: req.params.exerciseName,
      status: 'AVALIADO',
      progressionType,
      comparisons: {
        previousDate: prev.workoutDate,
        currentDate: curr.workoutDate,
        deltaLoadKg: deltaLoad,
        deltaTonnageKg: deltaTonnage,
        deltaAvgReps: deltaReps,
      },
      recommendations,
      occurrences,
    });
  } catch (err: any) {
    console.error('Overload engine error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro no motor de sobrecarga' },
    });
  }
});

// 4. Exercises Library
router.get('/exercises', requireAuth, async (req: Request, res: Response) => {
  try {
    const list = await WorkoutRepository.getExercises();
    return res.json({ success: true, exercises: list });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao listar exercícios' },
    });
  }
});

router.post('/exercises', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const { name, pattern, primaryMuscles, secondaryMuscles, equipment, evidenceNotes } = req.body;
    if (!name || !pattern || !primaryMuscles || !equipment) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios ausentes para criação de exercício' },
      });
    }

    const created = await WorkoutRepository.createExercise({
      name,
      pattern,
      primaryMuscles,
      secondaryMuscles,
      equipment,
      evidenceNotes,
      isStandard: false,
      createdByUserId: callerId,
    });

    return res.status(201).json({ success: true, exercise: created });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao cadastrar exercício personalizado' },
    });
  }
});

export default router;
