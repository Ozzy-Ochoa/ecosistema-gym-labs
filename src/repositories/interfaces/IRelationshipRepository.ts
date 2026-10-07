import { ProfessionalInvitation, HealthTeamMember } from '../../types/ecosystem';

export interface IRelationshipRepository {
  getHealthTeam(): HealthTeamMember[];
  getInvitations(): ProfessionalInvitation[];
  createInvitation(invitation: Omit<ProfessionalInvitation, 'id' | 'createdAt' | 'code' | 'status'>): Promise<void>;
  terminateRelationship(relationshipId: string, reason?: string): Promise<boolean>;
  syncRemote(): Promise<boolean>;
}
