import React from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Utensils,
  Activity,
  ArrowUpRight,
  Flame,
  FileText,
  MessageSquare
} from 'lucide-react';

interface NutriDashboardTabProps {
  onNavigateTab: (tab: any) => void;
  onOpenChat: () => void;
}

export const NutriDashboardTab: React.FC<NutriDashboardTabProps> = ({
  onNavigateTab,
  onOpenChat,
}) => {
  const {
    nutriPatients,
    nutriConsultations,
    nutriMealPlans,
    nutriFinances,
    chatMessages,
  } = useGymLabs();

  const totalPatients = nutriPatients.length;
  const activePatients = nutriPatients.filter((p) => p.status === 'ACTIVE').length;
  const newPatientsThisMonth = nutriPatients.filter((p) => {
    const reg = new Date(p.registeredAt);
    const now = new Date();
    return reg.getMonth() === now.getMonth() && reg.getFullYear() === now.getFullYear();
  }).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayConsultations = nutriConsultations.filter((c) => c.date === todayStr);
  const upcomingConsultations = nutriConsultations.filter(
    (c) => c.date >= todayStr && c.status === 'SCHEDULED'
  );
  const returnConsultations = nutriConsultations.filter((c) => c.type === 'FOLLOW_UP');
  const activeMealPlans = nutriMealPlans.filter((p) => p.status === 'PUBLISHED').length;

  // Finances
  const currentMonthIncomes = nutriFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingReceivables = nutriFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'PENDING')
    .reduce((sum, f) => sum + f.amount, 0);

  const overdueIncomes = nutriFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'OVERDUE')
    .reduce((sum, f) => sum + f.amount, 0);

  const unreadMessagesCount = chatMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              PAINEL CLÍNICO GYM LABS NUTRI // AMBIENTE PROFISSIONAL
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Visão consolidada de pacientes, consultas do dia, prescrições ativas e saúde financeira do consultório.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenChat}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>MENSAGENS {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('consultations')}
            className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>NOVA CONSULTA</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Pacientes Ativos</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-white">{activePatients}</div>
          <div className="text-[10px] text-zinc-400">
            Total cadastrados: <span className="text-white font-bold">{totalPatients}</span> (+{newPatientsThisMonth} este mês)
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Consultas Hoje</span>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{todayConsultations.length}</div>
          <div className="text-[10px] text-zinc-400">
            Próximas na semana: <span className="text-white font-bold">{upcomingConsultations.length}</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Planos Publicados</span>
            <Utensils className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeMealPlans}</div>
          <div className="text-[10px] text-zinc-400">
            Sincronizados com o app do atleta
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Faturamento Mensal</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            R$ {currentMonthIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400">
            A receber: R$ {pendingReceivables.toLocaleString('pt-BR')} | Atrasados: R$ {overdueIncomes.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Main Grid: Consultas de Hoje + Alertas Clínicos & Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda & Consultas Imediatas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Próximas Consultas & Retornos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('consultations')}
                className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold cursor-pointer"
              >
                Ver Todas ({nutriConsultations.length}) →
              </button>
            </div>

            {nutriConsultations.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="p-3 bg-black border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{c.patientName}</span>
                    <span className={`text-[8px] px-1.5 py-0.2 font-bold uppercase border ${
                      c.type === 'FIRST_VISIT'
                        ? 'border-blue-700 bg-blue-950/60 text-blue-300'
                        : c.type === 'FOLLOW_UP'
                        ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                    }`}>
                      {c.type === 'FIRST_VISIT' ? 'PRIMEIRA CONSULTA' : c.type === 'FOLLOW_UP' ? 'RETORNO' : 'TELECONSULTA'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Data: <span className="text-zinc-200">{c.date}</span> às <span className="text-zinc-200">{c.time}</span> ({c.durationMinutes} min)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                    c.status === 'CONFIRMED'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      : c.status === 'SCHEDULED'
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {c.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('consultations')}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Prontuário
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts to Clinical Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('patients')}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-left transition-colors cursor-pointer group"
            >
              <Users className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">Gestão de Pacientes</div>
              <div className="text-[10px] text-zinc-500 mt-1">Prontuário completo, alergias e histórico</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('dietBuilder')}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-left transition-colors cursor-pointer group"
            >
              <Utensils className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">Criador de Dietas</div>
              <div className="text-[10px] text-zinc-500 mt-1">Refeições, macros, substituições e publicação</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('assessments')}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-left transition-colors cursor-pointer group"
            >
              <Activity className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white uppercase">Antropometria</div>
              <div className="text-[10px] text-zinc-500 mt-1">Dobras cutâneas, bioimpedância e gráficos</div>
            </button>
          </div>
        </div>

        {/* Right Column: Alertas Clínicos & Integração Interprofissional */}
        <div className="space-y-4">
          {/* Alerts & Tasks */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Alertas Clínicos & Tarefas
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 text-amber-200">
                <span className="font-bold block text-[10px] uppercase text-amber-400">
                  Retorno Pendente (Alex Vance)
                </span>
                <span className="text-[11px] text-zinc-300">
                  Última consulta realizada há 30 dias. Convidar para reavaliação de composição corporal.
                </span>
              </div>

              <div className="p-2.5 bg-blue-950/20 border border-blue-900/40 text-blue-200">
                <span className="font-bold block text-[10px] uppercase text-blue-400">
                  Novo Exame Laboratorial Anexado
                </span>
                <span className="text-[11px] text-zinc-300">
                  Hemograma completo e perfil lipídico recebidos no prontuário de Alex Vance.
                </span>
              </div>

              <div className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300">
                <span className="font-bold block text-[10px] uppercase text-zinc-400">
                  Alinhamento com Personal Trainer
                </span>
                <span className="text-[11px] text-zinc-400">
                  Marcus Steel iniciou fase de força com alto volume no atleta Alex. Superávit calórico recomendado.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Interprofessional Card */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Ecossistema Gym Labs Integrado
            </h4>
            <p className="text-[10px] text-zinc-400 font-sans">
              Suas prescrições e cálculos alimentares refletem instantaneamente no aplicativo do aluno e podem ser acompanhados pelo personal trainer autorizado.
            </p>
            <button
              type="button"
              onClick={onOpenChat}
              className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Abrir Chat Interprofissional</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
