import React, { useMemo } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Dumbbell,
  Check,
  Flame,
} from 'lucide-react';
import { DayAttendance } from '../../types/training';

export const GymAttendanceCalendar: React.FC = () => {
  const {
    attendanceLogs,
    setDayAttendance,
    trainingSessions,
  } = useGymLabs();

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayDateStr = today.toISOString().split('T')[0];
  const todayDayNum = today.getDate();

  const monthName = useMemo(() => {
    return today.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
  }, [today]);

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Mapping of attended days
  const attendanceMap = useMemo(() => {
    const map: Record<string, DayAttendance> = {};
    attendanceLogs.forEach((a) => {
      map[a.date] = a;
    });
    trainingSessions.forEach((s) => {
      const d = s.startedAt.split('T')[0];
      if (!map[d]) {
        map[d] = {
          date: d,
          status: 'ATTENDED',
          workoutType: 'FULL_BODY',
          title: s.title,
          durationMinutes: s.durationMinutes,
        };
      }
    });
    return map;
  }, [attendanceLogs, trainingSessions]);

  const daysAttendedThisMonth = useMemo(() => {
    let count = 0;
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (attendanceMap[dateStr]?.status === 'ATTENDED') {
        count++;
      }
    }
    return count;
  }, [attendanceMap, currentYear, currentMonth, totalDaysInMonth]);

  const trainedToday = attendanceMap[todayDateStr]?.status === 'ATTENDED';

  // Toggle presence for today
  const handleToggleToday = () => {
    setDayAttendance({
      date: todayDateStr,
      status: trainedToday ? 'REST' : 'ATTENDED',
      workoutType: 'FULL_BODY',
      title: trainedToday ? 'Descanso' : 'Treino de Força & Musculação',
    });
  };

  const consistencyPct = Math.round((daysAttendedThisMonth / Math.max(1, todayDayNum)) * 100);

  return (
    <div
      id="gymlabs-attendance-widget"
      className="p-3 bg-zinc-950 border border-zinc-800 font-mono shadow-sm"
    >
      {/* Sleek Minimal Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-900 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white text-black font-black flex items-center justify-center text-[10px]">
            {todayDayNum}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase text-white tracking-wider">
                Frequência • {monthName} {currentYear}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold">
                {daysAttendedThisMonth}/{totalDaysInMonth}d ({consistencyPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Quick 1-click status pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleToday}
            className={`px-2.5 py-1 text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
              trainedToday
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                : 'bg-white text-black border-white hover:bg-zinc-200 shadow-sm'
            }`}
          >
            {trainedToday ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Hoje: Treinado ✓</span>
              </>
            ) : (
              <>
                <Dumbbell className="w-3 h-3" />
                <span>Registrar Treino de Hoje</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Minimal Calendar Matrix (Micro-cells row: 1 cell per day, ultra-sleek widget) */}
      <div className="pt-2 space-y-1.5">
        <div className="grid grid-cols-10 sm:grid-cols-16 md:grid-cols-31 gap-1">
          {Array.from({ length: totalDaysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dayNum === todayDayNum;
            const log = attendanceMap[dateStr];
            const isCompleted = log?.status === 'ATTENDED';
            const isPast = dayNum < todayDayNum;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => {
                  if (dayNum <= todayDayNum) {
                    setDayAttendance({
                      date: dateStr,
                      status: isCompleted ? 'REST' : 'ATTENDED',
                      workoutType: 'FULL_BODY',
                      title: isCompleted ? 'Descanso' : 'Treino Concluído',
                    });
                  }
                }}
                title={`Dia ${dayNum}/${currentMonth + 1}: ${
                  isCompleted ? 'Treinado ✓' : isToday ? 'Hoje' : isPast ? 'Descanso' : 'Previsto'
                }`}
                className={`h-5 flex items-center justify-center text-[8px] font-mono font-bold transition-all cursor-pointer border ${
                  isCompleted
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : isToday
                    ? 'bg-zinc-900 border-white text-white ring-1 ring-white/50'
                    : isPast
                    ? 'bg-black border-zinc-900 text-zinc-600 hover:border-zinc-700'
                    : 'bg-zinc-950/40 border-zinc-900/40 text-zinc-800'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Ultra-compact Legend */}
        <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono pt-0.5">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" /> Treinado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 border border-white bg-zinc-900 inline-block" /> Hoje
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-900 inline-block" /> Descanso
            </span>
          </div>
          <span className="text-zinc-400 hidden sm:inline">
            Clique no dia para registrar ou alternar presença
          </span>
        </div>
      </div>
    </div>
  );
};
