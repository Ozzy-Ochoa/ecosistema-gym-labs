export interface ExerciseSetRecord {
  setNumber: number;
  loadKg: number;
  reps: number;
  rir?: number;
  failed?: boolean;
}

export interface ExerciseSessionOccurrence {
  sessionId: string;
  sessionDate: string;
  exerciseName: string;
  sets: ExerciseSetRecord[];
  maxLoadKg: number;
  totalTonnageKg: number;
  avgReps: number;
}

export type OverloadClassification =
  | 'PROGRESSÃO'
  | 'MANUTENÇÃO'
  | 'ESTAGNAÇÃO'
  | 'REGRESSÃO'
  | 'DADOS INSUFICIENTES';

export interface OverloadAnalysisResult {
  exerciseName: string;
  status: OverloadClassification;
  confidence: 'ALTA' | 'MÉDIA' | 'BAIXA' | 'INSUFICIENTES';
  reasoning: string;
  totalSessionsRecorded: number;
  loadDeltaKg: number;
  tonnageDeltaKg: number;
  previousSession?: ExerciseSessionOccurrence;
  currentSession?: ExerciseSessionOccurrence;
}

/**
 * Deterministic Progressive Overload Engine
 * Axiom: If < 2 sessions recorded, explicitly returns 'DADOS INSUFICIENTES'.
 * Never invents linear progression or synthetic curves!
 */
export function evaluateProgressiveOverload(
  exerciseName: string,
  history: ExerciseSessionOccurrence[]
): OverloadAnalysisResult {
  const targetName = (exerciseName || '').toLowerCase().trim();
  const filtered = history
    .filter((h) => (h.exerciseName || '').toLowerCase().trim() === targetName)
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

  if (filtered.length < 2) {
    return {
      exerciseName,
      status: 'DADOS INSUFICIENTES',
      confidence: 'INSUFICIENTES',
      reasoning:
        'Axioma Científico: É obrigatório o registro de ao menos 2 sessões concluídas com este exercício para comparar o vetor de sobrecarga determinística. Gráficos lineares sintéticos foram bloqueados.',
      totalSessionsRecorded: filtered.length,
      loadDeltaKg: 0,
      tonnageDeltaKg: 0,
    };
  }

  const prev = filtered[filtered.length - 2];
  const curr = filtered[filtered.length - 1];

  const loadDeltaKg = curr.maxLoadKg - prev.maxLoadKg;
  const tonnageDeltaKg = curr.totalTonnageKg - prev.totalTonnageKg;

  let status: OverloadClassification = 'MANUTENÇÃO';
  let reasoning = '';

  if (loadDeltaKg > 0 || (loadDeltaKg === 0 && tonnageDeltaKg > 0)) {
    status = 'PROGRESSÃO';
    reasoning = `Sobrecarga efetiva comprovada: delta de pico de +${loadDeltaKg} kg ou tonelagem acrescida em +${tonnageDeltaKg} kg sob mesmo volume planejado.`;
  } else if (loadDeltaKg === 0 && tonnageDeltaKg === 0) {
    status = 'MANUTENÇÃO';
    reasoning = 'Isocarga mecânica: volume e intensidade idênticos mantidos com integridade biomecânica.';
  } else if (filtered.length >= 3) {
    const prev2 = filtered[filtered.length - 3];
    if (curr.totalTonnageKg <= prev.totalTonnageKg && prev.totalTonnageKg <= prev2.totalTonnageKg) {
      status = 'ESTAGNAÇÃO';
      reasoning = 'Atenção: Três sessões consecutivas sem aumento na tonelagem nem na carga. Indicador de necessidade de deload programado.';
    } else {
      status = 'REGRESSÃO';
      reasoning = `Queda de carga observada (${loadDeltaKg} kg). Avaliar fadiga residual, qualidade de sono e RIR.`;
    }
  } else {
    status = 'REGRESSÃO';
    reasoning = `Redução registrada na capacidade mecânica (${loadDeltaKg} kg).`;
  }

  return {
    exerciseName,
    status,
    confidence: 'ALTA',
    reasoning,
    totalSessionsRecorded: filtered.length,
    loadDeltaKg,
    tonnageDeltaKg,
    previousSession: prev,
    currentSession: curr,
  };
}

export interface PRVaultEntry {
  exerciseName: string;
  maxAbsoluteLoadKg: number;
  maxLoadDate: string;
  maxRepRecords: Record<number, { loadKg: number; date: string }>;
  maxSetVolumeKg: { volumeKg: number; reps: number; loadKg: number; date: string };
  maxEstimated1RmKg: { estimated1Rm: number; formula: string; date: string };
}

/**
 * Builds the 4-Vector Personal Record Vault
 */
export function buildPRVault(sessions: ExerciseSessionOccurrence[]): PRVaultEntry[] {
  const map = new Map<string, PRVaultEntry>();

  for (const s of sessions) {
    let entry = map.get(s.exerciseName);
    if (!entry) {
      entry = {
        exerciseName: s.exerciseName,
        maxAbsoluteLoadKg: 0,
        maxLoadDate: s.sessionDate,
        maxRepRecords: {},
        maxSetVolumeKg: { volumeKg: 0, reps: 0, loadKg: 0, date: s.sessionDate },
        maxEstimated1RmKg: { estimated1Rm: 0, formula: 'Epley (1985)', date: s.sessionDate },
      };
      map.set(s.exerciseName, entry);
    }

    for (const set of s.sets) {
      // 1. Max Absolute Load
      if (set.loadKg > entry.maxAbsoluteLoadKg) {
        entry.maxAbsoluteLoadKg = set.loadKg;
        entry.maxLoadDate = s.sessionDate;
      }

      // 2. Max Load by Rep count
      if (set.reps > 0) {
        const curRep = entry.maxRepRecords[set.reps];
        if (!curRep || set.loadKg > curRep.loadKg) {
          entry.maxRepRecords[set.reps] = { loadKg: set.loadKg, date: s.sessionDate };
        }
      }

      // 3. Max Set Volume (Load * Reps)
      const setVol = set.loadKg * set.reps;
      if (setVol > entry.maxSetVolumeKg.volumeKg) {
        entry.maxSetVolumeKg = {
          volumeKg: setVol,
          reps: set.reps,
          loadKg: set.loadKg,
          date: s.sessionDate,
        };
      }

      // 4. Max Estimated 1RM (Epley: Load * (1 + 0.0333 * Reps))
      if (set.reps >= 1 && set.reps <= 12 && set.loadKg > 0) {
        const est1Rm = Math.round(set.loadKg * (1 + 0.0333 * set.reps));
        if (est1Rm > entry.maxEstimated1RmKg.estimated1Rm) {
          entry.maxEstimated1RmKg = {
            estimated1Rm: est1Rm,
            formula: set.reps === 1 ? '1RM Absoluta' : 'Epley (1985)',
            date: s.sessionDate,
          };
        }
      }
    }
  }

  return Array.from(map.values());
}
