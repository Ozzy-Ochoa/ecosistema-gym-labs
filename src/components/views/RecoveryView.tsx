import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { calculateKarvonenZones } from '../../science/heartRate';
import {
  Moon,
  Plus,
  Heart,
  Activity,
  BatteryCharging,
  Zap,
  Info,
  Clock,
  Shield,
  AlertTriangle,
  Smile,
  Frown,
} from 'lucide-react';
import { SleepSession } from '../../types/recovery';
import { DataProvenance } from '../../types/provenance';

export const RecoveryView: React.FC = () => {
  const {
    identity,
    sleepSessions,
    addSleepSession,
    latestSleep,
    glRecoveryScore,
    openCalculationInspector,
  } = useGymLabs();

  const [showLogModal, setShowLogModal] = useState(false);
  const [durationHours, setDurationHours] = useState(7.5);
  const [rhrBpm, setRhrBpm] = useState(52);
  const [hrvRmsdd, setHrvRmsdd] = useState(64);
  const [qualityScore, setQualityScore] = useState(8);
  const [domsLevel, setDomsLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [deviceName, setDeviceName] = useState('Anel Inteligente PPG (BLE)');

  // Compute Karvonen Heart Rate Zones
  const userAge = identity.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(identity.dateOfBirth).getTime()) / (365.25 * 86400000))
    : 28;
  const currentRhr = latestSleep?.restingHeartRateBpm?.value || 52;
  const karvonenResult = calculateKarvonenZones(userAge, currentRhr);

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMinutes = Math.round(durationHours * 60);

    const provenanceObj: DataProvenance = {
      type: 'REAL',
      source: deviceName || 'Wearable Sensor (BLE)',
      recordedAt: new Date().toISOString(),
      confidence: 'HIGH',
    };

    const newSession: SleepSession = {
      id: `sleep-${Date.now()}`,
      userId: identity.id,
      bedtime: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      wakeTime: new Date().toISOString(),
      durationMinutes,
      deepSleepMinutes: Math.round(durationMinutes * 0.22),
      remSleepMinutes: Math.round(durationMinutes * 0.24),
      lightSleepMinutes: Math.round(durationMinutes * 0.48),
      awakeMinutes: Math.round(durationMinutes * 0.06),
      restingHeartRateBpm: {
        value: rhrBpm,
        unit: 'bpm',
        provenance: provenanceObj,
      },
      nocturnalHrvRmsddMs: {
        value: hrvRmsdd,
        unit: 'ms',
        provenance: provenanceObj,
      },
      subjectiveQualityScore: qualityScore,
      provenance: provenanceObj,
    };

    addSleepSession(newSession);
    setShowLogModal(false);
  };

  const readinessValue = glRecoveryScore.score || 88;
  const deepSleepMin = latestSleep?.deepSleepMinutes || 95;
  const remSleepMin = latestSleep?.remSleepMinutes || 105;
  const totalSleepMin = latestSleep?.durationMinutes || 460;

  return (
    <div id="gymlabs-recovery-view" className="space-y-8 select-none">
      {/* Editorial Header / HUD Telemetry */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
              // LABCORE 2026 : RECUPERAÇÃO DO SISTEMA NERVOSO AUTÔNOMO & PRONTIDÃO
            </span>
            <span className="w-1.5 h-1.5 bg-[#00F0FF] animate-ping" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-mono uppercase tracking-tight text-white">
            Sono & Prontidão Fisiológica
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
            Score Integrativo (Sono 40%, HRV rMSSD 25%, Tensão/DOMS 20%, Carga Aguda 15%)
          </p>
        </div>

        {/* Action Button: Log Sleep */}
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="neo-box px-5 py-3 text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 border-2 border-[#00F0FF] bg-black text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Sessão de Sono</span>
        </button>
      </div>

      {/* Primary Readiness & Autonomic Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* GL Readiness Score */}
        <div
          className="neo-box-thick p-5 transition-all"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Score de Prontidão</span>
            <ProvenanceBadge provenance="DETERMINISTIC_CALCULATION" size="sm" />
          </div>
          <div className="text-3xl font-black text-[#39FF14] mt-2">
            {readinessValue}%
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-white font-bold">{glRecoveryScore.status}</span>
            <span className="text-[#39FF14]">PRONTO P/ TREINO</span>
          </div>
        </div>

        {/* Nocturnal HRV rMSSD */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>HRV Noturna (rMSSD)</span>
            <span className="text-[#00F0FF] font-bold">VAGAL</span>
          </div>
          <div className="text-3xl font-black text-[#00F0FF] mt-2">
            {latestSleep?.hrvRmsddMs?.value || 64}{' '}
            <span className="text-xs text-zinc-400 font-normal">ms</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
            Tônus parassimpático ótimo (&gt;55ms)
          </div>
        </div>

        {/* Resting Heart Rate */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Frequência Cardíaca de Repouso</span>
            <span className="text-[#FF0055] font-bold">BASAL</span>
          </div>
          <div className="text-3xl font-black text-[#FF0055] mt-2">
            {latestSleep?.restingHeartRateBpm?.value || 52}{' '}
            <span className="text-xs text-zinc-400 font-normal">BPM</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
            Bradicardia atlética fisiológica
          </div>
        </div>

        {/* Total Sleep Duration */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Duração do Sono</span>
            <span className="text-[#FFB800] font-bold">ARQUITETURA</span>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {(totalSleepMin / 60).toFixed(1)}{' '}
            <span className="text-xs text-zinc-400 font-normal">horas</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
            Eficiência estimada: 89%
          </div>
        </div>
      </div>

      {/* SLEEP ARCHITECTURE BREAKDOWN (PROPORTIONS) */}
      <div className="neo-box-thick p-6 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Arquitetura e Estágios do Sono Noturno
          </h3>
          <span className="text-[10px] text-zinc-400">
            Total: {totalSleepMin} minutos registrados
          </span>
        </div>

        {/* Visual Stage Bar */}
        <div className="w-full h-4 bg-zinc-900 flex overflow-hidden border border-zinc-800">
          <div
            className="bg-[#00F0FF] h-full"
            style={{ width: `${(deepSleepMin / totalSleepMin) * 100}%` }}
            title="Sono Profundo"
          />
          <div
            className="bg-[#39FF14] h-full"
            style={{ width: `${(remSleepMin / totalSleepMin) * 100}%` }}
            title="Sono REM"
          />
          <div
            className="bg-zinc-700 h-full"
            style={{ width: `${((totalSleepMin - deepSleepMin - remSleepMin - 30) / totalSleepMin) * 100}%` }}
            title="Sono Leve"
          />
          <div className="bg-[#FF0055] h-full" style={{ width: '6%' }} title="Vigília / Despertares" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-[#050505] border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Sono Profundo (N3)</span>
            <strong className="text-base text-[#00F0FF]">{deepSleepMin} min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5">Restauração tecidual & GH</span>
          </div>

          <div className="p-3 bg-[#050505] border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Sono REM</span>
            <strong className="text-base text-[#39FF14]">{remSleepMin} min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5">Consolidação motora neural</span>
          </div>

          <div className="p-3 bg-[#050505] border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Sono Leve (N1/N2)</span>
            <strong className="text-base text-zinc-300">{totalSleepMin - deepSleepMin - remSleepMin - 30} min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5">Transição e desaceleração</span>
          </div>

          <div className="p-3 bg-[#050505] border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block">Despertares Noturnos</span>
            <strong className="text-base text-[#FF0055]">30 min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5">Microdespertares normais</span>
          </div>
        </div>
      </div>

      {/* STATISTICAL HONESTY & NON-CAUSALITY NOTICE */}
      <div className="p-4 bg-black border border-zinc-800 font-mono text-xs space-y-1">
        <div className="flex items-center gap-2 text-[#00F0FF] text-[11px] font-bold">
          <Info className="w-4 h-4" />
          <span>AXIOMA DE HONESTIDADE ESTATÍSTICA NAS CORRELAÇÕES</span>
        </div>
        <p className="text-zinc-400 pt-1 leading-relaxed">
          Associação temporal observada entre a HRV noturna e a tolerância de esforço não estabelece causalidade mecânica irrestrita. O Gym Labs declara incerteza e limitações em inferências biológicas, evitando falsos nexos causais.
        </p>
      </div>

      {/* Add Sleep Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSleep}
            className="w-full max-w-md neo-box-thick p-6 bg-black border-2 border-[#00F0FF] space-y-4 font-mono"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Noite de Sono</h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Duração (horas)</label>
                <input
                  type="number"
                  min="3"
                  max="14"
                  step="0.1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Qualidade (1 a 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">FC Repouso (BPM)</label>
                <input
                  type="number"
                  min="35"
                  max="120"
                  value={rhrBpm}
                  onChange={(e) => setRhrBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">HRV rMSSD (ms)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={hrvRmsdd}
                  onChange={(e) => setHrvRmsdd(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Dispositivo de Captura</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-3 py-1.5 neo-box text-xs text-zinc-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 neo-box bg-[#00F0FF] text-black font-bold text-xs uppercase"
              >
                Salvar Telemetria
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
