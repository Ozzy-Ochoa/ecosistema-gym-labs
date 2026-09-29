import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { TrainerStudent } from '../../../types/trainer';
import {
  Users,
  Search,
  Plus,
  Dumbbell,
  Calendar,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MessageSquare,
  Award,
  X
} from 'lucide-react';

interface TrainerStudentsTabProps {
  onPrescribeWorkout: (student: TrainerStudent) => void;
  onNewAssessment: (student: TrainerStudent) => void;
  onOpenChat: (studentId: string) => void;
}

export const TrainerStudentsTab: React.FC<TrainerStudentsTabProps> = ({
  onPrescribeWorkout,
  onNewAssessment,
  onOpenChat,
}) => {
  const { trainerStudents, addTrainerStudent } = useGymLabs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'INACTIVE'>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(trainerStudents[0]?.id || '');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Student Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [weightKg, setWeightKg] = useState(82.5);
  const [heightCm, setHeightCm] = useState(178);
  const [fitnessLevel, setFitnessLevel] = useState<TrainerStudent['fitnessLevel']>('ADVANCED');
  const [primaryGoal, setPrimaryGoal] = useState<TrainerStudent['primaryGoal']>('HYPERTROPHY');
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [injuries, setInjuries] = useState('');
  const [preferences, setPreferences] = useState('');

  const filteredStudents = trainerStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.primaryGoal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeStudent = trainerStudents.find((s) => s.id === selectedStudentId) || trainerStudents[0];

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newStudent: TrainerStudent = {
      id: `std_${Date.now()}`,
      name,
      email,
      phone: phone || '(11) 99999-8888',
      dateOfBirth: '1996-01-01',
      biologicalSex: 'MALE',
      weightKg,
      heightCm,
      fitnessLevel,
      primaryGoal,
      trainingDaysPerWeekTarget: daysPerWeek,
      injuriesAndLimitations: injuries ? injuries.split(',').map((s) => s.trim()) : [],
      medicalClearance: true,
      trainingPreferences: preferences ? preferences.split(',').map((s) => s.trim()) : [],
      status: 'ACTIVE',
      totalWorkoutsLoggedCount: 0,
      registeredAt: new Date().toISOString(),
      timeline: [
        {
          id: `time_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'NOTE',
          title: 'Aluno Cadastrado',
          description: 'Abertura de ficha de treinamento no Gym Labs Trainer.',
          authorName: 'Personal Trainer Responsável',
        },
      ],
    };

    addTrainerStudent(newStudent);
    setSelectedStudentId(newStudent.id);
    setShowNewModal(false);
    setName('');
    setEmail('');
  };

  const bmi = activeStudent
    ? Number((activeStudent.weightKg / Math.pow(activeStudent.heightCm / 100, 2)).toFixed(1))
    : 0;

  return (
    <div className="space-y-6 font-mono">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950 p-4 border border-zinc-800">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar aluno por nome, email ou meta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-white transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black border border-zinc-800 px-3 py-2 text-xs text-zinc-300 font-mono outline-none focus:border-white"
          >
            <option value="ALL">TODOS</option>
            <option value="ACTIVE">ATIVOS</option>
            <option value="PENDING">PENDENTES</option>
            <option value="INACTIVE">INATIVOS</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NOVO ALUNO</span>
        </button>
      </div>

      {/* Main Grid: Student List & Full Student Sports Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider px-1">
            Alunos Vinculados ({filteredStudents.length})
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredStudents.map((st) => {
              const isSelected = st.id === activeStudent?.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{st.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono block">{st.email}</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800">
                      {st.fitnessLevel}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-900 grid grid-cols-2 text-[10px]">
                    <div>
                      <span className="text-zinc-500 uppercase">Peso: </span>
                      <span className="text-white font-bold">{st.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 uppercase">Objetivo: </span>
                      <span className="text-white font-bold">{st.primaryGoal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Student Record */}
        <div className="lg:col-span-8 space-y-6">
          {activeStudent ? (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white text-base font-black">
                      {activeStudent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white uppercase">
                          {activeStudent.name}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                          {activeStudent.fitnessLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {activeStudent.email} • {activeStudent.phone} • Frequência Alvo: {activeStudent.trainingDaysPerWeekTarget}x/sem
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenChat(activeStudent.id)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNewAssessment(activeStudent)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Avaliação Física</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrescribeWorkout(activeStudent)}
                      className="px-3.5 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Prescrever Treino</span>
                    </button>
                  </div>
                </div>

                {/* Biometrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">Peso Atual</span>
                    <span className="text-base font-black text-white">{activeStudent.weightKg} kg</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">Estatura</span>
                    <span className="text-base font-black text-white">{activeStudent.heightCm} cm</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">IMC Calculado</span>
                    <span className="text-base font-black text-white">{bmi} kg/m²</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">Sessões Realizadas</span>
                    <span className="text-base font-black text-emerald-400">
                      {activeStudent.totalWorkoutsLoggedCount || 42} treinos
                    </span>
                  </div>
                </div>

                {/* Injuries & Restrictions */}
                <div className="p-4 bg-black border border-zinc-900 space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Lesões, Restrições & Patologias Informadas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeStudent.injuriesAndLimitations && activeStudent.injuriesAndLimitations.length > 0 ? (
                      activeStudent.injuriesAndLimitations.map((inj, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold uppercase">
                          {inj}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-500">Nenhuma lesão ou restrição informada</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Timeline */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Linha do Tempo de Treinamento
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">REGISTRO HISTÓRICO</span>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-800">
                  {activeStudent.timeline && activeStudent.timeline.length > 0 ? (
                    activeStudent.timeline.map((evt) => (
                      <div key={evt.id} className="relative pl-7 space-y-1">
                        <div className="w-2.5 h-2.5 bg-white border-2 border-black absolute left-2 top-1.5 rounded-full" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase">{evt.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{evt.date}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans">{evt.description}</p>
                        <span className="text-[9px] text-zinc-600 block">Autor: {evt.authorName}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 py-4 text-center">Nenhum evento registrado ainda.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 border border-zinc-800 text-center text-zinc-500">
              Selecione um aluno para carregar o prontuário.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Novo Aluno */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Novo Aluno de Personal</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Nome *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Altura (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Frequência/sem</label>
                  <input
                    type="number"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Nível de Treino</label>
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="BEGINNER">INICIANTE</option>
                    <option value="INTERMEDIATE">INTERMEDIÁRIO</option>
                    <option value="ADVANCED">AVANÇADO</option>
                    <option value="ELITE">ATLETA / ELITE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Objetivo Principal</label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="HYPERTROPHY">HIPERTROFIA MIOFIBRILAR</option>
                    <option value="STRENGTH">FORÇA MÁXIMA & POTÊNCIA</option>
                    <option value="FAT_LOSS">EMAGRECIMENTO & DÉFICIT</option>
                    <option value="ENDURANCE">RESISTÊNCIA & CARDIO</option>
                    <option value="REHABILITATION">REABILITAÇÃO & POSTURA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Lesões ou Limitações (separar por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Condromalácia patelar, hérnia L5-S1..."
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase hover:bg-zinc-200"
                >
                  Salvar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
