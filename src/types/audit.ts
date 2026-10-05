export type AuditEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'MFA_VERIFIED'
  | 'PROFILE_UPDATED'
  | 'PERMISSION_CHANGED'
  | 'RELATIONSHIP_INVITED'
  | 'RELATIONSHIP_ACCEPTED'
  | 'RELATIONSHIP_REJECTED'
  | 'RELATIONSHIP_TERMINATED'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_EXPORTED'
  | 'DATA_DELETED'
  | 'PROFESSIONAL_ACCESS_RECORD'
  | 'SECURITY_SCOPE_ESCALATION_PREVENTED'
  | 'CALCULATION_EXECUTED'
  | 'ADMIN_ACTION';

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
