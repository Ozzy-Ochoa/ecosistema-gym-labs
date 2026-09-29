import React, { useState } from 'react';
import { Lock, Unlock, Users, ChevronDown, Check } from 'lucide-react';
import { useGymLabs } from '../../context/GymLabsContext';

export const EnclaveLockScreen: React.FC = () => {
  const {
    isEnclaveLocked,
    unlockWithPin,
    enclavePin,
    savedAccounts,
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none font-mono">
      {/* Top HUD Markers */}
      <div className="absolute top-4 left-4 text-white text-xs font-mono font-bold">
        ┌ GYM LABS: TERMINAL BLOQUEADO ┐
      </div>
      <div className="absolute top-4 right-4 text-zinc-500 text-xs font-mono">
        ┌ PIN PAD RESTRITO ┐
      </div>

      <div className="w-full max-w-sm p-6 bg-zinc-950 border border-white text-center space-y-5 relative shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]">
        {/* Active Account Switcher */}
        {savedAccounts.length > 1 && (
          <div className="relative">
            <div
              onClick={() => setShowAccountList(!showAccountList)}
              className="p-2.5 bg-black border border-zinc-700 hover:border-white cursor-pointer transition-all flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 border border-white bg-white text-black text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {activeAccount?.name ? activeAccount.name.substring(0, 2).toUpperCase() : 'GL'}
                </div>
                <div className="truncate font-mono">
                  <div className="text-xs font-bold text-white truncate uppercase">
                    {activeAccount?.name || 'Atleta'}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {activeAccount?.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0 pl-1 font-bold">
                <span>{savedAccounts.length} PERFIS</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAccountList ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {showAccountList && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white z-20 max-h-48 overflow-y-auto">
                {savedAccounts.map((acc) => {
                  const isSelected = acc.id === activeAccount?.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc.id)}
                      className={`p-2 flex items-center justify-between text-left cursor-pointer transition-colors border-b border-zinc-900 ${
                        isSelected ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold uppercase truncate">{acc.name}</div>
                        <div className="text-[9px] opacity-75 truncate">{acc.email}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="inline-flex p-3 bg-black border border-white text-white">
          <Lock className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
            TERMINAL EM REPOUSO
          </span>
          <h2 className="text-lg font-black text-white uppercase mt-0.5">
            Insira o PIN de 4 Dígitos
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Digite seu código de acesso para desbloquear o visor de métricas.
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 border transition-all ${
                pinInput.length > i
                  ? 'border-white bg-white'
                  : errorMsg
                  ? 'border-white bg-transparent animate-pulse'
                  : 'border-zinc-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="p-2 border border-white bg-black text-white text-xs font-mono">
            PIN INCORRETO. TENTE NOVAMENTE.
          </div>
        )}

        {/* Keypad in strict monochrome */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3 bg-black border border-zinc-800 text-base font-mono font-bold text-white hover:border-white hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-black border border-zinc-800 text-xs font-mono font-bold text-zinc-400 hover:text-white hover:border-white transition-all cursor-pointer"
          >
            LIMPAR
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 bg-black border border-zinc-800 text-base font-mono font-bold text-white hover:border-white hover:bg-zinc-900 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => {
              if (pinInput) {
                const ok = unlockWithPin(pinInput);
                if (!ok) {
                  setErrorMsg(true);
                  setTimeout(() => setPinInput(''), 600);
                }
              }
            }}
            className="py-3 bg-white text-black text-xs font-mono font-black uppercase hover:bg-zinc-200 transition-all cursor-pointer"
          >
            ENTRAR
          </button>
        </div>
      </div>
    </div>
  );
};
