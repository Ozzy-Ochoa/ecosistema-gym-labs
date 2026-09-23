import { Router, Request, Response } from 'express';
import { getAuthenticatedUserId } from './auth';
import { readUserPartition, writeUserPartition, deleteUserPartition } from '../database/db';
import { logAuditEvent } from '../services/auditService';

const router = Router();

// 1. Get Athlete Profile
router.get('/profile', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const { passwordHash, recoveryKeyHash, twoFactorSecret, ...safeUser } = partition.user;
  return res.json({ user: safeUser });
});

// 2. LGPD: Export My Data (Portabilidade Integral)
router.get('/export', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  // Log audit event
  logAuditEvent(userId, 'DATA_EXPORT_LGPD', 'SUCCESS', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, { scope: 'FULL_TENANT_PORTABILITY' });

  // Completely sanitize sensitive security credentials before export
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    standard: 'LGPD_BR_ART_18_PORTABILITY',
    platform: 'Gym Labs Labcore 2026',
    athleteIdentity: {
      id: partition.user.id,
      email: partition.user.email,
      name: partition.user.name,
      role: partition.user.role,
      createdAt: partition.user.createdAt,
    },
    trainingTelemetry: partition.workouts || [],
    nutritionTelemetry: partition.nutrition || [],
    sleepTelemetry: partition.sleep || [],
    anthropometryTelemetry: partition.body || [],
    securityAuditTrail: partition.auditLogs || [],
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="gymlabs_export_${userId}.json"`);
  return res.json(exportPayload);
});

// 3. LGPD: Delete My Data (Direito ao Esquecimento / Expurgo Atômico)
router.delete('/delete-account', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // Log audit event before deletion
  logAuditEvent(userId, 'DATA_DELETION_LGPD', 'SUCCESS', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, { scope: 'ATOMIC_PURGE_RIGHT_TO_FORGET' });

  const success = deleteUserPartition(userId);
  if (!success) {
    return res.status(500).json({ error: 'Failed to purge partition' });
  }

  return res.json({
    message: 'User partition and all physiological telemetry permanently expunged in compliance with LGPD.',
    deletedAt: new Date().toISOString(),
  });
});

export default router;
