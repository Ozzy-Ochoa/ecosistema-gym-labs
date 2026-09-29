import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { TrainerScheduleAppointment } from '../../../types/trainer';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  User,
  MapPin,
  CheckCircle,
  X
} from 'lucide-react';

export const TrainerScheduleTab: React.FC = () => {
  const { trainerAppointments, trainerStudents, addTrainerAppointment } = useGymLabs();
  const [viewMode, setViewMode] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [showModal, setShowModal] = useState(false);

  // New Appointment Form
  const [studentId, setStudentId] = useState(trainerStudents[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('07:00');
  const [type, setType] = useState<TrainerScheduleAppointment['type']>('IN_PERSON_TRAINING');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('Iron Gym Jardins (Unidade Principal)');
  const [fee, setFee] = useState(150);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hours = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
  ];

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const st = trainerStudents.find((s) => s.id === studentId);
    if (!st) return;

    const newApt: TrainerScheduleAppointment = {
      id: `apt_${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      date,
      time,
      durationMinutes: duration,
      type,
      status: 'SCHEDULED',
      location,
      feeAmount: fee,
      createdAt: new Date().toISOString(),
    };

    addTrainerAppointment(newApt);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header & Actions */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 bg-black border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-2">OUTUBRO / 2026</span>
            <button
              type="button"
              className="p-1.5 bg-black border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-1">
            {(['DAY', 'WEEK', 'MONTH'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${
                  viewMode === m
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {m === 'DAY' ? 'DIA' : m === 'WEEK' ? 'SEMANA' : 'MÊS'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>AGENDAR SESSÃO</span>
        </button>
      </div>

      {/* Week Grid */}
      <div className="bg-zinc-950 border border-zinc-800 overflow-x-auto">
        <div className="grid grid-cols-6 min-w-[700px] border-b border-zinc-800 text-center text-xs">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className="p-3 bg-black border-r border-zinc-900 last:border-r-0">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">{day}</span>
              <span className="text-sm font-bold text-white">{12 + idx} Out</span>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="divide-y divide-zinc-900 min-w-[700px]">
          {hours.map((hr) => (
            <div key={hr} className="grid grid-cols-6 min-h-[64px]">
              {daysOfWeek.map((day, dIdx) => {
                const match = trainerAppointments.find((a) => a.time === hr && dIdx === 1);
                const isBlocked = hr === '12:00' || (hr === '18:00' && dIdx === 5);

                return (
                  <div
                    key={dIdx}
                    className="p-2 border-r border-zinc-900 last:border-r-0 relative hover:bg-zinc-900/30 transition-colors"
                  >
                    <span className="text-[8px] text-zinc-600 block mb-1">{hr}</span>
                    {match ? (
                      <div className="p-2 bg-zinc-900 border-l-2 border-blue-500 text-white text-[10px] space-y-0.5">
                        <span className="font-bold block truncate uppercase">{match.studentName}</span>
                        <span className="text-[8px] text-zinc-400 block truncate">{match.location}</span>
                      </div>
                    ) : isBlocked ? (
                      <div className="p-1.5 bg-zinc-900/40 text-zinc-600 text-[9px] uppercase font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Bloqueado
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Agendar Sessão */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Agendar Sessão de Treinamento</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Aluno *</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                >
                  {trainerStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
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
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Horário *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Tipo de Sessão</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="IN_PERSON_TRAINING">TREINO PRESENCIAL 1-ON-1</option>
                    <option value="ONLINE_CONSULTATION">CONSULTORIA REMOTA / ALINHAMENTO</option>
                    <option value="PHYSICAL_ASSESSMENT">AVALIAÇÃO FÍSICA</option>
                    <option value="REASSESSMENT">REAVALIAÇÃO DE CARGAS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Duração (minutos)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Local / Academia</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Smart Fit Jardins / Studio Próprio"
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
