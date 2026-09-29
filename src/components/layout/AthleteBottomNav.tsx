import React from 'react';
import { useGymLabs, NavigationTab } from '../../context/GymLabsContext';
import { Home, Dumbbell, Activity, FlaskConical, Bot, Settings, Users } from 'lucide-react';

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
  { id: 'professionals', number: '05', label: 'PRO CONNECT', icon: Users },
  { id: 'intelligence', number: '06', label: 'IA INTEL', icon: Bot },
  { id: 'settings', number: '07', label: 'AJUSTES', icon: Settings },
];

export const AthleteBottomNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useGymLabs();

  return (
    <nav
      id="gymlabs-bottom-bar"
      aria-label="Navegação Principal do App"
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-zinc-800 select-none pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.9)]"
    >
      <div className="max-w-4xl mx-auto flex items-stretch justify-around px-1 py-1.5 sm:py-2">
        {ATHLETE_TABS.map((tab) => {
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'health' &&
              (currentTab === 'body' ||
                currentTab === 'nutrition' ||
                currentTab === 'recovery'));
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 font-mono transition-all cursor-pointer rounded-none group ${
                isActive
                  ? 'border border-white bg-zinc-950 text-white shadow-[0_0_12px_rgba(255,255,255,0.18)]'
                  : 'border border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800/80'
              }`}
            >
              {/* Corner Square Accent on Active Tab (Consistent with Image.png specification) */}
              {isActive && (
                <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-white inline-block shadow-[0_0_6px_#fff]" />
              )}

              {/* Icon and Tab Number */}
              <div className="flex items-center gap-1 mb-0.5">
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
                    isActive ? 'text-white scale-110' : 'text-zinc-500 group-hover:text-zinc-400'
                  }`}
                />
                <span
                  className={`text-[9px] sm:text-[10px] tracking-wider hidden xs:inline ${
                    isActive ? 'text-zinc-300 font-bold' : 'text-zinc-600'
                  }`}
                >
                  {tab.number}
                </span>
              </div>

              {/* Tab Label */}
              <span
                className={`text-[9px] sm:text-[11px] font-black tracking-wider uppercase leading-none truncate max-w-full ${
                  isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
