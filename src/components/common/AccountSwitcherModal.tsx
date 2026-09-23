import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Users,
  UserCheck,
  UserPlus,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SavedUserAccount, UserRole } from '../../types/user';

export const AccountSwitcherModal: React.FC = () => {
  const {
    isAccountModalOpen,
    closeAccountModal,
    savedAccounts,
    activeAccountId,
    switchAccount,
    addSavedAccount,
    removeSavedAccount,
  } = useGymLabs();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSex, setNewSex] = useState<'MALE' | 'FEMALE'>('MALE');
  const [newGoal, setNewGoal] = useState<'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'LONGEVITY'>('HYPERTROPHY');
  const [newWeight, setNewWeight] = useState(78);
  const [newHeight, setNewHeight] = useState(175);
  const [newPin, setNewPin] = useState('2026');
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

    const newId = `usr_${Date.now()}`;
    const account: SavedUserAccount = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      preferredName: newName.trim().split(' ')[0],
      role: 'USER',
      biologicalSex: newSex,
      primaryGoal: newGoal,
      weightKg: Number(newWeight),
      heightCm: Number(newHeight),
      pin: newPin || '2026',
      lastActiveAt: 'Recém-criado',
      tagline: `Atleta ${newGoal === 'HYPERTROPHY' ? 'Hipertrofia' : newGoal === 'FAT_LOSS' ? 'Composição Corporal' : newGoal === 'STRENGTH' ? 'Força' : 'Saúde & Longevidade'}`,
    };

    addSavedAccount(account);
    switchAccount(newId);
    setIsAddingNew(false);
    setNewName('');
    setNewEmail('');
    closeAccountModal();
  };

  return (
    <div
      id="account-switcher-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
      onClick={closeAccountModal}
    >
      <div
        id="account-switcher-container"
        className="relative w-full max-w-2xl bg-[#050505] border-2 border-zinc-800 neo-box-thick shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-800 bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 neo-box border border-[#00F0FF] flex items-center justify-center bg-[#00F0FF]/10 text-[#00F0FF]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-black text-sm uppercase tracking-wider text-white">
                  Seletor de Perfis // Logins Locais
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                  {savedAccounts.length} {savedAccounts.length === 1 ? 'CONTA' : 'CONTAS'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Gym Labs Labcore • Portal do Usuário Final & Atleta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAccountModal}
            className="p-1.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prototype Scope Banner */}
        <div className="px-6 py-2.5 bg-zinc-950 border-b border-zinc-900 text-xs font-mono text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            Ambiente exclusivo para o Usuário Final (Pessoa Física).
          </span>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            Personais & Nutricionistas acessam apps dedicados
          </span>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isAddingNew ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  Contas Disponíveis neste Dispositivo
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1 neo-box text-xs font-mono font-bold text-[#00F0FF] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>ADICIONAR OUTRA CONTA</span>
                </button>
              </div>

              {/* Account Cards */}
              <div className="space-y-3 font-mono">
                {savedAccounts.map((acc) => {
                  const isCurrent = acc.id === activeAccountId;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => !isCurrent && handleSelectAccount(acc.id)}
                      className={`p-4 border-2 transition-all cursor-pointer relative group ${
                        isCurrent
                          ? 'border-[#00F0FF] bg-[#00F0FF]/5 shadow-[3px_3px_0px_0px_rgba(0,240,255,0.3)]'
                          : 'border-zinc-800 bg-black hover:border-zinc-500 hover:bg-zinc-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar block */}
                          <div
                            className={`w-11 h-11 neo-box flex items-center justify-center font-bold text-sm uppercase ${
                              isCurrent
                                ? 'bg-black text-[#00F0FF] border-2 border-[#00F0FF]'
                                : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {acc.name.substring(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white uppercase">
                                {acc.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#39FF14] text-black font-black uppercase tracking-wider">
                                  CONTA ATIVA
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">{acc.email}</p>
                            {acc.tagline && (
                              <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">
                                {acc.tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Stats & Action */}
                        <div className="text-right flex flex-col items-end justify-between">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            {acc.weightKg && <span>{acc.weightKg} kg</span>}
                            {acc.heightCm && <span>• {acc.heightCm} cm</span>}
                            <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800">
                              {acc.primaryGoal || 'TREINO'}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            {savedAccounts.length > 1 && !isCurrent && (
                              <button
                                type="button"
                                title="Remover conta do dispositivo"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remover perfil de ${acc.name} deste dispositivo?`)) {
                                    removeSavedAccount(acc.id);
                                  }
                                }}
                                className="p-1 text-zinc-600 hover:text-[#FF0055] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isCurrent ? (
                              <div className="flex items-center gap-1.5 text-xs text-[#39FF14] font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>EM USO</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectAccount(acc.id)}
                                className="px-3 py-1 neo-box text-xs font-bold text-white group-hover:border-[#00F0FF] group-hover:text-[#00F0FF] flex items-center gap-1 transition-all"
                              >
                                <span>ENTRAR</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer micro-info */}
                      <div className="mt-3 pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>PIN de Acesso: {acc.pin || '2026'}</span>
                        <span>Último Acesso: {acc.lastActiveAt || 'Recente'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add New Athlete Form */
            <form onSubmit={handleCreateAccount} className="space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs uppercase font-bold text-[#00F0FF]">
                  // Novo Perfil de Usuário Final
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Voltar para lista
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 border border-[#FF0055] bg-[#FF0055]/10 text-[#FF0055] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Lucas Ferreira"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    E-mail do Atleta
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="lucas@exemplo.com"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    Sexo Biológico
                  </label>
                  <select
                    value={newSex}
                    onChange={(e) => setNewSex(e.target.value as any)}
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    Objetivo Primário
                  </label>
                  <select
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value as any)}
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none"
                  >
                    <option value="HYPERTROPHY">Hipertrofia Muscular</option>
                    <option value="STRENGTH">Força Máxima</option>
                    <option value="FAT_LOSS">Composição Corporal / Queima de Gordura</option>
                    <option value="LONGEVITY">Saúde & Longevidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    step="0.5"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                    PIN do Enclave (4 dígitos para desbloqueio rápido)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="2026"
                    className="w-full p-2.5 bg-black border border-zinc-700 text-white font-mono text-sm focus:border-[#00F0FF] outline-none tracking-widest text-center"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 neo-box bg-[#00F0FF] text-black font-mono font-black text-xs uppercase hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)]"
                >
                  CRIAR & SELECIONAR CONTA
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-4 bg-black border-t-2 border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
            <span>Partições locais criptografadas individualmente (AES-256-GCM)</span>
          </div>
          <span>Labcore 2026</span>
        </div>
      </div>
    </div>
  );
};
