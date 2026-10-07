import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { UserRepository } from '../repositories/UserRepository';
import { HealthRepository } from '../repositories/HealthRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { NutritionRepository } from '../repositories/NutritionRepository';
import { SleepRepository } from '../repositories/SleepRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { db } from '../../src/db/index';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// 1. Get Athlete Profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não localizado' },
      });
    }

    const profile = await UserRepository.getProfile(userId);
    const roles = await UserRepository.getUserRoles(userId);

    const { passwordHash, recoveryKeyHash, twoFactorSecret, ...safeUser } = user;

    return res.json({
      success: true,
      user: {
        ...safeUser,
        role: roles[0] || 'USER',
        profile,
      },
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar perfil do usuário' },
    });
  }
});

// 2. Update Profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { dateOfBirth, biologicalSex, weightKg, heightCm, activityLevel, primaryGoal, dietaryRestrictions } = req.body;

    const updatedProfile = await UserRepository.upsertProfile(userId, {
      dateOfBirth,
      biologicalSex,
      weightKg: weightKg ? Number(weightKg) : undefined,
      heightCm: heightCm ? Number(heightCm) : undefined,
      activityLevel,
      primaryGoal,
      dietaryRestrictions: dietaryRestrictions || [],
    });

    if (weightKg) {
      await HealthRepository.logBodyRecord({
        userId,
        weightKg: Number(weightKg),
        heightCm: heightCm ? Number(heightCm) : undefined,
      });
    }

    await AuditRepository.logEvent(
      userId,
      'DATA_UPDATED',
      `prf-${userId}`,
      { fields: Object.keys(req.body) },
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao atualizar perfil' },
    });
  }
});

// 3. Body Measurements Telemetry
router.get('/body', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const targetUserId = (req.query.studentId as string) || (req.query.userId as string) || callerId;

    const [bodyList, circList] = await Promise.all([
      HealthRepository.getBodyRecords(targetUserId),
      HealthRepository.getCircumferences(targetUserId),
    ]);

    return res.json({
      success: true,
      bodyRecords: bodyList,
      circumferences: circList,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar medições corporais' },
    });
  }
});

router.post('/body', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.userId!;
    const { weightKg, heightCm, bodyFatPct, skeletalMuscleKg, circumferences: circs, studentId } = req.body;
    const targetUserId = studentId || callerId;

    if (!weightKg) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'weightKg é obrigatório' },
      });
    }

    const record = await HealthRepository.logBodyRecord({
      userId: targetUserId,
      weightKg: Number(weightKg),
      heightCm: heightCm ? Number(heightCm) : undefined,
      bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
      skeletalMuscleKg: skeletalMuscleKg ? Number(skeletalMuscleKg) : undefined,
    });

    if (circs && typeof circs === 'object') {
      await HealthRepository.logCircumferences({
        userId: targetUserId,
        waistCm: circs.waistCm,
        hipCm: circs.hipCm,
        chestCm: circs.chestCm,
        armCm: circs.armCm,
        thighCm: circs.thighCm,
        calfCm: circs.calfCm,
      });
    }

    return res.status(201).json({
      success: true,
      record,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao salvar registro antropométrico' },
    });
  }
});

// 4. LGPD: Portabilidade Integral (Export My Data)
router.get('/export', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' },
      });
    }

    const [workouts, meals, sleep, body, auditLogs] = await Promise.all([
      WorkoutRepository.getSessions(userId),
      NutritionRepository.getMeals(userId),
      SleepRepository.getSessions(userId),
      HealthRepository.getBodyRecords(userId),
      AuditRepository.getEvents(userId, 500),
    ]);

    await AuditRepository.logEvent(userId, 'DATA_EXPORT_LGPD', userId, { scope: 'FULL_TENANT_PORTABILITY' }, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      standard: 'LGPD_BR_ART_18_PORTABILITY',
      platform: 'Gym Labs Labcore 2026',
      athleteIdentity: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      trainingTelemetry: workouts,
      nutritionTelemetry: meals,
      sleepTelemetry: sleep,
      anthropometryTelemetry: body,
      securityAuditTrail: auditLogs,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gymlabs_export_${userId}.json"`);
    return res.json(exportPayload);
  } catch (err: any) {
    console.error('Error exporting data:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Falha ao gerar arquivo de portabilidade LGPD' },
    });
  }
});

// 5. LGPD: Direito ao Esquecimento (Expurgo Atômico)
router.delete('/delete-account', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await AuditRepository.logEvent(userId, 'DATA_DELETION_LGPD', userId, { scope: 'ATOMIC_PURGE_RIGHT_TO_FORGET' }, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    // Expurgo no PostgreSQL (as constraints com onDelete: cascade eliminam registros vinculados)
    await db.delete(users).where(eq(users.id, userId));

    return res.json({
      success: true,
      message: 'Conta de usuário e telemetrias fisiológicas foram expurgadas permanentemente em conformidade com a LGPD.',
      deletedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error deleting account:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao expurgar conta no banco de dados' },
    });
  }
});

export default router;
