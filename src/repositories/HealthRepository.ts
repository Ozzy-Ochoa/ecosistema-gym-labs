import { IHealthRepository } from './interfaces/IHealthRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { BodyCompositionRecord, CircumferenceRecord } from '../types/body';
import { healthApi } from '../api/health.api';

export class HealthRepository implements IHealthRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getBodyRecords(): BodyCompositionRecord[] {
    return this.localStore.getBodyRecords();
  }

  public async addBodyRecord(record: BodyCompositionRecord): Promise<void> {
    try {
      const res = await healthApi.logBodyRecord(record);
      if (res.success) {
        this.localStore.addBodyRecord({ ...record, syncStatus: 'SYNCED' });
        return;
      }
    } catch (err) {
      console.warn('[HealthRepository] API indisponível, gravando local com status PENDING:', err);
    }
    this.localStore.addBodyRecord({ ...record, syncStatus: 'PENDING' });
  }

  public getCircumferences(): CircumferenceRecord[] {
    return this.localStore.getCircumferences();
  }

  public async addCircumference(record: CircumferenceRecord): Promise<void> {
    try {
      const res = await healthApi.logCircumference(record);
      if (res.success) {
        this.localStore.addCircumference({ ...record, syncStatus: 'SYNCED' });
        return;
      }
    } catch (err) {
      console.warn('[HealthRepository] API indisponível, gravando local com status PENDING:', err);
    }
    this.localStore.addCircumference({ ...record, syncStatus: 'PENDING' });
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await healthApi.getHealthRecords();
      return res.success;
    } catch {
      return false;
    }
  }
}
