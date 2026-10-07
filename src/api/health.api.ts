/**
 * GYM LABS — HEALTH & BIOMETRICS API CLIENT
 * 
 * Contrato de comunicação para biometria, composição corporal e circunferências.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';

export interface HealthRecordsResponse {
  bodyRecords: BodyCompositionRecord[];
  circumferences: CircumferenceRecord[];
}

export const healthApi = {
  getHealthRecords: async (): Promise<ApiResponse<HealthRecordsResponse>> => {
    return apiClient.get<HealthRecordsResponse>('/api/user/health');
  },

  logBodyRecord: async (record: BodyCompositionRecord): Promise<ApiResponse<{ record: BodyCompositionRecord }>> => {
    return apiClient.post<{ record: BodyCompositionRecord }>('/api/user/health/body', record);
  },

  logCircumference: async (record: CircumferenceRecord): Promise<ApiResponse<{ record: CircumferenceRecord }>> => {
    return apiClient.post<{ record: CircumferenceRecord }>('/api/user/health/circumference', record);
  },
};
