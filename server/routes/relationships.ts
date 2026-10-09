import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { RelationshipRepository } from '../repositories/RelationshipRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AuditRepository } from '../repositories/AuditRepository';

const router = Router();

// 1. List Relationships & Invitations
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await UserRepository.findById(userId);

    const [rels, invs, csts] = await Promise.all([
      RelationshipRepository.getRelationships(userId),
      RelationshipRepository.getInvitations(userId, user?.email),
      RelationshipRepository.getConsents(userId),
    ]);

    return res.json({
      success: true,
      relationships: rels,
      invitations: invs,
      consents: csts,
    });
  } catch (err: any) {
    console.error('Error fetching relationships:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao buscar relacionamentos no banco relacional' },
    });
  }
});

// 2. Create Invitation
router.post('/invitations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { targetEmail, targetName, role, notes } = req.body;

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'targetEmail é obrigatório' },
      });
    }

    const invitation = await RelationshipRepository.createInvitation({
      senderId: userId,
      targetEmail,
      targetName,
      targetRole: role || 'COACH',
      notes,
    });

    await AuditRepository.logEvent(
      userId,
      'RELATIONSHIP_INVITED',
      invitation.id,
      { targetEmail, role: role || 'COACH', code: invitation.code },
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.status(201).json({
      success: true,
      invitation,
    });
  } catch (err: any) {
    console.error('Error creating invitation:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao criar convite no banco de dados' },
    });
  }
});

// 3. Respond Invitation (Accept/Reject with ACID Transaction)
router.post('/invitations/respond', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { code, invitationId, action, rejectionReason } = req.body;

    const inviteCode = code || invitationId;
    if (!inviteCode || !action) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Código do convite (code) e ação (action) são obrigatórios' },
      });
    }

    if (action.toUpperCase() === 'ACCEPT') {
      const result = await RelationshipRepository.acceptInvitation(inviteCode, userId);

      await AuditRepository.logEvent(
        userId,
        'RELATIONSHIP_ACCEPTED',
        result.relationshipId,
        { code: inviteCode },
        { ip: req.ip, userAgent: req.headers['user-agent'] as string }
      );

      return res.json({
        success: true,
        message: 'Convite aceito com sucesso e vínculo estabelecido',
        relationshipId: result.relationshipId,
        invitation: result.invitation,
      });
    } else {
      await RelationshipRepository.rejectInvitation(inviteCode, userId);

      await AuditRepository.logEvent(
        userId,
        'RELATIONSHIP_REJECTED',
        inviteCode,
        { reason: rejectionReason || 'Rejeitado pelo destinatário' },
        { ip: req.ip, userAgent: req.headers['user-agent'] as string }
      );

      return res.json({
        success: true,
        message: 'Convite rejeitado',
      });
    }
  } catch (err: any) {
    console.error('Error responding invitation:', err);
    const isValidation = err.message.includes('inválido') || err.message.includes('processado') || err.message.includes('outro endereço');
    return res.status(isValidation ? 400 : 500).json({
      success: false,
      error: {
        code: isValidation ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
        message: err.message || 'Falha ao processar resposta ao convite',
      },
    });
  }
});

// 4. Terminate Relationship (Soft Delete com Histórico)
router.post('/terminate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { relationshipId, reason } = req.body;

    if (!relationshipId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'relationshipId é obrigatório' },
      });
    }

    const result = await RelationshipRepository.terminateRelationship(
      relationshipId,
      userId,
      reason || 'Encerramento solicitado pelo usuário'
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Relacionamento não encontrado' },
      });
    }

    await AuditRepository.logEvent(
      userId,
      'RELATIONSHIP_TERMINATED',
      relationshipId,
      { reason },
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.json({
      success: true,
      message: 'Vínculo encerrado com sucesso (status TERMINATED preservado no histórico)',
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN_NOT_PARTY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Acesso negado: você não é participante deste relacionamento' },
      });
    }
    console.error('Error terminating relationship:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao encerrar relacionamento' },
    });
  }
});

// 5. Revoke LGPD Consent
router.post('/consents/revoke', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { consentId } = req.body;

    if (!consentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'consentId é obrigatório' },
      });
    }

    const result = await RelationshipRepository.revokeConsent(consentId, userId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consentimento não encontrado' },
      });
    }

    await AuditRepository.logEvent(
      userId,
      'CONSENT_REVOKED',
      consentId,
      {},
      { ip: req.ip, userAgent: req.headers['user-agent'] as string }
    );

    return res.json({
      success: true,
      message: 'Consentimento revogado com sucesso. Acesso bloqueado imediatamente.',
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN_NOT_PARTY') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Acesso negado: você não é titular nem beneficiário deste consentimento' },
      });
    }
    console.error('Error revoking consent:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao revogar consentimento' },
    });
  }
});

export default router;
