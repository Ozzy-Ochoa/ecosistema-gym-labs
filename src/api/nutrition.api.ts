/**
 * GYM LABS — NUTRITION API CLIENT
 * 
 * Contrato de comunicação com /api/nutrition.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { MealEntry } from '../types/nutrition';

export interface NutritionListResponse {
  nutritionLogs: MealEntry[];
}

export interface NutritionLogResponse {
  log: MealEntry;
}

export interface DynamicHydrationPayload {
  weightKg: number;
  ambientTempC?: number;
  trainingMinutes?: number;
  sweatRate?: 'LOW' | 'MODERATE' | 'HIGH';
  takingCreatine?: boolean;
}

export interface DynamicHydrationApiResponse {
  totalTargetMl: number;
  breakdown: {
    baselineMl: number;
    thermalMl: number;
    trainingMl: number;
    creatineAdjustmentMl: number;
  };
  protocol: string;
}

export const nutritionApi = {
  getNutritionLogs: async (): Promise<ApiResponse<NutritionListResponse>> => {
    return apiClient.get<NutritionListResponse>('/api/nutrition');
  },

  logMeal: async (meal: Partial<MealEntry>): Promise<ApiResponse<NutritionLogResponse>> => {
    return apiClient.post<NutritionLogResponse>('/api/nutrition', meal);
  },

  calculateDynamicHydration: async (payload: DynamicHydrationPayload): Promise<ApiResponse<DynamicHydrationApiResponse>> => {
    return apiClient.post<DynamicHydrationApiResponse>('/api/nutrition/dynamic-hydration', payload);
  },
};
