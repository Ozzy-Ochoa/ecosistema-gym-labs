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
    this.localStore.addBodyRecord(record);

    try {
      await healthApi.logBodyRecord(record);
    } catch {
      // Local fallback preservado
    }
  }

  public getCircumferences(): CircumferenceRecord[] {
    return this.localStore.getCircumferences();
  }

  public async addCircumference(record: CircumferenceRecord): Promise<void> {
    this.localStore.addCircumference(record);

    try {
      await healthApi.logCircumference(record);
    } catch {
      // Local fallback preservado
    }
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
