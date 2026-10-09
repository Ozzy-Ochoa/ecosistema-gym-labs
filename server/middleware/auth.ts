import { Request, Response, NextFunction } from 'express';
import { SessionRepository } from '../repositories/SessionRepository';
import { RelationshipRepository } from '../repositories/RelationshipRepository';
import { db } from '../../src/db/index';
import { consents } from '../../src/db/schema';
import { and, eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    sessionId?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de autenticação ausente ou inválido',
      },
    });
  }

  const token = authHeader.substring(7).trim();

  // 1. Validação estrita no PostgreSQL (Sessão com hash, TTL e revogação em tempo real)
  try {
    const sessionData = await SessionRepository.validateSession(token);
    if (sessionData) {
      req.userId = sessionData.userId;
      req.user = { id: sessionData.userId, sessionId: sessionData.sessionId };
      return next();
    }
  } catch (err) {
    console.error('Session DB validation exception:', err);
    // Falha de forma segura sem conceder acesso em caso de indisponibilidade
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Falha na validação segura da sessão',
      },
    });
  }

  // Nenhuma sessão válida encontrada, expirada ou revogada: rejeição estrita (sem fallback permissivo)
  return res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Sessão expirada, inexistente ou revogada',
    },
  });
}

export type ResourceDomain = 'WORKOUT' | 'DIET' | 'BODY' | 'SLEEP' | 'HEALTH' | 'CHAT';

/**
 * Middleware para garantir isolamento multi-tenant estrito:
 * NUNCA confia cegamente em userId/studentId enviado pelo frontend.
 */
export function authorizeResource(domain: ResourceDomain) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const callerId = req.userId;
    if (!callerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      });
    }

    // Identificar o alvo solicitado
    const targetUserId =
      (req.params.userId as string) ||
      (req.query.studentId as string) ||
      (req.query.userId as string) ||
      (req.body.userId as string) ||
      (req.body.studentId as string) ||
      callerId;

    // Se o próprio usuário for o titular dos dados, acesso concedido
    if (callerId === targetUserId) {
      return next();
    }

    // Se tentar acessar dados de outro usuário, verificar relacionamento ativo
    try {
      const rel = await RelationshipRepository.getActiveRelationship(callerId, targetUserId);
      if (!rel) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado: nenhum relacionamento ativo entre os usuários',
          },
        });
      }

      // Verificar permissões específicas por domínio
      let hasDomainPermission = false;
      switch (domain) {
        case 'WORKOUT':
          hasDomainPermission = Boolean(rel.canViewWorkouts || rel.canPrescribeWorkouts);
          break;
        case 'DIET':
          hasDomainPermission = Boolean(rel.canViewDiet || rel.canPrescribeDiet);
          break;
        case 'BODY':
        case 'HEALTH':
          hasDomainPermission = Boolean(rel.canViewBodyMetrics);
          break;
        case 'SLEEP':
          hasDomainPermission = Boolean(rel.canViewHydrationSleep);
          break;
        case 'CHAT':
          hasDomainPermission = true;
          break;
        default:
          hasDomainPermission = false;
      }

      if (!hasDomainPermission) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Acesso negado: permissão para ${domain} não concedida no relacionamento`,
          },
        });
      }

      // Verificar Consentimento LGPD Ativo
      const activeConsents = await db
        .select()
        .from(consents)
        .where(
          and(
            eq(consents.userId, targetUserId),
            eq(consents.granteeId, callerId),
            eq(consents.status, 'ACTIVE')
          )
        )
        .limit(1);

      // Se houver consentimento explicitamente revogado, bloquear
      const revokedConsents = await db
        .select()
        .from(consents)
        .where(
          and(
            eq(consents.userId, targetUserId),
            eq(consents.granteeId, callerId),
            eq(consents.status, 'REVOKED')
          )
        )
        .limit(1);

      if (revokedConsents.length > 0 && activeConsents.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado: consentimento de dados revogado pelo titular (LGPD)',
          },
        });
      }

      return next();
    } catch (err: any) {
      console.error('Authorization check error:', err);
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Erro ao verificar autorização' },
      });
    }
  };
}
