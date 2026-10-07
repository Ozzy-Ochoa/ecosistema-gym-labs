import { BodyCompositionRecord, CircumferenceRecord } from '../../types/body';

export interface IHealthRepository {
  getBodyRecords(): BodyCompositionRecord[];
  addBodyRecord(record: BodyCompositionRecord): Promise<void>;
  getCircumferences(): CircumferenceRecord[];
  addCircumference(record: CircumferenceRecord): Promise<void>;
  syncRemote(): Promise<boolean>;
}
