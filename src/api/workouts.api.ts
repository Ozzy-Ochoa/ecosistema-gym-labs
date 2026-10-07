/**
 * GYM LABS — WORKOUTS API CLIENT
 * 
 * Contrato de comunicação com /api/workouts.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { TrainingSession } from '../types/training';

export interface WorkoutsListResponse {
  workouts: TrainingSession[];
}

export interface WorkoutLogResponse {
  workout: TrainingSession;
}

export interface ProgressiveOverloadResponse {
  exerciseName: string;
  hasSufficientData: boolean;
  history: Array<{
    date: string;
    maxWeightKg: number;
    totalReps: number;
    estimated1RM: number;
  }>;
  progressionTrendPct: number;
  message?: string;
}

export const workoutsApi = {
  getWorkouts: async (): Promise<ApiResponse<WorkoutsListResponse>> => {
    return apiClient.get<WorkoutsListResponse>('/api/workouts');
  },

  logWorkout: async (workout: Partial<TrainingSession>): Promise<ApiResponse<WorkoutLogResponse>> => {
    return apiClient.post<WorkoutLogResponse>('/api/workouts', workout);
  },

  getProgressiveOverload: async (exerciseName: string): Promise<ApiResponse<ProgressiveOverloadResponse>> => {
    const encoded = encodeURIComponent(exerciseName);
    return apiClient.get<ProgressiveOverloadResponse>(`/api/workouts/progressive-overload/${encoded}`);
  },

  getExercises: async (): Promise<ApiResponse<{ exercises: any[] }>> => {
    return apiClient.get<{ exercises: any[] }>('/api/workouts/exercises');
  },

  addCustomExercise: async (exercise: any): Promise<ApiResponse<{ exercise: any }>> => {
    return apiClient.post<{ exercise: any }>('/api/workouts/exercises', exercise);
  },
};
