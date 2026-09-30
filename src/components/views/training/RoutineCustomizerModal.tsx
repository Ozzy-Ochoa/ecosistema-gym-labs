import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  UserWorkoutRoutine,
  UserRoutineSession,
  UserRoutineExercise,
} from '../../../types/training';
import {
  Dumbbell,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  X,
  Sparkles,
  Calendar,
  Clock,
  Layers,
  Check,
} from 'lucide-react';

interface RoutineCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'Segunda', short: 'SEG' },
  { day: 2, label: 'Terça', short: 'TER' },
  { day: 3, label: 'Quarta', short: 'QUA' },
  { day: 4, label: 'Quinta', short: 'QUI' },
  { day: 5, label: 'Sexta', short: 'SEX' },
  { day: 6, label: 'Sábado', short: 'SÁB' },
  { day: 0, label: 'Domingo', short: 'DOM' },
];

export const RoutineCustomizerModal: React.FC<RoutineCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    userWorkoutRoutine,
    saveUserWorkoutRoutine,
    resetToSuggestedRoutine,
    exercises: libraryExercises,
    profile,
  } = useGymLabs();

  // Local draft state
  const [draftRoutine, setDraftRoutine] = useState<UserWorkoutRoutine>(() =>
    JSON.parse(JSON.stringify(userWorkoutRoutine))
  );

  const [activeSessionIdx, setActiveSessionIdx] = useState(0);

  if (!isOpen) return null;

  const currentSession: UserRoutineSession | undefined =
    draftRoutine.sessions[activeSessionIdx] || draftRoutine.sessions[0];

  const handleToggleScheduledDay = (day: number) => {
    let days = [...draftRoutine.scheduledDaysOfWeek];
    if (days.includes(day)) {
      days = days.filter((d) => d !== day);
    } else {
      days.push(day);
      days.sort((a, b) => a - b);
    }
    setDraftRoutine({
      ...draftRoutine,
      scheduledDaysOfWeek: days,
    });
  };

  const handleUpdateSession = (field: keyof UserRoutineSession, value: any) => {
    if (!currentSession) return;
    const updatedSessions = [...draftRoutine.sessions];
    updatedSessions[activeSessionIdx] = {
      ...currentSession,
      [field]: value,
    };
    setDraftRoutine({
      ...draftRoutine,
      sessions: updatedSessions,
      source: 'CUSTOM',
    });
  };

  const handleAddSession = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLetter = letters[draftRoutine.sessions.length] || `S${draftRoutine.sessions.length + 1}`;
    const newSession: UserRoutineSession = {
      id: `sess-${Date.now()}`,
      splitLetter: nextLetter,
      name: `Treino ${nextLetter}: Novo Grupo Muscular`,
      daysOfWeek: [1],
      targetMuscles: ['Geral'],
      estimatedDurationMinutes: 50,
      exercises: [
        {
          id: `ex-${Date.now()}-1`,
          exerciseId: 'ex-supino-reto',
          exerciseName: 'Supino Reto com Barra',
          muscleGroup: 'Peitoral',
          sets: 4,
          repsTarget: '8-10',
          loadKgTarget: null, // Deixado em branco para colocar na hora
          restSeconds: 90,
          notes: 'Execução controlada',
        },
      ],
    };
    setDraftRoutine({
      ...draftRoutine,
      source: 'CUSTOM',
      sessions: [...draftRoutine.sessions, newSession],
    });
    setActiveSessionIdx(draftRoutine.sessions.length);
  };

  const handleRemoveSession = (idx: number) => {
    if (draftRoutine.sessions.length <= 1) return;
    const filtered = draftRoutine.sessions.filter((_, i) => i !== idx);
    setDraftRoutine({
      ...draftRoutine,
      source: 'CUSTOM',
      sessions: filtered,
    });
    setActiveSessionIdx(Math.max(0, idx - 1));
  };

  const handleAddExerciseToCurrentSession = () => {
    if (!currentSession) return;
    const defaultEx = libraryExercises[0];
    const newEx: UserRoutineExercise = {
      id: `ex-${Date.now()}`,
      exerciseId: defaultEx?.id || 'ex-default',
      exerciseName: defaultEx?.name || 'Exercício Personalizado',
      muscleGroup: defaultEx?.primaryMuscles?.[0] || 'Peitoral',
      sets: 3,
      repsTarget: '10-12',
      loadKgTarget: null, // Deixado em branco para na hora do treino
      restSeconds: 60,
      notes: '',
    };
    handleUpdateSession('exercises', [...currentSession.exercises, newEx]);
  };

  const handleUpdateExercise = (
    exIdx: number,
    field: keyof UserRoutineExercise,
    value: any
  ) => {
    if (!currentSession) return;
    const updatedExercises = [...currentSession.exercises];
    updatedExercises[exIdx] = {
      ...updatedExercises[exIdx],
      [field]: value,
    };
    handleUpdateSession('exercises', updatedExercises);
  };

  const handleRemoveExercise = (exIdx: number) => {
    if (!currentSession || currentSession.exercises.length <= 1) return;
    const filtered = currentSession.exercises.filter((_, i) => i !== exIdx);
    handleUpdateSession('exercises', filtered);
  };

  const handleSave = () => {
    saveUserWorkoutRoutine(draftRoutine);
    onClose();
  };

  const handleResetSuggested = () => {
    if (
      window.confirm(
        'Deseja restaurar a sugestão inteligente do sistema baseada no seu objetivo atual?'
      )
    ) {
      resetToSuggestedRoutine(profile.primaryGoal, draftRoutine.scheduledDaysOfWeek.length || 4);
      onClose();
    }
  };

  return (
    <div
      id="routine-customizer-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono select-none"
    >
      <div className="bg-zinc-950 border border-zinc-700 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-black font-black flex items-center justify-center text-sm">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
                  Personalizar Rotina de Treino
                </h2>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                  {draftRoutine.source === 'SYSTEM_SUGGESTED' ? 'Sugerido Editável' : 'Personalizado'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Ajuste os dias de treino, crie novas divisões (splits) ou edite séries, repetições e cargas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Routine Title & Days of the Week */}
          <div className="p-4 bg-black border border-zinc-900 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  Nome da Rotina / Ficha
                </label>
                <input
                  type="text"
                  value={draftRoutine.title}
                  onChange={(e) =>
                    setDraftRoutine({ ...draftRoutine, title: e.target.value, source: 'CUSTOM' })
                  }
                  className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white font-bold outline-none focus:border-white font-mono text-xs"
                />
              </div>

              <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-4">
                <button
                  type="button"
                  onClick={handleResetSuggested}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                  title="Gerar treino sugerido pelo algoritmo científico"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sugerido pelo Sistema</span>
                </button>
              </div>
            </div>

            {/* Days of Week Selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-white" />
                <span>Dias da Semana em que Você Treina:</span>
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((d) => {
                  const isScheduled = draftRoutine.scheduledDaysOfWeek.includes(d.day);
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => handleToggleScheduledDay(d.day)}
                      className={`p-2 text-center border transition-all cursor-pointer ${
                        isScheduled
                          ? 'bg-white text-black border-white font-black shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white'
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-bold">{d.short}</span>
                      <span className="text-[8px] block opacity-80">
                        {isScheduled ? '✓ Sim' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Session Splits Navigation (Treino A, B, C...) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-white" />
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Divisões de Treino (Splits)
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddSession}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-700 text-white font-bold transition-all flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar Divisão (Split)</span>
              </button>
            </div>

            {/* Split Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {draftRoutine.sessions.map((sess, idx) => (
                <div key={sess.id || idx} className="relative flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSessionIdx(idx)}
                    className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeSessionIdx === idx
                        ? 'bg-white text-black border-white shadow-sm'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>{sess.splitLetter}:</span>
                    <span className="truncate max-w-[140px]">
                      {sess.name.replace(/Treino [A-Z]: /, '')}
                    </span>
                  </button>

                  {draftRoutine.sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSession(idx);
                      }}
                      className="ml-1 text-zinc-600 hover:text-red-400 p-1 cursor-pointer"
                      title="Excluir este split"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Current Session Editor */}
            {currentSession && (
              <div className="p-4 bg-black border border-zinc-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-3 border-b border-zinc-900">
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                      Título do Split ({currentSession.splitLetter})
                    </label>
                    <input
                      type="text"
                      value={currentSession.name}
                      onChange={(e) => handleUpdateSession('name', e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white font-bold outline-none focus:border-white font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                      Duração Estimada (min)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      value={currentSession.estimatedDurationMinutes || 50}
                      onChange={(e) =>
                        handleUpdateSession('estimatedDurationMinutes', Number(e.target.value))
                      }
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white font-bold outline-none focus:border-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Exercises Table in this Session */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-white tracking-wider">
                      Exercícios deste Treino ({currentSession.exercises.length}):
                    </label>

                    <button
                      type="button"
                      onClick={handleAddExerciseToCurrentSession}
                      className="px-2.5 py-1 bg-white text-black font-black uppercase hover:bg-zinc-200 transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Exercício</span>
                    </button>
                  </div>

                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 uppercase px-2 pt-1">
                    <span className="col-span-4">Exercício & Grupo</span>
                    <span className="col-span-2 text-center">Séries</span>
                    <span className="col-span-2 text-center">Reps Alvo</span>
                    <span className="col-span-2 text-center">Carga (kg)*</span>
                    <span className="col-span-1 text-center">Descanso</span>
                    <span className="col-span-1 text-right">Ação</span>
                  </div>

                  {/* Exercises List */}
                  <div className="space-y-1.5">
                    {currentSession.exercises.map((ex, exIdx) => (
                      <div
                        key={ex.id || exIdx}
                        className="grid grid-cols-12 gap-2 items-center p-2.5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                      >
                        {/* Exercise Name & Group */}
                        <div className="col-span-4 space-y-1">
                          <input
                            type="text"
                            value={ex.exerciseName}
                            onChange={(e) =>
                              handleUpdateExercise(exIdx, 'exerciseName', e.target.value)
                            }
                            placeholder="Nome do exercício"
                            className="w-full p-1 bg-black border border-zinc-800 text-white font-bold outline-none focus:border-white text-xs"
                          />
                          <input
                            type="text"
                            value={ex.muscleGroup}
                            onChange={(e) =>
                              handleUpdateExercise(exIdx, 'muscleGroup', e.target.value)
                            }
                            placeholder="Grupo muscular (ex: Peitoral)"
                            className="w-full p-1 bg-black border border-zinc-900 text-[10px] text-zinc-400 outline-none focus:border-zinc-700"
                          />
                        </div>

                        {/* Sets */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={ex.sets}
                            onChange={(e) =>
                              handleUpdateExercise(exIdx, 'sets', Number(e.target.value))
                            }
                            className="w-full p-1.5 bg-black border border-zinc-800 text-white text-center font-bold outline-none focus:border-white text-xs"
                          />
                        </div>

                        {/* Target Reps (String, ex: '8-10' or '12') */}
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={ex.repsTarget}
                            onChange={(e) =>
                              handleUpdateExercise(exIdx, 'repsTarget', e.target.value)
                            }
                            placeholder="ex: 8-10"
                            className="w-full p-1.5 bg-black border border-zinc-800 text-white text-center font-bold outline-none focus:border-white text-xs"
                          />
                        </div>

                        {/* Target Load (Can be left blank / empty!) */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            max="500"
                            step="0.5"
                            value={ex.loadKgTarget === null || ex.loadKgTarget === undefined ? '' : ex.loadKgTarget}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number(e.target.value);
                              handleUpdateExercise(exIdx, 'loadKgTarget', val);
                            }}
                            placeholder="Na hora"
                            className="w-full p-1.5 bg-black border border-zinc-800 text-emerald-400 text-center font-bold outline-none focus:border-white text-xs placeholder:text-zinc-600"
                          />
                        </div>

                        {/* Rest seconds */}
                        <div className="col-span-1">
                          <select
                            value={ex.restSeconds}
                            onChange={(e) =>
                              handleUpdateExercise(exIdx, 'restSeconds', Number(e.target.value))
                            }
                            className="w-full p-1 bg-black border border-zinc-800 text-zinc-300 text-center outline-none text-[10px]"
                          >
                            <option value={45}>45s</option>
                            <option value={60}>60s</option>
                            <option value={75}>75s</option>
                            <option value={90}>90s</option>
                            <option value={120}>120s</option>
                          </select>
                        </div>

                        {/* Remove */}
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            title="Remover exercício"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-zinc-500 font-sans italic pt-1">
                    * O campo <strong>Carga (kg)</strong> pode ser deixado em branco ("Na hora") para que você preencha diretamente durante a execução do treino no console ativo!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-black flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-zinc-400 font-mono">
            {draftRoutine.sessions.length} divisões •{' '}
            {draftRoutine.sessions.reduce((s, c) => s + c.exercises.length, 0)} exercícios no total
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white text-xs uppercase font-bold cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Rotina</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
