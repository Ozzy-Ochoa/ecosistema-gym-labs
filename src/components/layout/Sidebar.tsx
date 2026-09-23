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
  Sparkles,
  Terminal,
  Activity,
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
  { id: 'body', label: 'Biometria & ISAK', icon: User },
  { id: 'nutrition', label: 'Nutrição & Hidratação', icon: Utensils, badge: 'SAWKA' },
  { id: 'recovery', label: 'Sono & Prontidão', icon: Moon, badge: 'HRV' },
  { id: 'datalab', label: 'GL Data Lab', icon: LineChart, badge: 'EXP', section: 'ANÁLISE & INTELIGÊNCIA' },
  { id: 'intelligence', label: 'GL Intelligence', icon: Bot, badge: 'AI' },
  { id: 'professionals', label: 'Profissionais Conectados', icon: Users, section: 'ECOSSISTEMA DO USUÁRIO' },
  { id: 'organizations', label: 'Academias & Studios', icon: Building2 },
  { id: 'trust', label: 'Governança & LGPD', icon: ShieldCheck, section: 'SEGURANÇA & AUDITORIA' },
  { id: 'settings', label: 'Configurações // Enclave', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, isDemoMode, identity, savedAccounts, openAccountModal } = useGymLabs();

  return (
    <aside
      id="gymlabs-sidebar"
      className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 bg-black border-r-2 border-zinc-800 p-3 overflow-y-auto shrink-0 select-none"
    >
      {/* Demo Sandbox Alert (Neo-Brutalist) */}
      {isDemoMode && (
        <div className="mb-3 p-2.5 bg-black border-2 border-[#FFB800] text-[11px] text-[#FFB800]">
          <div className="font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MODO SANDBOX ATIVO</span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
            Dados simulados carregados para exploração e testes.
          </p>
        </div>
      )}

      {/* Navigation Grouping */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div className="pt-4 pb-1 px-2 text-[9px] font-mono font-bold tracking-widest text-zinc-600 uppercase">
                  // {item.section}
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left font-mono text-xs transition-all ${
                  isActive
                    ? 'bg-[#050505] text-white border-l-4 border-l-[#00F0FF] border-y border-r border-zinc-800 font-bold shadow-[2px_2px_0px_0px_rgba(0,240,255,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00F0FF]' : 'text-zinc-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 border font-mono font-bold ${
                      isActive
                        ? 'border-[#00F0FF] text-[#00F0FF] bg-black'
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
      <div className="mt-3 p-2.5 bg-black border border-zinc-800 neo-box font-mono">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
            USUÁRIO ATUAL // ATLETA
          </span>
          <button
            type="button"
            onClick={openAccountModal}
            className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            title="Alternar entre contas e logins salvos"
          >
            <Users className="w-3 h-3" />
            <span>TROCAR</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 neo-box border border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center text-xs font-bold shrink-0">
            {identity.name ? identity.name.substring(0, 1).toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate uppercase">
              {identity.name}
            </div>
            <div className="text-[9px] text-zinc-500 truncate">
              {savedAccounts.length} {savedAccounts.length === 1 ? 'login salvo' : 'logins salvos'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Enclave Diagnostic Badge */}
      <div className="mt-4 pt-3 border-t border-zinc-900 font-mono text-[10px] text-zinc-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 bg-[#39FF14] inline-block animate-pulse" />
            ENCLAVE V4.2
          </span>
          <span className="text-[#00F0FF]">SCRYPT: OK</span>
        </div>
        <div className="text-[9px] text-zinc-400 truncate">
          JURIS: LGPD_BR // PRIVACY BY DESIGN
        </div>
      </div>
    </aside>
  );
};
