/**
 * GYM LABS - SERVICE LAYER (Fundação Arquitetural)
 * 
 * Camada intermediária que desacopla a UI/Context da implementação de armazenamento.
 * Encapsula regras de negócio, persistência (GymLabsDataStore) e futuras chamadas de API/Database.
 */

import { GymLabsDataStore } from '../repositories/GymLabsDataStore';
import { UserIdentity, UserProfile, SavedUserAccount, RegisterUserData } from '../types/user';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';
import { Exercise, TrainingSession, DayAttendance, UserWorkoutRoutine } from '../types/training';
import { MealEntry, HydrationLog, FoodItem } from '../types/nutrition';
import { SleepSession, SubjectiveWellnessLog } from '../types/recovery';
import { ConsentGrant } from '../types/consent';
import { ProfessionalProfile } from '../types/professional';
import { Organization } from '../types/organization';
import { SystemNotification } from '../types/notification';
import { HealthTeamMember, InterProfessionalConsent, ChatMessage, ProfessionalInvitation } from '../types/ecosystem';
import { NutriPatient, NutriConsultation, NutriAssessment, NutriMealPlan, NutriFinanceTransaction, NutriLibraryItem } from '../types/nutri';
import { TrainerStudent, TrainerWorkoutPlan, TrainerAssessment, TrainerScheduleAppointment, TrainerFinanceTransaction } from '../types/trainer';
import { AuditRecord, AuditEventType } from '../types/audit';
import { UserRepository } from '../repositories/UserRepository';
import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { NutritionRepository } from '../repositories/NutritionRepository';
import { SleepRepository } from '../repositories/SleepRepository';
import { HealthRepository } from '../repositories/HealthRepository';
import { RelationshipRepository } from '../repositories/RelationshipRepository';
import { ChatRepository } from '../repositories/ChatRepository';
import { IntelligenceRepository } from '../repositories/IntelligenceRepository';
import { IntelligenceQueryRequest, IntelligenceQueryResponse } from '../types/api';

export class GymLabsService {
  private static instance: GymLabsService;
  private dataStore: GymLabsDataStore;

  // Repositórios desacoplados da persistência física
  public readonly users: UserRepository;
  public readonly workouts: WorkoutRepository;
  public readonly nutrition: NutritionRepository;
  public readonly sleep: SleepRepository;
  public readonly health: HealthRepository;
  public readonly relationships: RelationshipRepository;
  public readonly chat: ChatRepository;
  public readonly intelligence: IntelligenceRepository;

  private constructor() {
    this.dataStore = GymLabsDataStore.getInstance();
    this.users = new UserRepository(this.dataStore);
    this.workouts = new WorkoutRepository(this.dataStore);
    this.nutrition = new NutritionRepository(this.dataStore);
    this.sleep = new SleepRepository(this.dataStore);
    this.health = new HealthRepository(this.dataStore);
    this.relationships = new RelationshipRepository(this.dataStore);
    this.chat = new ChatRepository(this.dataStore);
    this.intelligence = new IntelligenceRepository();
  }

  public static getInstance(): GymLabsService {
    if (!GymLabsService.instance) {
      GymLabsService.instance = new GymLabsService();
    }
    return GymLabsService.instance;
  }

  // --- Operações Assíncronas & Sincronização Remota (Fase 02) ---
  public async queryIntelligence(request: IntelligenceQueryRequest): Promise<IntelligenceQueryResponse> {
    return this.intelligence.query(request);
  }

  public async syncAllRemote(): Promise<{ workouts: boolean; nutrition: boolean; sleep: boolean; relationships: boolean }> {
    const [workouts, nutrition, sleep, relationships] = await Promise.all([
      this.workouts.syncRemote(),
      this.nutrition.syncRemote(),
      this.sleep.syncRemote(),
      this.relationships.syncRemote(),
    ]);
    return { workouts, nutrition, sleep, relationships };
  }

  // --- Autenticação e Sessão ---
  public getIsAuthenticated(): boolean {
    return this.dataStore.getIsAuthenticated();
  }

  public setAuthenticated(val: boolean): void {
    this.dataStore.setAuthenticated(val);
  }

  public login(credentials: { email?: string; password?: string; pin?: string; accountId?: string }): { success: boolean; error?: string } {
    return this.dataStore.login(credentials);
  }

  public register(data: RegisterUserData): { success: boolean; error?: string; account?: SavedUserAccount } {
    return this.dataStore.register(data);
  }

  public logout(): void {
    this.dataStore.logout();
  }

