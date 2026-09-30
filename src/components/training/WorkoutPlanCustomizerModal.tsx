import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Dumbbell,
  Plus,
  Trash2,
  X,
  Check,
  Calendar,
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Save,
  HelpCircle
} from 'lucide-react';

export interface CustomExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  loadKg?: number | string; // can be blank!
  restSeconds: number;
}

export interface CustomWorkoutDivision {
  id: string;
  letter: string;
  name: string;
  dayOfWeek?: number; // 1 = Seg, 2 = Ter...
  exercises: CustomExerciseItem[];
}

export interface WorkoutPlanCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'SUGGESTED' | 'CUSTOM';
  currentDivisions: CustomWorkoutDivision[];
  onSavePlan: (mode: 'SUGGESTED' | 'CUSTOM', divisions: CustomWorkoutDivision[], frequency: number) => void;
}

export const WorkoutPlanCustomizerModal: React.FC<WorkoutPlanCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'SUGGESTED',
  currentDivisions,
  onSavePlan,
}) => {
  const { exercises, profile, identity } = useGymLabs();

  const [mode, setMode] = useState<'SUGGESTED' | 'CUSTOM'>(initialMode);
  const [frequencyDays, setFrequencyDays] = useState(4);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 4, 5]); // Seg, Ter, Qui, Sex
  const [divisions, setDivisions] = useState<CustomWorkoutDivision[]>(currentDivisions);
  const [activeDivisionIdx, setActiveDivisionIdx] = useState(0);

  // New exercise state for current division
  const [showAddEx, setShowAddEx] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Peito');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState('8-10');
  const [newExLoad, setNewExLoad] = useState<string>(''); // blank by default!
  const [newExRest, setNewExRest] = useState(90);

  if (!isOpen) return null;

  const currentDiv = divisions[activeDivisionIdx] || divisions[0];

  const handleToggleDay = (dayNum: number) => {
    if (selectedDays.includes(dayNum)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayNum));
    } else {
      setSelectedDays([...selectedDays, dayNum].sort());
    }
  };

  const handleAddDivision = () => {
    const nextLetter = String.fromCharCode(65 + divisions.length);
    const newDiv: CustomWorkoutDivision = {
      id: `div_${Date.now()}`,
      letter: nextLetter,
      name: `Treino ${nextLetter}: Novo Grupamento`,
      exercises: [],
    };
    setDivisions([...divisions, newDiv]);
    setActiveDivisionIdx(divisions.length);
  };

  const handleRemoveDivision = (idx: number) => {
    if (divisions.length <= 1) return;
    const filtered = divisions.filter((_, i) => i !== idx);
    setDivisions(filtered);
    setActiveDivisionIdx(Math.max(0, idx - 1));
  };

  const handleAddExerciseToCurrentDiv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName) return;

    const newItem: CustomExerciseItem = {
      id: `ex_item_${Date.now()}`,
      name: newExName,
      muscleGroup: newExMuscle,
      sets: newExSets,
      reps: newExReps,
      loadKg: newExLoad ? Number(newExLoad) : undefined,
      restSeconds: newExRest,
    };

    const updated = divisions.map((d, i) => {
      if (i !== activeDivisionIdx) return d;
      return {
        ...d,
        exercises: [...d.exercises, newItem],
      };
    });

    setDivisions(updated);
    setShowAddEx(false);
    setNewExName('');
    setNewExLoad('');
  };

  const handleRemoveExercise = (exId: string) => {
    const updated = divisions.map((d, i) => {
      if (i !== activeDivisionIdx) return d;
      return {
        ...d,
        exercises: d.exercises.filter((e) => e.id !== exId),
      };
    });
    setDivisions(updated);
  };

  const handleResetToSystemDefault = () => {
    // Generates optimal evidence-based routine
    const defaultDivs: CustomWorkoutDivision[] = [
      {
        id: 'div_a',
        letter: 'A',
        name: 'Treino A: Peitoral, Deltoide Anterior & Tríceps (Push)',
        exercises: [
          { id: 'ex_1', name: 'Supino Reto com Barra', muscleGroup: 'Peito', sets: 4, reps: '8-10', loadKg: 70, restSeconds: 90 },
          { id: 'ex_2', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', sets: 4, reps: '10', loadKg: 26, restSeconds: 90 },
          { id: 'ex_3', name: 'Crucifixo na Polia Média', muscleGroup: 'Peito', sets: 3, reps: '12-15', loadKg: 15, restSeconds: 60 },
          { id: 'ex_4', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', sets: 3, reps: '10', loadKg: 18, restSeconds: 90 },
          { id: 'ex_5', name: 'Elevação Lateral', muscleGroup: 'Ombros', sets: 4, reps: '12-15', loadKg: 10, restSeconds: 60 },
          { id: 'ex_6', name: 'Tríceps Corda na Polia', muscleGroup: 'Tríceps', sets: 4, reps: '12', loadKg: 20, restSeconds: 60 },
        ],
      },
      {
        id: 'div_b',
        letter: 'B',
        name: 'Treino B: Dorsal, Deltoide Posterior & Bíceps (Pull)',
        exercises: [
          { id: 'ex_7', name: 'Puxada Alta na Polia', muscleGroup: 'Costas', sets: 4, reps: '8-10', loadKg: 65, restSeconds: 90 },
          { id: 'ex_8', name: 'Remada Curvada com Barra', muscleGroup: 'Costas', sets: 4, reps: '8-10', loadKg: 65, restSeconds: 90 },
          { id: 'ex_9', name: 'Remada Baixa no Triângulo', muscleGroup: 'Costas', sets: 3, reps: '10-12', loadKg: 55, restSeconds: 75 },
          { id: 'ex_10', name: 'Crucifixo Invertido', muscleGroup: 'Ombros', sets: 3, reps: '15', loadKg: 8, restSeconds: 60 },
          { id: 'ex_11', name: 'Rosca Direta Barra W', muscleGroup: 'Bíceps', sets: 4, reps: '10', loadKg: 28, restSeconds: 60 },
          { id: 'ex_12', name: 'Rosca Martelo com Halteres', muscleGroup: 'Bíceps', sets: 3, reps: '12', loadKg: 12, restSeconds: 60 },
        ],
      },
      {
        id: 'div_c',
        letter: 'C',
        name: 'Treino C: Quadríceps, Isquiotibiais & Panturrilhas (Legs)',
        exercises: [
          { id: 'ex_13', name: 'Agachamento Livre com Barra', muscleGroup: 'Pernas', sets: 4, reps: '8', loadKg: 90, restSeconds: 120 },
          { id: 'ex_14', name: 'Leg Press 45°', muscleGroup: 'Pernas', sets: 4, reps: '10-12', loadKg: 220, restSeconds: 90 },
          { id: 'ex_15', name: 'Cadeira Extensora', muscleGroup: 'Pernas', sets: 3, reps: '12-15', loadKg: 50, restSeconds: 60 },
          { id: 'ex_16', name: 'Mesa Flexora', muscleGroup: 'Pernas', sets: 4, reps: '10-12', loadKg: 45, restSeconds: 60 },
          { id: 'ex_17', name: 'Panturrilha em Pé na Máquina', muscleGroup: 'Panturrilha', sets: 4, reps: '15', loadKg: 60, restSeconds: 45 },
        ],
      },
    ];
    setDivisions(defaultDivs);
    setActiveDivisionIdx(0);
    setMode('SUGGESTED');
  };

  const handleSave = () => {
    onSavePlan(mode, divisions, selectedDays.length);
    onClose();
  };

  const weekDayNames = [
    { num: 1, label: 'Seg', name: 'Segunda' },
    { num: 2, label: 'Ter', name: 'Terça' },
    { num: 3, label: 'Qua', name: 'Quarta' },
    { num: 4, label: 'Qui', name: 'Quinta' },
    { num: 5, label: 'Sex', name: 'Sexta' },
    { num: 6, label: 'Sáb', name: 'Sábado' },
    { num: 0, label: 'Dom', name: 'Domingo' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-mono">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              <Dumbbell className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Personalizador de Treino do Aluno
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                  {mode === 'SUGGESTED' ? 'TREINO SUGERIDO EDITÁVEL' : 'TREINO MONTADO DO ZERO'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                Adapte as divisões, dias da semana, séries e cargas às suas necessidades de treinamento.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Days of Week */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold uppercase">Origem da Ficha:</span>
              <div className="inline-flex p-1 bg-black border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('SUGGESTED')}
                  className={`px-3 py-1 font-bold uppercase transition-all cursor-pointer ${
                    mode === 'SUGGESTED' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sugerido pelo Sistema (IA Fisiológica)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('CUSTOM')}
                  className={`px-3 py-1 font-bold uppercase transition-all cursor-pointer ${
                    mode === 'CUSTOM' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Montar Meu Treino do Zero
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToSystemDefault}
              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar Padrão Científico</span>
            </button>
          </div>

          {/* Days of Week Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">
              Dias da Semana em que você treina ({selectedDays.length} dias selecionados):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {weekDayNames.map((d) => {
                const isSelected = selectedDays.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => handleToggleDay(d.num)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divisions Selector */}
        <div className="p-3 bg-black border-b border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {divisions.map((div, idx) => (
              <button
                key={div.id || idx}
                type="button"
                onClick={() => setActiveDivisionIdx(idx)}
                className={`px-3 py-1.5 text-xs font-bold uppercase border transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeDivisionIdx === idx
                    ? 'bg-zinc-900 border-white text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-4 h-4 bg-white text-black font-black text-[9px] flex items-center justify-center">
                  {div.letter}
                </span>
                <span className="truncate max-w-[140px]">{div.name.replace(/Treino [A-Z]: /, '')}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleAddDivision}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Adicionar nova divisão de treino"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {divisions.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveDivision(activeDivisionIdx)}
              className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Excluir Divisão {currentDiv?.letter}</span>
            </button>
          )}
        </div>

        {/* Exercises List in Current Division */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-900">
            <div>
              <input
                type="text"
                value={currentDiv?.name || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setDivisions(
                    divisions.map((d, i) => (i === activeDivisionIdx ? { ...d, name: val } : d))
                  );
                }}
                className="bg-black border border-zinc-800 px-3 py-1 text-sm font-bold text-white uppercase outline-none focus:border-white font-mono w-full sm:w-80"
              />
              <span className="text-[10px] text-zinc-500 block mt-1">
                {currentDiv?.exercises.length || 0} exercícios cadastrados nesta divisão
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddEx(true)}
              className="px-3.5 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Exercício</span>
            </button>
          </div>

          {/* Form to Add Exercise */}
          {showAddEx && (
            <form onSubmit={handleAddExerciseToCurrentDiv} className="p-4 bg-zinc-900 border border-zinc-700 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-white font-bold uppercase">
                  Novo Exercício para {currentDiv?.name}
                </span>
                <button type="button" onClick={() => setShowAddEx(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase">Nome do Exercício *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Supino Reto, Agachamento, Puxada..."
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase">Grupamento</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="Peito">Peito</option>
                    <option value="Costas">Costas</option>
                    <option value="Pernas">Pernas (Quadríceps/Isquiotibiais)</option>
                    <option value="Ombros">Ombros</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Panturrilha">Panturrilha</option>
                    <option value="Abdômen">Abdômen / Core</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase">Séries</label>
                  <input
                    type="number"
                    value={newExSets}
                    onChange={(e) => setNewExSets(Number(e.target.value))}
                    className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase">Repetições</label>
                  <input
                    type="text"
                    placeholder="Ex: 8-10 ou 12"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase">
                    Carga Alvo (kg) <span className="text-zinc-500 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Em branco p/ preencher no treino"
                    value={newExLoad}
                    onChange={(e) => setNewExLoad(e.target.value)}
                    className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5 font-bold uppercase">Descanso (seg)</label>
                  <input
                    type="number"
                    value={newExRest}
                    onChange={(e) => setNewExRest(Number(e.target.value))}
                    className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddEx(false)}
                  className="px-3 py-1 text-zinc-400 hover:text-white uppercase font-bold text-[10px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-black uppercase text-[10px] hover:bg-zinc-200 cursor-pointer"
                >
                  Inserir Exercício
                </button>
              </div>
            </form>
          )}

          {/* Current Exercises Cards */}
          <div className="space-y-2">
            {currentDiv?.exercises.map((ex, i) => (
              <div
                key={ex.id || i}
                className="p-3 bg-black border border-zinc-900 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-white font-bold uppercase">{ex.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      <span className="text-blue-400 font-bold">{ex.sets} séries</span> ×{' '}
                      <span className="text-white font-bold">{ex.reps} reps</span> • Carga:{' '}
                      <span className="text-emerald-400 font-bold">
                        {ex.loadKg ? `${ex.loadKg} kg` : 'A definir na hora'}
                      </span>{' '}
                      • Descanso: <span className="text-zinc-300">{ex.restSeconds}s</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveExercise(ex.id)}
                  className="text-zinc-600 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                  title="Remover exercício"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {currentDiv?.exercises.length === 0 && (
              <div className="p-8 border border-dashed border-zinc-900 text-center text-zinc-500 text-xs space-y-1">
                <Dumbbell className="w-6 h-6 mx-auto text-zinc-700" />
                <p className="font-bold uppercase">Nenhum exercício nesta divisão.</p>
                <p className="text-[11px] font-sans">Clique em "Adicionar Exercício" acima para montar seu treino.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] text-zinc-400 font-sans flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span>O peso pode ser deixado em branco para você digitar os kg na hora de executar cada série!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white uppercase font-bold text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar e Ativar Ficha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
