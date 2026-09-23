export type AuditEventType = 
  | 'LOGIN_SUCCESS'
  | 'MFA_VERIFIED'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_EXPORTED'
  | 'DATA_DELETED'
  | 'PROFESSIONAL_ACCESS_RECORD'
  | 'SECURITY_SCOPE_ESCALATION_PREVENTED'
  | 'CALCULATION_EXECUTED';

export interface AuditRecord {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId: string;
  actor: string;
  ipAddress: string | 'UNAVAILABLE';
  resourceTarget: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'SECURITY_FLAG';
}