  public getIsDemoMode(): boolean {
    return this.dataStore.getIsDemoMode();
  }

  public toggleDemoMode(): boolean {
    return this.dataStore.toggleDemoMode();
  }

  // --- Contas & Amostras de Teste ---
  public getSavedAccounts(): SavedUserAccount[] {
    return this.dataStore.getSavedAccounts();
  }

  public getActiveAccountId(): string {
    return this.dataStore.getActiveAccountId();
  }

  public switchAccount(accountId: string): boolean {
    return this.dataStore.switchAccount(accountId);
  }

  public addSavedAccount(account: SavedUserAccount): void {
    this.dataStore.addSavedAccount(account);
  }

  public removeSavedAccount(accountId: string): boolean {
    return this.dataStore.removeSavedAccount(accountId);
  }

  public quickAccessSampleAccount(roleOrId: string): { success: boolean; account: SavedUserAccount } {
    return this.dataStore.quickAccessSampleAccount(roleOrId);
  }

  // --- Identidade & Perfil ---
  public getIdentity(): UserIdentity {
    return this.dataStore.getIdentity();
  }

  public updateIdentity(updates: Partial<UserIdentity>): void {
    this.dataStore.updateIdentity(updates);
  }

  public updateAccountEmail(accountId: string, newEmail: string, currentPassword?: string): { success: boolean; error?: string } {
    return this.dataStore.updateAccountEmail(accountId, newEmail, currentPassword);
  }

  public getProfile(): UserProfile {
    return this.dataStore.getProfile();
  }

  public updateProfile(updates: Partial<UserProfile>): void {
    this.dataStore.updateProfile(updates);
  }

  // --- Biometria e Antropometria ---
  public getBodyRecords(): BodyCompositionRecord[] {
    return this.dataStore.getBodyRecords();
  }

  public addBodyRecord(record: BodyCompositionRecord): void {
    this.dataStore.addBodyRecord(record);
  }

  public getCircumferences(): CircumferenceRecord[] {
    return this.dataStore.getCircumferences();
  }

  public addCircumference(record: CircumferenceRecord): void {
    this.dataStore.addCircumference(record);
  }

  // --- Treinamento ---
  public getExercises(): Exercise[] {
    return this.dataStore.getExercises();
  }

  public addCustomExercise(exercise: Exercise): void {
    this.dataStore.addCustomExercise(exercise);
  }

  public getTrainingSessions(): TrainingSession[] {
    return this.dataStore.getTrainingSessions();
  }

  public addTrainingSession(session: TrainingSession): void {
    this.dataStore.addTrainingSession(session);
  }

  public getAttendanceLogs(): DayAttendance[] {
    return this.dataStore.getAttendanceLogs();
  }

  public setDayAttendance(attendance: DayAttendance): void {
    this.dataStore.setDayAttendance(attendance);
  }

  public getScheduledDaysOfWeek(): number[] {
    return this.dataStore.getScheduledDaysOfWeek();
  }

  public setScheduledDaysOfWeek(days: number[]): void {
    this.dataStore.setScheduledDaysOfWeek(days);
  }

  public getUserWorkoutRoutine(): UserWorkoutRoutine {
    return this.dataStore.getUserWorkoutRoutine();
  }

  public saveUserWorkoutRoutine(routine: UserWorkoutRoutine): void {
    this.dataStore.saveUserWorkoutRoutine(routine);
  }

  public resetToSuggestedRoutine(goal?: string, daysCount?: number): UserWorkoutRoutine {
    return this.dataStore.resetToSuggestedRoutine(goal, daysCount);
  }

  // --- Nutrição & Alimentos ---
  public getFoods(): FoodItem[] {
    return this.dataStore.getFoods();
  }

  public addFood(food: FoodItem): void {
    this.dataStore.addFood(food);
  }

  public getMeals(): MealEntry[] {
    return this.dataStore.getMeals();
  }

  public addMeal(meal: MealEntry): void {
    this.dataStore.addMeal(meal);
  }

  public getHydration(): HydrationLog[] {
    return this.dataStore.getHydration();
  }

  public logWater(ml: number): void {
    this.dataStore.logWater(ml);
  }

  // --- Sono e Recuperação ---
  public getSleepSessions(): SleepSession[] {
    return this.dataStore.getSleepSessions();
  }

  public addSleepSession(session: SleepSession): void {
    this.dataStore.addSleepSession(session);
  }

  public getWellnessLogs(): SubjectiveWellnessLog[] {
    return this.dataStore.getWellnessLogs();
  }

