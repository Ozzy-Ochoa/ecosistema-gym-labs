import { SleepSession, SubjectiveWellnessLog } from '../../types/recovery';

export interface ISleepRepository {
  getSleepSessions(): SleepSession[];
  addSleepSession(session: SleepSession): Promise<void>;
  getWellnessLogs(): SubjectiveWellnessLog[];
  addWellnessLog(log: SubjectiveWellnessLog): Promise<void>;
  syncRemote(): Promise<boolean>;
}
