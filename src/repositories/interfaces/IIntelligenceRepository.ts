import { IntelligenceQueryRequest, IntelligenceQueryResponse } from '../../types/api';

export interface IIntelligenceRepository {
  query(request: IntelligenceQueryRequest): Promise<IntelligenceQueryResponse>;
}