  public addWellnessLog(log: SubjectiveWellnessLog): void {
    this.dataStore.addWellnessLog(log);
  }

  // --- Ecossistema, Auditoria e Notificações ---
  public getConsents(): ConsentGrant[] {
    return this.dataStore.getConsents();
  }

  public grantConsent(grant: ConsentGrant): void {
    this.dataStore.grantConsent(grant);
  }

  public revokeConsent(grantId: string, reason: string): void {
    this.dataStore.revokeConsent(grantId, reason);
  }

  public getAuditLogs(): AuditRecord[] {
    return this.dataStore.getAuditLogs();
  }

  public logAudit(eventType: AuditEventType, resourceTarget: string, details: string): void {
    this.dataStore.logAudit(eventType, resourceTarget, details);
  }

  public exportUserDataJson(): string {
    return this.dataStore.exportUserDataJson();
  }

  public purgeAllUserData(): void {
    this.dataStore.purgeAllUserData();
  }

  public checkAndGenerateSystemNotifications(): void {
    this.dataStore.checkAndGenerateSystemNotifications();
  }

  public getNotifications(): SystemNotification[] {
    return this.dataStore.getNotifications();
  }

  public addNotification(notif: SystemNotification): void {
    this.dataStore.addNotification(notif);
  }

  public dismissNotificationPopup(id: string): void {
    this.dataStore.dismissNotificationPopup(id);
  }

  public markNotificationAsRead(id: string): void {
    this.dataStore.markNotificationAsRead(id);
  }

  public markAllNotificationsAsRead(): void {
    this.dataStore.markAllNotificationsAsRead();
  }

  public removeNotification(id: string): void {
    this.dataStore.removeNotification(id);
  }

  public clearAllNotifications(): void {
    this.dataStore.clearAllNotifications();
  }

  public getLastDataVerificationDate(): string {
    return this.dataStore.getLastDataVerificationDate();
  }

  public confirmDataCompatibility(updates?: {
    weightKg?: number;
    heightCm?: number;
    biologicalSex?: 'MALE' | 'FEMALE';
    activityLevel?: any;
  }): void {
    this.dataStore.confirmDataCompatibility(updates);
  }

  public triggerPeriodicCheckSimulation(): void {
    this.dataStore.triggerPeriodicCheckSimulation();
  }

  public getProfessionals(): ProfessionalProfile[] {
    return this.dataStore.getProfessionals();
  }

  public getOrganizations(): Organization[] {
    return this.dataStore.getOrganizations();
  }

  public getHealthTeamMembers(): HealthTeamMember[] {
    return this.dataStore.getHealthTeamMembers();
  }

  public saveHealthTeamMember(member: HealthTeamMember): void {
    this.dataStore.saveHealthTeamMember(member);
  }

  public removeHealthTeamMember(memberId: string): void {
    this.dataStore.removeHealthTeamMember(memberId);
  }

  public getInterProfessionalConsents(studentId?: string): InterProfessionalConsent[] {
    return this.dataStore.getInterProfessionalConsents(studentId);
  }

  public saveInterProfessionalConsent(consent: InterProfessionalConsent): void {
    this.dataStore.saveInterProfessionalConsent(consent);
  }

  public getChatMessages(conversationId?: string): ChatMessage[] {
    return this.dataStore.getChatMessages(conversationId);
  }

