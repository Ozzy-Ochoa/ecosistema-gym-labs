import { IRelationshipRepository } from './interfaces/IRelationshipRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { ProfessionalInvitation, HealthTeamMember } from '../types/ecosystem';
import { relationshipsApi } from '../api/relationships.api';

export class RelationshipRepository implements IRelationshipRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getHealthTeam(): HealthTeamMember[] {
    return this.localStore.getHealthTeamMembers();
  }

  public getInvitations(): ProfessionalInvitation[] {
    return this.localStore.getInvitations();
  }

  public async createInvitation(invitation: Omit<ProfessionalInvitation, 'id' | 'createdAt' | 'code' | 'status'>): Promise<void> {
    this.localStore.createInvitation(invitation);

    try {
      await relationshipsApi.createInvitation({
        targetEmail: invitation.targetEmail,
        targetName: invitation.targetName,
        role: invitation.targetRole || 'COACH',
        notes: invitation.notes,
      });
    } catch {
      // Local fallback preservado
    }
  }

  public async terminateRelationship(relationshipId: string, reason?: string): Promise<boolean> {
    const localResult = this.localStore.terminateRelationship(relationshipId, reason);

    try {
      await relationshipsApi.terminateRelationship(relationshipId, reason);
    } catch {
      // Local fallback preservado
    }

    return localResult;
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await relationshipsApi.getRelationships();
      return res.success;
    } catch {
      return false;
    }
  }
}
