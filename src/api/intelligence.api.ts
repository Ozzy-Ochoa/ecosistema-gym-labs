/**
 * GYM LABS — INTELLIGENCE (AI) API CLIENT
 * 
 * Contrato de comunicação com /api/intelligence/query.
 * NUNCA expõe a chave de API Gemini no client.
 * Envia o contexto fisiológico minimizado e recebe a síntese determinística ou neural.
 */

import { apiClient } from './apiClient';
import { ApiResponse, IntelligenceQueryRequest, IntelligenceQueryResponse } from '../types/api';

export const intelligenceApi = {
  query: async (payload: IntelligenceQueryRequest): Promise<ApiResponse<IntelligenceQueryResponse>> => {
    return apiClient.post<IntelligenceQueryResponse>('/api/intelligence/query', payload);
  },
};
