import { DataProvenance } from './provenance';

export type UserRole = 
  | 'USER' 
  | 'COACH' 
  | 'NUTRITIONIST' 
  | 'GYM'
  | 'ADMIN';

export type ExtendedUserRole =
  | 'USER'
  | 'PERSONAL_TRAINER'
  | 'NUTRITIONIST'
  | 'ACADEMY_ADMIN'
  | 'ACADEMY_STAFF'
  | 'SUPPORT'
  | 'ADMIN'
  | 'COACH'
  | 'GYM'
  | 'ATHLETE';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'ARCHIVED';

export type JurisdictionCode = 'BR' | 'US' | 'EU' | 'MX' | 'GLOBAL';

export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  preferredName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  biologicalSex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  jurisdiction: JurisdictionCode;
  country?: string;
  language: 'pt' | 'en' | 'es';
  timezone: string;
  unitSystem: UnitSystem;
  role: UserRole;
  roles?: ExtendedUserRole[];
  permissions?: string[];
  status?: UserStatus;
  isDemo?: boolean;
  createdAt: string;
  weightKg?: number;
  heightCm?: number;
}

export interface UserProfile {
  userId: string;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  primaryGoal?: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'LONGEVITY' | 'MOBILITY';
  experienceYears?: number;
  trainingDaysPerWeekTarget?: number;
  dietaryRestrictions?: string[];
  provenance: DataProvenance;
}

export interface CountryConfiguration {
  code: JurisdictionCode;
  name: string;
  currency: string;
  privacyRegime: 'GDPR' | 'LGPD' | 'HIPAA_CCPA' | 'NOM_024';
  healthDataClassification: 'SENSITIVE_PROTECTED' | 'SPECIAL_CATEGORY';
  unitsDefault: UnitSystem;
  taxRegistrationSupported: boolean;
  status: 'AVAILABLE' | 'LIMITED' | 'BETA' | 'FUTURE' | 'NOT_AVAILABLE' | 'COMING_SOON';
}

export interface SavedUserAccount {
  id: string;
  name: string;
  email: string;
  preferredName?: string;
  role: UserRole;
  isDemo?: boolean;
  biologicalSex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  dateOfBirth?: string;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  primaryGoal?: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'LONGEVITY' | 'MOBILITY';
  pin?: string;
  password?: string;
  lastActiveAt?: string;
  weightKg?: number;
  heightCm?: number;
  tagline?: string;
  isCurrent?: boolean;
  createdAt?: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password?: string;
  pin?: string;
  role: UserRole;
  biologicalSex?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  primaryGoal?: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'LONGEVITY' | 'MOBILITY';
  measurements?: {
    waistCm?: number;
    hipCm?: number;
    chestCm?: number;
    armCm?: number;
    thighCm?: number;
    neckCm?: number;
  };
  jurisdiction?: JurisdictionCode;
  professionalLicense?: string; // CREF for Coach, CRN for Nutritionist, CNPJ for Gym
  organizationName?: string;
}


