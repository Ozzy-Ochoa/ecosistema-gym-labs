import React, { useState, useMemo } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Moon,
  Clock,
  Dumbbell,
  Settings2,
  Check,
  ChevronRight,
  Flame,
  X,
  Save,
  Info,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  AttendanceStatus,
  WorkoutSplitType,
  DayAttendance,
} from '../../types/training';

const DAYS_OF_WEEK_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const WORKOUT_SPLIT_LABELS: Record<WorkoutSplitType, { name: string; short: string; muscles: string }> = {
  PUSH: { name: 'Push (Empurrar)', short: 'PUSH', muscles: 'Peito, Ombros e Tríceps' },
  PULL: { name: 'Pull (Puxar)', short: 'PULL', muscles: 'Costas, Bíceps e Trapézio' },
  LEGS: { name: 'Legs (Inferiores)', short: 'LEGS', muscles: 'Quadríceps, Isquiotibiais e Glúteos' },
  UPPER: { name: 'Upper (Superiores)', short: 'UPPER', muscles: 'Membros Superiores Completos' },
  LOWER: { name: 'Lower (Inferiores & Core)', short: 'LOWER', muscles: 'Pernas, Panturrilhas e Abdômen' },
  FULL_BODY: { name: 'Full Body (Geral)', short: 'FULL', muscles: 'Corpo Inteiro' },
  CARDIO_MOBILITY: { name: 'Cardio & Mobilidade', short: 'CARDIO', muscles: 'Aeróbico e Flexibilidade' },
  REST_DAY: { name: 'Descanso / Recuperação', short: 'OFF', muscles: 'Regeneração Muscular' },
};

