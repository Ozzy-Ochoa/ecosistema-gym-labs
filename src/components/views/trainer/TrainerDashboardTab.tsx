import React from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  Users,
  Dumbbell,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Flame,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';

interface TrainerDashboardTabProps {
  onNavigateTab: (tab: any) => void;
  onOpenChat: () => void;
}

export const TrainerDashboardTab: React.FC<TrainerDashboardTabProps> = ({
  onNavigateTab,
  onOpenChat,
}) => {
  const {
    trainerStudents,
    trainerWorkoutPlans,
    trainerAppointments,
    trainerFinances,
    chatMessages,
  } = useGymLabs();

  const totalStudents = trainerStudents.length;
  const activeStudents = trainerStudents.filter((s) => s.status === 'ACTIVE').length;
  const newStudents = trainerStudents.filter((s) => {
    const reg = new Date(s.registeredAt);
    const now = new Date();
    return reg.getMonth() === now.getMonth() && reg.getFullYear() === now.getFullYear();
  }).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = trainerAppointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = trainerAppointments.filter(
    (a) => a.date >= todayStr && a.status === 'SCHEDULED'
  );
  const publishedPlans = trainerWorkoutPlans.filter((p) => p.status === 'PUBLISHED').length;

  // Finances
  const totalBilled = trainerFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingReceivables = trainerFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'PENDING')
    .reduce((sum, f) => sum + f.amount, 0);

  const overdueIncomes = trainerFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'OVERDUE')
    .reduce((sum, f) => sum + f.amount, 0);

  const unreadMessagesCount = chatMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              PAINEL PROFISSIONAL GYM LABS TRAINER // PERSONAL COACHING
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Gestão de alunos, prescrição de sobrecarga progressiva, agenda de sessões presenciais e faturamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenChat}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>MENSAGENS {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('workoutBuilder')}
            className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>PRESCREVER NOVO TREINO</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Alunos Ativos</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeStudents}</div>
          <div className="text-[10px] text-zinc-400">
            Total matriculados: <span className="text-white font-bold">{totalStudents}</span> (+{newStudents} novos)
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Treinos de Hoje</span>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{todayAppointments.length}</div>
          <div className="text-[10px] text-zinc-400">
            Próximos agendados: <span className="text-white font-bold">{upcomingAppointments.length}</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Fichas Publicadas</span>
            <Dumbbell className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{publishedPlans}</div>
          <div className="text-[10px] text-zinc-400">
            Sincronizadas com o app do atleta
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Faturamento Mensal</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            R$ {totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400">
            A receber: R$ {pendingReceivables.toLocaleString('pt-BR')} | Atrasados: R$ {overdueIncomes.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Main Grid: Treinos de Hoje + Alertas do Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda Imediata e Ações */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sessões Agendadas & Treinos Presenciais
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('schedule')}
                className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold cursor-pointer"
              >
                Ver Grade Completa →
              </button>
            </div>

            {trainerAppointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-3 bg-black border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{apt.studentName}</span>
                    <span className="text-[8px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                      {apt.type === 'IN_PERSON_TRAINING' ? 'PRESENCIAL' : 'CONSULTORIA ONLINE'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Data: <span className="text-zinc-200">{apt.date}</span> às <span className="text-zinc-200">{apt.time}</span> ({apt.durationMinutes} min) • Local: {apt.location}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase border ${
                    apt.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    {apt.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('students')}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Ficha do Aluno
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('students')}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-left transition-colors cursor-pointer group"
            >
              <Users className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">Gestão de Alunos</div>
              <div className="text-[10px] text-zinc-500 mt-1">Prontuário esportivo, lesões e histórico de cargas</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('workoutBuilder')}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-left transition-colors cursor-pointer group"
            >
              <Dumbbell className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">Criador de Treinos</div>
              <div className="text-[10px] text-zinc-500 mt-1">Divisões A/B/C, séries, cargas, RPE e publicação</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('assessments')}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-left transition-colors cursor-pointer group"
            >
              <Activity className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">Avaliação Física</div>
              <div className="text-[10px] text-zinc-500 mt-1">Testes 1RM de força, mobilidade e biometria</div>
            </button>
          </div>
        </div>

        {/* Right Column: Alertas do Personal & Interprofissional */}
        <div className="space-y-4">
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Alertas de Treinamento
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 text-amber-200">
                <span className="font-bold block text-[10px] uppercase text-amber-400">
                  Sobrecarga & ACWR Elevado (Alex Vance)
                </span>
                <span className="text-[11px] text-zinc-300">
                  Razão Aguda:Crônica em 1.35. Planejar semana de deload ou diminuir volume acessório.
                </span>
              </div>

              <div className="p-2.5 bg-blue-950/20 border border-blue-900/40 text-blue-200">
                <span className="font-bold block text-[10px] uppercase text-blue-400">
                  Recorde Pessoal (PR) Superado
                </span>
                <span className="text-[11px] text-zinc-300">
                  Alex atingiu 140kg x 3 reps no Agachamento Livre. Novo 1RM estimado: 152.6 kg.
                </span>
              </div>

              <div className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300">
                <span className="font-bold block text-[10px] uppercase text-zinc-400">
                  Alinhamento Interprofissional com Nutri
                </span>
                <span className="text-[11px] text-zinc-400">
                  Dra. Elena Vance alinhou aumento de glicogênio para sessões intensas de pernas.
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Comunicação Integrada Gym Labs
            </h4>
            <p className="text-[10px] text-zinc-400 font-sans">
              Troque mensagens técnicas com seus alunos ou converse diretamente com a nutricionista responsável pelo aluno.
            </p>
            <button
              type="button"
              onClick={onOpenChat}
              className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Abrir Chat com Aluno / Nutri</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
