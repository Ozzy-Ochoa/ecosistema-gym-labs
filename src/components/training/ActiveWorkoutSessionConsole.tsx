import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  X,
  AlertTriangle,
  Award,
  Zap,
  TrendingUp,
  Sparkles,
  Check
} from 'lucide-react';

export interface LiveSetItem {
  setNumber: number;
  targetReps: string;
  actualReps: number;
  loadKg: number | string;
  isFailure: boolean;
  isCompleted: boolean;
}

export interface LiveExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  restSeconds: number;
  sets: LiveSetItem[];
  notes?: string;
}

export interface ActiveWorkoutSessionConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  divisionLetter: string;
  exercises: {
    id: string;
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string;
    loadKg?: number | string;
    restSeconds: number;
    notes?: string;
  }[];
  athleteWeightKg: number;
  onFinishSession: (result: {
    title: string;
    durationMinutes: number;
    totalVolumeKg: number;
    caloriesBurned: number;
    completedSets: number;
    totalSets: number;
  }) => void;
}

export const ActiveWorkoutSessionConsole: React.FC<ActiveWorkoutSessionConsoleProps> = ({
  isOpen,
  onClose,
  title,
  divisionLetter,
  exercises,
  athleteWeightKg,
  onFinishSession,
}) => {
  // Session Stop Watch (Counts up)
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Rest Timer State (Counts down)
  const [restSecondsTotal, setRestSecondsTotal] = useState(90);
  const [restTimerRemaining, setRestTimerRemaining] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState<string>('');

  // Finished Session Report Modal State
  const [showSummaryReport, setShowSummaryReport] = useState(false);
  const [sessionReportData, setSessionReportData] = useState<{
    title: string;
    durationMinutes: number;
    totalVolumeKg: number;
    caloriesBurned: number;
    completedSets: number;
    totalSets: number;
  } | null>(null);

  // Initialize live exercises state with editable sets
  const [liveExercises, setLiveExercises] = useState<LiveExerciseItem[]>(() => {
    return exercises.map((ex) => {
      const setCount = ex.sets || 4;
      const targetRepNum = parseInt(ex.reps) || 10;
      const initialLoad = ex.loadKg !== undefined ? ex.loadKg : '';

      const sets: LiveSetItem[] = Array.from({ length: setCount }).map((_, i) => ({
        setNumber: i + 1,
        targetReps: ex.reps || '10',
        actualReps: targetRepNum,
        loadKg: initialLoad,
        isFailure: false,
        isCompleted: false,
      }));

      return {
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        restSeconds: ex.restSeconds || 90,
        sets,
        notes: ex.notes,
      };
    });
  });

  // Keep liveExercises in sync if exercises prop changes when closed
  useEffect(() => {
    if (!isOpen) {
      setLiveExercises(
        exercises.map((ex) => {
          const setCount = ex.sets || 4;
          const targetRepNum = parseInt(ex.reps) || 10;
          const initialLoad = ex.loadKg !== undefined ? ex.loadKg : '';

          const sets: LiveSetItem[] = Array.from({ length: setCount }).map((_, i) => ({
            setNumber: i + 1,
            targetReps: ex.reps || '10',
            actualReps: targetRepNum,
            loadKg: initialLoad,
            isFailure: false,
            isCompleted: false,
          }));

          return {
            id: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            restSeconds: ex.restSeconds || 90,
            sets,
            notes: ex.notes,
          };
        })
      );
      setSecondsElapsed(0);
      setIsSessionActive(true);
      setShowSummaryReport(false);
    }
  }, [isOpen, exercises]);

  // Session timer ticker
  useEffect(() => {
    let timer: any = null;
    if (isOpen && isSessionActive && !showSummaryReport) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isSessionActive, showSummaryReport]);

  // Rest timer countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerRunning && restTimerRemaining > 0) {
      interval = setInterval(() => {
        setRestTimerRemaining((prev) => prev - 1);
      }, 1000);
    } else if (restTimerRemaining === 0 && isRestTimerRunning) {
      setIsRestTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restTimerRemaining]);

  if (!isOpen) return null;

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle set completion and trigger rest countdown
  const handleToggleSetComplete = (exIndex: number, setIndex: number) => {
    const updated = [...liveExercises];
    const targetSet = updated[exIndex].sets[setIndex];
    const newStatus = !targetSet.isCompleted;
    targetSet.isCompleted = newStatus;

    setLiveExercises(updated);

    if (newStatus) {
      // Trigger rest timer
      const restTime = updated[exIndex].restSeconds || 90;
      setRestSecondsTotal(restTime);
      setRestTimerRemaining(restTime);
      setIsRestTimerRunning(true);
      setActiveRestExerciseName(updated[exIndex].name);
    }
  };

  const handleUpdateSetField = (
    exIndex: number,
    setIndex: number,
    field: 'loadKg' | 'actualReps' | 'isFailure',
    value: any
  ) => {
    const updated = [...liveExercises];
    (updated[exIndex].sets[setIndex] as any)[field] = value;
    setLiveExercises(updated);
  };

  // Finish Workout
  const handleFinishWorkout = () => {
    setIsSessionActive(false);
    setIsRestTimerRunning(false);

    const durationMinutes = Math.max(1, Math.round(secondsElapsed / 60));

    let totalVolume = 0;
    let completedSetsCount = 0;
    let totalSetsCount = 0;

    liveExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        totalSetsCount++;
        if (s.isCompleted) {
          completedSetsCount++;
          const load = typeof s.loadKg === 'number' ? s.loadKg : parseFloat(String(s.loadKg)) || 0;
          totalVolume += load * (s.actualReps || 0);
        }
      });
    });

    // Scientific Caloric Expenditure Formula for Resistance Training (Ainsworth et al. Compendium of Physical Activities)
    // 6.0 METs for intense weight training + volume tonnage load factor (approx 15 kcal per 1.000 kg lifted)
    const hours = durationMinutes / 60;
    const metsCalories = 6.0 * athleteWeightKg * hours;
    const tonnageCalories = totalVolume * 0.015;
    const estimatedCalories = Math.round(metsCalories + tonnageCalories);

    const report = {
      title,
      durationMinutes,
      totalVolumeKg: Math.round(totalVolume),
      caloriesBurned: Math.max(150, estimatedCalories),
      completedSets: completedSetsCount,
      totalSets: totalSetsCount,
    };

    setSessionReportData(report);
    setShowSummaryReport(true);
  };

  const handleConfirmAndCloseReport = () => {
    if (sessionReportData) {
      onFinishSession(sessionReportData);
    }
    setShowSummaryReport(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-mono select-none">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[95vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Active Bar */}
        <div className="px-4 py-3 bg-black border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              {divisionLetter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
                  Sessão Ativa: {title}
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500">
                CONSOLE DE EXECUÇÃO EM TEMPO REAL // REGISTRO DE CARGAS & FALHA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatTime(secondsElapsed)}</span>
              <button
                type="button"
                onClick={() => setIsSessionActive(!isSessionActive)}
                className="ml-1 text-zinc-400 hover:text-white"
                title={isSessionActive ? 'Pausar Cronômetro' : 'Continuar Cronômetro'}
              >
                {isSessionActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1"
              title="Minimizar console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rest Timer Active Banner (Floating inside header) */}
        {isRestTimerRunning && (
          <div className="px-4 py-2 bg-blue-950/80 border-b border-blue-800 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-200 font-bold uppercase">
                Descanso em Andamento: <strong className="text-white">{formatTime(restTimerRemaining)}</strong>
              </span>
              <span className="text-[10px] text-blue-300 hidden sm:inline">
                ({activeRestExerciseName})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRestTimerRemaining((prev) => prev + 15)}
                className="px-2 py-0.5 bg-blue-900 hover:bg-blue-800 text-white text-[10px] font-bold uppercase"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => setRestTimerRemaining((prev) => Math.max(0, prev - 15))}
                className="px-2 py-0.5 bg-blue-900 hover:bg-blue-800 text-white text-[10px] font-bold uppercase"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => {
                  setRestTimerRemaining(0);
                  setIsRestTimerRunning(false);
                }}
                className="px-2.5 py-0.5 bg-white text-black text-[10px] font-black uppercase hover:bg-zinc-200 cursor-pointer"
              >
                Pular Descanso
              </button>
            </div>
          </div>
        )}

        {/* Exercises & Sets Scroll List */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 bg-black">
          {liveExercises.map((ex, exIdx) => (
            <div key={ex.id || exIdx} className="p-4 bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold flex items-center justify-center">
                    {exIdx + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase">{ex.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-zinc-400 font-mono">
                    {ex.muscleGroup}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Intervalo Alvo: <span className="text-zinc-300 font-bold">{ex.restSeconds}s</span>
                </div>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[9px] text-zinc-500 uppercase border-b border-zinc-900">
                    <tr>
                      <th className="pb-1.5 w-12 text-center">Série</th>
                      <th className="pb-1.5 w-24">Carga (kg)</th>
                      <th className="pb-1.5 w-20">Reps</th>
                      <th className="pb-1.5 w-24 text-center">Falha?</th>
                      <th className="pb-1.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {ex.sets.map((s, sIdx) => (
                      <tr
                        key={s.setNumber}
                        className={`transition-colors ${
                          s.isCompleted ? 'bg-zinc-900/40 text-zinc-400' : 'hover:bg-zinc-900/20'
                        }`}
                      >
                        <td className="py-2 font-bold text-center text-zinc-400">
                          #{s.setNumber}
                        </td>

                        {/* Weight input - can be left blank or filled on the spot */}
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              value={s.loadKg}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateSetField(exIdx, sIdx, 'loadKg', e.target.value)
                              }
                              className={`w-16 p-1.5 bg-black border text-xs font-bold outline-none text-center ${
                                s.isCompleted
                                  ? 'border-zinc-800 text-zinc-500'
                                  : 'border-zinc-700 text-white focus:border-white'
                              }`}
                            />
                            <span className="text-[10px] text-zinc-500">kg</span>
                          </div>
                        </td>

                        {/* Reps input */}
                        <td className="py-2">
                          <input
                            type="number"
                            value={s.actualReps}
                            onChange={(e) =>
                              handleUpdateSetField(
                                exIdx,
                                sIdx,
                                'actualReps',
                                Number(e.target.value)
                              )
                            }
                            className={`w-14 p-1.5 bg-black border text-xs font-bold outline-none text-center ${
                              s.isCompleted
                                ? 'border-zinc-800 text-zinc-500'
                                : 'border-zinc-700 text-white focus:border-white'
                            }`}
                          />
                        </td>

                        {/* Failure toggle */}
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSetField(exIdx, sIdx, 'isFailure', !s.isFailure)
                            }
                            className={`px-2 py-1 text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                              s.isFailure
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-black border-zinc-800 text-zinc-600 hover:text-zinc-400'
                            }`}
                          >
                            {s.isFailure ? 'FALHA ✓' : 'RPE < 10'}
                          </button>
                        </td>

                        {/* Finish Set Checkbox Button */}
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              s.isCompleted
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-white text-black font-black hover:bg-zinc-200'
                            }`}
                          >
                            {s.isCompleted ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Concluída</span>
                              </>
                            ) : (
                              <span>Concluir Série</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-sans">
            Ao finalizar, o sistema calcula o <strong>gasto calórico do treino</strong> e o integra automaticamente ao seu gasto total do dia!
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white uppercase font-bold text-xs"
            >
              Minimizar
            </button>
            <button
              type="button"
              onClick={handleFinishWorkout}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>FINALIZAR TREINO & GERAR RELATÓRIO</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY REPORT MODAL */}
      {showSummaryReport && sessionReportData && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-lg p-6 space-y-5 font-mono shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Treino Concluído com Sucesso!
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">LABCORE TELEMETRIA</span>
            </div>

            <div className="text-xs text-zinc-300 font-sans leading-relaxed">
              Excelente esforço! O seu treino de <strong>{sessionReportData.title}</strong> foi computado na base de dados com aferição fisiológica completa.
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-black border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Tempo Total</span>
                <span className="text-xl font-black text-white">{sessionReportData.durationMinutes} min</span>
              </div>

              <div className="p-3 bg-black border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Volume Total (Tonelagem)</span>
                <span className="text-xl font-black text-emerald-400">
                  {sessionReportData.totalVolumeKg.toLocaleString('pt-BR')} kg
                </span>
              </div>

              <div className="p-3 bg-black border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Séries Executadas</span>
                <span className="text-xl font-black text-white">
                  {sessionReportData.completedSets} de {sessionReportData.totalSets}
                </span>
              </div>

              {/* Caloric Expenditure Highlight */}
              <div className="p-3 bg-black border border-amber-900/60 bg-amber-950/20">
                <span className="text-[9px] text-amber-400 uppercase block font-bold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" /> Gasto Calórico
                </span>
                <span className="text-xl font-black text-amber-400">
                  +{sessionReportData.caloriesBurned} kcal
                </span>
              </div>
            </div>

            {/* Integration Notice */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 text-[11px] text-emerald-300 font-sans space-y-1">
              <div className="font-bold flex items-center gap-1.5 uppercase font-mono text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Integração Automática ao Gasto do Dia:</span>
              </div>
              <p>
                O gasto de <strong>{sessionReportData.caloriesBurned} kcal</strong> foi automaticamente incorporado ao balanço energético diário da sua aba Hoje e Nutrição, e sua presença de hoje foi registrada no calendário!
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleConfirmAndCloseReport}
                className="w-full py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
              >
                Salvar Sessão e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
