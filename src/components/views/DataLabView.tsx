import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { LineChart, BarChart2, TrendingUp, AlertTriangle, Info, Sparkles, BookOpen, Layers } from 'lucide-react';
import { EVIDENCE_REGISTRY } from '../../science/citations';

export const DataLabView: React.FC = () => {
  const {
    trainingSessions,
    bodyRecords,
    sleepSessions,
    acwrMetrics,
    openCalculationInspector,
  } = useGymLabs();

  const [activeExperiment, setActiveExperiment] = useState<'load_hrv' | 'volume_recomp' | 'sleep_performance'>('load_hrv');

  // Compute correlation points based on active experiment
  const loadPoints = trainingSessions.slice(0, 14).map((s) => ({
    date: new Date(s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    val: activeExperiment === 'load_hrv'
      ? (s.calculatedLoadUnits?.value || 0)
      : (s.calculatedVolumeKg?.value || 0),
    secondary: s.sessionRpe,
    unit: activeExperiment === 'load_hrv' ? 'AU' : 'kg',
  }));

  const sleepPoints = sleepSessions.slice(0, 14).map((s) => ({
    date: new Date(s.bedtime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    val: Number(((s.durationMinutes || 0) / 60).toFixed(1)),
    secondary: s.nocturnalHrvRmsddMs?.value || 60,
    unit: 'hrs',
  }));

  const activePoints = activeExperiment === 'sleep_performance' ? sleepPoints : loadPoints;
  const maxVal = Math.max(...activePoints.map((p) => p.val), 10);

  return (
    <div id="gymlabs-datalab-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0F172A] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Correlational Laboratory & Evidence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              EXPERIMENTAL SANDBOX
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            GL Data Lab & Analytics
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Mathematical cross-domain modeling between mechanical training load, autonomic recovery, and anthropometric recomposition.
          </p>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#070A12] border border-slate-800">
          <button
            onClick={() => setActiveExperiment('load_hrv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeExperiment === 'load_hrv'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Load (AU)
          </button>
          <button
            onClick={() => setActiveExperiment('volume_recomp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeExperiment === 'volume_recomp'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Volume (kg)
          </button>
          <button
            onClick={() => setActiveExperiment('sleep_performance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeExperiment === 'sleep_performance'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sleep & HRV
          </button>
        </div>
      </div>

      {/* Mandatory Scientific Causality Disclaimer (Section 21) */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">Epistemological Scientific Boundary: </strong>
          Statistical correlation does not establish physiological causation. Observed relationships between mechanical load,
          sleep stages, and autonomic HRV are non-linear and subject to confounding variables (acute nutritional status, psychological
          stress, environmental temperature).
        </div>
      </div>

      {/* Analytics Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Data Chart / Trend Visualizer */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {activeExperiment === 'load_hrv'
                  ? 'Session RPE Load Trajectory (AU)'
                  : activeExperiment === 'volume_recomp'
                  ? 'Cumulative Session Tonnage (kg)'
                  : 'Sleep Duration (hrs) & Autonomic Telemetry'}
              </h3>
              <p className="text-xs text-slate-400">14-day rolling observational window</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {activePoints.length} Data Points
            </span>
          </div>

          {activePoints.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 flex items-end gap-2 pt-6 px-2 border-b border-slate-800">
                {activePoints.map((pt, idx) => {
                  const heightPct = Math.round((pt.val / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-cyan-300 pointer-events-none whitespace-nowrap z-20">
                        {pt.val} {pt.unit} {pt.secondary ? `(sec: ${pt.secondary})` : ''}
                      </div>

                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600/40 to-cyan-400/80 group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all"
                        style={{ height: `${Math.max(12, heightPct)}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                        {pt.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>0 {activePoints[0]?.unit || 'AU'}</span>
                <span>
                  {activeExperiment === 'load_hrv'
                    ? 'Workload Units (Arbitrary Units = Duration × RPE)'
                    : activeExperiment === 'volume_recomp'
                    ? 'Total Session Volume (Sets × Reps × Load in kg)'
                    : 'Sleep Duration in Hours per Night'}
                </span>
                <span>Peak: {maxVal} {activePoints[0]?.unit || 'AU'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Insufficient longitudinal sessions recorded to map analytical correlation curves.
            </div>
          )}
        </div>

        {/* Right 1 Col: Evidence Registry Catalog */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Evidence Library
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {Object.keys(EVIDENCE_REGISTRY).length} Studies
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Validated peer-reviewed literature powering the Gym Labs mathematical calculation graph.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {Object.values(EVIDENCE_REGISTRY).map((evidence) => (
              <div
                key={evidence.citationId}
                className="p-3.5 rounded-2xl bg-[#070A12] border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-cyan-300">{evidence.shortCitation}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {evidence.evidenceLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 font-medium">{evidence.fullTitle}</p>
                <p className="text-[10px] text-slate-400 italic">
                  {evidence.journal} ({evidence.year})
                </p>
                <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                  <strong className="text-emerald-400">Core Finding: </strong>
                  {evidence.keyFinding}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
