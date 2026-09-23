export type PermissionScope = 
  | 'TRAINING_READ'
  | 'TRAINING_WRITE'
  | 'BODY_READ'
  | 'BODY_WRITE'
  | 'NUTRITION_READ'
  | 'NUTRITION_WRITE'
  | 'SLEEP_READ'
  | 'RECOVERY_READ'
  | 'HEALTH_BIOMETRIC_READ'
  | 'PROFILE_READ';

export type ConsentScope = PermissionScope;

export interface ConsentGrant {
  id: string;
  grantorUserId: string;
  granteeId: string; // Professional ID or Organization ID
  granteeName: string;
  granteeType: 'PROFESSIONAL' | 'ORGANIZATION';
  scopes: PermissionScope[];
  purpose: string;
  grantedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  revokedAt?: string;
  revocationReason?: string;
}
