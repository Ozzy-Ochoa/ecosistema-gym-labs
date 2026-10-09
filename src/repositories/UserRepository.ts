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
    // 1. Prioriza autenticação no PostgreSQL via REST API (Fonte Oficial)
    if (credentials.email && credentials.password) {
      try {
        const remoteRes = await authApi.login({
          email: credentials.email,
          password: credentials.password,
          pin: credentials.pin,
        });

        if (remoteRes.success && (remoteRes.data?.token || (remoteRes.data as any)?.sessionToken)) {
          // Token capturado no apiClient automaticamente
          // Atualiza cache local sincronizado
          const user = remoteRes.data.user;
          if (user) {
            this.localStore.updateIdentity({
              id: user.id,
              email: user.email,
              name: user.name,
              role: (user.role as any) || 'USER',
              isDemo: Boolean(user.isDemo),
            });
          }
          return { success: true };
        } else if (remoteRes.error) {
          // Se for erro de credencial, verifica se é conta DEMO local permitida
          const localCheck = this.localStore.login(credentials);
          if (localCheck.success && this.localStore.getIdentity().isDemo) {
            return localCheck;
          }
          const errMsg = typeof remoteRes.error === 'string' ? remoteRes.error : (remoteRes.error as any)?.message || 'Credenciais inválidas';
          return { success: false, error: errMsg };
        }
      } catch (err) {
        console.warn('[UserRepository] Falha ao comunicar com backend, recorrendo ao cache local/DEMO:', err);
      }
    }

    // 2. Fallback Offline / DEMO Data Store
    return this.localStore.login(credentials);
  }

  public async register(data: RegisterUserData): Promise<{ success: boolean; error?: string; account?: SavedUserAccount }> {
    // 1. Criação no PostgreSQL via REST API (Fonte Oficial da Verdade)
    try {
      const remoteRes = await authApi.register(data);
      if (remoteRes.success && remoteRes.data) {
        // Atualiza cache local para continuidade off-line
        const localResult = this.localStore.register(data);
        return localResult;
      } else if (remoteRes.error) {
        const errMsg = typeof remoteRes.error === 'string' ? remoteRes.error : (remoteRes.error as any)?.message || 'Falha ao registrar conta';
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.warn('[UserRepository] Backend offline, registrando no cache local:', err);
    }

    // 2. Fallback offline
    return this.localStore.register(data);
  }

  public async logout(): Promise<void> {
    this.localStore.logout();
    await authApi.logout();
  }
}
