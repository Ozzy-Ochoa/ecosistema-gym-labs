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

export interface ProfessionalInvitation {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'COACH' | 'NUTRITIONIST';
  targetEmail: string;
  targetName?: string;
  code: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  acceptedAt?: string;
}
