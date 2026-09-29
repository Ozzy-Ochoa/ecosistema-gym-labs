import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  TrainerWorkoutPlan,
  TrainerWorkoutSession,
  TrainerPrescribedExercise,
  TrainerStudent
} from '../../../types/trainer';
import {
  Dumbbell,
  Plus,
  Trash2,
  Send,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface TrainerWorkoutBuilderTabProps {
  initialStudent?: TrainerStudent | null;
}

export const TrainerWorkoutBuilderTab: React.FC<TrainerWorkoutBuilderTabProps> = ({
  initialStudent,
}) => {
  const {
    trainerWorkoutPlans,
    trainerStudents,
    addTrainerWorkoutPlan,
    publishTrainerWorkoutPlan,
  } = useGymLabs();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || trainerStudents[0]?.id || ''
  );

  const selectedStudent = trainerStudents.find((s) => s.id === selectedStudentId) || trainerStudents[0];

  const [title, setTitle] = useState(
    selectedStudent ? `Periodização Hipertrofia - ${selectedStudent.name}` : 'Hipertrofia Periodizada A/B/C'
  );
  const [goal, setGoal] = useState(selectedStudent?.primaryGoal || 'HYPERTROPHY');
  const [splitType, setSplitType] = useState<TrainerWorkoutPlan['splitType']>('ABC');
  const [weeklyFrequencyDays, setWeeklyFrequencyDays] = useState(5);
  const [generalInstructions, setGeneralInstructions] = useState(
    'Manter cadência excêntrica de 3 segundos em todos os exercícios base. Respeitar o intervalo de descanso cronometrado e registrar a carga real no aplicativo.'
  );

  // Initial Sessions
  const [sessions, setSessions] = useState<TrainerWorkoutSession[]>([
    {
      id: 'sess_1',
      name: 'Treino A: Peitoral, Deltoide Anterior & Tríceps',
      splitLetter: 'A',
      focusMuscleGroups: ['Peitoral', 'Deltoides', 'Tríceps'],
      estimatedDurationMinutes: 65,
      exercises: [
        {
          id: 'ex_1_1',
          exerciseName: 'Supino Reto com Barra Olímpica',
          muscleGroup: 'Peitoral Maior',
          sets: 4,
          reps: '6-8',
          loadKg: 85,
          restSeconds: 120,
          rpeTarget: 8.5,
          tempo: '3-0-1-0',
          notes: 'Pausa de 1s no peito. Manter retração escapular rígida no banco.',
        },
        {
          id: 'ex_1_2',
          exerciseName: 'Supino Inclinado com Halteres (30°)',
          muscleGroup: 'Peitoral Superior',
          sets: 4,
          reps: '8-10',
          loadKg: 32,
          restSeconds: 90,
          rpeTarget: 8,
          tempo: '3-1-1-0',
          notes: 'Alongamento máximo na descida. Cotovelos a 45 graus.',
        },
        {
          id: 'ex_1_3',
          exerciseName: 'Crucifixo no Crossover Polia Média',
          muscleGroup: 'Peitoral / Isolamento',
          sets: 3,
          reps: '12-15',
          loadKg: 20,
          restSeconds: 60,
          rpeTarget: 9,
          notes: 'Pico de contração isométrica de 2 segundos a cada repetição.',
        },
        {
          id: 'ex_1_4',
          exerciseName: 'Desenvolvimento Militar com Barra',
          muscleGroup: 'Deltoide Anterior',
          sets: 3,
          reps: '8-10',
          loadKg: 50,
          restSeconds: 90,
          rpeTarget: 8.5,
          notes: 'Core estabilizado, sem hiperextensão lombar.',
        },
        {
          id: 'ex_1_5',
          exerciseName: 'Tríceps Testa com Barra W',
          muscleGroup: 'Tríceps',
          sets: 4,
          reps: '10-12',
          loadKg: 34,
          restSeconds: 75,
          rpeTarget: 9,
          notes: 'Cotovelos fechados apontando para o teto.',
        },
      ],
    },
    {
      id: 'sess_2',
      name: 'Treino B: Dorsal, Deltoide Posterior & Bíceps',
      splitLetter: 'B',
      focusMuscleGroups: ['Dorsal', 'Trapézio', 'Bíceps'],
      estimatedDurationMinutes: 60,
      exercises: [
        {
          id: 'ex_2_1',
          exerciseName: 'Puxada Alta Pronada (Pulldown)',
          muscleGroup: 'Latíssimo do Dorso',
          sets: 4,
          reps: '8-10',
          loadKg: 75,
          restSeconds: 90,
          rpeTarget: 8.5,
          notes: 'Puxar em direção à clavícula deprimindo as escápulas.',
        },
        {
          id: 'ex_2_2',
          exerciseName: 'Remada Curvada com Barra',
          muscleGroup: 'Costas / Espessura',
          sets: 4,
          reps: '8-10',
          loadKg: 80,
          restSeconds: 90,
          rpeTarget: 8.5,
          notes: 'Tronco a 45 graus, puxar a barra no umbigo.',
        },
        {
          id: 'ex_2_3',
          exerciseName: 'Rosca Direta com Barra W',
          muscleGroup: 'Bíceps Braquial',
          sets: 4,
          reps: '10-12',
          loadKg: 32,
          restSeconds: 75,
          rpeTarget: 9,
          notes: 'Evitar balanço corporal, foco na fase excêntrica.',
        },
      ],
    },
    {
      id: 'sess_3',
      name: 'Treino C: Quadríceps, Isquiotibiais & Panturrilha',
      splitLetter: 'C',
      focusMuscleGroups: ['Quadríceps', 'Isquiotibiais', 'Panturrilhas'],
      estimatedDurationMinutes: 70,
      exercises: [
        {
          id: 'ex_3_1',
          exerciseName: 'Agachamento Livre com Barra',
          muscleGroup: 'Quadríceps & Glúteos',
          sets: 4,
          reps: '6-8',
          loadKg: 120,
          restSeconds: 150,
          rpeTarget: 9,
          notes: 'Profundidade paralela. Joelhos alinhados com a ponta dos pés.',
        },
        {
          id: 'ex_3_2',
          exerciseName: 'Leg Press 45 Graus',
          muscleGroup: 'Quadríceps',
          sets: 4,
          reps: '10-12',
          loadKg: 280,
          restSeconds: 90,
          rpeTarget: 8.5,
          notes: 'Amplitude total sem descolar o quadril do encosto.',
        },
        {
          id: 'ex_3_3',
          exerciseName: 'Mesa Flexora',
          muscleGroup: 'Isquiotibiais',
          sets: 4,
          reps: '10-12',
          loadKg: 55,
          restSeconds: 75,
          rpeTarget: 9,
          notes: 'Contração de 1s no topo, descida lenta.',
        },
      ],
    },
  ]);

  // Exercise Form Helper
  const [activeSessionForAdd, setActiveSessionForAdd] = useState<string | null>(null);
  const [newExName, setNewExName] = useState('');
  const [newExGroup, setNewExGroup] = useState('Peitoral');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState('8-10');
  const [newExLoad, setNewExLoad] = useState<number>(60);
  const [newExRest, setNewExRest] = useState<number>(90);
  const [newExRpe, setNewExRpe] = useState<number>(8.5);
  const [newExNotes, setNewExNotes] = useState('');

  const handleAddExercise = (sessionId: string) => {
    if (!newExName) return;
    const newEx: TrainerPrescribedExercise = {
      id: `ex_${Date.now()}`,
      exerciseName: newExName,
      muscleGroup: newExGroup,
      sets: newExSets,
      reps: newExReps,
      loadKg: newExLoad,
      restSeconds: newExRest,
      rpeTarget: newExRpe,
      notes: newExNotes || undefined,
    };

    setSessions(
      sessions.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          exercises: [...s.exercises, newEx],
        };
      })
    );

    setActiveSessionForAdd(null);
    setNewExName('');
    setNewExNotes('');
  };

  const handleRemoveExercise = (sessionId: string, exId: string) => {
    setSessions(
      sessions.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          exercises: s.exercises.filter((e) => e.id !== exId),
        };
      })
    );
  };

  const handleSaveAndPublish = () => {
    if (!selectedStudent) return;

    const newPlan: TrainerWorkoutPlan = {
      id: `plan_trainer_${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      authorId: 'usr_gymlabs_trainer',
      authorName: 'Marcus Steel (CREF 091823-G/SP)',
      title,
      goal,
      splitType,
      version: 2.0,
      status: 'PUBLISHED',
      sessions,
      weeklyFrequencyDays,
      generalInstructions,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    addTrainerWorkoutPlan(newPlan);
    publishTrainerWorkoutPlan(newPlan.id);
    alert(
      `Ficha de Treino "${title}" publicada com sucesso para o aluno ${selectedStudent.name}! O treino já está ativo e visível na aba Treino do aplicativo do aluno.`
    );
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                CONSTRUTOR DE TREINOS // WORKOUT BUILDER PROFISSIONAL
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Prescrição de fichas periodizadas com divisões musculares, séries, faixas de repetições, cargas alvo e RPE.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            className="px-5 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span>PUBLICAR TREINO PARA O ALUNO</span>
          </button>
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Aluno Destinatário</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
            >
              {trainerStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.fitnessLevel} // {s.weightKg} kg)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Título da Ficha</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-bold"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Divisão (Split)</label>
            <select
              value={splitType}
              onChange={(e) => setSplitType(e.target.value as any)}
              className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
            >
              <option value="ABC">DIVISÃO ABC</option>
              <option value="PUSH_PULL_LEGS">PUSH / PULL / LEGS</option>
              <option value="UPPER_LOWER">UPPER / LOWER</option>
              <option value="FULL_BODY">FULL BODY 3X</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workout Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sessões Estruturadas ({sessions.length} divisões de treino)
          </h3>
          <button
            type="button"
            onClick={() => {
              const letter = String.fromCharCode(65 + sessions.length) as any;
              setSessions([
                ...sessions,
                {
                  id: `sess_${Date.now()}`,
                  name: `Treino ${letter}: Novo Foco Muscular`,
                  splitLetter: letter,
                  focusMuscleGroups: ['Corpo Inteiro'],
                  estimatedDurationMinutes: 60,
                  exercises: [],
                },
              ]);
            }}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Sessão</span>
          </button>
        </div>

        {sessions.map((sess) => (
          <div key={sess.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white text-black font-black flex items-center justify-center text-sm">
                  {sess.splitLetter}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">{sess.name}</h4>
                  <div className="text-[10px] text-zinc-400">
                    Duração estimada: {sess.estimatedDurationMinutes} min • {sess.exercises.length} exercícios
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSessionForAdd(sess.id)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-white hover:text-black text-white text-xs font-bold uppercase border border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Exercício</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSessions(sessions.filter((s) => s.id !== sess.id))}
                  className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exercises List inside session */}
            <div className="space-y-2">
              {sess.exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="p-3 bg-black border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-600 font-bold text-xs">{idx + 1}.</span>
                    <div>
                      <div className="text-white font-bold uppercase">{ex.exerciseName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        <span className="text-blue-400 font-bold">{ex.sets} séries</span> ×{' '}
                        <span className="text-white font-bold">{ex.reps} reps</span> • Carga:{' '}
                        <span className="text-emerald-400 font-bold">{ex.loadKg || 0} kg</span> • Descanso:{' '}
                        <span className="text-zinc-200">{ex.restSeconds}s</span> • Alvo: RPE {ex.rpeTarget}
                      </div>
                      {ex.notes && (
                        <p className="text-[10px] text-zinc-500 font-sans italic mt-1">{ex.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(sess.id, ex.id)}
                    className="text-zinc-600 hover:text-red-400 p-1 self-end sm:self-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {sess.exercises.length === 0 && (
                <div className="p-4 border border-dashed border-zinc-900 text-center text-zinc-500 text-xs">
                  Nenhum exercício prescrito nesta divisão. Clique em "Adicionar Exercício".
                </div>
              )}
            </div>

            {/* Form Drawer to add exercise */}
            {activeSessionForAdd === sess.id && (
              <div className="p-4 bg-zinc-900/80 border border-zinc-700 space-y-3 mt-3 text-xs">
                <div className="text-[10px] text-white font-bold uppercase">
                  Adicionar Exercício à Divisão {sess.splitLetter}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nome do exercício (ex: Supino Inclinado com Halteres)"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Grupo (ex: Peitoral, Dorsal)"
                      value={newExGroup}
                      onChange={(e) => setNewExGroup(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Séries</label>
                    <input
                      type="number"
                      value={newExSets}
                      onChange={(e) => setNewExSets(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Repetições</label>
                    <input
                      type="text"
                      placeholder="Ex: 8-10 ou FALHA"
                      value={newExReps}
                      onChange={(e) => setNewExReps(e.target.value)}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Carga Inicial (kg)</label>
                    <input
                      type="number"
                      value={newExLoad}
                      onChange={(e) => setNewExLoad(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Descanso (seg)</label>
                    <input
                      type="number"
                      value={newExRest}
                      onChange={(e) => setNewExRest(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Instruções biomecânicas ou cadência (ex: 3s na descida, amplitude completa)"
                    value={newExNotes}
                    onChange={(e) => setNewExNotes(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSessionForAdd(null)}
                    className="px-3 py-1 text-zinc-400 hover:text-white uppercase font-bold text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddExercise(sess.id)}
                    className="px-4 py-1.5 bg-white text-black font-black uppercase text-[10px] hover:bg-zinc-200 cursor-pointer"
                  >
                    Confirmar Exercício
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* General Instructions */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-2">
        <label className="block text-zinc-400 uppercase text-[10px] font-bold">
          Orientações Gerais de Treinamento ao Aluno
        </label>
        <textarea
          rows={3}
          value={generalInstructions}
          onChange={(e) => setGeneralInstructions(e.target.value)}
          placeholder="Aquecimento neuromuscular, cardio pós-treino, orientações sobre hidratação..."
          className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white text-xs font-mono"
        />
      </div>

      {/* Publish Bar */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          Status atual: <span className="text-blue-400 font-bold uppercase">Pronto para Publicação</span>
        </div>
        <button
          type="button"
          onClick={handleSaveAndPublish}
          className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>PUBLICAR TREINO PARA O ALUNO AGORA</span>
        </button>
      </div>
    </div>
  );
};
