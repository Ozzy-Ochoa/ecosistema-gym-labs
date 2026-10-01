import { DeterministicCalculationResult } from '../types/science';
import { EVIDENCE_REGISTRY } from './citations';

export interface HeartRateZonesResult {
  maxHrBpm: number;
  restingHrBpm: number;
  heartRateReserve: number;
  zones: {
    zone: number;
    name: string;
    minBpm: number;
    maxBpm: number;
    intensityPct: string;
    metabolicTarget: string;
  }[];
}

export function calculateKarvonenZones(
  ageYears: number | null | undefined,
  restingHrBpm: number | null | undefined = null
): DeterministicCalculationResult<HeartRateZonesResult> {
  if (!ageYears || ageYears <= 0 || !restingHrBpm || restingHrBpm <= 30) {
    const missingFields: string[] = [];
    if (!ageYears || ageYears <= 0) missingFields.push('idade/data de nascimento');
    if (!restingHrBpm || restingHrBpm <= 30) missingFields.push('frequência cardíaca de repouso');

    return {
      result: null,
      unit: 'bpm',
      formulaName: 'Tanaka HRmax & Karvonen Heart Rate Reserve Equations',
      formulaVersion: '1.0.0',
      mathematicalExpression: 'HRmax = 208 - (0.7 * Age); FCR = ((HRmax - FC_Repouso) * %Intensidade) + FC_Repouso',
      inputs: { ageYears, restingHrBpm },
      provenance: {
        type: 'UNKNOWN',
        source: 'Gym Labs Cardiovascular Engine',
        recordedAt: new Date().toISOString(),
        confidence: 'INSUFFICIENT_DATA',
        limitations: [`Parâmetro(s) fisiológico(s) obrigatório(s) ausente(s): ${missingFields.join(', ')}. Não inventamos dados fisiológicos silenciosos.`],
      },
      evidenceCitation: EVIDENCE_REGISTRY.TANAKA_2001,
      confidence: 'INSUFFICIENT_DATA',
      clinicalBoundaryDisclaimer: 'Necessária idade e frequência cardíaca de repouso real do atleta para calcular determinísticamente a reserva cardíaca e zonas de Karvonen.',
    };
  }

  const effectiveRestHr = restingHrBpm;
  // Tanaka Formula: 208 - (0.7 * Age)
  const maxHr = Math.round(208 - 0.7 * ageYears);
  const hrr = maxHr - effectiveRestHr; // Heart Rate Reserve

  // Karvonen Target HR = ((MaxHR - RestHR) * %intensity) + RestHR
  const calcTarget = (pct: number) => Math.round(hrr * pct + effectiveRestHr);

  const zones = [
    {
      zone: 1,
      name: 'Active Recovery / Aerobic Base',
      minBpm: calcTarget(0.50),
      maxBpm: calcTarget(0.60),
      intensityPct: '50-60%',
      metabolicTarget: 'Lipolysis & mitochondrial biogenesis foundation',
    },
    {
      zone: 2,
      name: 'Extensive Aerobic / Zone 2 Endurance',
      minBpm: calcTarget(0.60),
      maxBpm: calcTarget(0.70),
      intensityPct: '60-70%',
      metabolicTarget: 'Fat oxidation efficiency and capillary density',
    },
    {
      zone: 3,
      name: 'Intensive Aerobic / Tempo',
      minBpm: calcTarget(0.70),
      maxBpm: calcTarget(0.80),
      intensityPct: '70-80%',
      metabolicTarget: 'Glycogen metabolism & aerobic threshold development',
    },
    {
      zone: 4,
      name: 'Lactate Threshold / Threshold Power',
      minBpm: calcTarget(0.80),
      maxBpm: calcTarget(0.90),
      intensityPct: '80-90%',
      metabolicTarget: 'Lactate buffering capacity and anaerobic threshold',
    },
    {
      zone: 5,
      name: 'VO2max / Neuromuscular Power',
      minBpm: calcTarget(0.90),
      maxBpm: maxHr,
      intensityPct: '90-100%',
      metabolicTarget: 'Peak cardiac output and maximal oxygen uptake',
    },
  ];

  return {
    result: {
      maxHrBpm: maxHr,
      restingHrBpm,
      heartRateReserve: hrr,
      zones,
    },
    unit: 'bpm',
    formulaName: 'Tanaka HRmax & Karvonen Heart Rate Reserve Equations',
    formulaVersion: '1.0.0',
    mathematicalExpression: `HRmax = 208 - (0.7 * ${ageYears}) = ${maxHr} bpm | Target = (HRR * %Intensity) + ${restingHrBpm} bpm`,
    inputs: { ageYears, restingHrBpm },
    provenance: {
      type: 'CALCULATED',
      source: 'Gym Labs Cardiovascular Engine',
      recordedAt: new Date().toISOString(),
      calculationMethod: 'Tanaka et al. (2001) + Karvonen (1957)',
      confidence: 'HIGH',
      limitations: ['Standard deviation of +/- 10 bpm in maximal heart rate across individuals.'],
    },
    evidenceCitation: EVIDENCE_REGISTRY.TANAKA_2001_HRMAX,
    confidence: 'HIGH',
    clinicalBoundaryDisclaimer: 'Heart rate zones are population-derived targets. Cardiac conditions, medications (e.g. beta-blockers), or illness significantly alter heart rate kinetics.',
  };
}
