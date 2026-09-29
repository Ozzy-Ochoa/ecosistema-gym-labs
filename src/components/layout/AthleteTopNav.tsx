import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { Users, LogOut, Shield, Bell } from 'lucide-react';

export const AthleteTopNav: React.FC = () => {
  const {
    identity,
    openAccountModal,
    logout,
    savedAccounts,
    notifications,
    unreadNotificationsCount,
    setIsNotificationCenterOpen,
  } = useGymLabs();

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-zinc-900 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-2.5 text-[10px] sm:text-xs font-mono">
        {/* Brand & System Status */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-white inline-block shadow-[0_0_6px_#fff]" />
          <span className="text-white font-black tracking-wider text-xs sm:text-sm">GYM LABS</span>
          <span className="text-zinc-700 hidden xs:inline">|</span>
          <span className="text-zinc-400 hidden sm:inline">APP DO ATLETA</span>
        </div>

        {/* User Identity & Session Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500 hidden sm:inline">ATLETA:</span>
            <span className="text-white font-bold uppercase truncate max-w-[110px] sm:max-w-none">
              {identity.name || 'USUÁRIO'}
            </span>
            <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
              CONVENCIONAL
            </span>
          </div>

          {savedAccounts.length > 1 && (
            <button
              type="button"
              onClick={openAccountModal}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Alternar entre contas"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TROCAR CONTA ({savedAccounts.length})</span>
            </button>
          )}

          {/* Sino de Notificações ao lado de SAIR */}
          <button
            type="button"
            onClick={() => setIsNotificationCenterOpen(true)}
            className="relative flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer px-2.5 py-1 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600"
            title="Caixa de Notificações & Avisos do Sistema"
          >
            <Bell className={`w-3.5 h-3.5 ${unreadNotificationsCount > 0 ? 'text-amber-400' : 'text-zinc-300'}`} />
            <span className="hidden sm:inline font-bold">NOTIFICAÇÕES</span>
            {unreadNotificationsCount > 0 ? (
              <span className="px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] min-w-[16px] text-center leading-none">
                {unreadNotificationsCount}
              </span>
            ) : notifications.length > 0 ? (
              <span className="text-[9px] text-zinc-500 font-bold hidden sm:inline">
                ({notifications.length})
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-1 border border-zinc-800 hover:border-zinc-600"
            title="Sair da sessão"
          >
            <LogOut className="w-3 h-3" />
            <span>SAIR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
