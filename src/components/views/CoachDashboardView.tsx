import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Users,
  Dumbbell,
  AlertTriangle,
  ClipboardList,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  LogOut
} from 'lucide-react';

export const CoachDashboardView: React.FC = () => {
  const {
    identity,
    savedAccounts,
    openAccountModal,
    logout,
    exercises,
  } = useGymLabs();

  const [activeTab, setActiveTab] = useState<'students' | 'prescribe' | 'acwr'>('students');

  // Real connected students from saved accounts
  const athleteStudents = savedAccounts.filter((a) => a.role === 'USER');

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-900 bg-black px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              PT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase">{identity.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-white border border-zinc-700 font-bold uppercase">
                  PERSONAL TRAINER
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">
                PORTAL PROFISSIONAL // PRESCRIÇÃO DETERMINÍSTICA DE TREINO
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {savedAccounts.length > 1 && (
              <button
                type="button"
                onClick={openAccountModal}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>TROCAR CONTA</span>
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SAIR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="border-b border-zinc-900 bg-black px-4">
        <div className="max-w-7xl mx-auto flex gap-4 text-xs">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'students' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            01 MEUS ALUNOS ({athleteStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('prescribe')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'prescribe' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            02 PRESCRIÇÃO DE TREINO
          </button>
          <button
            onClick={() => setActiveTab('acwr')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'acwr' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            03 MONITORAMENTO DE SOBRECARGA
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase text-white">Alunos Vinculados</h2>
                <p className="text-xs text-zinc-400 font-sans">
                  Atletas com permissão de acompanhamento autorizada.
                </p>
              </div>
            </div>

            {athleteStudents.length === 0 ? (
              <div className="p-8 border border-zinc-800 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-zinc-600" />
                <span className="text-xs text-zinc-400 uppercase block font-bold">
                  Nenhum aluno vinculado ainda
                </span>
                <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                  Quando seus alunos criarem conta no Gym Labs, você poderá prescrever treinos e acompanhar suas cargas em tempo real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {athleteStudents.map((st) => (
                  <div key={st.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-white uppercase">{st.name}</h3>
                        <span className="text-xs text-zinc-500">{st.email}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 border border-zinc-700 text-white font-bold uppercase">
                        ATIVO
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Meta</span>
                        <span className="text-white font-bold">{st.primaryGoal || 'HIPERTROFIA'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Peso Base</span>
                        <span className="text-white font-bold">{st.weightKg ? `${st.weightKg} kg` : 'Sem registro'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-zinc-500">Último Acesso: {st.lastActiveAt || 'Recente'}</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('prescribe')}
                        className="text-white hover:underline font-bold"
                      >
                        Prescrever Treino →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'prescribe' && (
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-white uppercase">
                Prescrição Determinística de Séries & Cargas
              </h2>
              <span className="text-xs text-zinc-400">BANCO: {exercises.length} EXERCÍCIOS</span>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Monte fichas de treino periodizadas com cálculo de tonelagem planejada e controle de repetições em reserva.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Aluno Destinatário
                </label>
                <select className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white">
                  {athleteStudents.length === 0 ? (
                    <option value="">Nenhum aluno cadastrado</option>
                  ) : (
                    athleteStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.primaryGoal || 'Hipertrofia'})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Nome da Ficha / Rotina
                </label>
                <input
                  type="text"
                  defaultValue="Periodização de Cargas - Bloco A"
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Frequência Semanal
                </label>
                <select className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white">
                  <option value="4">4 dias por semana (Upper / Lower)</option>
                  <option value="5">5 dias por semana (PPLUL)</option>
                  <option value="6">6 dias por semana (Push / Pull / Legs)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Ficha de treino transmitida com sucesso para o terminal do aluno!')}
              className="mt-4 px-6 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
            >
              TRANSMITIR ROTINA AO ALUNO
            </button>
          </div>
        )}

        {activeTab === 'acwr' && (
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <TrendingUp className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase">
                Monitor de Sobrecarga Aguda x Crônica (ACWR)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              A proporção entre a carga aguda (últimos 7 dias) e a carga crônica (últimos 28 dias) deve se manter na zona recomendada (0.80 - 1.30) para evitar picos abruptos de lesão articular.
            </p>
            <div className="p-4 bg-black border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <div className="flex items-center justify-between">
                <span>Zona Adequada (Sweet Spot):</span>
                <span className="text-white font-bold">0.80 - 1.30 (Evolução progressiva)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pico Excessivo de Carga:</span>
                <span className="text-zinc-400 font-bold">&gt; 1.50 (Ajustar volume de treino)</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
