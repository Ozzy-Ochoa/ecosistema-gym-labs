export type VerificationStatus = 
  | 'VERIFIED' 
  | 'VERIFICATION_PENDING' 
  | 'NOT_VERIFIED' 
  | 'EXPIRED' 
  | 'SUSPENDED';

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
}

export interface ProfessionalProfile {
  id: string;
  name: string;
  title: string; // e.g. "Sports Scientist & CSCS Coach", "Clinical Exercise Physiologist"
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
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
