import { GLRecoveryScore, SleepSession, SubjectiveWellnessLog } from '../types/recovery';

export interface RecoveryEngineInput {
  lastSleep?: SleepSession;
  subjectiveWellness?: SubjectiveWellnessLog;
  acuteLoadRatio?: number | null; // e.g. from ACWR
  baselineHrvRmsdd?: number;      // Rolling 30-day baseline HRV
}

export function computeGLRecoveryScore(input: RecoveryEngineInput): GLRecoveryScore {
  const { lastSleep, subjectiveWellness, baselineHrvRmsdd } = input;

  if (!lastSleep && !subjectiveWellness) {
    return {
      score: null,
      status: 'INSUFFICIENT_DATA',
      components: {
        hrvComponentScore: null,
        sleepDurationScore: null,
        subjectiveReadinessScore: null,
        trainingStrainBalance: null,
      },
      provenance: {
        type: 'UNKNOWN',
        source: 'GL Recovery Index Engine v1',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
        limitations: ['Neither sleep records nor subjective wellness logs exist for today.'],
      },
      disclaimer: 'The GL Recovery / Readiness Index is a multi-factorial composite index derived by Gym Labs. It does not measure direct central nervous system recovery or diagnose medical readiness.',
    };
  }

  let totalWeight = 0;
  let accumulatedPoints = 0;

  // 1. Sleep Duration Component (Weight = 35)
  let sleepScore: number | null = null;
  if (lastSleep && lastSleep.durationMinutes > 0) {
    const hours = lastSleep.durationMinutes / 60;
    // Optimal window 7-9 hours
    if (hours >= 7.5 && hours <= 9) sleepScore = 100;
    else if (hours >= 7 && hours < 7.5) sleepScore = 90;
    else if (hours >= 6 && hours < 7) sleepScore = 75;
    else if (hours >= 5 && hours < 6) sleepScore = 50;
    else sleepScore = 30;

    accumulatedPoints += sleepScore * 0.35;
    totalWeight += 0.35;
  }

  // 2. Nocturnal HRV component (Weight = 35 if available)
  let hrvScore: number | null = null;
  const currentHrv = lastSleep?.nocturnalHrvRmsddMs?.value;
  if (currentHrv && baselineHrvRmsdd && baselineHrvRmsdd > 0) {
    const ratio = currentHrv / baselineHrvRmsdd;
    if (ratio >= 0.95 && ratio <= 1.15) hrvScore = 95; // Within normal SWC (Smallest Worthwhile Change)
    else if (ratio > 1.15) hrvScore = 88; // Sympathetic rebound or high parasympathetic tone
    else if (ratio >= 0.85 && ratio < 0.95) hrvScore = 75;
    else if (ratio >= 0.70 && ratio < 0.85) hrvScore = 55;
    else hrvScore = 35; // Significant autonomic suppression

    accumulatedPoints += hrvScore * 0.35;
    totalWeight += 0.35;
  }

  // 3. Subjective Wellness Component (Weight = 30)
  let subjectiveScore: number | null = null;
  if (subjectiveWellness) {
    // Energy (1-5), Soreness (1-5, reversed), Stress (1-5, reversed)
    const energyNorm = ((subjectiveWellness.energyLevel - 1) / 4) * 100;
    const sorenessNorm = ((5 - subjectiveWellness.muscleSoreness) / 4) * 100;
    const stressNorm = ((5 - subjectiveWellness.stressLevel) / 4) * 100;
    subjectiveScore = Math.round((energyNorm + sorenessNorm + stressNorm) / 3);

    const weight = hrvScore !== null ? 0.30 : 0.65;
    accumulatedPoints += subjectiveScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return {
      score: null,
      status: 'INSUFFICIENT_DATA',
      components: {
        hrvComponentScore: null,
        sleepDurationScore: null,
        subjectiveReadinessScore: null,
        trainingStrainBalance: null,
      },
      provenance: {
        type: 'UNKNOWN',
        source: 'GL Recovery Index Engine v1',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
      },
      disclaimer: 'The GL Recovery Index is an internal metric derived from sleep, autonomic signals, and subjective reporting. It is not an absolute clinical diagnostic.',
    };
  }

  const finalScore = Math.round(accumulatedPoints / totalWeight);
  let status: GLRecoveryScore['status'] = 'ADEQUATE';
  if (finalScore >= 80) status = 'EXCELLENT';
  else if (finalScore >= 60) status = 'ADEQUATE';
  else status = 'REDUCED';

  return {
    score: finalScore,
    status,
    components: {
      hrvComponentScore: hrvScore,
      sleepDurationScore: sleepScore,
      subjectiveReadinessScore: subjectiveScore,
      trainingStrainBalance: null,
    },
    provenance: {
      type: 'CALCULATED',
      source: 'Gym Labs Recovery/Readiness Algorithm v1.0',
      recordedAt: new Date().toISOString(),
      calculationMethod: 'Composite Autonomic & Somatic Readiness Scoring',
      confidence: hrvScore !== null ? 'HIGH' : 'MEDIUM',
      limitations: [
        'Readiness scores reflect daily systemic trends, not local tissue structural fatigue.',
        'Psychological stressors or subclinical infections can alter HRV independent of athletic recovery.',
      ],
    },
    disclaimer: 'The GL Recovery / Readiness Index is an algorithmic estimate derived by Gym Labs. It does not measure direct central nervous system recovery.',
  };
}
