import { ISleepRepository } from './interfaces/ISleepRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { SleepSession, SubjectiveWellnessLog } from '../types/recovery';
import { sleepApi } from '../api/sleep.api';
import { createMetricValue } from '../types/provenance';

export class SleepRepository implements ISleepRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getSleepSessions(): SleepSession[] {
    return this.localStore.getSleepSessions();
  }

  public async addSleepSession(session: SleepSession): Promise<void> {
    // 1. Tentar persistência remota (PostgreSQL) primeiro
    try {
      const res = await sleepApi.logSleep(session);
      if (res.success) {
        // 2. Retorno confirmado -> atualiza cache local como SYNCED
        this.localStore.addSleepSession({ ...session, syncStatus: 'SYNCED' });
        return;
      }
    } catch (err) {
      console.warn('[SleepRepository] API/PostgreSQL indisponível, gravando local com status PENDING:', err);
    }

    // 3. Fallback Offline: local cache com status PENDING
    this.localStore.addSleepSession({ ...session, syncStatus: 'PENDING' });
  }

  public getWellnessLogs(): SubjectiveWellnessLog[] {
    return this.localStore.getWellnessLogs();
  }

  public async addWellnessLog(log: SubjectiveWellnessLog): Promise<void> {
    this.localStore.addWellnessLog({ ...log, syncStatus: 'SYNCED' });
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await sleepApi.getSleepLogs();
      if (res.success && res.data?.sleepLogs) {
        res.data.sleepLogs.forEach((s: any) => {
          this.localStore.addSleepSession({
            id: s.id,
            userId: s.userId || 'current',
            bedtime: typeof s.bedtime === 'string' ? s.bedtime : new Date(s.bedtime).toISOString(),
            wakeTime: typeof s.wakeTime === 'string' ? s.wakeTime : new Date(s.wakeTime).toISOString(),
            durationMinutes: s.durationMinutes,
            deepSleepMinutes: s.deepSleepMinutes,
            remSleepMinutes: s.remSleepMinutes,
            nocturnalHrvRmsddMs: s.restingHrvRmssd ? createMetricValue(s.restingHrvRmssd, 'ms', (s.provenanceType as any) || 'REAL') : undefined,
            restingHeartRateBpm: s.restingHeartRateBpm ? createMetricValue(s.restingHeartRateBpm, 'bpm', (s.provenanceType as any) || 'REAL') : undefined,
            provenance: (s.provenanceType as any) || 'REAL',
            syncStatus: 'SYNCED',
          });
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
