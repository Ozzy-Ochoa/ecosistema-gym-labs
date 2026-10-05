import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  ShieldAlert,
  Users,
  Building2,
  Lock,
  LogOut,
  CheckCircle,
  Database,
  Trash2
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    identity,
    savedAccounts,
    openAccountModal,
    logout,
    auditLogs,
    exportUserDataJson,
  } = useGymLabs();

  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'audit'>('overview');

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between select-none">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              ADM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase">{identity.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-white border border-zinc-700 font-bold uppercase">
                  ADMINISTRADOR
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">
                PORTAL INTERNO DE GOVERNANÇA & AUDITORIA
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

      {/* Tabs */}
      <div className="border-b border-zinc-900 bg-black px-4">
        <div className="max-w-7xl mx-auto flex gap-4 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'overview' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            01 VISÃO GERAL
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'accounts' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            02 CONTAS REGISTRADAS ({savedAccounts.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'audit' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            03 REGISTROS DE AUDITORIA ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Status do Sistema</span>
                <span className="text-xl font-black text-white flex items-center gap-1.5 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" /> OPERACIONAL
                </span>
                <span className="text-[10px] text-zinc-500 mt-2 block font-sans">
                  Partições ativas e determinísticas.
                </span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Total de Usuários</span>
                <span className="text-xl font-black text-white mt-1">
                  {savedAccounts.length} CONTAS
                </span>
                <span className="text-[10px] text-zinc-500 mt-2 block font-sans">
                  Perfis salvos no dispositivo.
                </span>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Ações Registradas</span>
                <span className="text-xl font-black text-white mt-1">
                  {auditLogs.length} EVENTOS
                </span>
                <span className="text-[10px] text-zinc-500 mt-2 block font-sans">
                  Histórico de autenticações.
                </span>
              </div>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase">Portabilidade & Backup de Dados</h3>
              <p className="text-xs text-zinc-400 font-sans">
                Exporte todo o banco de registros e perfis em formato JSON estruturado.
              </p>
              <button
                type="button"
                onClick={exportUserDataJson}
                className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Exportar Relatório Geral (JSON)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Contas Cadastradas</h2>
            {savedAccounts.length === 0 ? (
              <div className="p-8 border border-zinc-800 text-center text-xs text-zinc-500">
                Nenhuma conta cadastrada no momento.
              </div>
            ) : (
              <div className="border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Função</th>
                      <th className="p-3">Último Acesso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {savedAccounts.map((acc) => (
                      <tr key={acc.id}>
                        <td className="p-3 font-bold text-white uppercase">{acc.name}</td>
                        <td className="p-3 text-zinc-400">{acc.email}</td>
                        <td className="p-3">
                          <span className="text-[9px] px-1.5 py-0.5 border border-zinc-700 text-white font-bold uppercase">
                            {acc.role}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-500">{acc.lastActiveAt || 'Recente'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Trilha de Eventos</h2>
            <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-zinc-500 text-center py-4">Nenhum evento registrado ainda.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2 border-b border-zinc-900 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold block">{log.eventType}</span>
                        <span className={`text-[9px] px-1 py-0.2 font-bold uppercase border ${
                          log.status === 'SUCCESS'
                            ? 'border-emerald-700 text-emerald-400 bg-emerald-950/40'
                            : log.status === 'DENIED'
                            ? 'border-red-700 text-red-400 bg-red-950/40'
                            : 'border-amber-700 text-amber-400 bg-amber-950/40'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <span className="text-zinc-400 text-[11px] font-sans block">{log.details}</span>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Ator: {log.actor} • Recurso: {log.resourceTarget} • IP: {log.ipAddress}
                      </div>
                    </div>
                    <span className="text-zinc-600 text-[10px] shrink-0 font-mono">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
