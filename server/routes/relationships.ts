import { Router, Request, Response } from 'express';
import { getAuthenticatedUserId } from './auth';
import { readUserPartition, writeUserPartition } from '../database/db';

const router = Router();

// 1. List Relationships & Invitations
router.get('/', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  return res.json({
    relationships: partition.relationships || [],
    invitations: partition.invitations || [],
  });
});

// 2. Create Invitation
router.post('/invitations', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { targetEmail, targetName, role, notes } = req.body;
  if (!targetEmail) {
    return res.status(400).json({ error: 'targetEmail é obrigatório' });
  }

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const invitation = {
    id: `inv-${Date.now()}`,
    senderId: userId,
    senderName: partition.user.name,
    senderRole: partition.user.role,
    targetEmail,
    targetName: targetName || '',
    targetRole: role || 'COACH',
    code: `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    notes: notes || '',
  };

  if (!partition.invitations) partition.invitations = [];
  partition.invitations.unshift(invitation);
  writeUserPartition(userId, partition);

  return res.status(201).json({ invitation });
});

// 3. Respond Invitation (Accept/Reject)
router.post('/invitations/respond', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { invitationId, action, rejectionReason } = req.body;
  if (!invitationId || !action) {
    return res.status(400).json({ error: 'invitationId e action são obrigatórios' });
  }

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  if (!partition.invitations) partition.invitations = [];
  const inv = partition.invitations.find((i: any) => i.id === invitationId);

  if (inv) {
    inv.status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    inv.respondedAt = new Date().toISOString();
    if (rejectionReason) inv.rejectionReason = rejectionReason;

    let relationship = null;
    if (action === 'ACCEPT') {
      relationship = {
        id: `rel-${Date.now()}`,
        userId,
        userName: partition.user.name,
        userEmail: partition.user.email,
        professionalId: inv.senderId,
        professionalName: inv.senderName,
        professionalRole: inv.senderRole,
        status: 'ACTIVE',
        requestedAt: inv.createdAt,
        acceptedAt: new Date().toISOString(),
        permissions: {
          canViewWorkouts: true,
          canViewDiet: true,
          canViewBodyMetrics: true,
          canViewHydrationAndSleep: true,
          canPrescribeWorkouts: true,
          canPrescribeDiet: true,
        },
      };

      if (!partition.relationships) partition.relationships = [];
      partition.relationships.unshift(relationship);
    }

    writeUserPartition(userId, partition);
    return res.json({ success: true, relationship });
  }

  return res.status(404).json({ error: 'Convite não encontrado' });
});

// 4. Terminate Relationship
router.delete('/:id', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const relationshipId = req.params.id;
  const terminationReason = (req.headers['x-termination-reason'] as string) || 'Vínculo revogado pelo usuário';

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  if (partition.relationships) {
    const rel = partition.relationships.find((r: any) => r.id === relationshipId);
    if (rel) {
      rel.status = 'TERMINATED';
      rel.terminatedAt = new Date().toISOString();
      rel.terminationReason = terminationReason;
      writeUserPartition(userId, partition);
      return res.json({ success: true });
    }
  }

  return res.status(404).json({ error: 'Relacionamento não encontrado' });
});

export default router;
