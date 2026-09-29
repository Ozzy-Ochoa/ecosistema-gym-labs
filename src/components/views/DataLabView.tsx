import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { LineChart, BarChart2, TrendingUp, AlertTriangle, BookOpen, Layers } from 'lucide-react';
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
    date: new Date(s.startedAt).toLocaleDateString('pt-BR', { month: 'numeric', day: 'numeric' }),
    val: activeExperiment === 'load_hrv'
      ? (s.calculatedLoadUnits?.value || 0)
      : (s.calculatedVolumeKg?.value || 0),
    secondary: s.sessionRpe,
    unit: activeExperiment === 'load_hrv' ? 'UA' : 'kg',
  }));

  const sleepPoints = sleepSessions.slice(0, 14).map((s) => ({
    date: new Date(s.bedtime).toLocaleDateString('pt-BR', { month: 'numeric', day: 'numeric' }),
    val: Number(((s.durationMinutes || 0) / 60).toFixed(1)),
    secondary: s.nocturnalHrvRmsddMs?.value || 60,
    unit: 'h',
  }));

  const activePoints = activeExperiment === 'sleep_performance' ? sleepPoints : loadPoints;
  const maxVal = Math.max(...activePoints.map((p) => p.val), 10);

  return (
    <div id="gymlabs-datalab-view" className="space-y-6 font-mono select-none">
      {/* Header */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Laboratório Correlacional & Evidências
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              MÓDULO ANALÍTICO
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Gym Labs Data Lab
          </h1>
          <p className="text-xs text-zinc-400 font-sans max-w-xl">
            Modelagem matemática entre carga mecânica de treino, recuperação autonômica (HRV) e recomposição corporal.
          </p>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveExperiment('load_hrv')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeExperiment === 'load_hrv'
                ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Carga × Prontidão
          </button>
          <button
            type="button"
            onClick={() => setActiveExperiment('volume_recomp')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeExperiment === 'volume_recomp'
                ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Volume × Massa
          </button>
          <button
            type="button"
            onClick={() => setActiveExperiment('sleep_performance')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              activeExperiment === 'sleep_performance'
                ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sono × HRV
          </button>
        </div>
      </div>

      {/* Primary Telemetry Chart Box */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">
              {activeExperiment === 'load_hrv' && 'Série Temporal: Carga Interna (Foster RPE-Session)'}
              {activeExperiment === 'volume_recomp' && 'Série Temporal: Tonelagem de Volume (Kg Levantados)'}
              {activeExperiment === 'sleep_performance' && 'Série Temporal: Duração do Sono (Horas)'}
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Dados auditados das sessões registradas no dispositivo
            </p>
          </div>
          <span className="text-xs text-zinc-500 font-bold">
            {activePoints.length} PONTOS AMOSTRAIS
          </span>
        </div>

        {/* Visual Bar Plot */}
        <div className="pt-4 pb-2">
          {activePoints.length > 0 ? (
            <div className="flex items-end gap-2 h-44 border-b border-l border-zinc-800 px-2 pb-1">
              {activePoints.map((pt, idx) => {
                const heightPct = Math.max(8, Math.round((pt.val / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-zinc-800 hover:bg-white transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-zinc-500 font-mono rotate-45 sm:rotate-0 mt-1">
                      {pt.date}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white px-1.5 py-0.5 text-[9px] text-white whitespace-nowrap z-20 pointer-events-none">
                      {pt.val} {pt.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Sem dados suficientes registrados ainda para traçar a curva correlacional.
            </div>
          )}
        </div>
      </div>

      {/* Scientific Evidence Registry */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
          <BookOpen className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white uppercase">
            Registro de Validação Científica & Literatura Peer-Reviewed
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(EVIDENCE_REGISTRY).slice(0, 6).map((item) => (
            <div
              key={item.citationId}
              className="p-3 bg-zinc-950 border border-zinc-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white font-bold uppercase">{item.shortCitation}</span>
                <span className="text-[9px] px-1 bg-black border border-zinc-700 text-zinc-400">
                  {item.year}
                </span>
              </div>
              <h4 className="font-bold text-zinc-200 text-xs line-clamp-2">{item.fullTitle}</h4>
              <p className="text-[11px] text-zinc-400 font-sans line-clamp-3">
                {item.keyFinding}
              </p>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                {item.journal}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
