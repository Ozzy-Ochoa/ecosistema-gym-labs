import React, { useState, useEffect, useMemo } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  UserRoutineSession,
  TrainingSession,
  TrainingSet,
  ExerciseLog,
} from '../../../types/training';
import { calculateSessionRpeLoad } from '../../../science/trainingLoad';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  Dumbbell,
  AlertCircle,
  Trophy,
  X,
  Timer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ActiveWorkoutRunnerModalProps {
  session: UserRoutineSession;
  isOpen: boolean;
  onClose: () => void;
}

interface LiveSetState {
  exerciseIndex: number;
  setIndex: number;
  setNumber: number;
  targetReps: string;
  repsDone: number;
  loadKg: number;
  isFailure: boolean;
  completed: boolean;
}

export const ActiveWorkoutRunnerModal: React.FC<ActiveWorkoutRunnerModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const {
    identity,
    bodyRecords,
    addTrainingSession,
    setDayAttendance,
  } = useGymLabs();

  // Elapsed Session Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);

  // Rest Timer State
  const [restDuration, setRestDuration] = useState(60);
  const [restRemaining, setRestRemaining] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [restAlertFlash, setRestAlertFlash] = useState(false);

  const triggerRestEndAlert = () => {
    setRestAlertFlash(true);
    setTimeout(() => setRestAlertFlash(false), 3500);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [0, 0.18, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now + offset);
          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.12);
        });
      }
    } catch {
      // Audio fallback safe
    }
  };

  // Live state of all sets across all exercises in this session
  const [exerciseSetsState, setExerciseSetsState] = useState<LiveSetState[][]>([]);

  // Session RPE evaluation (1-10)
  const [sessionRpe, setSessionRpe] = useState(8.5);

  // Report Modal state after finishing workout
  const [showReport, setShowReport] = useState(false);
  const [finishedSessionReport, setFinishedSessionReport] = useState<{
    durationMinutes: number;
    totalVolumeKg: number;
    totalSets: number;
    totalReps: number;
    failuresCount: number;
    estimatedCaloriesBurned: number;
  } | null>(null);

  // Initialize sets when session opens
  useEffect(() => {
    if (session && session.exercises) {
      const initial: LiveSetState[][] = session.exercises.map((ex, exIdx) => {
        const targetRepsNum = parseInt(ex.repsTarget, 10) || 10;
        return Array.from({ length: ex.sets }).map((_, sIdx) => ({
          exerciseIndex: exIdx,
          setIndex: sIdx,
          setNumber: sIdx + 1,
          targetReps: ex.repsTarget,
          repsDone: targetRepsNum,
          loadKg: ex.loadKgTarget || 0, // se deixado em branco, vem 0 para preencher na hora
          isFailure: false,
          completed: false,
        }));
      });
      setExerciseSetsState(initial);
      setElapsedSeconds(0);
      setIsSessionPaused(false);
      setRestRemaining(0);
      setIsRestActive(false);
      setShowReport(false);
      setFinishedSessionReport(null);
    }
  }, [session, isOpen]);

  // Session Stopwatch interval
  useEffect(() => {
    if (!isOpen || isSessionPaused || showReport) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSessionPaused, showReport]);

  // Rest Timer interval
  useEffect(() => {
    if (!isRestActive || restRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          setIsRestActive(false);
          triggerRestEndAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestActive, restRemaining]);

  if (!isOpen) return null;

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleUpdateSetField = (
    exIdx: number,
    setIdx: number,
    field: keyof LiveSetState,
    value: any
  ) => {
    const updated = [...exerciseSetsState];
    if (!updated[exIdx]) return;
    updated[exIdx][setIdx] = {
      ...updated[exIdx][setIdx],
      [field]: value,
    };
    setExerciseSetsState(updated);
  };

  const handleToggleCompleteSet = (exIdx: number, setIdx: number) => {
    const current = exerciseSetsState[exIdx]?.[setIdx];
    if (!current) return;
    const nextCompleted = !current.completed;
    handleUpdateSetField(exIdx, setIdx, 'completed', nextCompleted);

    // If marking as completed, start rest timer!
    if (nextCompleted) {
      const restSec = session.exercises[exIdx]?.restSeconds || 60;
      setRestDuration(restSec);
      setRestRemaining(restSec);
      setIsRestActive(true);
    }
  };

  const handleStartCustomRest = (seconds: number) => {
    setRestDuration(seconds);
    setRestRemaining(seconds);
    setIsRestActive(true);
  };

  const handleSkipRest = () => {
    setIsRestActive(false);
    setRestRemaining(0);
  };

  // Finish Workout Session
  const handleFinishWorkout = () => {
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    const userWeight = bodyRecords[0]?.weightKg?.value || identity.weightKg || 75;

    // Calculate metrics
    let totalVolume = 0;
    let totalSetsDone = 0;
    let totalRepsDone = 0;
    let failures = 0;

    const recordedExercises: ExerciseLog[] = session.exercises.map((ex, exIdx) => {
      const sets = exerciseSetsState[exIdx] || [];
      const completedSets: TrainingSet[] = sets.map((st) => {
        const vol = (st.loadKg || 0) * (st.repsDone || 0);
        totalVolume += vol;
        if (st.completed) totalSetsDone++;
        totalRepsDone += st.repsDone || 0;
        if (st.isFailure) failures++;

        return {
          setNumber: st.setNumber,
          reps: st.repsDone || 10,
          loadKg: st.loadKg || 0,
          rpe: st.isFailure ? 10 : sessionRpe,
          rir: st.isFailure ? 0 : 2,
          restSeconds: ex.restSeconds || 60,
          completed: st.completed,
        };
      });

      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: completedSets,
        notes: ex.notes,
      };
    });

    // Caloric expenditure: MET 6.0 * weight (kg) * (duration in hours)
    const calBurned = Math.round(6.0 * userWeight * (durationMins / 60));

    // Construct TrainingSession entity
    const newSession: TrainingSession = {
      id: `session-${Date.now()}`,
      userId: identity.id,
      title: session.name,
      startedAt: new Date(Date.now() - durationMins * 60000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: durationMins,
      sessionRpe,
      calculatedVolumeKg: {
        value: totalVolume,
        unit: 'KG',
        provenance: {
          type: 'CALCULATED',
          source: 'Console Ativo Gym Labs',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      calculatedLoadUnits: {
        value: calculateSessionRpeLoad(durationMins, sessionRpe),
        unit: 'AU',
        provenance: {
          type: 'CALCULATED',
          source: 'Foster Session-RPE',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      provenance: {
        type: 'REAL',
        source: 'Sessão Executada pelo Usuário',
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
      exercises: recordedExercises,
    };

    // Save session to history
    addTrainingSession(newSession);

    // Auto mark attendance in Gym Attendance Calendar for today
    const todayStr = new Date().toISOString().split('T')[0];
    setDayAttendance({
      date: todayStr,
      status: 'ATTENDED',
      workoutType: session.name.toLowerCase().includes('push')
        ? 'PUSH'
        : session.name.toLowerCase().includes('pull')
        ? 'PULL'
        : session.name.toLowerCase().includes('perna') || session.name.toLowerCase().includes('leg')
        ? 'LEGS'
        : session.name.toLowerCase().includes('ombro')
        ? 'UPPER'
        : 'FULL_BODY',
      title: session.name,
      durationMinutes: durationMins,
      volumeKg: totalVolume,
    });

    // Prepare report data & show modal
    setFinishedSessionReport({
      durationMinutes: durationMins,
      totalVolumeKg: totalVolume,
      totalSets: totalSetsDone,
      totalReps: totalRepsDone,
      failuresCount: failures,
      estimatedCaloriesBurned: calBurned,
    });
    setShowReport(true);
  };

  return (
    <div
      id="active-workout-runner-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono select-none"
    >
      {/* FINAL REPORT MODAL */}
      {showReport && finishedSessionReport && (
        <div className="bg-zinc-950 border border-white w-full max-w-xl p-5 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-fadeIn">
          <div className="text-center space-y-2 border-b border-zinc-800 pb-4">
            <div className="w-12 h-12 bg-white text-black font-black flex items-center justify-center mx-auto text-xl shadow-lg">
              ✓
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">
              SESSÃO DE TREINO FINALIZADA COM SUCESSO
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              Relatório Completo de Treinamento
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              {session.name} • {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Key Result Vectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-black border border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Tempo Total</span>
              <span className="text-xl font-black text-white font-mono">
                {finishedSessionReport.durationMinutes} min
              </span>
            </div>

            <div className="p-3 bg-black border border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Volume Total (Tonelagem)</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {finishedSessionReport.totalVolumeKg.toLocaleString('pt-BR')} kg
              </span>
            </div>

            <div className="p-3 bg-black border border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Séries Concluídas</span>
              <span className="text-xl font-black text-white font-mono">
                {finishedSessionReport.totalSets} séries
              </span>
            </div>

            <div className="p-3 bg-black border border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Total de Repetições</span>
              <span className="text-xl font-black text-white font-mono">
                {finishedSessionReport.totalReps} reps
              </span>
            </div>

            <div className="p-3 bg-black border border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Falhas Musculares</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {finishedSessionReport.failuresCount} falhas
              </span>
            </div>

            {/* ESTIMATED CALORIES BURNED INTEGRATED INTO DAILY BALANCE */}
            <div className="p-3 bg-emerald-950/60 border border-emerald-700/80 space-y-1">
              <span className="text-[9px] uppercase font-bold text-emerald-300 block flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" />
                <span>Gasto Calórico</span>
              </span>
              <span className="text-xl font-black text-emerald-300 font-mono">
                ~{finishedSessionReport.estimatedCaloriesBurned} kcal
              </span>
            </div>
          </div>

          {/* Integration with Daily Energy Expenditure callout */}
          <div className="p-3.5 bg-black border border-zinc-800 text-xs space-y-1 font-sans">
            <span className="font-bold text-white uppercase text-[11px] block flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sincronizado ao seu Gasto Calórico Diário (TDEE)</span>
            </span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              O gasto estimado de <strong>{finishedSessionReport.estimatedCaloriesBurned} kcal</strong> foi automaticamente unificado ao balanço energético do seu dia na aba <strong>Início</strong> e <strong>Saúde</strong>, e sua presença de hoje foi confirmada na frequência da academia!
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
            >
              Concluir & Fechar Console
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE WORKOUT CONSOLE */}
      {!showReport && (
        <div className="bg-zinc-950 border border-zinc-700 w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Top Bar: Live Stopwatch & Controls */}
          <div className="p-3 sm:p-4 bg-black border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                  CONSOLE DE TREINO ATIVO // EM EXECUÇÃO
                </span>
                <h2 className="text-sm sm:text-base font-black uppercase text-white truncate max-w-[240px] sm:max-w-md">
                  {session.name}
                </h2>
              </div>
            </div>

            {/* Live Stopwatch Pill */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-white font-mono text-base font-black flex items-center gap-2 shadow-inner">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsSessionPaused(!isSessionPaused)}
                className={`p-2 border transition-colors cursor-pointer ${
                  isSessionPaused
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title={isSessionPaused ? 'Retomar treino' : 'Pausar cronômetro'}
              >
                {isSessionPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleFinishWorkout}
                className="px-4 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>FINALIZAR TREINO</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-500 hover:text-white cursor-pointer ml-1"
                title="Fechar (treino continua salvo no estado)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rest Timer Drawer (Active between sets) */}
          {isRestActive && (
            <div className="p-3 bg-blue-950/80 border-b border-blue-800 text-white flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-blue-400 animate-spin" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-300 block">
                    Temporizador de Descanso
                  </span>
                  <div className="text-xl font-black font-mono text-white">
                    {formatTime(restRemaining)}
                    <span className="text-xs text-blue-300 font-normal ml-2">
                      (alvo: {restDuration}s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRestRemaining((prev) => prev + 30)}
                  className="px-2 py-1 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold border border-blue-700 cursor-pointer"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={handleSkipRest}
                  className="px-3 py-1 bg-white text-black font-black text-[11px] uppercase hover:bg-zinc-200 cursor-pointer"
                >
                  Pular Descanso
                </button>
              </div>
            </div>
          )}

          {/* Rest Alert Flash Notification Banner */}
          {restAlertFlash && (
            <div className="p-3 bg-amber-400 text-black font-black flex items-center justify-between border-b-2 border-black animate-pulse">
              <div className="flex items-center gap-2 text-xs uppercase">
                <span className="text-base">🔔</span>
                <span>DESCANSO CONCLUÍDO! INICIE A PRÓXIMA SÉRIE COM INTENSIDADE MÁXIMA!</span>
              </div>
              <button
                type="button"
                onClick={() => setRestAlertFlash(false)}
                className="px-2 py-0.5 bg-black text-white text-[10px] uppercase font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          )}

          {/* Exercise Sets Table */}
          <div className="p-3 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {session.exercises.map((ex, exIdx) => {
              const sets = exerciseSetsState[exIdx] || [];
              const allDone = sets.length > 0 && sets.every((s) => s.completed);

              return (
                <div
                  key={ex.id || exIdx}
                  className={`p-3.5 bg-black border transition-all space-y-3 ${
                    allDone ? 'border-zinc-800 opacity-90' : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Exercise Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white text-black font-black text-[10px] flex items-center justify-center">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-tight">
                          {ex.exerciseName}
                        </h3>
                        <span className="text-[10px] text-zinc-400 font-sans">
                          {ex.muscleGroup} • Alvo: {ex.sets} séries × {ex.repsTarget} reps • Descanso: {ex.restSeconds || 60}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartCustomRest(ex.restSeconds || 60)}
                        className="px-2 py-0.5 border border-zinc-800 hover:border-zinc-600 text-[10px] text-zinc-400 hover:text-white cursor-pointer uppercase flex items-center gap-1 font-bold"
                      >
                        <Timer className="w-3 h-3 text-zinc-400" />
                        <span>Descansar {ex.restSeconds || 60}s</span>
                      </button>
                    </div>
                  </div>

                  {/* Sets Rows */}
                  <div className="space-y-1.5">
                    {/* Header Columns */}
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 uppercase px-2">
                      <span className="col-span-2">Série</span>
                      <span className="col-span-3 text-center">Carga (kg)</span>
                      <span className="col-span-3 text-center">Reps Feitas</span>
                      <span className="col-span-2 text-center">Falha?</span>
                      <span className="col-span-2 text-right">Concluir</span>
                    </div>

                    {sets.map((st, setIdx) => (
                      <div
                        key={setIdx}
                        className={`grid grid-cols-12 gap-2 items-center p-2 transition-all border ${
                          st.completed
                            ? 'bg-zinc-950/80 border-emerald-900/60'
                            : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        {/* Set Number */}
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className={`text-xs font-black font-mono ${st.completed ? 'text-emerald-400' : 'text-white'}`}>
                            #{st.setNumber}
                          </span>
                          <span className="text-[9px] text-zinc-500 hidden sm:inline font-mono">
                            (alvo {st.targetReps})
                          </span>
                        </div>

                        {/* Load (kg) Input - Editable on the fly! */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            max="500"
                            step="0.5"
                            value={st.loadKg === 0 ? '' : st.loadKg}
                            onChange={(e) =>
                              handleUpdateSetField(
                                exIdx,
                                setIdx,
                                'loadKg',
                                e.target.value === '' ? 0 : Number(e.target.value)
                              )
                            }
                            placeholder="Peso kg"
                            className="w-full p-1.5 bg-black border border-zinc-800 text-center font-bold text-xs text-white outline-none focus:border-white placeholder:text-zinc-600"
                          />
                        </div>

                        {/* Reps Input */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={st.repsDone}
                            onChange={(e) =>
                              handleUpdateSetField(
                                exIdx,
                                setIdx,
                                'repsDone',
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-1.5 bg-black border border-zinc-800 text-center font-bold text-xs text-white outline-none focus:border-white"
                          />
                        </div>

                        {/* Failure / Falha Indicator Toggle */}
                        <div className="col-span-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSetField(exIdx, setIdx, 'isFailure', !st.isFailure)
                            }
                            className={`px-2 py-1 text-[10px] font-black uppercase transition-all cursor-pointer border ${
                              st.isFailure
                                ? 'bg-red-950 border-red-600 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                            title="Indicar que a série atingiu falha muscular concêntrica (RPE 10 / RIR 0)"
                          >
                            {st.isFailure ? 'FALHA ✓' : 'FALHA?'}
                          </button>
                        </div>

                        {/* Complete Checkbox */}
                        <div className="col-span-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleCompleteSet(exIdx, setIdx)}
                            className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all cursor-pointer flex items-center justify-end gap-1 ml-auto border ${
                              st.completed
                                ? 'bg-emerald-600 text-black border-emerald-500 shadow-sm'
                                : 'bg-zinc-900 border-zinc-700 text-white hover:bg-white hover:text-black'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{st.completed ? 'Feito' : 'Check'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ex.notes && (
                    <p className="text-[10px] text-zinc-500 font-sans italic pt-0.5">
                      Nota técnica: {ex.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: Evaluation & Finalize */}
          <div className="p-3 sm:p-4 bg-black border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-zinc-400 uppercase font-bold">
                Percepção de Esforço da Sessão (RPE Foster 1-10):
              </label>
              <select
                value={sessionRpe}
                onChange={(e) => setSessionRpe(Number(e.target.value))}
                className="p-1 bg-zinc-950 border border-zinc-700 text-white font-bold outline-none text-xs"
              >
                <option value={6}>6 - Fácil / Recuperativo</option>
                <option value={7}>7 - Moderado</option>
                <option value={8}>8 - Difícil (2 reps reserva)</option>
                <option value={8.5}>8.5 - Muito Difícil (1-2 reps reserva)</option>
                <option value={9}>9 - Quase Máximo (1 rep reserva)</option>
                <option value={9.5}>9.5 - Extremo (talvez 0-1 rep)</option>
                <option value={10}>10 - Máximo Absoluto (Falha)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold text-xs cursor-pointer"
              >
                Continuar Depois
              </button>

              <button
                type="button"
                onClick={handleFinishWorkout}
                className="px-5 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>FINALIZAR TREINO & VER RELATÓRIO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
