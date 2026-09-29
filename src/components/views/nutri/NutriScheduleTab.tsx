import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  User,
  CheckCircle,
  Video
} from 'lucide-react';

export const NutriScheduleTab: React.FC = () => {
  const { nutriConsultations, nutriPatients } = useGymLabs();
  const [viewMode, setViewMode] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header & View Controls */}
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('Horário de almoço e bloqueio clínico adicionados.')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear Horário</span>
          </button>
        </div>
      </div>

      {/* Week Calendar Grid */}
      <div className="bg-zinc-950 border border-zinc-800 overflow-x-auto">
        <div className="grid grid-cols-6 min-w-[700px] border-b border-zinc-800 text-center text-xs">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className="p-3 bg-black border-r border-zinc-900 last:border-r-0">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">{day}</span>
              <span className="text-sm font-bold text-white">
                {12 + idx} Out
              </span>
            </div>
          ))}
        </div>

        {/* Time Slots Table */}
        <div className="divide-y divide-zinc-900 min-w-[700px]">
          {hours.map((hr) => (
            <div key={hr} className="grid grid-cols-6 min-h-[64px]">
              {daysOfWeek.map((day, dIdx) => {
                // Check if any consultation matches this slot
                const match = nutriConsultations.find((c) => c.time === hr && dIdx === 1);
                const isBlocked = hr === '12:00' || (hr === '13:00' && dIdx === 3);

                return (
                  <div
                    key={dIdx}
                    className="p-2 border-r border-zinc-900 last:border-r-0 relative hover:bg-zinc-900/30 transition-colors"
                  >
                    <span className="text-[8px] text-zinc-600 block mb-1">{hr}</span>
                    {match ? (
                      <div className="p-2 bg-zinc-900 border-l-2 border-white text-white text-[10px] space-y-0.5">
                        <span className="font-bold block truncate uppercase">{match.patientName}</span>
                        <span className="text-[8px] text-zinc-400 block">{match.type}</span>
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
    </div>
  );
};
