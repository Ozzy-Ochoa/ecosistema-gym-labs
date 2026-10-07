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
    try {
      const res = await relationshipsApi.createInvitation({
        targetEmail: invitation.targetEmail,
        targetName: invitation.targetName,
        role: invitation.targetRole || 'COACH',
        notes: invitation.notes,
      });

      if (res.success && res.data?.invitation) {
        const inv = res.data.invitation;
        this.localStore.createInvitation({
          senderId: invitation.senderId,
          senderName: invitation.senderName,
          senderRole: invitation.senderRole,
          targetEmail: inv.targetEmail,
          targetName: inv.targetName,
          targetRole: inv.targetRole,
          notes: inv.notes,
        });
        return;
      }
    } catch (err) {
      console.warn('[RelationshipRepository] API indisponível, registrando convite local:', err);
    }

    this.localStore.createInvitation(invitation);
  }

  public async terminateRelationship(relationshipId: string, reason?: string): Promise<boolean> {
    try {
      const res = await relationshipsApi.terminateRelationship(relationshipId, reason);
      if (res.success) {
        this.localStore.terminateRelationship(relationshipId, reason);
        return true;
      }
    } catch (err) {
      console.warn('[RelationshipRepository] API indisponível, encerrando relacionamento local:', err);
    }

    return this.localStore.terminateRelationship(relationshipId, reason);
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
