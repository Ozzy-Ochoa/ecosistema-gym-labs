import React from 'react';
import { useGymLabs, NavigationTab } from '../../context/GymLabsContext';
import { Home, Dumbbell, Activity, FlaskConical, Bot, Settings, Users, LogOut, Shield } from 'lucide-react';

interface TabItem {
  id: NavigationTab;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ATHLETE_TABS: TabItem[] = [
  { id: 'today', number: '01', label: 'INÍCIO', icon: Home },
  { id: 'training', number: '02', label: 'TREINO', icon: Dumbbell },
  { id: 'health', number: '03', label: 'SAÚDE', icon: Activity },
  { id: 'datalab', number: '04', label: 'LABORATÓRIO', icon: FlaskConical },
  { id: 'intelligence', number: '05', label: 'IA INTEL', icon: Bot },
  { id: 'settings', number: '06', label: 'AJUSTES', icon: Settings },
];

export const AthleteTopNav: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    identity,
    openAccountModal,
    logout,
    savedAccounts,
  } = useGymLabs();

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-zinc-900 select-none">
      {/* Top Status Strip */}
      <div className="hidden sm:flex items-center justify-between px-4 py-1.5 bg-black border-b border-zinc-900 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-white inline-block" />
          <span className="text-white font-bold tracking-wider">GYM LABS // ENCLAVE OPERACIONAL</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">CIÊNCIA DETERMINÍSTICA • DADOS REAIS</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500">ATLETA:</span>
            <span className="text-white font-bold uppercase">{identity.name || 'USUÁRIO'}</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-white font-bold">
              CONVENCIONAL
            </span>
          </div>

          {savedAccounts.length > 1 && (
            <button
              type="button"
              onClick={openAccountModal}
              className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Alternar entre logins salvos"
            >
              <Users className="w-3 h-3" />
              <span>TROCAR CONTA ({savedAccounts.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Sair da sessão"
          >
            <LogOut className="w-3 h-3" />
            <span>SAIR</span>
          </button>
        </div>
      </div>

      {/* Cyber HUD Navigation Bar (Matches user's exact specification) */}
      <nav className="flex items-center justify-center sm:justify-start lg:justify-center overflow-x-auto no-scrollbar px-2 sm:px-6 py-2 bg-black gap-1 sm:gap-4 md:gap-8">
        {ATHLETE_TABS.map((tab) => {
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'health' && (currentTab === 'body' || currentTab === 'nutrition' || currentTab === 'recovery'));
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[72px] sm:min-w-[96px] py-1.5 px-2.5 sm:px-4 font-mono transition-all cursor-pointer ${
                isActive
                  ? 'border border-white bg-black text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                  : 'border border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800/60'
              }`}
            >
              {/* Corner Square Accent (Top-Left of active item as in reference image) */}
              {isActive && (
                <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-white inline-block shadow-[0_0_4px_#fff]" />
              )}

              {/* Icon and Tab Number */}
              <div className="flex items-center gap-1 mb-1">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-white scale-110' : 'text-zinc-500'
                  }`}
                />
                <span className={`text-[10px] tracking-wider ${isActive ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {tab.number}
                </span>
              </div>

              {/* Tab Label */}
              <span
                className={`text-[11px] font-black tracking-wider uppercase ${
                  isActive ? 'text-white' : 'text-zinc-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
