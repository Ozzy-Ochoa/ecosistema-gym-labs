/**
 * GYM LABS — AUTH API CLIENT
 * 
 * Contrato de comunicação com /api/auth.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { RegisterUserData } from '../types/user';

export interface AuthLoginPayload {
  email: string;
  password?: string;
  pin?: string;
}

export interface AuthLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isDemo?: boolean;
    twoFactorRequired?: boolean;
  };
}

export interface AuthRegisterResponse {
  token: string;
  recoveryKey: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isDemo?: boolean;
  };
}

export const authApi = {
  login: async (credentials: AuthLoginPayload): Promise<ApiResponse<AuthLoginResponse>> => {
    const res = await apiClient.post<AuthLoginResponse>('/api/auth/login', credentials, { skipAuth: true });
    if (res.success && res.data?.token) {
      apiClient.setAuthToken(res.data.token);
    }
    return res;
  },

  register: async (payload: RegisterUserData): Promise<ApiResponse<AuthRegisterResponse>> => {
    const res = await apiClient.post<AuthRegisterResponse>('/api/auth/register', payload, { skipAuth: true });
    if (res.success && res.data?.token) {
      apiClient.setAuthToken(res.data.token);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Ignora erro de rede em logout
    } finally {
      apiClient.clearAuthToken();
    }
  },

  setupPin: async (pin: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<{ success: boolean }>('/api/auth/pin/setup', { pin });
  },

  verifyPin: async (pin: string): Promise<ApiResponse<{ valid: boolean }>> => {
    return apiClient.post<{ valid: boolean }>('/api/auth/pin/verify', { pin });
  },

  getHealth: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/health', { skipAuth: true });
  },
};
