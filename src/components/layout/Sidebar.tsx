import React from 'react';
import { useGymLabs, NavigationTab } from '../../context/GymLabsContext';
import {
  Sun,
  Dumbbell,
  User,
  Utensils,
  Moon,
  LineChart,
  Bot,
  Users,
  Building2,
  ShieldCheck,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Hoje // Telemetria', icon: Sun, section: 'PAINEL DO ATLETA' },
  { id: 'training', label: 'Treino & Sobrecarga', icon: Dumbbell, badge: '1RM' },
  { id: 'body', label: 'Biometria & Perímetros', icon: User },
  { id: 'nutrition', label: 'Nutrição & Hidratação', icon: Utensils, badge: 'SAWKA' },
  { id: 'recovery', label: 'Sono & Prontidão', icon: Moon, badge: 'HRV' },
  { id: 'datalab', label: 'Gym Labs Data Lab', icon: LineChart, badge: 'EXP', section: 'ANÁLISE & CIÊNCIA' },
  { id: 'intelligence', label: 'Consulta Científica', icon: Bot, badge: 'INTEL' },
  { id: 'professionals', label: 'Nutricionistas & Personais', icon: Users, section: 'ECOSSISTEMA PROFISSIONAL' },
  { id: 'organizations', label: 'Academias & Studios', icon: Building2 },
  { id: 'settings', label: 'Configurações // Perfil', icon: Settings, section: 'SISTEMA' },
];

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, identity, savedAccounts, openAccountModal } = useGymLabs();

  return (
    <aside
      id="gymlabs-sidebar"
      className="hidden md:flex flex-col w-64 h-[calc(100vh-3.5rem)] sticky top-14 bg-black border-r border-zinc-800 p-3 overflow-y-auto shrink-0 select-none font-mono"
    >
      {/* Navigation Grouping */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div className="pt-4 pb-1 px-2 text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                  // {item.section}
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 border font-bold uppercase ${
                      isActive
                        ? 'border-black text-black bg-white'
                        : 'border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Active User Card with Switch Account button */}
      <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
            PERFIL ATIVO
          </span>
          {savedAccounts.length > 1 && (
            <button
              type="button"
              onClick={openAccountModal}
              className="text-[10px] text-white hover:underline flex items-center gap-1 font-bold cursor-pointer uppercase"
              title="Alternar entre perfis salvos"
            >
              <Users className="w-3 h-3" />
              <span>TROCAR</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-zinc-700 bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
            {identity.name ? identity.name.substring(0, 1).toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate uppercase">
              {identity.name || 'Atleta'}
            </div>
            <div className="text-[9px] text-zinc-500 truncate">
              {savedAccounts.length} {savedAccounts.length === 1 ? 'perfil neste app' : 'perfis salvos'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
