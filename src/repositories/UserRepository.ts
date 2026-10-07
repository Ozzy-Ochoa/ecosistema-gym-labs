import { IUserRepository } from './interfaces/IUserRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { UserIdentity, UserProfile, SavedUserAccount, RegisterUserData } from '../types/user';
import { authApi } from '../api/auth.api';

export class UserRepository implements IUserRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getIdentity(): UserIdentity {
    return this.localStore.getIdentity();
  }

  public async updateIdentity(updates: Partial<UserIdentity>): Promise<void> {
    this.localStore.updateIdentity(updates);
  }

  public getProfile(): UserProfile {
    return this.localStore.getProfile();
  }

  public async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    this.localStore.updateProfile(updates);
  }

  public getSavedAccounts(): SavedUserAccount[] {
    return this.localStore.getSavedAccounts();
  }

  public getActiveAccountId(): string {
    return this.localStore.getActiveAccountId();
  }

  public switchAccount(accountId: string): boolean {
    return this.localStore.switchAccount(accountId);
  }

  public async login(credentials: { email?: string; password?: string; pin?: string; accountId?: string }): Promise<{ success: boolean; error?: string }> {
    // 1. Executa login local para compatibilidade contínua
    const localResult = this.localStore.login(credentials);
    
    // 2. Se email e senha fornecidos, tenta autenticar no backend assincronamente (em segundo plano)
    if (credentials.email && credentials.password) {
      try {
        const remoteRes = await authApi.login({
          email: credentials.email,
          password: credentials.password,
          pin: credentials.pin,
        });
        if (remoteRes.success && remoteRes.data?.token) {
          // Token capturado no apiClient automaticamente
        }
      } catch {
        // Fallback local permanece ativo e transparente
      }
    }

    return localResult;
  }

  public async register(data: RegisterUserData): Promise<{ success: boolean; error?: string; account?: SavedUserAccount }> {
    // 1. Cria conta no armazenamento local
    const localResult = this.localStore.register(data);

    // 2. Tenta registrar no backend em segundo plano
    if (localResult.success) {
      try {
        await authApi.register(data);
      } catch {
        // Fallback local garante continuidade sem internet
      }
    }

    return localResult;
  }

  public async logout(): Promise<void> {
    this.localStore.logout();
    await authApi.logout();
  }
}
