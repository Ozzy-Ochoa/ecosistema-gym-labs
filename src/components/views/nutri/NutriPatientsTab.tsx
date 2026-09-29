import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { NutriPatient, NutriTimelineEvent } from '../../../types/nutri';
import {
  Users,
  Search,
  Plus,
  FileText,
  Clock,
  Activity,
  AlertCircle,
  Calendar,
  Utensils,
  ChevronRight,
  Shield,
  Heart,
  Droplet,
  Moon,
  MessageSquare,
  CheckCircle,
  X
} from 'lucide-react';

interface NutriPatientsTabProps {
  onPrescribeDiet: (patient: NutriPatient) => void;
  onNewConsultation: (patient: NutriPatient) => void;
  onOpenChat: (patientId: string) => void;
}

export const NutriPatientsTab: React.FC<NutriPatientsTabProps> = ({
  onPrescribeDiet,
  onNewConsultation,
  onOpenChat,
}) => {
  const { nutriPatients, addNutriPatient, updateNutriPatient } = useGymLabs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'INACTIVE'>('ALL');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(nutriPatients[0]?.id || '');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // New Patient Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [primaryGoal, setPrimaryGoal] = useState<'FAT_LOSS' | 'HYPERTROPHY' | 'PERFORMANCE' | 'HEALTH' | 'RECOMPOSITION'>('HYPERTROPHY');
  const [biologicalSex, setBiologicalSex] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');
  const [clinicalObs, setClinicalObs] = useState('');

  const filteredPatients = nutriPatients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryGoal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activePatient = nutriPatients.find((p) => p.id === selectedPatientId) || nutriPatients[0];

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newPatient: NutriPatient = {
      id: `pat_${Date.now()}`,
      name,
      email,
      phone: phone || '(11) 90000-0000',
      dateOfBirth: '1995-01-01',
      biologicalSex,
      weightKg,
      heightCm,
      primaryGoal,
      activityLevel: 'MODERATELY_ACTIVE',
      dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.split(',').map((s) => s.trim()) : [],
      allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
      foodPreferences: preferences ? preferences.split(',').map((s) => s.trim()) : [],
      foodDislikes: [],
      sleepHoursDaily: 7.5,
      waterIntakeGoalMl: Math.round(weightKg * 40),
      clinicalObservations: clinicalObs || 'Paciente cadastrado no portal clínico Gym Labs Nutri.',
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
      timeline: [
        {
          id: `time_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'NOTE',
          title: 'Prontuário Criado',
          description: 'Abertura de ficha nutricional no sistema Gym Labs.',
          authorName: 'Nutricionista Responsável',
        },
      ],
    };

    addNutriPatient(newPatient);
    setSelectedPatientId(newPatient.id);
    setShowNewPatientModal(false);
    // Reset form
    setName('');
    setEmail('');
    setPhone('');
  };

  // BMI calculation
  const bmi = activePatient
    ? Number((activePatient.weightKg / Math.pow(activePatient.heightCm / 100, 2)).toFixed(1))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950 p-4 border border-zinc-800">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou objetivo..."
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
            <option value="ALL">TODOS STATUS</option>
            <option value="ACTIVE">ATIVOS</option>
            <option value="PENDING">PENDENTES</option>
            <option value="INACTIVE">INATIVOS</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPatientModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NOVO PACIENTE</span>
        </button>
      </div>

      {/* Main Grid: Patients List + Patient Full Clinical Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patients List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider px-1">
            Pacientes Cadastrados ({filteredPatients.length})
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredPatients.map((patient) => {
              const isSelected = patient.id === activePatient?.id;
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{patient.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono block">{patient.email}</span>
                    </div>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 font-bold uppercase border ${
                        patient.status === 'ACTIVE'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-900 grid grid-cols-2 text-[10px]">
                    <div>
                      <span className="text-zinc-500 uppercase">Peso: </span>
                      <span className="text-white font-bold">{patient.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 uppercase">Objetivo: </span>
                      <span className="text-white font-bold">{patient.primaryGoal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Patient Prontuário & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {activePatient ? (
            <div className="space-y-6">
              {/* Patient Header Card */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white text-base font-black">
                      {activePatient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white uppercase">
                          {activePatient.name}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase">
                          PRONTUÁRIO ATIVO
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {activePatient.email} • {activePatient.phone} • {activePatient.biologicalSex === 'MALE' ? 'MASCULINO' : 'FEMININO'}
                      </div>
                    </div>
                  </div>

                  {/* Direct Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenChat(activePatient.id)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNewConsultation(activePatient)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Agendar Consulta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrescribeDiet(activePatient)}
                      className="px-3.5 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Prescrever Dieta</span>
                    </button>
                  </div>
                </div>

                {/* Biometrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">Peso Corporal</span>
                    <span className="text-base font-black text-white">{activePatient.weightKg} kg</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">Estatura</span>
                    <span className="text-base font-black text-white">{activePatient.heightCm} cm</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">IMC Atual</span>
                    <span className="text-base font-black text-white">{bmi} kg/m²</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">Meta Hídrica</span>
                    <span className="text-base font-black text-cyan-400">{activePatient.waterIntakeGoalMl} ml</span>
                  </div>
                </div>

                {/* Anamnesis Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-black border border-zinc-900 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Restrições & Alergias
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePatient.allergies.length > 0 ? (
                        activePatient.allergies.map((a, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 font-bold uppercase">
                            ALERGIA: {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-500">Nenhuma alergia relatada</span>
                      )}
                      {activePatient.dietaryRestrictions.map((r, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold uppercase">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-black border border-zinc-900 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" /> Preferências Alimentares
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePatient.foodPreferences.length > 0 ? (
                        activePatient.foodPreferences.map((p, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-500">Sem preferências anotadas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinical Observations */}
                <div className="p-3.5 bg-black border border-zinc-900 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Parecer Clínico & Conduta Nutricional
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {activePatient.clinicalObservations}
                  </p>
                </div>
              </div>

              {/* Patient Timeline */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Linha do Tempo Clínica do Paciente
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">HISTÓRICO COMPLETO</span>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-800">
                  {activePatient.timeline && activePatient.timeline.length > 0 ? (
                    activePatient.timeline.map((evt) => (
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
              Selecione um paciente para carregar o prontuário.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Novo Paciente */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Novo Cadastro de Paciente</h3>
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Nome Completo *</label>
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
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Altura (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Objetivo Principal</label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  >
                    <option value="HYPERTROPHY">HIPERTROFIA</option>
                    <option value="FAT_LOSS">EMAGRECIMENTO</option>
                    <option value="PERFORMANCE">PERFORMANCE ESPORTIVA</option>
                    <option value="HEALTH">SAÚDE & LONGEVIDADE</option>
                    <option value="RECOMPOSITION">RECOMPOSIÇÃO CORPORAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Sexo Biológico</label>
                  <select
                    value={biologicalSex}
                    onChange={(e) => setBiologicalSex(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  >
                    <option value="MALE">MASCULINO</option>
                    <option value="FEMALE">FEMININO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Alergias Alimentares</label>
                <input
                  type="text"
                  placeholder="Ex: Frutos do mar, amendoim, glúten (separar por vírgula)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Restrições / Aversões</label>
                <input
                  type="text"
                  placeholder="Ex: Lactose, carne vermelha, etc."
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Observações Clínicas</label>
                <textarea
                  rows={3}
                  value={clinicalObs}
                  onChange={(e) => setClinicalObs(e.target.value)}
                  placeholder="Histórico médico, rotina, suplementação anterior..."
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase hover:bg-zinc-200"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