  public sendChatMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    return this.dataStore.sendChatMessage(messageData);
  }

  public markChatAsRead(conversationId: string, readerUserId: string): void {
    this.dataStore.markChatAsRead(conversationId, readerUserId);
  }

  public getInvitations(): ProfessionalInvitation[] {
    return this.dataStore.getInvitations();
  }

  public createInvitation(invitationData: Omit<ProfessionalInvitation, 'id' | 'createdAt' | 'code' | 'status'>): ProfessionalInvitation {
    return this.dataStore.createInvitation(invitationData);
  }

  public acceptInvitation(codeOrId: string, responder?: { id: string; name: string }): boolean {
    return this.dataStore.acceptInvitation(codeOrId, responder);
  }

  public rejectInvitation(codeOrId: string, reason?: string): boolean {
    return this.dataStore.rejectInvitation(codeOrId, reason);
  }

  public revokeInvitation(invitationId: string): boolean {
    return this.dataStore.revokeInvitation(invitationId);
  }

  public terminateRelationship(healthTeamMemberId: string, reason?: string): boolean {
    return this.dataStore.terminateRelationship(healthTeamMemberId, reason);
  }

  public getActivePrescribedMealPlanForStudent(studentId: string): NutriMealPlan | undefined {
    return this.dataStore.getActivePrescribedMealPlanForStudent(studentId);
  }

  public getActivePrescribedWorkoutPlanForStudent(studentId: string): TrainerWorkoutPlan | undefined {
    return this.dataStore.getActivePrescribedWorkoutPlanForStudent(studentId);
  }

  // --- Portais Profissionais: Trainer ---
  public getTrainerStudents(): TrainerStudent[] {
    return this.dataStore.getTrainerStudents();
  }

  public getTrainerStudentById(id: string): TrainerStudent | undefined {
    return this.dataStore.getTrainerStudentById(id);
  }

  public saveTrainerStudent(student: TrainerStudent): void {
    this.dataStore.saveTrainerStudent(student);
  }

  public deleteTrainerStudent(id: string): void {
    this.dataStore.deleteTrainerStudent(id);
  }

  public getTrainerWorkoutPlans(studentId?: string): TrainerWorkoutPlan[] {
    return this.dataStore.getTrainerWorkoutPlans(studentId);
  }

  public saveTrainerWorkoutPlan(plan: TrainerWorkoutPlan): void {
    this.dataStore.saveTrainerWorkoutPlan(plan);
  }

  public publishTrainerWorkoutPlan(id: string): void {
    this.dataStore.publishTrainerWorkoutPlan(id);
  }

  public getTrainerAssessments(studentId?: string): TrainerAssessment[] {
    return this.dataStore.getTrainerAssessments(studentId);
  }

  public saveTrainerAssessment(assessment: TrainerAssessment): void {
    this.dataStore.saveTrainerAssessment(assessment);
  }

  public getTrainerAppointments(studentId?: string): TrainerScheduleAppointment[] {
    return this.dataStore.getTrainerAppointments(studentId);
  }

  public saveTrainerAppointment(appointment: TrainerScheduleAppointment): void {
    this.dataStore.saveTrainerAppointment(appointment);
  }

  public getTrainerFinances(): TrainerFinanceTransaction[] {
    return this.dataStore.getTrainerFinances();
  }

  public saveTrainerFinance(transaction: TrainerFinanceTransaction): void {
    this.dataStore.saveTrainerFinance(transaction);
  }

  public deleteTrainerFinance(id: string): void {
    this.dataStore.deleteTrainerFinance(id);
  }

  // --- Portais Profissionais: Nutri ---
  public getNutriPatients(): NutriPatient[] {
    return this.dataStore.getNutriPatients();
  }

  public getNutriPatientById(id: string): NutriPatient | undefined {
    return this.dataStore.getNutriPatientById(id);
  }

  public saveNutriPatient(patient: NutriPatient): void {
    this.dataStore.saveNutriPatient(patient);
  }

  public deleteNutriPatient(id: string): void {
    this.dataStore.deleteNutriPatient(id);
  }

  public getNutriConsultations(patientId?: string): NutriConsultation[] {
    return this.dataStore.getNutriConsultations(patientId);
  }

  public saveNutriConsultation(consultation: NutriConsultation): void {
    this.dataStore.saveNutriConsultation(consultation);
  }

  public getNutriAssessments(patientId?: string): NutriAssessment[] {
    return this.dataStore.getNutriAssessments(patientId);
  }

  public saveNutriAssessment(assessment: NutriAssessment): void {
    this.dataStore.saveNutriAssessment(assessment);
  }

  public getNutriMealPlans(patientId?: string): NutriMealPlan[] {
    return this.dataStore.getNutriMealPlans(patientId);
  }

  public saveNutriMealPlan(plan: NutriMealPlan): void {
    this.dataStore.saveNutriMealPlan(plan);
  }

  public publishNutriMealPlan(id: string): void {
    this.dataStore.publishNutriMealPlan(id);
  }

  public getNutriFinances(): NutriFinanceTransaction[] {
    return this.dataStore.getNutriFinances();
  }

  public saveNutriFinance(transaction: NutriFinanceTransaction): void {
    this.dataStore.saveNutriFinance(transaction);
  }

  public deleteNutriFinance(id: string): void {
    this.dataStore.deleteNutriFinance(id);
  }

  public getNutriLibrary(): NutriLibraryItem[] {
    return this.dataStore.getNutriLibrary();
  }

  public saveNutriLibraryItem(item: NutriLibraryItem): void {
    this.dataStore.saveNutriLibraryItem(item);
  }
}
