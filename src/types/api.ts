/**
 * GYM LABS — API & NETWORK CONTRACTS
 * 
 * Contratos padronizados de comunicação cliente-servidor, envelopes de resposta,
 * códigos de erro, paginação e estados do ciclo de vida das requisições.
 */

export type ApiStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'OFFLINE';

export type SyncStatus = 'SYNCED' | 'PENDING' | 'CONFLICT' | 'LOCAL_ONLY';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  status: number;
  timestamp: string;
  cached?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
  timestamp: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  skipAuth?: boolean;
  signal?: AbortSignal;
  cachePolicy?: 'network-only' | 'cache-first' | 'network-first';
}

export interface IntelligenceQueryRequest {
  question: string;
  domain?: 'performance_science' | 'nutrition' | 'recovery' | 'biomechanics' | 'general';
  athleteContext?: {
    age?: number;
    biologicalSex?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    bmr?: number;
    tdee?: number;
    recoveryScore?: number;
    acwr?: number;
    recentSessionsCount?: number;
  };
  language?: 'pt' | 'en' | 'es';
}

export interface IntelligenceQueryResponse {
  response: string;
  confidence: 'ALTA' | 'MEDIA' | 'ESTIMADA';
  citations: string[];
  limitations: string;
  disclaimer: string;
  model?: string;
  provenance: 'INTERPRETED' | 'DETERMINISTIC_RULES_ENGINE';
  timestamp: string;
  uncertaintyDeclared: boolean;
}
