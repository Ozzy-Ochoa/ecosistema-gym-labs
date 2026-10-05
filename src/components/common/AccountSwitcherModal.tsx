import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Users,
  UserCheck,
  UserPlus,
  X,
  Lock,
  ArrowRight,
  Dumbbell,
  Trash2,
  AlertCircle,
  Award,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { SavedUserAccount } from '../../types/user';

export const AccountSwitcherModal: React.FC = () => {
  const {
    isAccountModalOpen,
    closeAccountModal,
    savedAccounts,
    activeAccountId,
    switchAccount,
    addSavedAccount,
    removeSavedAccount,
    quickAccessSampleAccount,
  } = useGymLabs();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSex, setNewSex] = useState<'MALE' | 'FEMALE' | ''>('');
  const [newGoal, setNewGoal] = useState<'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'LONGEVITY' | ''>('');
  const [newWeight, setNewWeight] = useState<string>('');
  const [newHeight, setNewHeight] = useState<string>('');
  const [newPin, setNewPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAccountModalOpen) return null;

  const handleSelectAccount = (id: string) => {
    switchAccount(id);
    closeAccountModal();
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setErrorMsg('Nome e email são obrigatórios.');
      return;
    }

    if (newPin && newPin.trim().length > 0 && !/^\d{4}$/.test(newPin.trim())) {
      setErrorMsg('O PIN deve conter exatamente 4 dígitos numéricos.');
      return;
    }

    const parsedWeight = newWeight.trim() ? parseFloat(newWeight) : undefined;
    const parsedHeight = newHeight.trim() ? parseFloat(newHeight) : undefined;

    const newId = `usr_${Date.now()}`;
    const account: SavedUserAccount = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      preferredName: newName.trim().split(' ')[0],
      role: 'USER',
      biologicalSex: newSex || undefined,
      primaryGoal: newGoal || undefined,
      weightKg: parsedWeight && !isNaN(parsedWeight) ? parsedWeight : undefined,
      heightCm: parsedHeight && !isNaN(parsedHeight) ? parsedHeight : undefined,
      pin: newPin && newPin.trim().length === 4 ? newPin.trim() : undefined,
      lastActiveAt: 'Recém-criado',
      isDemo: false,
      tagline: newGoal
        ? `Atleta ${newGoal === 'HYPERTROPHY' ? 'Hipertrofia' : newGoal === 'FAT_LOSS' ? 'Composição Corporal' : newGoal === 'STRENGTH' ? 'Força' : 'Saúde & Longevidade'}`
        : 'Usuário Convencional // Atleta',
    };

    addSavedAccount(account);
    switchAccount(newId);
    setIsAddingNew(false);
    setNewName('');
    setNewEmail('');
    setNewSex('');
    setNewGoal('');
    setNewWeight('');
    setNewHeight('');
    setNewPin('');
    closeAccountModal();
  };

  return (
    <div
      id="account-switcher-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 select-none font-mono"
      onClick={closeAccountModal}
    >
      <div
        id="account-switcher-container"
        className="relative w-full max-w-2xl bg-black border border-white p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] text-white flex flex-col max-h-[90vh] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white flex items-center justify-center bg-white text-black font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm uppercase text-white">
                  Gerenciador de Perfis // Logins Locais
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                  {savedAccounts.length} {savedAccounts.length === 1 ? 'CONTA' : 'CONTAS'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Gym Labs // Alternância de contas no mesmo dispositivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAccountModal}
            className="p-1 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Body */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {!isAddingNew ? (
            <>
              {/* Quick 1-Click Demo Switcher Toolbar */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 inline-block animate-pulse" />
                    <span>Acesso Instantâneo de Teste // Alternar Perfil Demo</span>
                  </span>
                  <span className="text-zinc-500 font-mono">1 CLIQUE DIRETO</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      quickAccessSampleAccount('USER');
                      closeAccountModal();
                    }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-700 text-white font-bold transition-all text-center cursor-pointer"
                  >
                    ALUNO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      quickAccessSampleAccount('COACH');
                      closeAccountModal();
                    }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-blue-500 hover:text-white border border-zinc-700 text-white font-bold transition-all text-center cursor-pointer"
                  >
                    PERSONAL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      quickAccessSampleAccount('NUTRITIONIST');
                      closeAccountModal();
                    }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-emerald-500 hover:text-white border border-zinc-700 text-white font-bold transition-all text-center cursor-pointer"
                  >
                    NUTRI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      quickAccessSampleAccount('GYM');
                      closeAccountModal();
                    }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-700 hover:text-white border border-zinc-700 text-white font-bold transition-all text-center cursor-pointer"
                  >
                    ACADEMIA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      quickAccessSampleAccount('ADMIN');
                      closeAccountModal();
                    }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-700 hover:text-white border border-zinc-700 text-white font-bold transition-all text-center cursor-pointer"
                  >
                    ADMIN
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  Contas Salvas neste Dispositivo
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1.5 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>CRIAR OUTRO PERFIL</span>
                </button>
              </div>

              {/* Account Cards Grouped by Product */}
              <div className="space-y-4 font-mono">
                {/* 1. Atletas */}
                {savedAccounts.some((a) => a.role === 'USER') && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-white" />
                      <span>App do Atleta // Convencional</span>
                    </div>
                    {savedAccounts
                      .filter((a) => a.role === 'USER')
                      .map((acc) => {
                        const isCurrent = acc.id === activeAccountId;
                        return (
                          <div
                            key={acc.id}
                            onClick={() => !isCurrent && handleSelectAccount(acc.id)}
                            className={`p-3.5 border transition-all cursor-pointer relative ${
                              isCurrent
                                ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                                : 'border-zinc-800 bg-black hover:border-zinc-500'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 border border-zinc-700 bg-black flex items-center justify-center font-bold text-xs text-white">
                                  {acc.name ? acc.name.substring(0, 2).toUpperCase() : 'GL'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs uppercase text-white">{acc.name}</h4>
                                    {isCurrent && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                                        ATIVO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-zinc-400 font-sans block">{acc.email}</span>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">
                                    {acc.tagline || 'Usuário Convencional'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {savedAccounts.length > 1 && !isCurrent && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSavedAccount(acc.id);
                                    }}
                                    className="p-1.5 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 cursor-pointer"
                                    title="Remover perfil do dispositivo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAccount(acc.id)}
                                    className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                                  >
                                    ACESSAR
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 2. Profissionais */}
                {savedAccounts.some((a) => a.role === 'COACH' || a.role === 'NUTRITIONIST') && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-white" />
                      <span>App Pro Suite // Personais & Nutricionistas</span>
                    </div>
                    {savedAccounts
                      .filter((a) => a.role === 'COACH' || a.role === 'NUTRITIONIST')
                      .map((acc) => {
                        const isCurrent = acc.id === activeAccountId;
                        return (
                          <div
                            key={acc.id}
                            onClick={() => !isCurrent && handleSelectAccount(acc.id)}
                            className={`p-3.5 border transition-all cursor-pointer relative ${
                              isCurrent
                                ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                                : 'border-zinc-800 bg-black hover:border-zinc-500'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 border border-zinc-700 bg-black flex items-center justify-center font-bold text-xs text-white">
                                  {acc.role === 'COACH' ? 'PT' : 'NT'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs uppercase text-white">{acc.name}</h4>
                                    {isCurrent && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                                        ATIVO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-zinc-400 font-sans block">{acc.email}</span>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">
                                    {acc.tagline || (acc.role === 'COACH' ? 'Personal Trainer' : 'Nutricionista')}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {savedAccounts.length > 1 && !isCurrent && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSavedAccount(acc.id);
                                    }}
                                    className="p-1.5 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 cursor-pointer"
                                    title="Remover perfil do dispositivo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAccount(acc.id)}
                                    className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                                  >
                                    ACESSAR
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 3. Academias */}
                {savedAccounts.some((a) => a.role === 'GYM') && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-white" />
                      <span>App Enterprise Hub // Academias & Unidades</span>
                    </div>
                    {savedAccounts
                      .filter((a) => a.role === 'GYM')
                      .map((acc) => {
                        const isCurrent = acc.id === activeAccountId;
                        return (
                          <div
                            key={acc.id}
                            onClick={() => !isCurrent && handleSelectAccount(acc.id)}
                            className={`p-3.5 border transition-all cursor-pointer relative ${
                              isCurrent
                                ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                                : 'border-zinc-800 bg-black hover:border-zinc-500'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 border border-zinc-700 bg-black flex items-center justify-center font-bold text-xs text-white">
                                  GYM
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs uppercase text-white">{acc.name}</h4>
                                    {isCurrent && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                                        ATIVO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-zinc-400 font-sans block">{acc.email}</span>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">
                                    {acc.tagline || 'Academia / Centro de Treino'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {savedAccounts.length > 1 && !isCurrent && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSavedAccount(acc.id);
                                    }}
                                    className="p-1.5 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 cursor-pointer"
                                    title="Remover perfil do dispositivo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAccount(acc.id)}
                                    className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                                  >
                                    ACESSAR
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 4. Administrador / Auditoria */}
                {savedAccounts.some((a) => a.role === 'ADMIN') && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>Portal de Governança & Auditoria (Admin)</span>
                    </div>
                    {savedAccounts
                      .filter((a) => a.role === 'ADMIN')
                      .map((acc) => {
                        const isCurrent = acc.id === activeAccountId;
                        return (
                          <div
                            key={acc.id}
                            onClick={() => !isCurrent && handleSelectAccount(acc.id)}
                            className={`p-3.5 border transition-all cursor-pointer relative ${
                              isCurrent
                                ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                                : 'border-zinc-800 bg-black hover:border-zinc-500'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 border border-zinc-700 bg-black flex items-center justify-center font-bold text-xs text-white">
                                  ADM
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs uppercase text-white">{acc.name}</h4>
                                    {isCurrent && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                                        ATIVO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-zinc-400 font-sans block">{acc.email}</span>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">
                                    {acc.tagline || 'Governança & Auditoria Criptográfica'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAccount(acc.id)}
                                    className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                                  >
                                    ACESSAR
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase text-white">Novo Perfil de Usuário</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {errorMsg && (
                <div className="p-2 border border-white text-xs text-white">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="carlos@exemplo.com"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Sexo Biológico (Opcional)
                  </label>
                  <select
                    value={newSex}
                    onChange={(e) => setNewSex(e.target.value as any)}
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  >
                    <option value="">Não informado / Desconhecido</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    PIN Numérico (4 Dígitos - Opcional)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Ex: 1234 (sem PIN padrão)"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Peso (kg - Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="Ex: 80.0"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Altura (cm - Opcional)
                  </label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    placeholder="Ex: 178"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  CRIAR & SALVAR PERFIL
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
