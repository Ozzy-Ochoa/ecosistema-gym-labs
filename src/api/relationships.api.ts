/**
 * GYM LABS — RELATIONSHIPS & INVITATIONS API CLIENT
 * 
 * Contrato de comunicação com /api/relationships.
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { ProfessionalRelationship, ProfessionalInvitation } from '../types/ecosystem';

export interface RelationshipsListResponse {
  relationships: ProfessionalRelationship[];
  invitations: ProfessionalInvitation[];
}

export const relationshipsApi = {
  getRelationships: async (): Promise<ApiResponse<RelationshipsListResponse>> => {
    return apiClient.get<RelationshipsListResponse>('/api/relationships');
  },

  createInvitation: async (payload: {
    targetEmail: string;
    targetName?: string;
    role: string;
    notes?: string;
  }): Promise<ApiResponse<{ invitation: ProfessionalInvitation }>> => {
    return apiClient.post<{ invitation: ProfessionalInvitation }>('/api/relationships/invitations', payload);
  },

  respondInvitation: async (payload: {
    invitationId: string;
    action: 'ACCEPT' | 'REJECT';
    rejectionReason?: string;
  }): Promise<ApiResponse<{ relationship?: ProfessionalRelationship }>> => {
    return apiClient.post<{ relationship?: ProfessionalRelationship }>('/api/relationships/invitations/respond', payload);
  },

  terminateRelationship: async (relationshipId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<{ success: boolean }>(`/api/relationships/${relationshipId}`, {
      headers: reason ? { 'X-Termination-Reason': reason } : undefined,
    });
  },
};
