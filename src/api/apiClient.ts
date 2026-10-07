/**
 * GYM LABS — CENTRALIZED API CLIENT (FASE 02)
 * 
 * Cliente HTTP padronizado responsável por todas as requisições à API REST do backend.
 * Encapsula:
 * - Injeção de cabeçalhos e autenticação (Bearer Token)
 * - Timeout determinístico configurável (AbortController)
 * - Detecção automática de status OFFLINE (rede indisponível)
 * - Serialização/desserialização JSON segura
 * - Envelopamento uniforme em ApiResponse<T> e ApiError
 */

import { ApiResponse, ApiError, RequestOptions, ApiStatus } from '../types/api';

const DEFAULT_TIMEOUT_MS = 10000;
const AUTH_TOKEN_STORAGE_KEY = 'gymlabs_auth_token_v1';

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private currentToken: string | null = null;
  private statusListeners: Array<(status: ApiStatus) => void> = [];
  private currentStatus: ApiStatus = 'IDLE';

  private constructor() {
    // URL relativa padrão aproveita a mesma origem (dev server Express ou proxy)
    this.baseUrl = '';
    // Inicializa token da memória/armazenamento local se existente
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.currentToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch {
      this.currentToken = null;
    }
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // --- Gerenciamento de Sessão e Token ---
  public setAuthToken(token: string | null): void {
    this.currentToken = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) {
          localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
        } else {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }
      }
    } catch {
      // Ignora falhas de quota ou restrições de sandbox
    }
  }

  public getAuthToken(): string | null {
    return this.currentToken;
  }

  public clearAuthToken(): void {
    this.setAuthToken(null);
  }

  // --- Observabilidade de Status ---
  public getStatus(): ApiStatus {
    return this.currentStatus;
  }

  public onStatusChange(listener: (status: ApiStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus(status: ApiStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((l) => {
      try {
        l(status);
      } catch {
        // Safe listener failure
      }
    });
  }

  // --- Método Central de Execução ---
  public async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const timestamp = new Date().toISOString();

    // 1. Checagem prévia de conectividade
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.notifyStatus('OFFLINE');
      return {
        success: false,
        status: 0,
        error: 'Conexão indisponível (dispositivo offline)',
        code: 'NETWORK_OFFLINE',
        timestamp,
      };
    }

    this.notifyStatus('LOADING');

    // 2. Montagem de Headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (!options.skipAuth && this.currentToken) {
      headers['Authorization'] = `Bearer ${this.currentToken}`;
    }

    // 3. Montagem do AbortController / Timeout
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const fullUrl = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let parsedData: any = null;

      if (contentType.includes('application/json')) {
        try {
          parsedData = await response.json();
        } catch {
          parsedData = null;
        }
      } else {
        parsedData = await response.text();
      }

      if (!response.ok) {
        this.notifyStatus('ERROR');
        const errorMessage = (parsedData && (parsedData.error || parsedData.message)) || `HTTP ${response.status} ${response.statusText}`;
        return {
          success: false,
          status: response.status,
          error: errorMessage,
          code: parsedData?.code || `HTTP_${response.status}`,
          data: parsedData,
          timestamp,
        };
      }

      this.notifyStatus('SUCCESS');
      return {
        success: true,
        status: response.status,
        data: parsedData as T,
        timestamp,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        this.notifyStatus('ERROR');
        return {
          success: false,
          status: 408,
          error: `Tempo limite de requisição excedido (${timeoutMs}ms)`,
          code: 'TIMEOUT',
          timestamp,
        };
      }

      this.notifyStatus('OFFLINE');
      return {
        success: false,
        status: 0,
        error: err.message || 'Falha de comunicação com o servidor',
        code: 'NETWORK_FAILURE',
        timestamp,
      };
    }
  }

  // --- Atalhos Semânticos ---
  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, options);
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, options);
  }

  public patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, options);
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}

export const apiClient = ApiClient.getInstance();
