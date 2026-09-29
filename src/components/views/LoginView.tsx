import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  KeyRound,
  ArrowRight,
  UserPlus,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  Award,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    login,
    setAuthView,
    authProduct,
    setAuthProduct,
    goToRegisterWithProduct,
    quickAccessSampleAccount,
  } = useGymLabs();

  // Active product login: strictly bound to authProduct ('USER' | 'PROFESSIONAL' | 'GYM')
  const activeProduct = authProduct || 'USER';

  // Form State
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!emailInput || !passwordInput) {
      setErrorMsg('Informe e-mail e senha.');
      return;
    }

    const res = login({ email: emailInput.trim(), password: passwordInput });
    if (!res.success) {
      setErrorMsg(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha ou cadastre-se.');
    }
  };

  const handleQuickDemoAccess = () => {
    setErrorMsg(null);
    if (activeProduct === 'USER') {
      quickAccessSampleAccount('USER');
    } else if (activeProduct === 'PROFESSIONAL') {
      quickAccessSampleAccount('COACH');
    } else if (activeProduct === 'GYM') {
      quickAccessSampleAccount('GYM');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-6 border-b border-zinc-900">
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
          <span className="text-zinc-400 font-bold">GYM LABS // AUTENTICAÇÃO SEGURA</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-6 space-y-6">
        {/* Dynamic App Login Header Context - Clean & Dedicated */}
        <div className="text-center space-y-2">
          {activeProduct === 'USER' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase">
                <Dumbbell className="w-3.5 h-3.5 text-white" />
                <span>01 // APP DO ATLETA</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white">
                Entrar no App de Treino
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Acesse seu diário de cargas, sobrecarga progressiva, balanço hídrico e dados corporais.
              </p>
            </>
          )}

          {activeProduct === 'PROFESSIONAL' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase">
                <Award className="w-3.5 h-3.5 text-white" />
                <span>02 // APP PRO SUITE</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white">
                Portal Profissional
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Ambiente exclusivo para Personal Trainers (CREF) e Nutricionistas Esportivos (CRN).
              </p>
            </>
          )}

          {activeProduct === 'GYM' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase">
                <Building2 className="w-3.5 h-3.5 text-white" />
                <span>03 // ENTERPRISE HUB</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white">
                Portal da Academia
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Coordenação de personais contratados, quadro de matriculados e retenção da unidade.
              </p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-black border border-white text-xs text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean, Secure Login Form (No saved profiles exposed) */}
        <form onSubmit={handleManualLogin} className="p-6 bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1.5 font-bold">
                {activeProduct === 'GYM'
                  ? 'E-mail da Unidade / Responsável *'
                  : activeProduct === 'PROFESSIONAL'
                  ? 'E-mail Profissional *'
                  : 'E-mail de Acesso *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={
                    activeProduct === 'USER'
                      ? 'seu.email@exemplo.com'
                      : activeProduct === 'PROFESSIONAL'
                      ? 'personal.ou.nutri@pro.com'
                      : 'gestao@academia.com.br'
                  }
                  className="w-full pl-9 pr-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1.5 font-bold">
                Senha de Acesso *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {activeProduct === 'USER'
                  ? 'ENTRAR NO APP DO ATLETA'
                  : activeProduct === 'PROFESSIONAL'
                  ? 'ENTRAR NO PORTAL PRO SUITE'
                  : 'ENTRAR NO APP DA ACADEMIA'}
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={() => goToRegisterWithProduct(activeProduct)}
              className="text-xs text-white hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>
                {activeProduct === 'USER'
                  ? 'Não possui conta de atleta? Cadastre-se'
                  : activeProduct === 'PROFESSIONAL'
                  ? 'Cadastrar-se como Personal ou Nutri'
                  : 'Cadastrar nova unidade de academia'}
              </span>
            </button>
          </div>
        </form>

        {/* Quick Demo Access Buttons - Direct access to Nutri, Personal, Gym without real data */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Testar Telas sem Cadastro (1 Clique)</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">MODO DEMO</span>
          </div>

          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Não possui dados reais para autenticar? Clique abaixo para abrir e explorar a tela imediatamente com dados científicos pré-configurados:
          </p>

          <div className="space-y-2 pt-1">
            {activeProduct === 'PROFESSIONAL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('COACH')}
                  className="p-2.5 bg-black border border-zinc-700 hover:border-white text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-white" />
                      <span>Testar Tela do Personal</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-sans">
                      CREF 089142-G/SP • Prescrição ACWR
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('NUTRITIONIST')}
                  className="p-2.5 bg-black border border-zinc-700 hover:border-white text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-white" />
                      <span>Testar Tela da Nutricionista</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-sans">
                      CRN-3 48192 • Metrópoles & Sawka
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            )}

            {activeProduct === 'GYM' && (
              <button
                type="button"
                onClick={() => quickAccessSampleAccount('GYM')}
                className="w-full p-2.5 bg-black border border-zinc-700 hover:border-white text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                    <span>Testar Tela da Academia</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans">
                    CNPJ 42.109.876/0001-20 • Coordenação de Equipe & Retenção
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            )}

            {activeProduct === 'USER' && (
              <button
                type="button"
                onClick={() => quickAccessSampleAccount('USER')}
                className="w-full p-2.5 bg-black border border-zinc-700 hover:border-white text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-white" />
                    <span>Testar Tela do Atleta</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans">
                    Alex Vance • 82.5 kg • Cargas, 1RM e Biometria
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Subtle Switch Link (In case user opened wrong app) */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setAuthView('landing')}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
          >
            ← Deseja acessar outro aplicativo do ecossistema? Voltar à capa
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-xl w-full mx-auto text-center pt-6 border-t border-zinc-900 text-[11px] text-zinc-600">
        Gym Labs // 2026. Acesso individualizado por credenciais criptográficas.
      </div>
    </div>
  );
};
