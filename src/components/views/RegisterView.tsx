import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { UserRole } from '../../types/user';
import {
  UserPlus,
  ArrowLeft,
  Check,
  AlertCircle,
  Dumbbell,
  Users,
  Award,
  Building2,
  FileCheck
} from 'lucide-react';

export const RegisterView: React.FC = () => {
  const {
    register,
    setAuthView,
  } = useGymLabs();

  // Public roles only: NO ADMIN allowed here!
  const [role, setRole] = useState<'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM'>('USER');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('2026');

  // Professional Verification
  const [crefNumber, setCrefNumber] = useState<string>('');
  const [crnNumber, setCrnNumber] = useState<string>('');
  const [gymName, setGymName] = useState<string>('');
  const [gymCnpj, setGymCnpj] = useState<string>('');

  // Biometrics (For Conventional User)
  const [biologicalSex, setBiologicalSex] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState<string>('1998-05-20');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [primaryGoal, setPrimaryGoal] = useState<'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'LONGEVITY'>('HYPERTROPHY');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email) {
      setErrorMsg('Informe o nome e o e-mail.');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (role === 'COACH' && !crefNumber) {
      setErrorMsg('Informe seu número de registro profissional CREF com UF para validação.');
      return;
    }

    if (role === 'NUTRITIONIST' && !crnNumber) {
      setErrorMsg('Informe seu número de registro profissional CRN com região para validação.');
      return;
    }

    if (role === 'GYM' && (!gymName || !gymCnpj)) {
      setErrorMsg('Informe o nome da academia e o CNPJ / identificação da unidade.');
      return;
    }

    const professionalLicense =
      role === 'COACH' ? crefNumber : role === 'NUTRITIONIST' ? crnNumber : role === 'GYM' ? gymCnpj : undefined;

    const res = register({
      name: role === 'GYM' ? `${gymName} (Resp: ${name})` : name,
      email,
      password: password || 'password123',
      pin: pin || '2026',
      role: role as UserRole,
      biologicalSex,
      dateOfBirth,
      weightKg: role === 'USER' ? Number(weightKg) : undefined,
      heightCm: role === 'USER' ? Number(heightCm) : undefined,
      primaryGoal: role === 'USER' ? primaryGoal : undefined,
      professionalLicense,
      organizationName: role === 'GYM' ? gymName : undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao registrar conta.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setAuthView('landing')}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR AO INÍCIO</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500">JÁ POSSUI CONTA?</span>
          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="text-white hover:underline font-bold cursor-pointer"
          >
            FAZER LOGIN
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto my-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
            // CADASTRO NO SISTEMA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white">
            Criar Conta no Gym Labs
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Selecione seu tipo de acesso para carregar o aplicativo e as ferramentas correspondentes:
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-black border border-white text-xs text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 bg-zinc-950 border border-zinc-800 space-y-6">
          {/* 1. SELEÇÃO DO TIPO DE CONTA (SEM ADMIN) */}
          <div className="space-y-3">
            <label className="block text-xs uppercase font-bold text-white">
              1. Selecione seu Tipo de Acesso:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Usuário Convencional */}
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`p-3.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'USER'
                    ? 'border-white bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Usuário Convencional</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans mt-1">
                    Para quem treina: registro de cargas, 1RM, peso, nutrição e métricas pessoais.
                  </p>
                </div>
              </button>

              {/* Personal Trainer */}
              <button
                type="button"
                onClick={() => setRole('COACH')}
                className={`p-3.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'COACH'
                    ? 'border-white bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Personal Trainer</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans mt-1">
                    Requer verificação de CREF. Prescrição de treinos e acompanhamento de alunos.
                  </p>
                </div>
              </button>

              {/* Nutricionista */}
              <button
                type="button"
                onClick={() => setRole('NUTRITIONIST')}
                className={`p-3.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'NUTRITIONIST'
                    ? 'border-white bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Nutricionista</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans mt-1">
                    Requer verificação de CRN. Prescrição dietética, BMR/TDEE e pacientes.
                  </p>
                </div>
              </button>

              {/* Academia */}
              <button
                type="button"
                onClick={() => setRole('GYM')}
                className={`p-3.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'GYM'
                    ? 'border-white bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Academia / Unidade</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans mt-1">
                    Para academias gerenciarem sua equipe de personais, nutris e alunos.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. DADOS CADASTRAIS */}
          <div className="space-y-3 pt-3 border-t border-zinc-900">
            <label className="block text-xs uppercase font-bold text-white">
              2. Dados Cadastrais:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  {role === 'GYM' ? 'Nome do Responsável / Gestor *' : 'Nome Completo *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'GYM' ? 'Ex: Carlos Silveira' : 'Ex: Lucas Ferreira'}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  PIN Rápido (4 Dígitos)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                />
              </div>

              {/* Specific Field for Personal Trainer */}
              {role === 'COACH' && (
                <div className="sm:col-span-2 p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-[11px] text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Verificação Profissional de Educação Física</span>
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Registro CREF com UF *
                    </label>
                    <input
                      type="text"
                      required
                      value={crefNumber}
                      onChange={(e) => setCrefNumber(e.target.value)}
                      placeholder="Ex: CREF 049812-G/SP"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-sans block">
                    O registro será conferido para habilitação da ferramenta de prescrição aos alunos afiliados.
                  </span>
                </div>
              )}

              {/* Specific Field for Nutritionist */}
              {role === 'NUTRITIONIST' && (
                <div className="sm:col-span-2 p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-[11px] text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    <span>Verificação Profissional de Nutrição</span>
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Registro CRN com Região *
                    </label>
                    <input
                      type="text"
                      required
                      value={crnNumber}
                      onChange={(e) => setCrnNumber(e.target.value)}
                      placeholder="Ex: CRN-3 38192"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-sans block">
                    O registro será conferido para habilitação da ferramenta de prontuário e prescrição de macronutrientes.
                  </span>
                </div>
              )}

              {/* Specific Field for Gym */}
              {role === 'GYM' && (
                <div className="sm:col-span-2 p-3 bg-black border border-zinc-800 space-y-3">
                  <div className="text-[11px] text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Dados da Academia / Centro de Treinamento</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                        Nome da Unidade / Academia *
                      </label>
                      <input
                        type="text"
                        required
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="Ex: Iron Prime Gym"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                        CNPJ ou Identificação da Unidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={gymCnpj}
                        onChange={(e) => setGymCnpj(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. PARÂMETROS BIOLÓGICOS (Se for Usuário Convencional) */}
          {role === 'USER' && (
            <div className="space-y-3 pt-3 border-t border-zinc-900">
              <label className="block text-xs uppercase font-bold text-white">
                3. Parâmetros Físicos Iniciais (Opcionais):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Sexo Biológico
                  </label>
                  <select
                    value={biologicalSex}
                    onChange={(e) => setBiologicalSex(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Peso Inicial (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Foco Principal de Treinamento
                  </label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  >
                    <option value="HYPERTROPHY">Hipertrofia Muscular</option>
                    <option value="STRENGTH">Ganho de Força Máxima</option>
                    <option value="FAT_LOSS">Composição Corporal & Queima de Gordura</option>
                    <option value="LONGEVITY">Saúde Geral & Longevidade</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>FINALIZAR CADASTRO & ENTRAR</span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="max-w-3xl w-full mx-auto text-center pt-6 border-t border-zinc-900 text-xs text-zinc-500">
        Gym Labs // 2026 • Plataforma de Inteligência Fisiológica e Treino
      </div>
    </div>
  );
};
