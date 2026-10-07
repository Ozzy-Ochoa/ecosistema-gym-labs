import { UserIdentity, UserProfile, SavedUserAccount, RegisterUserData } from '../../types/user';

export interface IUserRepository {
  getIdentity(): UserIdentity;
  updateIdentity(updates: Partial<UserIdentity>): Promise<void>;
  getProfile(): UserProfile;
  updateProfile(updates: Partial<UserProfile>): Promise<void>;
  getSavedAccounts(): SavedUserAccount[];
  getActiveAccountId(): string;
  switchAccount(accountId: string): boolean;
  login(credentials: { email?: string; password?: string; pin?: string; accountId?: string }): Promise<{ success: boolean; error?: string }>;
  register(data: RegisterUserData): Promise<{ success: boolean; error?: string; account?: SavedUserAccount }>;
  logout(): Promise<void>;
}
