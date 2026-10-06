export type VerificationStatus = 
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED' 
  | 'VERIFICATION_PENDING' 
  | 'REJECTED'
  | 'NOT_VERIFIED' 
  | 'EXPIRED' 
  | 'SUSPENDED';

export type VerificationEnvironment =
  | 'DEMO_SIMULATION'
  | 'OFFICIAL_REGISTRY'
  | 'MANUAL_AUDIT'
  | 'UNVERIFIED';

export interface ProfessionalCredential {
  id: string;
  type: 'STATE_LICENSE' | 'BOARD_CERTIFICATION' | 'ACADEMIC_DEGREE' | 'ACCREDITED_CERT';
  title: string;
  issuingBody: string;
  credentialNumber: string;
  jurisdiction: string;
  issuedDate: string;
  expirationDate?: string;
  verificationSource: string;
  verificationTimestamp?: string;
  verificationEnvironment?: VerificationEnvironment;
}

export interface ProfessionalProfile {
  id: string;
  name: string;
  title: string; // e.g. "Sports Scientist & CSCS Coach", "Clinical Exercise Physiologist"
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  verificationEnvironment?: VerificationEnvironment;
  isDemo?: boolean;
  credentials: ProfessionalCredential[];
  specialties: string[];
  activeClientsCount: number;
  country: string;
  bio: string;
  servicesOffered: {
    id: string;
    title: string;
    description: string;
    scopeRequirements: string[];
  }[];
}
