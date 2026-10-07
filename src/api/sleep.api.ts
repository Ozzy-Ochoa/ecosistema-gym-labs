/**
 * GYM LABS — SLEEP & RECOVERY API CLIENT
 * 
 * Contrato de comunicação com /api/sleep.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { SleepSession } from '../types/recovery';

export interface SleepListResponse {
  sleepLogs: SleepSession[];
}

export interface SleepLogResponse {
  sleep: SleepSession;
}

export interface ReadinessScoreApiResponse {
  readinessScore: number;
  classification: 'ALTA' | 'MODERADA' | 'REDUZIDA';
  components: {
    sleepScore: number;
    autonomicScore: number;
    subjectiveRecoveryScore: number;
  };
  recommendation: string;
}

export const sleepApi = {
  getSleepLogs: async (): Promise<ApiResponse<SleepListResponse>> => {
    return apiClient.get<SleepListResponse>('/api/sleep');
  },

  logSleep: async (session: Partial<SleepSession>): Promise<ApiResponse<SleepLogResponse>> => {
    return apiClient.post<SleepLogResponse>('/api/sleep', session);
  },

  getReadinessScore: async (): Promise<ApiResponse<ReadinessScoreApiResponse>> => {
    return apiClient.get<ReadinessScoreApiResponse>('/api/sleep/readiness-score');
  },
};
