import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { Lock, ShieldCheck, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    identity,
    isDemoMode,
    toggleDemoMode,
    setCurrentTab,
    lockEnclave,
    savedAccounts,
    openAccountModal,
  } = useGymLabs();

  return (
    <header
      id="gymlabs-global-header"
      className="sticky top-0 z-40 h-14 w-full bg-black border-b border-zinc-800 px-4 lg:px-8 flex items-center justify-between font-mono select-none"
    >
      {/* Brand & HUD Emblem */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setCurrentTab('today')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Monochrome HUD Emblem */}
          <div className="w-8 h-8 bg-black border border-white flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
            <span className="font-mono font-black text-xs text-white group-hover:text-black tracking-tighter">
              GL
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-white uppercase">
                GYM LABS
              </span>
              <span className="text-[9px] px-1 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                PRO V2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center status bar: Real Telemetry Indicator */}
      <div className="hidden md:flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] uppercase font-bold text-zinc-300">DADOS AUDITADOS REAIS</span>
        </div>
      </div>

      {/* Right Controls: Multi-Account Switcher & Lock */}
      <div className="flex items-center gap-2 text-xs">
        {/* Profile & Multi-Account Switcher Button */}
        {savedAccounts.length > 1 && (
          <button
            type="button"
            onClick={openAccountModal}
            className="px-2.5 py-1.5 border border-zinc-700 hover:border-white text-white text-[11px] font-bold flex items-center gap-1.5 transition-all bg-black cursor-pointer uppercase"
            title="Alternar entre perfis salvos"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {identity.name ? identity.name.split(' ')[0] : 'Perfil'}
            </span>
            <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-300">
              {savedAccounts.length}
            </span>
          </button>
        )}

        {/* Lock Visor Button */}
        <button
          type="button"
          onClick={lockEnclave}
          className="px-2.5 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer uppercase"
          title="Bloquear Visor (PIN)"
        >
          <Lock className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">BLOQUEAR</span>
        </button>

        {/* Profile Avatar / Quick Link */}
        <button
          type="button"
          onClick={() => setCurrentTab('settings')}
          className="w-8 h-8 border border-zinc-700 hover:border-white bg-zinc-950 flex items-center justify-center cursor-pointer text-xs font-bold text-white uppercase"
          title={identity.name}
        >
          {identity.name ? identity.name.substring(0, 2).toUpperCase() : 'GL'}
        </button>
      </div>
    </header>
  );
};
