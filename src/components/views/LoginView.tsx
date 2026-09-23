import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Users,
  KeyRound,
  ArrowRight,
  UserPlus,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  Award,
  ShieldAlert
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    savedAccounts,
    login,
    setAuthView,
  } = useGymLabs();

  const hasSavedLogins = savedAccounts.length > 0;
  const [showManualLogin, setShowManualLogin] = useState<boolean>(!hasSavedLogins);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(savedAccounts[0]?.id || '');
  const [pinInput, setPinInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  const handleLoginSaved = (accountId: string) => {
    setErrorMsg(null);
    const acc = savedAccounts.find((a) => a.id === accountId);
    if (!acc) return;

    if (acc.pin && pinInput && pinInput !== acc.pin) {
      setErrorMsg('PIN de segurança incorreto.');
      return;
    }

    const res = login({ accountId, pin: pinInput || acc.pin });
    if (!res.success) {
      setErrorMsg(res.error || 'Erro na autenticação.');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!emailInput || !passwordInput) {
      setErrorMsg('Informe e-mail e senha.');
      return;
    }

    // Special internal admin check if attempted
    if (emailInput.toLowerCase() === 'admin@gymlabs.app' && passwordInput === 'admin2026') {
      const res = login({
        email: emailInput,
        password: passwordInput,
      });
      if (res.success) return;
    }

    const res = login({ email: emailInput, password: passwordInput });
    if (!res.success) {
      setErrorMsg(res.error || 'Credenciais não encontradas. Se ainda não possui conta, cadastre-se.');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'COACH':
        return 'PERSONAL TRAINER';
      case 'NUTRITIONIST':
        return 'NUTRICIONISTA';
      case 'GYM':
        return 'ACADEMIA';
      case 'ADMIN':
        return 'ADMINISTRADOR';
      default:
        return 'USUÁRIO CONVENCIONAL';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setAuthView('landing')}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR AO INÍCIO</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 bg-white inline-block" />
          <span className="text-zinc-400 font-bold">GYM LABS // ENTRADA</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-xl w-full mx-auto my-8 space-y-6">
        {/* Scenario 1: Saved Logins Exist -> "Com qual login deseja entrar?" */}
        {hasSavedLogins && !showManualLogin ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                // DETECÇÃO DE SESSÕES
              </span>
              <h1 className="text-2xl font-black uppercase text-white">
                Com qual login deseja entrar?
              </h1>
              <p className="text-xs text-zinc-400 font-sans">
                Identificamos os seguintes perfis já registrados neste dispositivo:
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-black border border-white text-xs text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              {savedAccounts.map((acc) => {
                const isSelected = acc.id === selectedAccountId;
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      setPinInput(acc.pin || '');
                    }}
                    className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                        : 'border-zinc-800 bg-black hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white uppercase">{acc.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                            {getRoleLabel(acc.role)}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 font-sans">{acc.email}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoginSaved(acc.id);
                        }}
                        className="px-3 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>ENTRAR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setShowManualLogin(true)}
                className="text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Entrar com outro e-mail e senha
              </button>

              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="flex items-center gap-1 text-white hover:underline font-bold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>CRIAR OUTRA CONTA</span>
              </button>
            </div>
          </div>
        ) : (
          /* Scenario 2: No Saved Logins OR Manual Credentials Requested -> Conventional Login */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                // ENTRADA DE USUÁRIO
              </span>
              <h1 className="text-2xl font-black uppercase text-white">
                Acessar o Gym Labs
              </h1>
              <p className="text-xs text-zinc-400 font-sans">
                Insira seu e-mail e senha para abrir seu painel de treino e métricas:
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-black border border-white text-xs text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] mt-4"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>ENTRAR NA MINHA CONTA</span>
                </button>
              </div>

              {hasSavedLogins && (
                <div className="pt-3 border-t border-zinc-800 text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualLogin(false)}
                    className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    ← Voltar aos perfis identificados neste dispositivo
                  </button>
                </div>
              )}
            </form>

            <div className="p-4 bg-black border border-zinc-800 text-center space-y-2">
              <span className="text-xs text-zinc-400 block font-sans">
                Ainda não tem uma conta no Gym Labs?
              </span>
              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="px-4 py-2 border border-zinc-600 hover:border-white text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>CRIAR CADASTRO GRATUITO</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discrete Admin / Internal Access Footer */}
      <div className="max-w-2xl w-full mx-auto text-center pt-6 border-t border-zinc-900 text-xs text-zinc-600 flex items-center justify-between">
        <span>Gym Labs // 2026</span>
        <button
          type="button"
          onClick={() => {
            setShowManualLogin(true);
            setEmailInput('admin@gymlabs.app');
            setPasswordInput('admin2026');
          }}
          className="text-zinc-700 hover:text-zinc-400 transition-colors text-[10px]"
        >
          [Acesso Administrativo]
        </button>
      </div>
    </div>
  );
};
