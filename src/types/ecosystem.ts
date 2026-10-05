export interface HealthTeamMember {
  id: string;
  professionalId: string;
  name: string;
  role: 'COACH' | 'NUTRITIONIST' | 'GYM';
  credentialNumber: string; // e.g. CREF or CRN
  avatarUrl?: string;
  email: string;
  phone: string;
  specialty: string;
  connectedSince: string;
  status: 'ACTIVE' | 'PENDING' | 'DISCONNECTED';
  permissions: {
    canViewWorkouts: boolean;
    canViewDiet: boolean;
    canViewBodyMetrics: boolean;
    canViewHydrationAndSleep: boolean;
    canShareWithOtherProfessionals: boolean;
  };
}

export interface InterProfessionalConsent {
  id: string;
  studentId: string;
  studentName: string;
  coachId: string;
  coachName: string;
  nutriId: string;
  nutriName: string;
  shareMealPlanWithCoach: boolean;
  shareWorkoutLoadWithNutri: boolean;
  shareBodyComposition: boolean;
  shareClinicalNotes: boolean;
  grantedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM' | 'ADMIN';
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
  read: boolean;
  attachmentName?: string;
  attachmentType?: 'IMAGE' | 'EXAM_PDF' | 'MEAL_PLAN' | 'WORKOUT_PLAN';
}

export type RelationshipStatus = 
  | 'PENDING'       // Convite/solicitação enviada aguardando ação
  | 'ACCEPTED'      // Aprovado e ativo
  | 'REJECTED'      // Recusado
  | 'TERMINATED'    // Vínculo encerrado formalmente
  | 'REVOKED'       // Cancelado pelo emissor antes do aceite
  | 'EXPIRED';      // Expirado por decurso de prazo

export interface ProfessionalInvitation {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM';
  targetEmail: string;
  targetName?: string;
  targetRole?: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM';
  code: string;
  status: RelationshipStatus;
  createdAt: string;
  acceptedAt?: string;
  respondedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface EcosystemRelationshipRecord {
  id: string;
  invitationId?: string;
  partyAId: string;
  partyAName: string;
  partyARole: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM';
  partyBId: string;
  partyBName: string;
  partyBRole: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM';
  status: 'ACTIVE' | 'PENDING' | 'TERMINATED' | 'REJECTED';
  startedAt: string;
  terminatedAt?: string;
  terminationReason?: string;
  scope: {
    canViewWorkouts?: boolean;
    canViewDiet?: boolean;
    canViewBodyMetrics?: boolean;
    canViewHydrationAndSleep?: boolean;
    canPrescribeWorkouts?: boolean;
    canPrescribeDiet?: boolean;
  };
  provenance: {
    type: 'REAL' | 'DEMO';
    recordedAt: string;
  };
}
