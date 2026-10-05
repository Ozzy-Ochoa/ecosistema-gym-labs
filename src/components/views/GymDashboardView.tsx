import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Plus,
  LogOut,
  CheckCircle,
  FileText
} from 'lucide-react';

export const GymDashboardView: React.FC = () => {
  const {
    identity,
    savedAccounts,
    openAccountModal,
    logout,
  } = useGymLabs();

  const [activeTab, setActiveTab] = useState<'staff' | 'students' | 'metrics'>('staff');

  const affiliatedStaff = savedAccounts.filter((a) => a.role === 'COACH' || a.role === 'NUTRITIONIST');
  const enrolledStudents = savedAccounts.filter((a) => a.role === 'USER');

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-900 bg-black px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              GYM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase">{identity.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-white border border-zinc-700 font-bold uppercase">
                  CENTRO DE TREINAMENTO / ACADEMIA
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">
                PORTAL DE GESTÃO INTEGRADA // EQUIPE & RETENÇÃO DE ALUNOS
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1 pb-28">
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase text-white">Profissionais Credenciados</h2>
                <p className="text-xs text-zinc-400 font-sans">
                  Personais e Nutricionistas autorizados a atender dentro da unidade com verificação de CREF/CRN.
                </p>
              </div>
            </div>

            {affiliatedStaff.length === 0 ? (
              <div className="p-8 border border-zinc-800 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-zinc-600" />
                <span className="text-xs text-zinc-400 uppercase block font-bold">
                  Nenhum profissional vinculado ainda
                </span>
                <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                  Convide os personais e nutricionistas que atendem seus alunos a se cadastrarem com o CNPJ da sua unidade.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {affiliatedStaff.map((staff) => (
                  <div key={staff.id} className="p-4 bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-white uppercase">{staff.name}</h3>
                        <span className="text-xs text-zinc-500">{staff.email}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 border border-zinc-700 text-zinc-300 font-bold uppercase">
                        {staff.role}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-zinc-900 text-xs text-zinc-400 font-sans">
                      {staff.tagline || 'Profissional Ativo'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-black uppercase text-white">Alunos Matriculados na Unidade</h2>
              <span className="text-[10px] text-zinc-500 font-mono">
                🔒 LGPD: Dados clínicos e biométricos restritos ao atleta e profissionais autorizados.
              </span>
            </div>
            {enrolledStudents.length === 0 ? (
              <div className="p-8 border border-zinc-800 text-center space-y-2">
                <span className="text-xs text-zinc-400 uppercase block font-bold">
                  Nenhum aluno registrado na base ainda
                </span>
                <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                  Os alunos que utilizam o Gym Labs e selecionam sua academia aparecerão listados aqui.
                </p>
              </div>
            ) : (
              <div className="border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Último Acesso</th>
                      <th className="p-3">Status na Unidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {enrolledStudents.map((st) => (
                      <tr key={st.id}>
                        <td className="p-3 font-bold text-white uppercase">{st.name}</td>
                        <td className="p-3 text-zinc-400">{st.email}</td>
                        <td className="p-3 text-zinc-400 font-mono text-[11px]">{st.lastActiveAt || 'Hoje'}</td>
                        <td className="p-3">
                          <span className="text-[9px] px-1.5 py-0.5 border border-emerald-700 bg-emerald-950/30 text-emerald-400 font-bold uppercase">
                            REGULAR
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase">Indicadores de Frequência e Evasão</h2>
            <p className="text-xs text-zinc-400 font-sans">
              O Gym Labs analisa a frequência de treino dos alunos. Quando um aluno passa mais de 7 dias sem registrar nenhum treino na unidade, o sistema dispara um sinal de alerta para a equipe de atendimento agir antes do cancelamento da matrícula.
            </p>
            <div className="p-4 bg-black border border-zinc-800 text-xs text-zinc-400">
              Módulo de Retenção Ativo • Integração de presenças e treinos reais.
            </div>
          </div>
        )}
      </main>

      {/* Cyber HUD Bottom Bar with Icons for Gym */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-zinc-800 select-none pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.9)]">
        <div className="max-w-2xl mx-auto flex items-stretch justify-around px-2 py-1.5 sm:py-2">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-2 font-mono transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'border border-white bg-zinc-950 text-white shadow-[0_0_12px_rgba(255,255,255,0.18)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {activeTab === 'staff' && (
              <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-white inline-block shadow-[0_0_6px_#fff]" />
            )}
            <div className="flex items-center gap-1 mb-0.5">
              <Award className="w-4 h-4 text-white" />
              <span className="text-[10px] text-zinc-400">01</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase">
              EQUIPE ({affiliatedStaff.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-2 font-mono transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'border border-white bg-zinc-950 text-white shadow-[0_0_12px_rgba(255,255,255,0.18)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {activeTab === 'students' && (
              <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-white inline-block shadow-[0_0_6px_#fff]" />
            )}
            <div className="flex items-center gap-1 mb-0.5">
              <Users className="w-4 h-4 text-white" />
              <span className="text-[10px] text-zinc-400">02</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase">
              MATRICULADOS ({enrolledStudents.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-2 font-mono transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'border border-white bg-zinc-950 text-white shadow-[0_0_12px_rgba(255,255,255,0.18)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {activeTab === 'metrics' && (
              <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-white inline-block shadow-[0_0_6px_#fff]" />
            )}
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-[10px] text-zinc-400">03</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase">
              RETENÇÃO & CHURN
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
