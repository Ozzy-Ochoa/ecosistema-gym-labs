import { AuditRepository } from '../repositories/AuditRepository';
import { readUserPartition, writeUserPartition } from '../database/db';

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_2FA_ENABLED'
  | 'AUTH_2FA_VERIFIED'
  | 'AUTH_PASSWORD_RESET'
  | 'DATA_EXPORT_LGPD'
  | 'DATA_DELETION_LGPD'
  | 'VAULT_ITEM_STORED'
  | 'VAULT_ITEM_ACCESSED'
  | 'SENSITIVE_MODIFICATION';

export interface AuditLogEntry {
  id: string;
  userId: string;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status?: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  metadata?: Record<string, any>;
}

/**
 * Registra evento de auditoria no PostgreSQL (Fonte Oficial e Imutável)
 */
export async function logAuditEvent(
  userId: string,
  eventType: AuditEventType,
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED',
  reqInfo: { ip?: string; userAgent?: string },
  metadata?: Record<string, any>
): Promise<void> {
  const safeDetails = {
    status,
    ...(metadata || {}),
  };

  // 1. Gravação oficial no PostgreSQL
  await AuditRepository.logEvent(
    userId,
    eventType,
    undefined,
    safeDetails,
    reqInfo
  );

  // 2. Cache local não-bloqueante apenas para compatibilidade
  try {
    const partition = readUserPartition(userId);
    if (partition) {
      if (!partition.auditLogs) partition.auditLogs = [];
      partition.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        userId,
        eventType,
        ipAddress: reqInfo?.ip || '127.0.0.1',
        userAgent: reqInfo?.userAgent || 'Labcore-Client',
        timestamp: new Date().toISOString(),
        status,
        metadata: AuditRepository.sanitizeDetails(safeDetails),
      });
      if (partition.auditLogs.length > 500) {
        partition.auditLogs = partition.auditLogs.slice(0, 500);
      }
      writeUserPartition(userId, partition);
    }
  } catch {}
}

/**
 * Consulta trilha de auditoria oficial do PostgreSQL
 */
export async function getUserAuditLogs(userId: string): Promise<AuditLogEntry[]> {
  try {
    const pgEvents = await AuditRepository.getEvents(userId, 500);
    return pgEvents.map((e) => ({
      id: e.id,
      userId: e.userId,
      eventType: e.eventType,
      timestamp: e.recordedAt.toISOString(),
      metadata: (e.detailsJson as any) || {},
    }));
  } catch {
    // Fallback de contingência caso o banco esteja indisponível
    const partition = readUserPartition(userId);
    return (partition?.auditLogs as any) || [];
  }
}
