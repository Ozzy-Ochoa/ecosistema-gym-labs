import React, { useState, useEffect } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { BodyHudCanvas } from '../common/BodyHudCanvas';
import { calculateEstimated1RM } from '../../science/oneRepMax';
import { calculateSessionRpeLoad } from '../../science/trainingLoad';
import {
  Dumbbell,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Flame,
  Activity,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Shield,
  Trophy,
  Heart,
  TrendingUp,
  Crosshair,
} from 'lucide-react';
import { Exercise, TrainingSession, TrainingSet } from '../../types/training';

export const TrainingView: React.FC = () => {
  const {
    identity,
    trainingSessions,
    addTrainingSession,
    exercises,
    acwrMetrics,
    prVault,
    evaluateOverload,
    tanakaKarvonen,
    openCalculationInspector,
  } = useGymLabs();

  // Active Logger State
  const [isLogging, setIsLogging] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Upper Body Hypertrophy');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sessionRpe, setSessionRpe] = useState(8);
  const [patternFilter, setPatternFilter] = useState<string>('ALL');
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id || '');
  const [loggedSets, setLoggedSets] = useState<TrainingSet[]>([
    { setNumber: 1, reps: 8, loadKg: 80, rpe: 8, completed: true },
    { setNumber: 2, reps: 8, loadKg: 80, rpe: 8.5, completed: true },
    { setNumber: 3, reps: 7, loadKg: 80, rpe: 9, completed: true },
  ]);

  // Selected exercise for Progressive Overload Inspector
  const [overloadTargetExercise, setOverloadTargetExercise] = useState<string>('Supino Reto com Barra');

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerRemaining, setTimerRemaining] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerRemaining]);

  const handleStartTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setTimerRemaining(seconds);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    if (timerRemaining === 0) {
      setTimerRemaining(restSeconds);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(restSeconds);
  };

  // Submaximal 1RM Interactive Calculator State
  const [calcLoad, setCalcLoad] = useState<number>(100);
  const [calcReps, setCalcReps] = useState<number>(6);
  const [calcRpe, setCalcRpe] = useState<number>(8.5);

  const estimated1RMResult = calculateEstimated1RM(calcLoad, calcReps);

  const handleAddSet = () => {
    const nextNum = loggedSets.length + 1;
    const lastSet = loggedSets[loggedSets.length - 1];
    setLoggedSets([
      ...loggedSets,
      {
        setNumber: nextNum,
        reps: lastSet ? lastSet.reps : 10,
        loadKg: lastSet ? lastSet.loadKg : 60,
        rpe: lastSet ? lastSet.rpe : 8,
        completed: true,
      },
    ]);
  };

  const handleUpdateSet = (index: number, field: keyof TrainingSet, val: any) => {
    const updated = [...loggedSets];
    updated[index] = { ...updated[index], [field]: val };
    setLoggedSets(updated);
  };

  const handleRemoveSet = (index: number) => {
    if (loggedSets.length <= 1) return;
    setLoggedSets(loggedSets.filter((_, i) => i !== index));
  };

  const handleFinishSession = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEx = exercises.find((ex) => ex.id === selectedExerciseId) || exercises[0];

    const volumeKg = loggedSets.reduce((sum, s) => sum + s.loadKg * s.reps, 0);
    const sessionLoadResult = calculateSessionRpeLoad(durationMinutes, sessionRpe);

    const provObj = {
      type: 'REAL' as const,
      source: 'User Logged Session',
      recordedAt: new Date().toISOString(),
      confidence: 'HIGH' as const,
    };

    const newSession: TrainingSession = {
      id: `session-${Date.now()}`,
      userId: identity.id,
      title: sessionTitle,
      startedAt: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes,
      sessionRpe,
      calculatedVolumeKg: {
        value: volumeKg,
        unit: 'KG',
        provenance: { ...provObj, type: 'CALCULATED' },
      },
      calculatedLoadUnits: {
        value: sessionLoadResult,
        unit: 'AU',
        provenance: { ...provObj, type: 'CALCULATED' },
      },
      provenance: provObj,
      exercises: [
        {
          exerciseId: selectedEx.id,
          exerciseName: selectedEx.name,
          sets: loggedSets,
        },
      ],
    };

    addTrainingSession(newSession);
    setIsLogging(false);
  };

  const filteredExercises =
    patternFilter === 'ALL'
      ? exercises
      : exercises.filter((e) => e.pattern === patternFilter);

  // Progressive overload evaluation for selected exercise
  const overloadResult = evaluateOverload(overloadTargetExercise);

  return (
    <div id="gymlabs-training-view" className="space-y-8 select-none">
      {/* Editorial Header / HUD Telemetry */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
              // LABCORE 2026 : MOTOR DE PERIODIZAÇÃO DETERMINÍSTICA
            </span>
            <span className="w-1.5 h-1.5 bg-[#00F0FF] animate-ping" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-mono uppercase tracking-tight text-white">
            Treinamento & Sobrecarga
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
            Axiomas de Gabbett (ACWR), Epley/Brzycki (1RM), Tanaka (FCmáx) e Foster (Foster CR-10)
          </p>
        </div>

        {/* Action Button: Log Session */}
        <button
          type="button"
          onClick={() => setIsLogging(!isLogging)}
          className="neo-box px-5 py-3 text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 border-2 border-[#00F0FF] bg-black text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)] active:translate-x-0.5 active:translate-y-0.5"
        >
          {isLogging ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Fechar Console</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Registrar Sessão de Treino</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Anatomical 3D / HUD Vector Canvas */}
      <BodyHudCanvas />

      {/* Primary Telemetry Metrics Grid (Neo-Brutalist) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ACWR Metric */}
        <div className="neo-box-thick p-5 relative">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
            <span>Razão Carga Aguda:Crônica</span>
            <ProvenanceBadge provenance="DETERMINISTIC_CALCULATION" size="sm" />
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">
            {acwrMetrics.ratio !== null ? acwrMetrics.ratio.toFixed(2) : 'DADOS INSUF.'}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900 text-[11px] font-mono">
            <span className="text-[#39FF14] font-bold">{acwrMetrics.status}</span>
            <span className="text-zinc-500">Gabbett (2016)</span>
          </div>
        </div>

        {/* 7-day Acute Workload */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
            <span>Carga Aguda (7 Dias)</span>
            <span className="text-[#00F0FF] font-mono font-bold">AGUDO</span>
          </div>
          <div className="text-3xl font-black font-mono text-[#00F0FF] mt-2">
            {Math.round(acwrMetrics.acuteLoad7d || 0)} <span className="text-xs text-zinc-400 font-normal">AU</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
            Soma semanal dos últimos 7 dias
          </div>
        </div>

        {/* 28-day Chronic Workload */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
            <span>Carga Crônica (28 Dias)</span>
            <span className="text-[#39FF14] font-mono font-bold">FITNESS</span>
          </div>
          <div className="text-3xl font-black font-mono text-[#39FF14] mt-2">
            {Math.round(acwrMetrics.chronicLoad28d || 0)} <span className="text-xs text-zinc-400 font-normal">AU</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
            Capacidade adaptativa basal 28d
          </div>
        </div>

        {/* Histórico Registrado */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
            <span>Histórico Registrado</span>
            <span className={`font-mono text-xs font-bold ${acwrMetrics.dataSufficient ? 'text-[#39FF14]' : 'text-[#FFB800]'}`}>
              {acwrMetrics.dataSufficient ? 'SUFICIENTE' : 'EM AQUISIÇÃO'}
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">
            {acwrMetrics.daysRecorded} <span className="text-xs text-zinc-500 font-normal">/ 28 dias</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
            Janela ideal: 0.80 - 1.30 ACWR
          </div>
        </div>
      </div>

      {/* Active Session Logger Drawer */}
      {isLogging && (
        <form
          id="active-session-form"
          onSubmit={handleFinishSession}
          className="neo-box-thick p-6 bg-black border-2 border-[#00F0FF] space-y-6 shadow-[6px_6px_0px_0px_rgba(0,240,255,0.25)]"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00F0FF] animate-pulse inline-block" />
              <h3 className="font-mono text-base font-bold text-white uppercase tracking-tight">
                Console de Ingestão de Treinamento // Foster Session-RPE
              </h3>
            </div>
            <span className="text-xs font-mono text-[#00F0FF] border border-[#00F0FF] px-2 py-0.5">
              TELEMETRIA AO VIVO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-xs uppercase text-zinc-400 mb-1">Título da Sessão</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-zinc-400 mb-1">Duração (minutos)</label>
              <input
                type="number"
                min="5"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-zinc-400 mb-1">
                RPE da Sessão (1-10 Foster CR-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={sessionRpe}
                onChange={(e) => setSessionRpe(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              />
            </div>
          </div>

          {/* Exercise & Set Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Exercício Composto Alvo:
              </label>
              <button
                type="button"
                onClick={handleAddSet}
                className="px-2.5 py-1 neo-box text-xs text-[#00F0FF] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black font-mono font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Série</span>
              </button>
            </div>

            {/* Pattern Filter */}
            <div className="flex flex-wrap gap-1.5 items-center font-mono">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              {['ALL', 'SQUAT', 'HINGE', 'HORIZONTAL_PUSH', 'VERTICAL_PUSH', 'HORIZONTAL_PULL', 'VERTICAL_PULL'].map((pat) => (
                <button
                  key={pat}
                  type="button"
                  onClick={() => setPatternFilter(pat)}
                  className={`px-2 py-0.5 text-[10px] transition-colors ${
                    patternFilter === pat
                      ? 'bg-[#00F0FF] text-black font-bold'
                      : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {pat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white font-mono focus:border-[#00F0FF] focus:outline-none"
            >
              {filteredExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.pattern}) — {ex.targetMuscles.join(', ')}
                </option>
              ))}
            </select>

            {/* Set Table */}
            <div className="space-y-2 font-mono">
              <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase px-2">
                <span className="col-span-2">Série</span>
                <span className="col-span-3">Carga (kg)</span>
                <span className="col-span-3">Repetições</span>
                <span className="col-span-3">RPE / RIR</span>
                <span className="col-span-1 text-right">Ação</span>
              </div>

              {loggedSets.map((st, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center p-2 bg-[#050505] border border-zinc-800"
                >
                  <span className="col-span-2 text-xs font-bold text-white">#0{st.setNumber}</span>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    step="0.5"
                    value={st.loadKg}
                    onChange={(e) => handleUpdateSet(idx, 'loadKg', Number(e.target.value))}
                    className="col-span-3 px-2 py-1 bg-black border border-zinc-800 text-xs text-white text-center focus:border-[#00F0FF] focus:outline-none font-bold"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={st.reps}
                    onChange={(e) => handleUpdateSet(idx, 'reps', Number(e.target.value))}
                    className="col-span-3 px-2 py-1 bg-black border border-zinc-800 text-xs text-white text-center focus:border-[#00F0FF] focus:outline-none font-bold"
                  />
                  <input
                    type="number"
                    min="5"
                    max="10"
                    step="0.5"
                    value={st.rpe}
                    onChange={(e) => handleUpdateSet(idx, 'rpe', Number(e.target.value))}
                    className="col-span-3 px-2 py-1 bg-black border border-zinc-800 text-xs text-[#00F0FF] text-center focus:border-[#00F0FF] focus:outline-none font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(idx)}
                    className="col-span-1 text-right text-zinc-500 hover:text-[#FF0055] text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsLogging(false)}
              className="px-4 py-2 neo-box text-xs font-mono text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 neo-box bg-[#00F0FF] text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 shadow-[3px_3px_0px_0px_rgba(0,240,255,0.4)]"
            >
              Gravar Sessão no Enclave
            </button>
          </div>
        </form>
      )}

      {/* PR VAULT (4 VECTORS OF PERSONAL RECORDS) */}
      <div className="neo-box-thick p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFB800]" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              PR Vault // Cofre de Recordes Pessoais (4 Vetores)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#FFB800] border border-[#FFB800] px-2 py-0.5">
            DETERMINÍSTICO // 0 DADOS INVENTADOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {prVault.slice(0, 4).map((record) => (
            <div key={record.exerciseName} className="p-4 bg-[#050505] border border-zinc-800 space-y-3 font-mono">
              <span className="text-xs font-bold text-white truncate block">{record.exerciseName}</span>

              {/* Vector 1: Max Absolute Load */}
              <div className="p-2 bg-black border border-zinc-900">
                <span className="text-[9px] uppercase text-zinc-500 block">1. Carga Absoluta Máxima</span>
                <span className="text-xl font-bold text-[#FFB800]">{record.maxAbsoluteLoadKg} kg</span>
              </div>

              {/* Vector 2: Max Single-Set Volume */}
              <div className="p-2 bg-black border border-zinc-900">
                <span className="text-[9px] uppercase text-zinc-500 block">2. Maior Volume por Série</span>
                <span className="text-base font-bold text-[#00F0FF]">
                  {record.maxSetVolumeKg.volumeKg} kg{' '}
                  <span className="text-[10px] text-zinc-400 font-normal">
                    ({record.maxSetVolumeKg.reps}r @ {record.maxSetVolumeKg.loadKg}kg)
                  </span>
                </span>
              </div>

              {/* Vector 3: Max Estimated 1RM */}
              <div className="p-2 bg-black border border-zinc-900">
                <span className="text-[9px] uppercase text-zinc-500 block">3. 1RM Submáxima (Epley)</span>
                <span className="text-base font-bold text-[#39FF14]">
                  {record.maxEstimated1RmKg.estimated1Rm} kg
                </span>
              </div>

              {/* Vector 4: Peak Rep Records */}
              <div className="text-[10px] text-zinc-400">
                <span>Data do Recorde: </span>
                <strong className="text-zinc-200">
                  {new Date(record.maxLoadDate).toLocaleDateString()}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETERMINISTIC PROGRESSIVE OVERLOAD ENGINE (STRICT >= 2 SESSIONS RULE) */}
      <div className="neo-box-thick p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Motor de Sobrecarga Progressiva Determinística
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={overloadTargetExercise}
              onChange={(e) => setOverloadTargetExercise(e.target.value)}
              className="px-2 py-1 bg-black border border-zinc-700 text-xs font-mono text-white focus:border-[#00F0FF] focus:outline-none"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Evaluation Banner */}
        <div
          className={`p-4 border font-mono ${
            overloadResult.status === 'PROGRESSÃO'
              ? 'border-[#39FF14] bg-[#39FF14]/5 text-white'
              : overloadResult.status === 'DADOS INSUFICIENTES'
              ? 'border-[#FFB800] bg-[#FFB800]/5 text-[#FFB800]'
              : overloadResult.status === 'REGRESSÃO' || overloadResult.status === 'ESTAGNAÇÃO'
              ? 'border-[#FF0055] bg-[#FF0055]/5 text-white'
              : 'border-zinc-700 bg-zinc-950 text-white'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-zinc-400">Classificação:</span>
              <span
                className={`text-sm font-black px-2 py-0.5 border ${
                  overloadResult.status === 'PROGRESSÃO'
                    ? 'border-[#39FF14] text-[#39FF14]'
                    : overloadResult.status === 'DADOS INSUFICIENTES'
                    ? 'border-[#FFB800] text-[#FFB800]'
                    : 'border-[#FF0055] text-[#FF0055]'
                }`}
              >
                {overloadResult.status}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">
              Sessões Analisadas: <strong>{overloadResult.totalSessionsRecorded}</strong>
            </span>
          </div>

          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            {overloadResult.reasoning}
          </p>

          {overloadResult.status !== 'DADOS INSUFICIENTES' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-800 text-xs">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Delta Pico Carga:</span>
                <strong className={overloadResult.loadDeltaKg >= 0 ? 'text-[#39FF14]' : 'text-[#FF0055]'}>
                  {overloadResult.loadDeltaKg >= 0 ? `+${overloadResult.loadDeltaKg}` : overloadResult.loadDeltaKg} kg
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Delta Tonelagem:</span>
                <strong className={overloadResult.tonnageDeltaKg >= 0 ? 'text-[#00F0FF]' : 'text-[#FF0055]'}>
                  {overloadResult.tonnageDeltaKg >= 0 ? `+${overloadResult.tonnageDeltaKg}` : overloadResult.tonnageDeltaKg} kg
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Sessão Anterior:</span>
                <strong className="text-zinc-300">
                  {overloadResult.previousSession?.maxLoadKg || 0} kg max
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Sessão Recente:</span>
                <strong className="text-[#00F0FF]">
                  {overloadResult.currentSession?.maxLoadKg || 0} kg max
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TANAKA & KARVONEN CARDIO ZONES ENGINE */}
      <div className="neo-box-thick p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF0055]" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Zonas Cardiovasculares // Tanaka et al. (2001) & Karvonen
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF] px-2 py-0.5">
            FCmáx: {tanakaKarvonen.result.maxHeartRateBpm} BPM // FCR: {tanakaKarvonen.result.heartRateReserveBpm} BPM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono">
          {tanakaKarvonen.result.zones.map((z) => (
            <div
              key={z.zone}
              className="p-3 bg-[#050505] border border-zinc-800 space-y-2 hover:border-[#00F0FF] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00F0FF]">{z.zone}</span>
                <span className="text-[10px] text-zinc-500">{z.targetPctRange}</span>
              </div>
              <div className="text-lg font-bold text-white">
                {z.minBpm} - {z.maxBpm} <span className="text-[10px] text-zinc-500">BPM</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                {z.metabolicFocus}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMAXIMAL 1RM EXTRAPOLATION & REST TIMER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submaximal 1RM Calculator */}
        <div className="neo-box-thick p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FFB800]" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Calculadora Submáxima de 1RM (Epley / Brzycki)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#FFB800] border border-[#FFB800] px-2 py-0.5">
              EPLEY 1985
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono">
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1">Carga (kg)</label>
              <input
                type="number"
                min="20"
                max="500"
                value={calcLoad}
                onChange={(e) => setCalcLoad(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-black border border-zinc-800 text-sm font-bold text-white focus:border-[#FFB800] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1">Repetições</label>
              <input
                type="number"
                min="1"
                max="12"
                value={calcReps}
                onChange={(e) => setCalcReps(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-black border border-zinc-800 text-sm font-bold text-white focus:border-[#FFB800] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1">RPE (Borg)</label>
              <input
                type="number"
                min="6"
                max="10"
                step="0.5"
                value={calcRpe}
                onChange={(e) => setCalcRpe(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-black border border-zinc-800 text-sm font-bold text-[#00F0FF] focus:border-[#00F0FF] focus:outline-none"
              />
            </div>
          </div>

          {estimated1RMResult.result ? (
            <>
              <div className="p-4 bg-black border border-zinc-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">1RM Estimada (Epley):</span>
                  <div className="text-3xl font-black text-[#FFB800]">
                    {estimated1RMResult.result.estimated1RmKg} <span className="text-xs text-zinc-500 font-normal">kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block">Faixa de Dispersão (±3%):</span>
                  <span className="text-xs text-zinc-300 font-bold">
                    {Math.round(estimated1RMResult.result.estimated1RmKg * 0.97)} - {Math.round(estimated1RMResult.result.estimated1RmKg * 1.03)} kg
                  </span>
                </div>
              </div>

              {/* Intensity Spectrum Table */}
              <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs">
                {[
                  { pct: 90, reps: '3-4 reps' },
                  { pct: 85, reps: '5-6 reps' },
                  { pct: 80, reps: '7-8 reps' },
                  { pct: 75, reps: '9-10 reps' },
                ].map((t) => (
                  <div key={t.pct} className="p-2 bg-[#050505] border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">{t.pct}% 1RM</span>
                    <strong className="text-white">
                      {Math.round(estimated1RMResult.result!.estimated1RmKg * (t.pct / 100))} kg
                    </strong>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">{t.reps}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 bg-black border border-zinc-800 text-xs text-zinc-500 font-mono text-center">
              Insira carga e repetições válidas para extrapolação submáxima.
            </div>
          )}
        </div>

        {/* Inter-set Rest Chronometer & Autoregulation */}
        <div className="neo-box-thick p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00F0FF]" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Cronômetro de Recuperação Entre Séries
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF] px-2 py-0.5">
              AUTORREGULAÇÃO
            </span>
          </div>

          <div className="p-6 bg-black border border-zinc-800 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">Tempo Restante</span>
              <div
                className={`text-5xl font-black ${
                  timerRemaining === 0 ? 'text-[#39FF14] animate-pulse' : 'text-white'
                }`}
              >
                {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTimer}
                className={`px-4 py-3 neo-box font-bold text-xs flex items-center gap-1.5 transition-all ${
                  isTimerRunning
                    ? 'bg-[#FFB800] text-black border border-[#FFB800]'
                    : 'bg-[#00F0FF] text-black border border-[#00F0FF] shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)]'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{timerRemaining === 0 ? 'Reiniciar' : 'Iniciar'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetTimer}
                className="p-3 neo-box bg-[#050505] text-zinc-300 hover:text-white"
                title="Resetar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-[10px] text-zinc-500 uppercase">Presets:</span>
            {[
              { label: '30s (Metabólico)', sec: 30 },
              { label: '60s (Acessório)', sec: 60 },
              { label: '90s (Hipertrofia)', sec: 90 },
              { label: '120s (Composto)', sec: 120 },
              { label: '180s (Força)', sec: 180 },
              { label: '300s (Potência Máx)', sec: 300 },
            ].map((p) => (
              <button
                key={p.sec}
                type="button"
                onClick={() => handleStartTimer(p.sec)}
                className={`px-2.5 py-1 text-[10px] transition-colors ${
                  restSeconds === p.sec
                    ? 'bg-[#00F0FF] text-black font-bold'
                    : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
