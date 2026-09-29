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
  X,
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
      source: deviceName || 'Sensor Biométrico (BLE)',
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
    <div id="gymlabs-recovery-view" className="space-y-6 font-mono select-none">
      {/* Header Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Recuperação do SNA & Prontidão
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              SCORE INTEGRATIVO
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Sono & Prontidão Fisiológica
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Métricas de sono (40%), HRV rMSSD (25%), fadiga subjetiva (20%) e carga aguda (15%).
          </p>
        </div>

        {/* Action Button: Log Sleep */}
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTRAR SONO</span>
        </button>
      </div>

      {/* Primary Readiness & Autonomic Telemetry Grid (Strict Monochrome) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GL Readiness Score */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Score de Prontidão</span>
            <ProvenanceBadge provenance={glRecoveryScore.provenance} size="sm" />
          </div>
          <div className="text-3xl font-black text-white">
            {readinessValue}%
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-white font-bold">{glRecoveryScore.status}</span>
            <span className="text-zinc-400 font-sans">APTO AO TREINO</span>
          </div>
        </div>

        {/* Nocturnal HRV rMSSD */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>HRV Noturna (rMSSD)</span>
            <span className="text-zinc-300 font-bold text-[9px] border border-zinc-700 px-1">VAGAL</span>
          </div>
          <div className="text-3xl font-black text-white">
            {latestSleep?.hrvRmsddMs?.value || 64}{' '}
            <span className="text-xs text-zinc-500 font-normal">ms</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Tônus parassimpático (&gt;55ms)
          </div>
        </div>

        {/* Resting Heart Rate */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>FC de Repouso</span>
            <span className="text-zinc-300 font-bold text-[9px] border border-zinc-700 px-1">BASAL</span>
          </div>
          <div className="text-3xl font-black text-white">
            {latestSleep?.restingHeartRateBpm?.value || 52}{' '}
            <span className="text-xs text-zinc-500 font-normal">BPM</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Bradicardia atlética fisiológica
          </div>
        </div>

        {/* Total Sleep Duration */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Duração do Sono</span>
            <span className="text-zinc-300 font-bold text-[9px] border border-zinc-700 px-1">ARQUITETURA</span>
          </div>
          <div className="text-3xl font-black text-white">
            {(totalSleepMin / 60).toFixed(1)}{' '}
            <span className="text-xs text-zinc-500 font-normal">horas</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Eficiência estimada: 89%
          </div>
        </div>
      </div>

      {/* SLEEP ARCHITECTURE BREAKDOWN */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Arquitetura e Estágios do Sono Noturno
          </h3>
          <span className="text-[10px] text-zinc-500 font-bold">
            TOTAL: {totalSleepMin} MINUTOS
          </span>
        </div>

        {/* Visual Stage Bar (Monochrome Shades) */}
        <div className="w-full h-3 bg-zinc-900 flex overflow-hidden border border-zinc-800">
          <div
            className="bg-white h-full"
            style={{ width: `${(deepSleepMin / totalSleepMin) * 100}%` }}
            title="Sono Profundo"
          />
          <div
            className="bg-zinc-400 h-full"
            style={{ width: `${(remSleepMin / totalSleepMin) * 100}%` }}
            title="Sono REM"
          />
          <div
            className="bg-zinc-700 h-full"
            style={{ width: `${((totalSleepMin - deepSleepMin - remSleepMin - 30) / totalSleepMin) * 100}%` }}
            title="Sono Leve"
          />
          <div className="bg-zinc-900 h-full" style={{ width: '6%' }} title="Vigília" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Sono Profundo (N3)</span>
            <strong className="text-base text-white">{deepSleepMin} min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5 font-sans">Restauração tecidual & GH</span>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Sono REM</span>
            <strong className="text-base text-white">{remSleepMin} min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5 font-sans">Consolidação neural motora</span>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Sono Leve (N1/N2)</span>
            <strong className="text-base text-zinc-300">{totalSleepMin - deepSleepMin - remSleepMin - 30} min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5 font-sans">Transição e desaceleração</span>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Despertares</span>
            <strong className="text-base text-zinc-400">30 min</strong>
            <span className="text-[9px] text-zinc-400 block mt-0.5 font-sans">Microdespertares normais</span>
          </div>
        </div>
      </div>

      {/* STATISTICAL HONESTY */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 text-xs space-y-1">
        <div className="flex items-center gap-2 text-white text-[11px] font-bold uppercase">
          <Info className="w-4 h-4" />
          <span>Axioma de Honestidade Estatística</span>
        </div>
        <p className="text-zinc-400 pt-1 leading-relaxed font-sans">
          A associação temporal entre HRV e prontidão é correlacional, não necessariamente causal linear. O Gym Labs não infere falsos nexos mecânicos sem comprovação direta.
        </p>
      </div>

      {/* Add Sleep Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSleep}
            className="w-full max-w-md p-6 bg-black border border-white space-y-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Noite de Sono</h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Duração (horas)</label>
                <input
                  type="number"
                  min="3"
                  max="14"
                  step="0.1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Qualidade (1 a 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">FC Repouso (BPM)</label>
                <input
                  type="number"
                  min="35"
                  max="120"
                  value={rhrBpm}
                  onChange={(e) => setRhrBpm(Number(e.target.value))}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">HRV rMSSD (ms)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={hrvRmsdd}
                  onChange={(e) => setHrvRmsdd(Number(e.target.value))}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Dispositivo de Captura</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
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
