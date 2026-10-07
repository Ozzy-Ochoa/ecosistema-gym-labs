import { ISleepRepository } from './interfaces/ISleepRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { SleepSession, SubjectiveWellnessLog } from '../types/recovery';
import { sleepApi } from '../api/sleep.api';

export class SleepRepository implements ISleepRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getSleepSessions(): SleepSession[] {
    return this.localStore.getSleepSessions();
  }

  public async addSleepSession(session: SleepSession): Promise<void> {
    this.localStore.addSleepSession(session);

    try {
      await sleepApi.logSleep(session);
    } catch {
      // Local fallback preservado
    }
  }

  public getWellnessLogs(): SubjectiveWellnessLog[] {
    return this.localStore.getWellnessLogs();
  }

  public async addWellnessLog(log: SubjectiveWellnessLog): Promise<void> {
    this.localStore.addWellnessLog(log);
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await sleepApi.getSleepLogs();
      return res.success;
    } catch {
      return false;
    }
  }
}
