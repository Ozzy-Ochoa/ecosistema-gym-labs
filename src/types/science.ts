import { DataProvenance, ConfidenceLevel } from './provenance';

export interface ScientificEvidence {
  citationId: string;
  shortCitation: string;    // e.g. "Mifflin et al. (1990)"
  fullTitle: string;
  journal: string;
  year: number;
  doi?: string;
  evidenceLevel: 'META_ANALYSIS' | 'RCT' | 'COHORT' | 'EXPERT_CONSENSUS';
  keyFinding: string;
  limitations: string[];
}

export interface DeterministicCalculationResult<T = number> {
  result: T | null;
  unit: string;
  formulaName: string;
  formulaVersion: string;
  mathematicalExpression: string;
  inputs: Record<string, any>;
  provenance: DataProvenance;
  evidenceCitation: ScientificEvidence;
  confidence: ConfidenceLevel;
  clinicalBoundaryDisclaimer: string;
}
