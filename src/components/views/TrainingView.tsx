import React, { useState, useEffect } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { BodyHudCanvas } from '../common/BodyHudCanvas';
import { GymAttendanceCalendar } from '../common/GymAttendanceCalendar';
import { calculateEstimated1RM } from '../../science/oneRepMax';
import { calculateSessionRpeLoad } from '../../science/trainingLoad';
import {
  Dumbbell,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Flame,
  Activity,
  Filter,
  Trophy,
  Heart,
  TrendingUp,
  X,
} from 'lucide-react';
import { Exercise, TrainingSession, TrainingSet, UserRoutineSession } from '../../types/training';
import { RoutineCustomizerModal } from './training/RoutineCustomizerModal';
import { ActiveWorkoutRunnerModal } from './training/ActiveWorkoutRunnerModal';
import { Sliders, Sparkles, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';

export const TrainingView: React.FC = () => {
  const {
    identity,
    profile,
    trainingSessions,
    addTrainingSession,
    exercises,
    acwrMetrics,
    prVault,
    evaluateOverload,
    tanakaKarvonen,
    openCalculationInspector,
    activePrescribedWorkoutPlan,
    userWorkoutRoutine,
    resetToSuggestedRoutine,
    todayTrainingCalories,
  } = useGymLabs();

  const [activePrescribedSessionIdx, setActivePrescribedSessionIdx] = useState(0);
  const [selectedRoutineSplitIdx, setSelectedRoutineSplitIdx] = useState(0);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [activeRunnerSession, setActiveRunnerSession] = useState<UserRoutineSession | null>(null);
  const [viewAutonomousMode, setViewAutonomousMode] = useState(false);

  // Active Logger State
  const [isLogging, setIsLogging] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Hipertrofia Superior A');
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
      source: 'Sessão Registrada pelo Usuário',
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
    <div id="gymlabs-training-view" className="space-y-6 font-mono select-none">
      {/* Header Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Motor de Periodização & Sobrecarga
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              AFERIÇÃO DETERMINÍSTICA
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Treinamento & Sobrecarga Progressiva
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Métricas de Gabbett (ACWR), Epley/Brzycki (1RM), Tanaka (FCmáx) e Foster (Session-RPE).
          </p>
        </div>

        {/* Action Button: Log Session */}
        <button
          type="button"
          onClick={() => setIsLogging(!isLogging)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] shrink-0"
        >
          {isLogging ? (
            <>
              <Pause className="w-4 h-4" />
              <span>FECHAR CONSOLE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>REGISTRAR TREINO</span>
            </>
          )}
        </button>
      </div>

      {/* WORKOUT ROUTINE SECTION: PERSONAL TRAINER PLAN OR AUTONOMOUS SUGGESTED/CUSTOM PLAN */}
      {activePrescribedWorkoutPlan && !viewAutonomousMode ? (
        /* CONDITION 1: ATHLETE HAS PERSONAL TRAINER (PRESCRIBED & SYNCHRONIZED) */
        <div className="p-5 bg-zinc-950 border border-blue-900/60 shadow-[0_0_20px_rgba(59,130,246,0.12)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                PT
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    FICHA OFICIAL // PRESCRIÇÃO PERSONAL TRAINER
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                    PLANO CONTRATADO • SINCRONIZADO
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Prescrito por: <strong className="text-white">{activePrescribedWorkoutPlan.authorName || 'Personal Trainer'}</strong> (CREF) • {activePrescribedWorkoutPlan.title || 'Plano de Treino'} (v{activePrescribedWorkoutPlan.version || '1.0'})
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const sessions = activePrescribedWorkoutPlan?.sessions || [];
                  const safeIdx = Math.min(activePrescribedSessionIdx, Math.max(0, sessions.length - 1));
                  const sess = sessions[safeIdx] || sessions[0];
                  if (sess) {
                    const runnerSess: UserRoutineSession = {
                      id: sess.id || `pt-sess-${safeIdx}`,
                      splitLetter: sess.splitLetter || String.fromCharCode(65 + safeIdx),
                      name: sess.name || `Treino ${sess.splitLetter || safeIdx + 1}`,
                      daysOfWeek: [1],
                      targetMuscles: sess.targetMuscles || ['Geral'],
                      estimatedDurationMinutes: sess.estimatedDurationMinutes || 60,
                      exercises: (sess.exercises || []).map((ex, i) => ({
                        id: ex?.id || `pt-ex-${i}`,
                        exerciseId: ex?.exerciseId || `ex-${i}`,
                        exerciseName: ex?.exerciseName || 'Exercício',
                        muscleGroup: ex?.muscleGroup || 'Geral',
                        sets: ex?.sets || 3,
                        repsTarget: ex?.reps || '10',
                        loadKgTarget: ex?.loadKg,
                        restSeconds: ex?.restSeconds || 60,
                        notes: ex?.notes,
                      })),
                    };
                    setActiveRunnerSession(runnerSess);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <PlayCircle className="w-4 h-4 fill-current" />
                <span>ATIVAR ESTE TREINO AGORA</span>
              </button>

              <button
                type="button"
                onClick={() => setViewAutonomousMode(true)}
                className="px-3 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-[11px] font-bold uppercase transition-all cursor-pointer"
                title="Ver como seria o treino se você treinasse de forma autônoma sem personal"
              >
                <span>Ver Modo Autônomo</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-blue-600 pl-2.5">
            Condição ativa: Você possui acompanhamento com Personal Trainer. Sua ficha é calibrada pelo profissional e atualizada em tempo real conforme sua evolução.
          </p>

          {/* Sessions Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {(activePrescribedWorkoutPlan?.sessions || []).map((sess, idx) => (
              <button
                key={sess?.id || idx}
                type="button"
                onClick={() => setActivePrescribedSessionIdx(idx)}
                className={`px-3 py-1.5 text-xs font-bold uppercase border transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activePrescribedSessionIdx === idx
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <span>{sess?.splitLetter || String.fromCharCode(65 + idx)}:</span>
                <span className="truncate max-w-[180px]">{(sess?.name || '').replace(/Treino [A-Z]: /, '')}</span>
              </button>
            ))}
          </div>

          {/* Current Session Prescribed Exercises */}
          {(() => {
            const sessions = activePrescribedWorkoutPlan?.sessions || [];
            const safeIdx = Math.min(activePrescribedSessionIdx, Math.max(0, sessions.length - 1));
            const currentSess = sessions[safeIdx] || sessions[0];
            if (!currentSess) return null;
            const exercises = currentSess.exercises || [];

            return (
              <div className="space-y-3">
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>{currentSess.name} • Duração estimada: {currentSess.estimatedDurationMinutes || 60} min</span>
                  <span className="text-zinc-500">{exercises.length} exercícios</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exercises.map((ex, i) => (
                    <div key={ex?.id || i} className="p-3 bg-black border border-zinc-900 space-y-1 text-xs">
                      <div className="flex items-start justify-between">
                        <span className="text-white font-bold uppercase">{ex?.exerciseName || 'Exercício'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-zinc-400 font-mono">
                          {ex?.muscleGroup || 'Geral'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        <span className="text-blue-400 font-bold">{ex?.sets || 3} séries</span> × <span className="text-white font-bold">{ex?.reps || '10'} reps</span> • Carga:{' '}
                        <span className="text-emerald-400 font-bold">{ex?.loadKg || 0} kg</span> • Descanso:{' '}
                        <span className="text-zinc-200">{ex?.restSeconds || 60}s</span> • Alvo: RPE {ex?.rpeTarget || 8}
                      </div>
                      {ex?.notes && (
                        <p className="text-[10px] text-zinc-500 font-sans italic pt-0.5">{ex.notes}</p>
                      )}
                    </div>
                  ))}
                </div>

                {activePrescribedWorkoutPlan.generalInstructions && (
                  <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-blue-600 pl-3 pt-1">
                    "{activePrescribedWorkoutPlan.generalInstructions}"
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        /* CONDITION 2: CONVENTIONAL ATHLETE WORKOUT (SUGGESTED INTELIGENTE OU MONTADO PELO USUÁRIO) */
        <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-black font-black flex items-center justify-center text-sm shadow-md">
                <Dumbbell className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                    {userWorkoutRoutine?.title || 'Rotina de Treinamento Autônomo'}
                  </h2>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 border font-bold uppercase ${
                      userWorkoutRoutine?.source === 'SYSTEM_SUGGESTED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {userWorkoutRoutine?.source === 'SYSTEM_SUGGESTED'
                      ? 'SUGERIDO PELO SISTEMA (EDITÁVEL)'
                      : 'MONTADO POR VOCÊ'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Dias agendados:{' '}
                  <strong className="text-zinc-200">
                    {(userWorkoutRoutine?.scheduledDaysOfWeek || [1, 2, 3, 4, 5])
                      .map((d) => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d])
                      .join(', ')}
                  </strong>{' '}
                  • {userWorkoutRoutine?.sessions?.length || 0} divisões
                </div>
              </div>
            </div>

            {/* Action Buttons: Ativar Treino & Personalizar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* PRIMARY ACTION: ATIVAR TREINO DO DIA */}
              <button
                type="button"
                onClick={() => {
                  const sessions = userWorkoutRoutine?.sessions || [];
                  const safeIdx = Math.min(selectedRoutineSplitIdx, Math.max(0, sessions.length - 1));
                  const currentSess = sessions[safeIdx] || sessions[0];
                  if (currentSess) {
                    setActiveRunnerSession(currentSess);
                  }
                }}
                className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
              >
                <PlayCircle className="w-4 h-4 fill-current text-black" />
                <span>ATIVAR TREINO DO DIA</span>
              </button>

              {/* SECONDARY ACTION: EDITAR / MONTAR MEU TREINO */}
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5"
                title="Editar exercícios, criar novos splits ou montar do zero"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Editar / Montar Treino</span>
              </button>

              {/* RESTAURAR SUGERIDO */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja restaurar o treino sugerido pelo algoritmo fisiológico?')) {
                    resetToSuggestedRoutine(
                      profile?.primaryGoal || 'HYPERTROPHY',
                      userWorkoutRoutine?.scheduledDaysOfWeek?.length || 4
                    );
                  }
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                title="Restaurar treino sugerido pelo sistema"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>

              {/* If athlete has personal trainer, button to return to personal trainer view */}
              {activePrescribedWorkoutPlan && (
                <button
                  type="button"
                  onClick={() => setViewAutonomousMode(false)}
                  className="px-2.5 py-1.5 border border-blue-800 text-blue-400 hover:bg-blue-950 text-[10px] font-bold uppercase transition-colors"
                >
                  Voltar ao Treino do Personal
                </button>
              )}
            </div>
          </div>

          {/* Splits Tabs (Treino A, B, C...) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {(userWorkoutRoutine?.sessions || []).map((sess, idx) => (
              <button
                key={sess?.id || idx}
                type="button"
                onClick={() => setSelectedRoutineSplitIdx(idx)}
                className={`px-3 py-1.5 text-xs font-bold uppercase border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedRoutineSplitIdx === idx
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <span>{sess?.splitLetter || String.fromCharCode(65 + idx)}:</span>
                <span className="truncate max-w-[170px]">
                  {(sess?.name || '').replace(/Treino [A-Z]: /, '')}
                </span>
              </button>
            ))}
          </div>

          {/* Current Selected Split Exercises */}
          {(() => {
            const sessions = userWorkoutRoutine?.sessions || [];
            const safeIdx = Math.min(selectedRoutineSplitIdx, Math.max(0, sessions.length - 1));
            const currentSess = sessions[safeIdx] || sessions[0];
            if (!currentSess) {
              return (
                <div className="p-4 bg-black border border-zinc-900 text-center text-xs text-zinc-500">
                  Nenhuma divisão de treino disponível no momento. Clique em "Restaurar" para gerar uma rotina recomendada.
                </div>
              );
            }
            const exercises = currentSess.exercises || [];

            return (
              <div className="space-y-3">
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between pb-1 border-b border-zinc-900">
                  <span>
                    {currentSess.name || 'Divisão'} • Duração estimada: {currentSess.estimatedDurationMinutes || 50} min
                  </span>
                  <span className="text-zinc-500 font-bold">
                    {exercises.length} exercícios configurados
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exercises.map((ex, i) => (
                    <div
                      key={ex?.id || i}
                      className="p-3 bg-black border border-zinc-900 hover:border-zinc-800 transition-colors space-y-1 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-white font-bold uppercase">{ex?.exerciseName || 'Exercício'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-zinc-400 font-mono">
                          {ex?.muscleGroup || 'Geral'}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-400 font-mono">
                        <span className="text-white font-bold">{ex?.sets || 3} séries</span> ×{' '}
                        <span className="text-zinc-200 font-bold">{ex?.repsTarget || '10'} reps</span> • Carga:{' '}
                        <span className="text-emerald-400 font-bold">
                          {ex?.loadKgTarget !== null && ex?.loadKgTarget !== undefined && ex?.loadKgTarget > 0
                            ? `${ex.loadKgTarget} kg`
                            : 'Na hora do treino'}
                        </span>{' '}
                        • Descanso: <span className="text-zinc-300">{ex?.restSeconds || 60}s</span>
                      </div>

                      {ex?.notes && (
                        <p className="text-[10px] text-zinc-500 font-sans italic pt-0.5">
                          Nota: {ex.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Interactive Anatomical Vector Canvas */}
      <BodyHudCanvas />

      {/* Primary Telemetry Metrics Grid (Strict Monochrome) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ACWR Metric */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Razão Carga Aguda:Crônica</span>
            <span className="text-white border border-zinc-700 px-1 text-[9px]">ACWR</span>
          </div>
          <div className="text-3xl font-black text-white">
            {acwrMetrics.ratio !== null ? acwrMetrics.ratio.toFixed(2) : 'EM AQUISIÇÃO'}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-white font-bold">{acwrMetrics.status}</span>
            <span className="text-zinc-500 font-sans">Gabbett (2016)</span>
          </div>
        </div>

        {/* 7-day Acute Workload */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Carga Aguda (7 Dias)</span>
            <span className="text-zinc-300 border border-zinc-700 px-1 text-[9px]">AGUDO</span>
          </div>
          <div className="text-3xl font-black text-white">
            {Math.round(acwrMetrics.acuteLoad7d || 0)} <span className="text-xs text-zinc-500 font-normal">UA</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Soma semanal dos últimos 7 dias
          </div>
        </div>

        {/* 28-day Chronic Workload */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Carga Crônica (28 Dias)</span>
            <span className="text-zinc-300 border border-zinc-700 px-1 text-[9px]">FITNESS</span>
          </div>
          <div className="text-3xl font-black text-white">
            {Math.round(acwrMetrics.chronicLoad28d || 0)} <span className="text-xs text-zinc-500 font-normal">UA</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Capacidade adaptativa basal 28d
          </div>
        </div>

        {/* Histórico Registrado */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Janela Amostral</span>
            <span className="text-white font-bold text-[10px]">
              {acwrMetrics.dataSufficient ? 'CALIBRADO' : 'COLETANDO'}
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {acwrMetrics.daysRecorded} <span className="text-xs text-zinc-500 font-normal">/ 28 dias</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Zona ótima: 0.80 - 1.30 ACWR
          </div>
        </div>
      </div>

      {/* Gym Attendance & Monthly Plan Module */}
      <GymAttendanceCalendar />

      {/* Active Session Logger Drawer */}
      {isLogging && (
        <form
          id="active-session-form"
          onSubmit={handleFinishSession}
          className="p-5 bg-black border border-white space-y-5 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white inline-block" />
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                Console de Ingestão de Treinamento // Foster Session-RPE
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsLogging(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-bold">Título da Sessão</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-bold">Duração (minutos)</label>
              <input
                type="number"
                min="5"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-bold">
                RPE da Sessão (1-10 Foster CR-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={sessionRpe}
                onChange={(e) => setSessionRpe(Number(e.target.value))}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
              />
            </div>
          </div>

          {/* Exercise & Set Builder */}
          <div className="space-y-3 pt-2 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Exercício Alvo:
              </label>
              <button
                type="button"
                onClick={handleAddSet}
                className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Série</span>
              </button>
            </div>

            {/* Pattern Filter */}
            <div className="flex flex-wrap gap-1 items-center">
              <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              {['ALL', 'SQUAT', 'HINGE', 'HORIZONTAL_PUSH', 'VERTICAL_PUSH', 'HORIZONTAL_PULL', 'VERTICAL_PULL'].map((pat) => (
                <button
                  key={pat}
                  type="button"
                  onClick={() => setPatternFilter(pat)}
                  className={`px-2 py-0.5 text-[10px] transition-colors cursor-pointer uppercase font-bold ${
                    patternFilter === pat
                      ? 'bg-white text-black'
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
              className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
            >
              {filteredExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.pattern}) — {ex.targetMuscles.join(', ')}
                </option>
              ))}
            </select>

            {/* Set Table */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase px-2 font-bold">
                <span className="col-span-2">Série</span>
                <span className="col-span-3">Carga (kg)</span>
                <span className="col-span-3">Repetições</span>
                <span className="col-span-3">RPE / RIR</span>
                <span className="col-span-1 text-right">Ação</span>
              </div>

              {loggedSets.map((st, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center p-2 bg-zinc-950 border border-zinc-800"
                >
                  <span className="col-span-2 text-xs font-bold text-white">#0{st.setNumber}</span>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    step="0.5"
                    value={st.loadKg}
                    onChange={(e) => handleUpdateSet(idx, 'loadKg', Number(e.target.value))}
                    className="col-span-3 p-1 bg-black border border-zinc-800 text-xs text-white text-center outline-none focus:border-white font-bold"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={st.reps}
                    onChange={(e) => handleUpdateSet(idx, 'reps', Number(e.target.value))}
                    className="col-span-3 p-1 bg-black border border-zinc-800 text-xs text-white text-center outline-none focus:border-white font-bold"
                  />
                  <input
                    type="number"
                    min="5"
                    max="10"
                    step="0.5"
                    value={st.rpe}
                    onChange={(e) => handleUpdateSet(idx, 'rpe', Number(e.target.value))}
                    className="col-span-3 p-1 bg-black border border-zinc-800 text-xs text-white text-center outline-none focus:border-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(idx)}
                    className="col-span-1 text-right text-zinc-500 hover:text-white text-sm font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsLogging(false)}
              className="px-4 py-2 border border-zinc-700 text-xs text-zinc-400 hover:text-white cursor-pointer uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              Gravar Sessão no Histórico
            </button>
          </div>
        </form>
      )}

      {/* PR VAULT (4 VECTORS OF PERSONAL RECORDS) */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Cofre de Recordes Pessoais (PR Vault)
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
            DETERMINÍSTICO // 0 DADOS INVENTADOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {prVault.slice(0, 4).map((record) => (
            <div key={record.exerciseName} className="p-3 bg-zinc-950 border border-zinc-800 space-y-2.5">
              <span className="text-xs font-bold text-white truncate block uppercase">{record.exerciseName}</span>

              {/* Vector 1: Max Absolute Load */}
              <div className="p-2 bg-black border border-zinc-900">
                <span className="text-[9px] uppercase text-zinc-500 block font-bold">1. Carga Absoluta Máxima</span>
                <span className="text-lg font-black text-white">{record.maxAbsoluteLoadKg} kg</span>
              </div>

              {/* Vector 2: Max Single-Set Volume */}
              <div className="p-2 bg-black border border-zinc-900">
                <span className="text-[9px] uppercase text-zinc-500 block font-bold">2. Maior Volume por Série</span>
                <span className="text-sm font-bold text-white">
                  {record.maxSetVolumeKg.volumeKg} kg{' '}
                  <span className="text-[10px] text-zinc-500 font-normal">
                    ({record.maxSetVolumeKg.reps}r @ {record.maxSetVolumeKg.loadKg}kg)
                  </span>
                </span>
              </div>

              {/* Vector 3: Max Estimated 1RM */}
              <div className="p-2 bg-black border border-zinc-900">
                <span className="text-[9px] uppercase text-zinc-500 block font-bold">3. 1RM Submáxima (Epley)</span>
                <span className="text-sm font-bold text-white">
                  {record.maxEstimated1RmKg.estimated1Rm} kg
                </span>
              </div>

              {/* Vector 4: Peak Rep Records */}
              <div className="text-[10px] text-zinc-500">
                <span>Data: </span>
                <strong className="text-zinc-300">
                  {new Date(record.maxLoadDate).toLocaleDateString('pt-BR')}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESSIVE OVERLOAD ENGINE */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Motor de Sobrecarga Progressiva Determinística
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={overloadTargetExercise}
              onChange={(e) => setOverloadTargetExercise(e.target.value)}
              className="p-1.5 bg-black border border-zinc-700 text-xs font-mono text-white outline-none focus:border-white"
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
        <div className="p-4 border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-zinc-400 font-bold">Classificação:</span>
              <span className="text-xs font-black px-2 py-0.5 border border-white text-white">
                {overloadResult.status}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">
              Sessões Analisadas: <strong className="text-white">{overloadResult.totalSessionsRecorded}</strong>
            </span>
          </div>

          <p className="text-xs text-zinc-300 mt-2 font-sans leading-relaxed">
            {overloadResult.reasoning}
          </p>

          {overloadResult.status !== 'DADOS INSUFICIENTES' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-900 text-xs">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Delta Carga:</span>
                <strong className="text-white">
                  {overloadResult.loadDeltaKg >= 0 ? `+${overloadResult.loadDeltaKg}` : overloadResult.loadDeltaKg} kg
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Delta Tonelagem:</span>
                <strong className="text-white">
                  {overloadResult.tonnageDeltaKg >= 0 ? `+${overloadResult.tonnageDeltaKg}` : overloadResult.tonnageDeltaKg} kg
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Sessão Anterior:</span>
                <strong className="text-zinc-400">
                  {overloadResult.previousSession?.maxLoadKg || 0} kg max
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase block">Sessão Recente:</span>
                <strong className="text-white">
                  {overloadResult.currentSession?.maxLoadKg || 0} kg max
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TANAKA & KARVONEN CARDIO ZONES ENGINE */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Zonas Cardiovasculares // Tanaka et al. (2001) & Karvonen
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
            FCmáx: {tanakaKarvonen.result.maxHeartRateBpm} BPM // FCR: {tanakaKarvonen.result.heartRateReserveBpm} BPM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {tanakaKarvonen.result.zones.map((z) => (
            <div
              key={z.zone}
              className="p-3 bg-zinc-950 border border-zinc-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{z.zone}</span>
                <span className="text-[10px] text-zinc-500">{z.targetPctRange}</span>
              </div>
              <div className="text-base font-black text-white">
                {z.minBpm} - {z.maxBpm} <span className="text-[10px] text-zinc-500 font-normal">BPM</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight font-sans">
                {z.metabolicFocus}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMAXIMAL 1RM EXTRAPOLATION & REST TIMER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submaximal 1RM Calculator */}
        <div className="p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Calculadora Submáxima de 1RM (Epley)
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
              EPLEY 1985
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1 font-bold">Carga (kg)</label>
              <input
                type="number"
                min="20"
                max="500"
                value={calcLoad}
                onChange={(e) => setCalcLoad(Number(e.target.value))}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 text-xs font-bold text-white outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1 font-bold">Repetições</label>
              <input
                type="number"
                min="1"
                max="12"
                value={calcReps}
                onChange={(e) => setCalcReps(Number(e.target.value))}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 text-xs font-bold text-white outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1 font-bold">RPE (Borg)</label>
              <input
                type="number"
                min="6"
                max="10"
                step="0.5"
                value={calcRpe}
                onChange={(e) => setCalcRpe(Number(e.target.value))}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 text-xs font-bold text-white outline-none focus:border-white"
              />
            </div>
          </div>

          {estimated1RMResult.result ? (
            <>
              <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">1RM Estimada (Epley):</span>
                  <div className="text-2xl font-black text-white">
                    {estimated1RMResult.result.estimated1RmKg} <span className="text-xs text-zinc-500 font-normal">kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Dispersão (±3%):</span>
                  <span className="text-xs text-zinc-300 font-bold">
                    {Math.round(estimated1RMResult.result.estimated1RmKg * 0.97)} - {Math.round(estimated1RMResult.result.estimated1RmKg * 1.03)} kg
                  </span>
                </div>
              </div>

              {/* Intensity Spectrum Table */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { pct: 90, reps: '3-4 reps' },
                  { pct: 85, reps: '5-6 reps' },
                  { pct: 80, reps: '7-8 reps' },
                  { pct: 75, reps: '9-10 reps' },
                ].map((t) => (
                  <div key={t.pct} className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block font-bold">{t.pct}% 1RM</span>
                    <strong className="text-white">
                      {Math.round(estimated1RMResult.result!.estimated1RmKg * (t.pct / 100))} kg
                    </strong>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">{t.reps}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 bg-zinc-950 border border-zinc-800 text-xs text-zinc-500 text-center">
              Insira carga e repetições válidas para extrapolação submáxima.
            </div>
          )}
        </div>

        {/* Inter-set Rest Chronometer */}
        <div className="p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Cronômetro de Descanso Entre Séries
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
              AUTORREGULAÇÃO
            </span>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block font-bold">Tempo Restante</span>
              <div className="text-4xl font-black text-white">
                {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTimer}
                className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
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
                className="p-2.5 border border-zinc-700 bg-black text-zinc-300 hover:text-white cursor-pointer"
                title="Resetar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Presets:</span>
            {[
              { label: '30s (Metabólico)', sec: 30 },
              { label: '60s (Acessório)', sec: 60 },
              { label: '90s (Hipertrofia)', sec: 90 },
              { label: '120s (Composto)', sec: 120 },
              { label: '180s (Força)', sec: 180 },
            ].map((p) => (
              <button
                key={p.sec}
                type="button"
                onClick={() => handleStartTimer(p.sec)}
                className={`px-2 py-1 text-[10px] transition-colors cursor-pointer uppercase font-bold ${
                  restSeconds === p.sec
                    ? 'bg-white text-black'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routine Customizer & Split Builder Modal */}
      <RoutineCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      {/* Active Workout Console Runner Modal */}
      {activeRunnerSession && (
        <ActiveWorkoutRunnerModal
          session={activeRunnerSession}
          isOpen={!!activeRunnerSession}
          onClose={() => setActiveRunnerSession(null)}
        />
      )}
    </div>
  );
};
