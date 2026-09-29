import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { NutriConsultation } from '../../../types/nutri';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Filter,
  Check,
  X
} from 'lucide-react';

export const NutriConsultationsTab: React.FC = () => {
  const {
    nutriConsultations,
    nutriPatients,
    addNutriConsultation,
    updateNutriConsultation,
  } = useGymLabs();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Consultation Form
  const [selectedPatientId, setSelectedPatientId] = useState(nutriPatients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'FIRST_VISIT' | 'FOLLOW_UP' | 'ASSESSMENT' | 'ONLINE_TELEHEALTH'>('FOLLOW_UP');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [anamnesisNotes, setAnamnesisNotes] = useState('');
  const [dietaryFeedback, setDietaryFeedback] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [nextReturnDays, setNextReturnDays] = useState(30);

  const filteredConsultations = nutriConsultations.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesType = filterType === 'ALL' || c.type === filterType;
    return matchesStatus && matchesType;
  });

  const handleScheduleConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = nutriPatients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const newConsultation: NutriConsultation = {
      id: `cons_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      date,
      time,
      type,
      status: 'SCHEDULED',
      durationMinutes,
      anamnesisNotes: anamnesisNotes || 'Anamnese padrão de consulta nutricional.',
      dietaryFeedback: dietaryFeedback || 'Orientações preliminares fornecidas.',
      prescriptions: prescriptions || 'Manter meta de hidratação e adesão aos macronutrientes.',
      nextReturnDays,
      createdAt: new Date().toISOString(),
    };

    addNutriConsultation(newConsultation);
    setShowScheduleModal(false);
    setAnamnesisNotes('');
    setDietaryFeedback('');
  };

  const handleUpdateStatus = (id: string, newStatus: NutriConsultation['status']) => {
    updateNutriConsultation(id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 font-mono outline-none focus:border-white"
          >
            <option value="ALL">TODOS OS STATUS</option>
            <option value="SCHEDULED">AGENDADA</option>
            <option value="CONFIRMED">CONFIRMADA</option>
            <option value="COMPLETED">REALIZADA</option>
            <option value="MISSED">FALTA</option>
            <option value="CANCELLED">CANCELADA</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 font-mono outline-none focus:border-white"
          >
            <option value="ALL">TODOS OS TIPOS</option>
            <option value="FIRST_VISIT">PRIMEIRA CONSULTA</option>
            <option value="FOLLOW_UP">RETORNO</option>
            <option value="ASSESSMENT">AVALIAÇÃO</option>
            <option value="ONLINE_TELEHEALTH">TELECONSULTA</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>AGENDAR NOVA CONSULTA</span>
        </button>
      </div>

      {/* Consultations Table / List */}
      <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Registro Geral de Consultas ({filteredConsultations.length})
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            SISTEMA CLÍNICO NUTRICIONAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-zinc-500 border-b border-zinc-900 text-[10px] uppercase">
              <tr>
                <th className="p-3">Data & Horário</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Duração</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredConsultations.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3">
                    <div className="text-white font-bold">{c.date}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {c.time}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-white font-bold uppercase">{c.patientName}</div>
                    <div className="text-[10px] text-zinc-500 font-sans truncate max-w-xs">
                      {c.prescriptions || 'Sem prescrição específica'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[9px] px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 font-bold uppercase">
                      {c.type === 'FIRST_VISIT'
                        ? '1ª CONSULTA'
                        : c.type === 'FOLLOW_UP'
                        ? 'RETORNO'
                        : c.type === 'ONLINE_TELEHEALTH'
                        ? 'TELECONSULTA'
                        : 'AVALIAÇÃO'}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{c.durationMinutes} min</td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 font-bold uppercase border ${
                        c.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : c.status === 'CONFIRMED'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : c.status === 'SCHEDULED'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : c.status === 'MISSED'
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(c.id, 'COMPLETED')}
                          className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          title="Registrar Comparecimento / Concluída"
                        >
                          Concluir
                        </button>
                      )}
                      {c.status !== 'MISSED' && c.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(c.id, 'MISSED')}
                          className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          title="Registrar Falta"
                        >
                          Falta
                        </button>
                      )}
                      {c.status !== 'CANCELLED' && c.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(c.id, 'CANCELLED')}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agendar Consulta */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Agendar Nova Consulta</h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleConsultation} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Paciente *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                >
                  {nutriPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Data *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Horário *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Tipo de Consulta</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  >
                    <option value="FIRST_VISIT">PRIMEIRA CONSULTA (ANAMNESE)</option>
                    <option value="FOLLOW_UP">RETORNO DE ACOMPANHAMENTO</option>
                    <option value="ASSESSMENT">AVALIAÇÃO ANTROPOMÉTRICA</option>
                    <option value="ONLINE_TELEHEALTH">TELECONSULTA REMOTA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Duração (minutos)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Objetivo / Queixa Principal</label>
                <textarea
                  rows={2}
                  value={anamnesisNotes}
                  onChange={(e) => setAnamnesisNotes(e.target.value)}
                  placeholder="Ex: Análise de exames laboratoriais e reajuste calórico..."
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase hover:bg-zinc-200"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
