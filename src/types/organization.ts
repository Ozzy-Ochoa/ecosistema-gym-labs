export interface OrganizationLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'COMMERCIAL_GYM' | 'PERFORMANCE_STUDIO' | 'CLINICAL_CENTER' | 'UNIVERSITY_ATHLETICS';
  country: string;
  locations: OrganizationLocation[];
  memberCount: number;
  trainerCount: number;
  complianceTier: 'ENTERPRISE_SECURE' | 'STUDIO_PRO';
  isolatedTenantDatabaseId: string;
}
