/**
 * GYM LABS — CHAT API CLIENT
 * 
 * Contrato de comunicação com /api/chat.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { ChatMessage, Conversation } from '../types/ecosystem';

export interface ChatSyncResponse {
  conversations: Conversation[];
  messages: ChatMessage[];
}

export const chatApi = {
  getMessages: async (conversationId?: string): Promise<ApiResponse<ChatSyncResponse>> => {
    const url = conversationId ? `/api/chat?conversationId=${encodeURIComponent(conversationId)}` : '/api/chat';
    return apiClient.get<ChatSyncResponse>(url);
  },

  sendMessage: async (message: Partial<ChatMessage>): Promise<ApiResponse<{ message: ChatMessage }>> => {
    return apiClient.post<{ message: ChatMessage }>('/api/chat/messages', message);
  },

  markAsRead: async (conversationId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch<{ success: boolean }>(`/api/chat/conversations/${encodeURIComponent(conversationId)}/read`);
  },
};
