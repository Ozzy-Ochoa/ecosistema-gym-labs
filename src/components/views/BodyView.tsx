import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { MetricCard } from '../common/MetricCard';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { EmptyState } from '../common/EmptyState';
import { BodyCompositionRecord, CircumferenceRecord } from '../../types/body';
import { User, Plus, Scale, Activity, Ruler, Calendar, ShieldCheck, Info } from 'lucide-react';

export const BodyView: React.FC = () => {
  const {
    identity,
    bodyRecords,
    addBodyRecord,
    circumferences,
    addCircumference,
    bmiCalculation,
    openCalculationInspector,
  } = useGymLabs();

  const [showLogModal, setShowLogModal] = useState(false);
  const [showCircModal, setShowCircModal] = useState(false);
  const [weightKg, setWeightKg] = useState<number>(80);
  const [bodyFatPct, setBodyFatPct] = useState<string>('');
  const [measurementMethod, setMeasurementMethod] = useState<BodyCompositionRecord['method']>('BIA_HOME');
  const [sourceName, setSourceName] = useState('Smart Scale');

  // Circumference state
  const [waistCm, setWaistCm] = useState(82);
  const [hipCm, setHipCm] = useState(98);
  const [chestCm, setChestCm] = useState(104);
  const [armCm, setArmCm] = useState(38);
  const [thighCm, setThighCm] = useState(58);

  const latestRecord = bodyRecords[0] || null;
  const latestCirc = circumferences[0] || null;

  // Cardiometabolic Ratios
  const currentWaist = latestCirc?.waistCm?.value || waistCm;
  const currentHip = latestCirc?.hipCm?.value || hipCm;
  const currentHeight = identity.heightCm || 178;

  const whtr = currentHeight && currentWaist ? Number((currentWaist / currentHeight).toFixed(2)) : 0;
  const whr = currentHip && currentWaist ? Number((currentWaist / currentHip).toFixed(2)) : 0;

  const handleSaveCircumferences = (e: React.FormEvent) => {
    e.preventDefault();
    const newCirc: CircumferenceRecord = {
      id: `circ-${Date.now()}`,
      userId: identity.id,
      timestamp: new Date().toISOString(),
      waistCm: {
        value: waistCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'ISAK Anthropometric Tape',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      hipCm: {
        value: hipCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'ISAK Anthropometric Tape',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      chestCm: {
        value: chestCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'ISAK Anthropometric Tape',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      leftArmCm: {
        value: armCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'ISAK Anthropometric Tape',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      leftThighCm: {
        value: thighCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'ISAK Anthropometric Tape',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      provenance: {
        type: 'REAL',
        source: 'Self-Measured ISAK Tension Tape',
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
    };

    addCircumference(newCirc);
    setShowCircModal(false);
  };

  const handleSaveBodyRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const bfNum = bodyFatPct !== '' ? Number(bodyFatPct) : undefined;
    const leanMass = bfNum ? Number((weightKg * (1 - bfNum / 100)).toFixed(1)) : undefined;

    const newRecord: BodyCompositionRecord = {
      id: `body-${Date.now()}`,
      userId: identity.id,
      timestamp: new Date().toISOString(),
      weightKg: {
        value: weightKg,
        unit: 'kg',
        provenance: {
          type: measurementMethod === 'SELF_REPORT' ? 'ESTIMATED' : 'REAL',
          source: sourceName,
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      bodyFatPercent: bfNum
        ? {
            value: bfNum,
            unit: '%',
            provenance: {
              type: measurementMethod.startsWith('BIA') || measurementMethod === 'CALCULATED_NAVY' ? 'ESTIMATED' : 'REAL',
              source: `${measurementMethod} Assessment`,
              recordedAt: new Date().toISOString(),
              confidence: measurementMethod === 'DEXA' ? 'HIGH' : 'MEDIUM',
              limitations: measurementMethod.startsWith('BIA') ? ['Subject to hydration level fluctuation.'] : undefined,
            },
          }
        : undefined,
      leanMassKg: leanMass
        ? {
            value: leanMass,
            unit: 'kg',
            provenance: {
              type: 'CALCULATED',
              source: 'Weight * (1 - BodyFatPercent)',
              recordedAt: new Date().toISOString(),
              confidence: 'MEDIUM',
            },
          }
        : undefined,
      method: measurementMethod,
      provenance: {
        type: 'REAL',
        source: sourceName,
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
    };

    addBodyRecord(newRecord);
    setShowLogModal(false);
  };

  return (
    <div id="gymlabs-body-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0F172A] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Anthropometry & Composition
            </span>
            <ProvenanceBadge
              provenance={{
                type: 'REAL',
                source: 'Validated Biometric Inputs',
                recordedAt: new Date().toISOString(),
                confidence: 'HIGH',
              }}
              size="sm"
            />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Body System & Composition
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Multi-compartment anthropometric monitoring, DEXA calibration, and circumference tracking with strict provenance separation between measured and estimated metrics.
          </p>
        </div>

        <button
          id="open-body-log-modal-btn"
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Measurement</span>
        </button>
      </div>

      {/* KPI Cards: Current Weight, Body Fat, Lean Mass, BMI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="body-metric-weight"
          title="Total Body Mass"
          value={latestRecord?.weightKg?.value || null}
          unit="kg"
          subtitle={latestRecord ? `Method: ${latestRecord.method}` : 'No verified weigh-ins'}
          provenance={latestRecord?.weightKg?.provenance}
          icon={Scale}
        />

        <MetricCard
          id="body-metric-body-fat"
          title="Body Fat Percentage"
          value={latestRecord?.bodyFatPercent?.value || null}
          unit="%"
          subtitle={
            latestRecord?.bodyFatPercent
              ? `Source: ${latestRecord.bodyFatPercent.provenance.source}`
              : 'Untested / Unknown'
          }
          provenance={latestRecord?.bodyFatPercent?.provenance}
          accentColor="amber"
          icon={Activity}
        />

        <MetricCard
          id="body-metric-lean-mass"
          title="Calculated Lean Mass"
          value={latestRecord?.leanMassKg?.value || null}
          unit="kg"
          subtitle="Fat-Free Mass (FFM)"
          provenance={latestRecord?.leanMassKg?.provenance}
          accentColor="emerald"
          icon={User}
        />

        <MetricCard
          id="body-metric-bmi"
          title="Quetelet Index (BMI)"
          value={bmiCalculation.result?.bmi || null}
          unit="kg/m²"
          subtitle={`Classification: ${bmiCalculation.result?.category || 'Unknown'}`}
          provenance={bmiCalculation.provenance}
          onClickInspect={() => openCalculationInspector(bmiCalculation)}
        />
      </div>

      {/* Main Grid: Body Composition History & Anatomical Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Measurement History Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Anthropometric Log History</h3>
              <p className="text-xs text-slate-400">Chronological ledger with verification provenance</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{bodyRecords.length} records</span>
          </div>

          {bodyRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Body Fat</th>
                    <th className="py-2.5 px-3">Lean Mass</th>
                    <th className="py-2.5 px-3">Methodology</th>
                    <th className="py-2.5 px-3">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {bodyRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 text-slate-300">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {record.weightKg.value} {record.weightKg.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {record.bodyFatPercent?.value ? `${record.bodyFatPercent.value}%` : 'UNKNOWN'}
                      </td>
                      <td className="py-3 px-3 text-emerald-400">
                        {record.leanMassKg?.value ? `${record.leanMassKg.value} kg` : 'UNKNOWN'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{record.method}</td>
                      <td className="py-3 px-3">
                        <ProvenanceBadge provenance={record.provenance} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No Body Measurements Recorded"
              description="Record your morning fasted body weight and composition data to unlock metabolic BMR and body recomposition analytics."
              protocolTip="Weigh yourself immediately upon waking after voiding the bladder, once or multiple times weekly under identical hydration conditions."
              actionLabel="Add First Measurement"
              onAction={() => setShowLogModal(true)}
              icon={Scale}
            />
          )}
        </div>

        {/* Right 1 Col: Circumference Tracker & Anatomical Protocol */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">
                Circumferences
              </h3>
            </div>
            <button
              onClick={() => setShowCircModal(true)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Tape</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Tape measurements provide hypertrophy tracking free from scale hydration fluctuations.
          </p>

          <div className="space-y-2">
            {[
              { label: 'Waist (Umbilical)', value: latestCirc?.waistCm?.value, unit: 'cm' },
              { label: 'Chest (Mesosternal)', value: latestCirc?.chestCm?.value, unit: 'cm' },
              { label: 'Hip (Max Gluteal)', value: latestCirc?.hipCm?.value, unit: 'cm' },
              { label: 'Arm (Flexed Biceps)', value: latestCirc?.leftArmCm?.value, unit: 'cm' },
              { label: 'Thigh (Mid-Trochanteric)', value: latestCirc?.leftThighCm?.value, unit: 'cm' },
            ].map((circ, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-[#070A12] border border-slate-800"
              >
                <span className="text-xs text-slate-400 font-medium">{circ.label}</span>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {circ.value !== undefined && circ.value !== null ? `${circ.value} ${circ.unit}` : 'UNKNOWN'}
                </span>
              </div>
            ))}
          </div>

          {/* Cardiometabolic Risk Ratios (Ashwell / WHO) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
              Cardiometabolic Risk Indices
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#070A12] border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Waist-to-Height (WHtR)</span>
                <span className={`text-base font-bold font-mono ${whtr < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {whtr}
                </span>
                <span className="text-[9px] text-slate-500 block">Target: &lt; 0.50 (Ashwell)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070A12] border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Waist-to-Hip (WHR)</span>
                <span className={`text-base font-bold font-mono ${whr < 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {whr}
                </span>
                <span className="text-[9px] text-slate-500 block">WHO: &le; 0.90 (M) / 0.85 (F)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              ISAK standardized anthropometry dictates constant tension measuring tapes applied without skin indentation.
            </span>
          </div>
        </div>
      </div>

      {/* Log Circumferences Modal */}
      {showCircModal && (
        <div
          id="circ-log-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Log Anatomical Circumferences</h3>
            <p className="text-xs text-slate-400">
              Record precision tape measurements (cm) using ISAK surface landmark protocols.
            </p>

            <form onSubmit={handleSaveCircumferences} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Waist / Umbilical (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Hip / Gluteal (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hipCm}
                    onChange={(e) => setHipCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Chest / Mesosternal (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={chestCm}
                    onChange={(e) => setChestCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Arm / Flexed Biceps (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={armCm}
                    onChange={(e) => setArmCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-medium">Thigh / Mid-Trochanteric (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={thighCm}
                    onChange={(e) => setThighCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCircModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                >
                  Save Circumferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Body Record Modal */}
      {showLogModal && (
        <div
          id="body-log-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Record Body Composition</h3>
            <p className="text-xs text-slate-400">
              Enter verified measurements. Specify the methodology to ensure truthful provenance classification.
            </p>

            <form onSubmit={handleSaveBodyRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Body Fat % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="60"
                  placeholder="Leave empty if not measured"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Measurement Methodology</label>
                <select
                  value={measurementMethod}
                  onChange={(e) => setMeasurementMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="BIA_HOME">Bioelectrical Impedance (Home Smart Scale)</option>
                  <option value="BIA_PROFESSIONAL">Clinical BIA (InBody / Seca Multi-Frequency)</option>
                  <option value="DEXA">Dual-Energy X-ray Absorptiometry (DEXA Scan)</option>
                  <option value="SKINFOLD_7_SITE">Caliper Skinfold 7-Site Protocol (Jackson-Pollock)</option>
                  <option value="CALCULATED_NAVY">US Navy Circumference Model</option>
                  <option value="SELF_REPORT">Self-Report / Visual Approximation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Source / Device Description</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. InBody 770 Clinical or Withings Scale"
                  className="w-full px-3 py-2 rounded-xl bg-[#070A12] border border-slate-800 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