export const GymAttendanceCalendar: React.FC = () => {
  const {
    attendanceLogs,
    setDayAttendance,
    scheduledDaysOfWeek,
    setScheduledDaysOfWeek,
    trainingSessions,
    setCurrentTab,
  } = useGymLabs();

  // Always locked to the CURRENT MONTH as requested by user
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (e.g. 8 for September)
  const todayDateStr = today.toISOString().split('T')[0];

  const monthName = useMemo(() => {
    return today.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
  }, [today]);

  // Local state
  const [showScheduleConfig, setShowScheduleConfig] = useState<boolean>(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string;
    dayNum: number;
    dayOfWeek: number;
    status: AttendanceStatus;
    workoutType: WorkoutSplitType;
    title: string;
    notes: string;
    durationMinutes?: number;
    volumeKg?: number;
  } | null>(null);

  // Month grid calculation
  const monthData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Mapping of training sessions by date string (YYYY-MM-DD)
    const sessionsByDate: Record<string, typeof trainingSessions[0]> = {};
    trainingSessions.forEach((s) => {
      const d = s.startedAt.split('T')[0];
      sessionsByDate[d] = s;
    });

    // Mapping of manual attendance logs by date string
    const attendanceMap: Record<string, DayAttendance> = {};
    attendanceLogs.forEach((a) => {
      attendanceMap[a.date] = a;
    });

    // Default split distribution according to day of week
    const defaultSplitByWeekday: Record<number, WorkoutSplitType> = {
      1: 'PUSH', // Seg
      2: 'PULL', // Ter
      3: 'LEGS', // Qua
      4: 'UPPER', // Qui
      5: 'LOWER', // Sex
      6: 'CARDIO_MOBILITY', // Sáb
      0: 'REST_DAY', // Dom
    };

    const days = [];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateObj.getDay();
      const monthPadded = String(currentMonth + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;

      const isToday = dateStr === todayDateStr;
      const isPast = dateStr < todayDateStr;
      const isFuture = dateStr > todayDateStr;
      const isScheduled = scheduledDaysOfWeek.includes(dayOfWeek);

      const realSession = sessionsByDate[dateStr];
      const manualLog = attendanceMap[dateStr];

      let status: AttendanceStatus;
      let workoutType: WorkoutSplitType;
      let title: string;
      let notes: string = manualLog?.notes || '';
      let durationMinutes = manualLog?.durationMinutes || realSession?.durationMinutes;
      let volumeKg = manualLog?.volumeKg || (realSession ? realSession.calculatedVolumeKg.value : undefined);

      if (manualLog) {
        status = manualLog.status;
        workoutType = manualLog.workoutType;
        title = manualLog.title;
      } else if (realSession) {
        status = 'ATTENDED';
        title = realSession.title;
        workoutType = defaultSplitByWeekday[dayOfWeek] || 'FULL_BODY';
      } else if (isPast) {
        if (isScheduled) {
          status = 'MISSED'; // Missed planned gym session
          workoutType = defaultSplitByWeekday[dayOfWeek] || 'PUSH';
          title = `Falta // ${WORKOUT_SPLIT_LABELS[workoutType].name}`;
        } else {
          status = 'REST';
          workoutType = 'REST_DAY';
          title = 'Descanso Programado';
        }
      } else if (isToday) {
        if (isScheduled) {
          status = 'PLANNED'; // Today's gym session pending
          workoutType = defaultSplitByWeekday[dayOfWeek] || 'PUSH';
          title = `Treino de Hoje // ${WORKOUT_SPLIT_LABELS[workoutType].name}`;
        } else {
          status = 'REST';
          workoutType = 'REST_DAY';
          title = 'Descanso de Hoje';
        }
      } else {
        // Future days of current month
        if (isScheduled) {
          status = 'PLANNED';
          workoutType = defaultSplitByWeekday[dayOfWeek] || 'PUSH';
          title = `Planejado // ${WORKOUT_SPLIT_LABELS[workoutType].name}`;
        } else {
          status = 'REST';
          workoutType = 'REST_DAY';
          title = 'Descanso Planejado';
        }
      }

      days.push({
        dayNum: day,
        dateStr,
        dayOfWeek,
        isToday,
        isPast,
        isFuture,
        isScheduled,
        status,
        workoutType,
        title,
        notes,
        durationMinutes,
        volumeKg,
        hasRealSession: Boolean(realSession),
      });
    }

    return {
      startDayOfWeek,
      totalDaysInMonth,
      days,
    };
  }, [currentYear, currentMonth, todayDateStr, scheduledDaysOfWeek, attendanceLogs, trainingSessions]);

  // Overall Monthly Metrics (Assiduidade e Frequência)
  const stats = useMemo(() => {
    let attended = 0;
    let missed = 0;
    let incomplete = 0;
    let rest = 0;
    let planned = 0;

    monthData.days.forEach((d) => {
      if (d.status === 'ATTENDED') attended++;
      else if (d.status === 'MISSED') missed++;
      else if (d.status === 'INCOMPLETE') incomplete++;
      else if (d.status === 'REST') rest++;
      else if (d.status === 'PLANNED') planned++;
    });

    const evaluatedDays = attended + missed + incomplete;
    const attendanceRate = evaluatedDays > 0 ? Math.round((attended / evaluatedDays) * 100) : 100;

    // Calculate current streak of attended days without missed up to today
    let currentStreak = 0;
    const pastDaysChronological = monthData.days
      .filter((d) => d.dateStr <= todayDateStr)
      .reverse();

    for (const d of pastDaysChronological) {
      if (d.status === 'ATTENDED') {
        currentStreak++;
      } else if (d.status === 'REST') {
        // Rest days do not break a streak
        continue;
      } else if (d.status === 'MISSED' || d.status === 'INCOMPLETE') {
        break;
      }
    }

    return {
      attended,
      missed,
      incomplete,
      rest,
      planned,
      attendanceRate,
      currentStreak,
      totalPlannedDays: attended + missed + incomplete + planned,
    };
  }, [monthData, todayDateStr]);

  const handleToggleScheduledDay = (dayIndex: number) => {
    let updated: number[];
    if (scheduledDaysOfWeek.includes(dayIndex)) {
      if (scheduledDaysOfWeek.length <= 1) return; // Maintain at least 1 day
      updated = scheduledDaysOfWeek.filter((d) => d !== dayIndex);
    } else {
      updated = [...scheduledDaysOfWeek, dayIndex].sort();
    }
    setScheduledDaysOfWeek(updated);
  };

  const handleSaveDayEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayDetail) return;

    setDayAttendance({
      date: selectedDayDetail.dateStr,
      status: selectedDayDetail.status,
      workoutType: selectedDayDetail.workoutType,
      title: selectedDayDetail.title || WORKOUT_SPLIT_LABELS[selectedDayDetail.workoutType].name,
      notes: selectedDayDetail.notes || undefined,
      durationMinutes: selectedDayDetail.durationMinutes,
      volumeKg: selectedDayDetail.volumeKg,
    });

    setSelectedDayDetail(null);
  };

  return (
    <div id="gym-attendance-module" className="p-5 bg-zinc-950 border border-zinc-800 space-y-5 select-none font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 border border-zinc-700 bg-black flex items-center justify-center text-white">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Assistência à Academia // {monthName} {currentYear}
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                MÊS ATUAL
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Planificação dia a dia da sua rotina de musculação, controle de presenças, faltas e treinos incompletos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowScheduleConfig((prev) => !prev)}
            className="px-3 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer bg-black"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configurar Dias de Treino</span>
          </button>
        </div>
      </div>

      {/* Scheduled Days Selector Drawer */}
      {showScheduleConfig && (
        <div className="p-4 bg-black border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-white flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-white" />
              <span>Selecione seus dias habituais de academia na semana:</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-sans">
              {scheduledDaysOfWeek.length} dias selecionados por semana
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {[
              { idx: 1, label: 'Segunda', short: 'SEG' },
              { idx: 2, label: 'Terça', short: 'TER' },
              { idx: 3, label: 'Quarta', short: 'QUA' },
              { idx: 4, label: 'Quinta', short: 'QUI' },
              { idx: 5, label: 'Sexta', short: 'SEX' },
              { idx: 6, label: 'Sábado', short: 'SÁB' },
              { idx: 0, label: 'Domingo', short: 'DOM' },
            ].map((day) => {
              const active = scheduledDaysOfWeek.includes(day.idx);
              return (
                <button
                  key={day.idx}
                  type="button"
                  onClick={() => handleToggleScheduledDay(day.idx)}
                  className={`py-2 px-1 text-center border font-bold text-xs uppercase transition-all cursor-pointer ${
                    active
                      ? 'border-white bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <span className="block text-[11px] font-black">{day.short}</span>
                  <span className="text-[8px] font-sans block opacity-80 mt-0.5">
                    {active ? 'TREINO' : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-zinc-500 font-sans block">
            Os dias selecionados geram a grade automática do mês. Você pode clicar em qualquer dia do minicalendário para marcar presença, falta ou alterar o tipo de treino.
          </span>
        </div>
      )}

      {/* Monthly Attendance KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <div className="p-2.5 bg-black border border-zinc-800">
          <span className="text-[9px] uppercase font-bold text-zinc-500 block">Assiduidade Mensal</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{stats.attendanceRate}%</span>
            <span className="text-[10px] text-zinc-400 font-sans">taxa</span>
          </div>
        </div>

        <div className="p-2.5 bg-black border border-zinc-800">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500">
            <span>Presenças</span>
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{stats.attended}</span>
            <span className="text-[10px] text-zinc-400 font-sans">treinos</span>
          </div>
        </div>

        <div className="p-2.5 bg-black border border-zinc-800">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500">
            <span>Faltas</span>
            <XCircle className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{stats.missed}</span>
            <span className="text-[10px] text-zinc-400 font-sans">dias</span>
          </div>
        </div>

        <div className="p-2.5 bg-black border border-zinc-800">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500">
            <span>Incompletos</span>
            <AlertTriangle className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{stats.incomplete}</span>
            <span className="text-[10px] text-zinc-400 font-sans">treinos</span>
          </div>
        </div>

        <div className="p-2.5 bg-black border border-zinc-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500">
            <span>Sequência</span>
            <Flame className="w-3 h-3 text-white" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{stats.currentStreak}</span>
            <span className="text-[10px] text-zinc-400 font-sans">dias s/ falta</span>
          </div>
        </div>
      </div>

      {/* Mini-Calendar Month Grid */}
      <div className="space-y-1">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase text-zinc-500 pb-1 border-b border-zinc-900">
          {DAYS_OF_WEEK_SHORT.map((dow, idx) => (
            <div key={idx} className="py-1">
              {dow}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
          {/* Leading empty offset padding cells */}
          {Array.from({ length: monthData.startDayOfWeek }).map((_, padIdx) => (
            <div
              key={`pad-${padIdx}`}
              className="h-20 sm:h-24 bg-black/40 border border-zinc-900/40 opacity-20 pointer-events-none"
            />
          ))}

          {/* Actual days of the current month */}
          {monthData.days.map((day) => {
            const splitInfo = WORKOUT_SPLIT_LABELS[day.workoutType] || WORKOUT_SPLIT_LABELS.PUSH;

            return (
              <div
                key={day.dateStr}
                onClick={() =>
                  setSelectedDayDetail({
                    dateStr: day.dateStr,
                    dayNum: day.dayNum,
                    dayOfWeek: day.dayOfWeek,
                    status: day.status,
                    workoutType: day.workoutType,
                    title: day.title,
                    notes: day.notes,
                    durationMinutes: day.durationMinutes,
                    volumeKg: day.volumeKg,
                  })
                }
                className={`h-20 sm:h-24 p-1.5 border flex flex-col justify-between transition-all cursor-pointer relative group ${
                  day.isToday
                    ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] ring-1 ring-white'
                    : day.status === 'ATTENDED'
                    ? 'border-zinc-700 bg-zinc-950 hover:border-white'
                    : day.status === 'MISSED'
                    ? 'border-zinc-800 bg-black hover:border-white'
                    : day.status === 'INCOMPLETE'
                    ? 'border-zinc-800 bg-black hover:border-white'
                    : 'border-zinc-900 bg-black hover:border-zinc-700'
                }`}
              >
                {/* Cell Header: Day Number & Today indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black font-mono ${
                      day.isToday ? 'text-white underline' : 'text-zinc-300'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {day.isToday && (
                    <span className="text-[8px] px-1 bg-white text-black font-black uppercase">
                      HOJE
                    </span>
                  )}

                  {/* Status Indicator Icon */}
                  {day.status === 'ATTENDED' && (
                    <span className="text-[9px] text-white flex items-center" title="Presença confirmada / Treino realizado">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                  {day.status === 'MISSED' && (
                    <span className="text-[9px] text-zinc-400 flex items-center" title="Falta / Não compareceu">
                      <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    </span>
                  )}
                  {day.status === 'INCOMPLETE' && (
                    <span className="text-[9px] text-zinc-400 flex items-center" title="Treino incompleto">
                      <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                    </span>
                  )}
                  {day.status === 'REST' && (
                    <span className="text-[9px] text-zinc-600 flex items-center" title="Dia de descanso">
                      <Moon className="w-3 h-3 text-zinc-600" />
                    </span>
                  )}
                </div>

                {/* Workout Type Tag */}
                <div className="space-y-0.5">
                  <div
                    className={`text-[9px] font-bold uppercase truncate px-1 py-0.5 border ${
                      day.status === 'ATTENDED'
                        ? 'bg-black text-white border-zinc-700'
                        : day.status === 'MISSED'
                        ? 'bg-black text-zinc-400 border-zinc-800 line-through'
                        : day.status === 'INCOMPLETE'
                        ? 'bg-black text-zinc-300 border-zinc-800'
                        : day.status === 'REST'
                        ? 'bg-black text-zinc-600 border-zinc-900'
                        : 'bg-black text-zinc-400 border-dashed border-zinc-800'
                    }`}
                  >
                    {splitInfo.short}
                  </div>

                  {/* Micro Status Label */}
                  <span
                    className={`text-[8px] font-sans block truncate ${
                      day.status === 'ATTENDED'
                        ? 'text-zinc-300 font-bold'
                        : day.status === 'MISSED'
                        ? 'text-zinc-500 font-bold'
                        : day.status === 'INCOMPLETE'
                        ? 'text-zinc-400'
                        : day.status === 'REST'
                        ? 'text-zinc-600'
                        : 'text-zinc-500'
                    }`}
                  >
                    {day.status === 'ATTENDED'
                      ? '✓ Concluído'
                      : day.status === 'MISSED'
                      ? '✕ Falta'
                      : day.status === 'INCOMPLETE'
                      ? '⚠️ Incompleto'
                      : day.status === 'REST'
                      ? '• Descanso'
                      : '◌ Planejado'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Legend */}
      <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-400 font-sans">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <strong className="text-zinc-200">Presença / Foi:</strong> Treino realizado
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
            <strong className="text-zinc-200">Falta:</strong> Dia planejado sem treino
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
            <strong className="text-zinc-200">Incompleto:</strong> Sessão parcial
          </span>
          <span className="flex items-center gap-1">
            <Moon className="w-3 h-3 text-zinc-600" />
            <strong className="text-zinc-200">Descanso:</strong> Rest day
          </span>
        </div>

        <span className="text-[9px] text-zinc-500 font-mono">
          * Clique em qualquer dia para alterar o status ou tipo de treino
        </span>
      </div>

      {/* Day Inspection & Attendance Editor Modal */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border-2 border-white p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-white" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  Detalhes do Dia // {selectedDayDetail.dateStr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDayEdit} className="space-y-4 text-xs">
              {/* Status Selector */}
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1.5 font-bold">
                  Status de Assistência / Presença:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ATTENDED', label: '✓ Presença / Treino Concluído', icon: CheckCircle2 },
                    { id: 'MISSED', label: '✕ Falta / Não Compareceu', icon: XCircle },
                    { id: 'INCOMPLETE', label: '⚠️ Treino Incompleto', icon: AlertTriangle },
                    { id: 'REST', label: '• Dia de Descanso (Off)', icon: Moon },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setSelectedDayDetail((prev) =>
                          prev ? { ...prev, status: st.id as AttendanceStatus } : null
                        )
                      }
                      className={`p-2.5 border text-left font-bold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedDayDetail.status === st.id
                          ? 'border-white bg-white text-black font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'
                          : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <st.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Type Selector */}
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Tipo de Treino Deste Dia:
                </label>
                <select
                  value={selectedDayDetail.workoutType}
                  onChange={(e) =>
                    setSelectedDayDetail((prev) =>
                      prev ? { ...prev, workoutType: e.target.value as WorkoutSplitType } : null
                    )
                  }
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                >
                  <option value="PUSH">Push — Peitoral, Ombros e Tríceps</option>
                  <option value="PULL">Pull — Costas, Bíceps e Trapézio</option>
                  <option value="LEGS">Legs — Quadríceps, Isquiotibiais e Glúteos</option>
                  <option value="UPPER">Upper — Membros Superiores Completos</option>
                  <option value="LOWER">Lower — Membros Inferiores e Core</option>
                  <option value="FULL_BODY">Full Body — Corpo Inteiro</option>
                  <option value="CARDIO_MOBILITY">Cardio & Mobilidade / Funcional</option>
                  <option value="REST_DAY">Descanso / Recuperação Ativa</option>
                </select>
              </div>

              {/* Title & Notes */}
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Título / Identificação do Treino:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Treino de Força e Sobrecarga"
                  value={selectedDayDetail.title}
                  onChange={(e) =>
                    setSelectedDayDetail((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Duração Estimada (min):
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    value={selectedDayDetail.durationMinutes || ''}
                    onChange={(e) =>
                      setSelectedDayDetail((prev) =>
                        prev
                          ? { ...prev, durationMinutes: e.target.value ? Number(e.target.value) : undefined }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Volume Total (kg):
                  </label>
                  <input
                    type="number"
                    placeholder="8400"
                    value={selectedDayDetail.volumeKg || ''}
                    onChange={(e) =>
                      setSelectedDayDetail((prev) =>
                        prev
                          ? { ...prev, volumeKg: e.target.value ? Number(e.target.value) : undefined }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Observações / Motivo da Falta ou Notas do Treino:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Treinei pernas com intensidade alta; ou Faltei por viagem profissional."
                  value={selectedDayDetail.notes}
                  onChange={(e) =>
                    setSelectedDayDetail((prev) =>
                      prev ? { ...prev, notes: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  className="flex-1 py-2 border border-zinc-800 text-zinc-400 hover:text-white uppercase font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Presença</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
