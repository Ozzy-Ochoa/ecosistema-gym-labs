import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ShieldCheck, Lock, Activity, Globe, Terminal, Eye, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    identity,
    isDemoMode,
    toggleDemoMode,
    activeJurisdiction,
    setCurrentTab,
    lockEnclave,
    twoFactorEnabled,
    savedAccounts,
    openAccountModal,
  } = useGymLabs();

  return (
    <header
      id="gymlabs-global-header"
      className="sticky top-0 z-40 h-16 w-full bg-black/95 backdrop-blur-md border-b-2 border-zinc-800 px-4 lg:px-8 flex items-center justify-between"
    >
      {/* Brand & HUD Emblem */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setCurrentTab('today')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Cyber HUD Emblem */}
          <div className="relative w-9 h-9 neo-box flex items-center justify-center border-2 border-[#00F0FF] group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
            <span className="font-mono font-black text-sm text-[#00F0FF] tracking-tighter">
              GL
            </span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39FF14] animate-ping" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39FF14]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white uppercase font-mono">
                GYM LABS
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black text-[#00F0FF] border border-[#00F0FF] font-bold">
                LABCORE 2026
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 tracking-tight hidden sm:block">
              Inteligência Fisiológica & Auditoria Criptográfica
            </p>
          </div>
        </div>
      </div>

      {/* Center status bar: Real Provenance, Rigor & LGPD */}
      <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#050505] border border-zinc-800 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>RIGOR: ZERO-INVENTED DATA</span>
          <span className="w-1.5 h-1.5 bg-[#39FF14]" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#050505] border border-zinc-800 text-zinc-400">
          <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>ENCLAVE: SCRYPT-16384</span>
        </div>

        <div
          onClick={() => setCurrentTab('trust')}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-black hover:bg-zinc-900 border border-zinc-700 text-[#00F0FF] cursor-pointer transition-colors"
          title="Jurisdição LGPD Ativa"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>LGPD_BR</span>
        </div>
      </div>

      {/* Right Controls: Lock Visor, 2FA Status, Demo Mode */}
      <div className="flex items-center gap-2 font-mono">
        {/* Profile & Multi-Account Switcher Button */}
        <button
          type="button"
          onClick={openAccountModal}
          className="px-2.5 py-1.5 neo-box text-white hover:border-[#00F0FF] hover:text-[#00F0FF] text-[11px] font-mono font-bold flex items-center gap-2 transition-all bg-black cursor-pointer"
          title="Alternar entre contas e logins salvos"
        >
          <div className="w-5 h-5 neo-box border border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center text-[10px] shrink-0 font-bold">
            {identity.name ? identity.name.substring(0, 1).toUpperCase() : 'U'}
          </div>
          <span className="hidden sm:inline font-bold truncate max-w-[110px]">
            {identity.name ? identity.name.split(' ')[0] : 'Atleta'}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-[#00F0FF]">
            {savedAccounts.length} {savedAccounts.length === 1 ? 'CONTA' : 'CONTAS'}
          </span>
        </button>

        {/* Enclave Visor Lock Button */}
        <button
          type="button"
          onClick={lockEnclave}
          className="px-2.5 py-1.5 neo-box text-zinc-300 hover:text-[#00F0FF] hover:border-[#00F0FF] text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          title="Bloquear Visor do Enclave (PIN)"
        >
          <Lock className="w-3.5 h-3.5 text-[#FFB800]" />
          <span className="hidden sm:inline">BLOQUEAR</span>
        </button>

        {/* Demo Mode Toggle */}
        <button
          type="button"
          onClick={toggleDemoMode}
          className={`px-3 py-1.5 text-[11px] font-bold uppercase transition-all ${
            isDemoMode
              ? 'bg-[#00F0FF] text-black font-mono border border-[#00F0FF] shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)]'
              : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
          title="Alternar entre modo Produção e Demonstração"
        >
          {isDemoMode ? 'DEMO_DATA' : 'STRICT_LIVE'}
        </button>

        {/* Profile Avatar / Quick Link */}
        <div
          onClick={() => setCurrentTab('settings')}
          className="w-8 h-8 neo-box flex items-center justify-center cursor-pointer hover:border-[#00F0FF] text-xs font-bold text-white uppercase"
          title={identity.name}
        >
          {identity.name.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
