import { ACWRResult, TrainingSession } from '../types/training';

export interface DailyLoadRecord {
  date: string; // YYYY-MM-DD
  loadUnits: number; // Session RPE * Duration in minutes
  sessionCount: number;
}

/**
 * Calculates Session-RPE Load = Duration (min) * Session RPE (Foster et al., 2001)
 */
export function calculateSessionRpeLoad(durationMinutes: number, sessionRpe: number): number {
  if (durationMinutes <= 0 || sessionRpe <= 0) return 0;
  return Math.round(durationMinutes * Math.min(10, Math.max(1, sessionRpe)));
}

/**
 * Calculates Acute:Chronic Workload Ratio (ACWR) with strict scientific data sufficiency checks.
 * Requires 28 continuous days to establish chronic workload baseline.
 */
export function calculateACWR(dailyLoads: DailyLoadRecord[]): ACWRResult {
  // Check available days count
  const daysCount = dailyLoads.length;

  if (daysCount < 28) {
    return {
      ratio: null,
      acuteLoad7d: 0,
      chronicLoad28d: 0,
      status: 'INSUFFICIENT_DATA',
      scientificNote: `ACWR requires a verified 28-day baseline to compute chronic workload without statistical fabrication. Current recorded history: ${daysCount} of 28 required days.`,
      dataSufficient: false,
      daysRecorded: daysCount,
    };
  }

  // Sort chronologically ascending
  const sorted = [...dailyLoads].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Last 7 days = Acute load
  const last7Days = sorted.slice(-7);
  const acuteSum = last7Days.reduce((acc, curr) => acc + curr.loadUnits, 0);
  const acuteWeekly = acuteSum; // or average daily * 7

  // Last 28 days = Chronic load (weekly average over 4 weeks)
  const last28Days = sorted.slice(-28);
  const chronicSum = last28Days.reduce((acc, curr) => acc + curr.loadUnits, 0);
  const chronicWeeklyAvg = chronicSum / 4; // Normalized to 7-day scale

  if (chronicWeeklyAvg === 0) {
    return {
      ratio: null,
      acuteLoad7d: acuteWeekly,
      chronicLoad28d: 0,
      status: 'INSUFFICIENT_DATA',
      scientificNote: 'Chronic workload baseline is zero (no recorded training in the preceding 28 days). Workload ratio cannot be computed.',
      dataSufficient: false,
      daysRecorded: daysCount,
    };
  }

  const ratio = Number((acuteWeekly / chronicWeeklyAvg).toFixed(2));

  let status: ACWRResult['status'] = 'OPTIMAL';
  let scientificNote = '';

  if (ratio < 0.8) {
    status = 'UNDERLOAD';
    scientificNote = `Current acute ratio is ${ratio} (under 0.8). Workload is lower than your chronic preparation baseline.`;
  } else if (ratio <= 1.3) {
    status = 'OPTIMAL';
    scientificNote = `Current acute ratio is ${ratio} (between 0.8 and 1.3). Workload progression aligns with established progressive overload parameters.`;
  } else if (ratio <= 1.5) {
    status = 'OVERLOAD';
    scientificNote = `Current acute ratio is ${ratio} (between 1.3 and 1.5). Acute training stimulus is elevated relative to chronic baseline. Monitor recovery.`;
  } else {
    status = 'SPIKE_WARNING';
    scientificNote = `Current acute ratio is ${ratio} (> 1.5). Rapid acute workload escalation detected. Per Gabbett (2016), this metric has limitations and does not independently determine injury risk.`;
  }

  return {
    ratio,
    acuteLoad7d: acuteWeekly,
    chronicLoad28d: Math.round(chronicWeeklyAvg),
    status,
    scientificNote,
    dataSufficient: true,
    daysRecorded: daysCount,
  };
}
