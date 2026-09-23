import { DataProvenance } from './provenance';

export type UserRole = 
  | 'USER' 
  | 'COACH' 
  | 'NUTRITIONIST' 
  | 'GYM'
  | 'ADMIN'
  | 'PROFESSIONAL' 
  | 'ORGANIZATION_ADMIN' 
  | 'STAFF' 
  | 'SYSTEM_ADMIN';

export type JurisdictionCode = 'US' | 'BR' | 'EU' | 'MX' | 'GLOBAL';

export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  preferredName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  biologicalSex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  jurisdiction: JurisdictionCode;
  language: 'en' | 'pt' | 'es';
  timezone: string;
  unitSystem: UnitSystem;
  role: UserRole;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  primaryGoal?: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'LONGEVITY' | 'MOBILITY';
  experienceYears: number;
  trainingDaysPerWeekTarget: number;
  dietaryRestrictions: string[];
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
  status: 'AVAILABLE' | 'LIMITED' | 'BETA';
}

export interface SavedUserAccount {
  id: string;
  name: string;
  email: string;
  preferredName?: string;
  role: UserRole;
  biologicalSex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  primaryGoal?: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'LONGEVITY' | 'MOBILITY';
  pin?: string;
  password?: string;
  lastActiveAt?: string;
  weightKg?: number;
  heightCm?: number;
  tagline?: string;
  isCurrent?: boolean;
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
  primaryGoal?: 'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'ENDURANCE' | 'LONGEVITY' | 'MOBILITY';
  jurisdiction?: JurisdictionCode;
  professionalLicense?: string; // CREF for Coach, CRN for Nutritionist, CNPJ for Gym
  organizationName?: string;
}


