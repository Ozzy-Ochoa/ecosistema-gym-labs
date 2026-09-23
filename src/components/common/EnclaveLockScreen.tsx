import React, { useState } from 'react';
import { ShieldAlert, Lock, Unlock, Key, AlertTriangle, Users, ChevronDown, Check } from 'lucide-react';
import { useGymLabs } from '../../context/GymLabsContext';

export const EnclaveLockScreen: React.FC = () => {
  const {
    isEnclaveLocked,
    unlockWithPin,
    enclavePin,
    savedAccounts,
    activeAccountId,
    activeAccount,
    switchAccount,
    openAccountModal,
  } = useGymLabs();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);

  if (!isEnclaveLocked) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMsg(false);
      if (next.length === 4) {
        // Auto-check on 4 digits
        const ok = unlockWithPin(next);
        if (!ok) {
          setErrorMsg(true);
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg(false);
  };

  const handleSelectAccount = (id: string) => {
    switchAccount(id);
    setShowAccountList(false);
    setPinInput('');
    setErrorMsg(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 cyber-grid select-none">
      {/* HUD Reticle Markers */}
      <div className="absolute top-4 left-4 text-[#00F0FF] text-xs font-mono">┌ SEC_ENCLAVE_VISOR: LOCKED ┐</div>
      <div className="absolute top-4 right-4 text-[#00F0FF] text-xs font-mono">┌ KDF: SCRYPT-16384 ┐</div>
      <div className="absolute bottom-4 left-4 text-zinc-500 text-[10px] font-mono">└ LGPD_BR: ART_18 ACTIVE ┘</div>
      <div className="absolute bottom-4 right-4 text-zinc-500 text-[10px] font-mono">└ DEFAULT_PIN: {enclavePin} ┘</div>

      <div className="w-full max-w-sm neo-box-thick p-6 bg-[#050505] border-2 border-zinc-800 text-center space-y-5 relative">
        {/* Top Active User Banner with Quick Switcher */}
        <div className="relative">
          <div
            onClick={() => setShowAccountList(!showAccountList)}
            className="p-2.5 bg-black border border-zinc-700 hover:border-[#00F0FF] cursor-pointer transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 neo-box border border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                {activeAccount?.name ? activeAccount.name.substring(0, 2).toUpperCase() : 'GL'}
              </div>
              <div className="truncate font-mono">
                <div className="text-xs font-bold text-white truncate uppercase">
                  {activeAccount?.name || 'Atleta Gym Labs'}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {activeAccount?.email || 'athlete@gymlabs.global'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#00F0FF] shrink-0 pl-1 font-bold">
              <span>{savedAccounts.length} PERFIS</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAccountList ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Dropdown list of accounts */}
          {showAccountList && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-black border-2 border-zinc-700 neo-box p-1 space-y-1 shadow-2xl font-mono text-left max-h-48 overflow-y-auto">
              <div className="px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-900">
                Escolha o Login / Usuário
              </div>
              {savedAccounts.map((acc) => {
                const isSelected = acc.id === activeAccountId;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`p-2 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-bold border-l-2 border-l-[#00F0FF]'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs truncate">{acc.name}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{acc.email}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00F0FF]" />}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setShowAccountList(false);
                  openAccountModal();
                }}
                className="w-full p-2 text-center text-[10px] text-[#00F0FF] hover:bg-zinc-900 border-t border-zinc-900 font-bold"
              >
                + Gerenciar / Adicionar Nova Conta
              </button>
            </div>
          )}
        </div>

        <div className="inline-flex p-3 bg-black border border-zinc-700 text-[#00F0FF]">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest block font-bold">
            ENCLAVE CRIPTOGRÁFICO // LABCORE
          </span>
          <h2 className="text-lg font-bold font-mono text-white mt-0.5 uppercase tracking-tight">
            Bloqueio de Visor Local
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Digite o PIN de 4 dígitos para restaurar a telemetria do usuário
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 border-2 transition-all ${
                pinInput.length > i
                  ? 'border-[#00F0FF] bg-[#00F0FF]'
                  : errorMsg
                  ? 'border-[#FF0055] bg-transparent animate-pulse'
                  : 'border-zinc-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="p-2 border border-[#FF0055] bg-[#FF0055]/10 text-[#FF0055] text-xs font-mono flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>PIN incorreto. PIN deste perfil: {enclavePin}</span>
          </div>
        )}

        {/* Tactical Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3 neo-box text-base font-mono font-bold text-white hover:border-[#00F0FF] hover:text-[#00F0FF] active:scale-95 transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 neo-box text-xs font-mono text-zinc-500 hover:text-white"
          >
            CLR
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 neo-box text-base font-mono font-bold text-white hover:border-[#00F0FF] hover:text-[#00F0FF]"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => unlockWithPin(enclavePin)}
            className="py-3 neo-box text-xs font-mono font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
          >
            DESBLOQUEAR
          </button>
        </div>
      </div>
    </div>
  );
};

