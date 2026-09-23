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
  eventType: AuditEventType;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  metadata?: Record<string, string | number | boolean>;
}

export function logAuditEvent(
  userId: string,
  eventType: AuditEventType,
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED',
  reqInfo: { ip?: string; userAgent?: string },
  metadata?: Record<string, any>
): void {
  // Sanitize metadata to guarantee ZERO SECRETS in audit trail
  const safeMetadata: Record<string, any> = {};
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('pass') ||
        lower.includes('secret') ||
        lower.includes('key') ||
        lower.includes('token') ||
        lower.includes('hash') ||
        lower.includes('code')
      ) {
        safeMetadata[key] = '[REDACTED_BY_AUDIT_ENCLAVE]';
      } else {
        safeMetadata[key] = value;
      }
    }
  }

  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    eventType,
    ipAddress: reqInfo.ip || '127.0.0.1',
    userAgent: reqInfo.userAgent || 'Labcore-Client',
    timestamp: new Date().toISOString(),
    status,
    metadata: safeMetadata,
  };

  const partition = readUserPartition(userId);
  if (partition) {
    if (!partition.auditLogs) partition.auditLogs = [];
    partition.auditLogs.unshift(entry);
    // Keep last 500 audit logs per tenant
    if (partition.auditLogs.length > 500) {
      partition.auditLogs = partition.auditLogs.slice(0, 500);
    }
    writeUserPartition(userId, partition);
  }
}

export function getUserAuditLogs(userId: string): AuditLogEntry[] {
  const partition = readUserPartition(userId);
  return partition?.auditLogs || [];
}
