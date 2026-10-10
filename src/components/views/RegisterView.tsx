import React, { useState, useMemo, useRef } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { UserRole } from '../../types/user';
import {
  UserPlus,
  ArrowLeft,
  AlertCircle,
  Dumbbell,
  Award,
  Building2,
  FileCheck,
  Check,
  Wand2,
  CheckCircle2,
  ArrowRight,
  Flame,
  Activity,
  Ruler,
  ChevronDown,
  ChevronUp,
  Scale,
  Heart,
  Droplets,
  Info,
  Calendar,
} from 'lucide-react';

export const RegisterView: React.FC = () => {
  const {
    register,
    setAuthView,
    authProduct,
    goToLoginWithProduct,
    quickAccessSampleAccount,
  } = useGymLabs();

  const activeProduct = authProduct || 'USER';

  // Professional role toggle (only used if activeProduct === 'PROFESSIONAL')
  const [proRole, setProRole] = useState<'COACH' | 'NUTRITIONIST'>('COACH');

  // Form Fields - Basic Credentials
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('');

  // Professional Verification Fields
  const [crefNumber, setCrefNumber] = useState<string>('');
  const [crnNumber, setCrnNumber] = useState<string>('');

  // Gym Verification Fields
  const [gymName, setGymName] = useState<string>('');
  const [gymCnpj, setGymCnpj] = useState<string>('');

  // Mandatory Biometrics for Conventional User (Athlete)
  const [biologicalSex, setBiologicalSex] = useState<'MALE' | 'FEMALE' | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [dobDisplay, setDobDisplay] = useState<string>('');
  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleDobTextChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    setDobDisplay(formatted);

    if (digits.length === 8) {
      const d = parseInt(digits.slice(0, 2), 10);
      const m = parseInt(digits.slice(2, 4), 10);
      const y = parseInt(digits.slice(4, 8), 10);
      const currentYear = new Date().getFullYear();

      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= currentYear) {
        const iso = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        setDateOfBirth(iso);
        return;
      }
    }
    setDateOfBirth('');
  };

  const handleDatePickerChange = (isoValue: string) => {
    setDateOfBirth(isoValue);
    if (isoValue && isoValue.includes('-')) {
      const [y, m, d] = isoValue.split('-');
      setDobDisplay(`${d}/${m}/${y}`);
    } else {
      setDobDisplay('');
    }
  };
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<
    'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE' | ''
  >('');
  const [primaryGoal, setPrimaryGoal] = useState<
    'HYPERTROPHY' | 'STRENGTH' | 'FAT_LOSS' | 'LONGEVITY' | 'ENDURANCE' | 'MOBILITY' | ''
  >('');

  // Optional Measurements for Conventional User (Circumferences)
  const [showOptionalMeasurements, setShowOptionalMeasurements] = useState<boolean>(false);
  const [waistCm, setWaistCm] = useState<string>('');
  const [hipCm, setHipCm] = useState<string>('');
  const [chestCm, setChestCm] = useState<string>('');
  const [armCm, setArmCm] = useState<string>('');
  const [thighCm, setThighCm] = useState<string>('');
  const [neckCm, setNeckCm] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Scientific Previews (Demonstrates immediate deterministic utility to the athlete)
  const calculatedBaselines = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    if (!w || !h || isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || !biologicalSex) return null;

    let age = 26;
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      if (!isNaN(dob.getTime())) {
        age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
          age--;
        }
      }
    }

    // Mifflin-St Jeor formula
    const bmr =
      biologicalSex === 'MALE'
        ? 10 * w + 6.25 * h - 5 * age + 5
        : 10 * w + 6.25 * h - 5 * age - 161;

    // Activity multiplier
    const actMultipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9,
    };
    const mult = actMultipliers[activityLevel] || 1.55;
    const tdee = Math.round(bmr * mult);

    // BMI
    const hM = h / 100;
    const bmi = Number((w / (hM * hM)).toFixed(1));

    // Dynamic Base Hydration (approx 38ml/kg)
    const baseWaterMl = Math.round(w * 38);

    return {
      age,
      bmr: Math.round(bmr),
      tdee,
      bmi,
      baseWaterMl,
    };
  }, [weightKg, heightCm, biologicalSex, dateOfBirth, activityLevel]);

  const fillTestData = () => {
    if (activeProduct === 'PROFESSIONAL') {
      if (proRole === 'COACH') {
        setName('Dr. Lucas Silva');
        setEmail('lucas.personal@gymlabs.pro');
        setPassword('password123');
        setPin('2026');
        setCrefNumber('CREF 089142-G/SP');
      } else {
        setName('Elena Vance');
        setEmail('elena.nutri@gymlabs.pro');
        setPassword('password123');
        setPin('2026');
        setCrnNumber('CRN-3 48192');
      }
    } else if (activeProduct === 'GYM') {
      setGymName('Iron Prime CT');
      setGymCnpj('42.109.876/0001-20');
      setName('Carlos Silveira');
      setEmail('gestao@ironprime.com.br');
      setPassword('password123');
      setPin('2026');
    } else {
      setName('Alex Vance');
      setEmail('alex.atleta@gymlabs.com');
      setPassword('password123');
      setPin('2026');
      setBiologicalSex('MALE');
      setDateOfBirth('1998-05-20');
      setWeightKg('82.5');
      setHeightCm('180');
      setActivityLevel('MODERATELY_ACTIVE');
      setPrimaryGoal('HYPERTROPHY');
      // Optional measurements
      setWaistCm('82');
      setHipCm('98');
      setChestCm('104');
      setArmCm('38');
      setThighCm('58');
      setNeckCm('39');
      setShowOptionalMeasurements(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Basic Credentials Validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Informe o nome completo (mínimo 2 caracteres).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      setErrorMsg('Informe um e-mail válido (ex: seu.nome@exemplo.com).');
      return;
    }

    if (!password || password.trim().length < 6) {
      setErrorMsg('A senha de acesso é obrigatória (mínimo 6 caracteres).');
      return;
    }

    let userPin: string | undefined = undefined;
    if (pin && pin.trim().length > 0) {
      if (!/^\d{4}$/.test(pin.trim())) {
        setErrorMsg('O PIN rápido deve conter exatamente 4 dígitos numéricos.');
        return;
      }
      userPin = pin.trim();
    }

    // 2. Role Specific Verification
    let targetRole: UserRole = 'USER';
    if (activeProduct === 'PROFESSIONAL') {
      targetRole = proRole;
      if (proRole === 'COACH' && !crefNumber.trim()) {
        setErrorMsg('Informe seu registro profissional CREF com UF (Ex: CREF 049812-G/SP).');
        return;
      }
      if (proRole === 'NUTRITIONIST' && !crnNumber.trim()) {
        setErrorMsg('Informe seu registro profissional CRN com região (Ex: CRN-3 38192).');
        return;
      }
    } else if (activeProduct === 'GYM') {
      targetRole = 'GYM';
      if (!gymName.trim() || !gymCnpj.trim()) {
        setErrorMsg('Informe o nome da academia e o CNPJ / identificação da unidade.');
        return;
      }
    }

    // 3. Strict Mandatory Validation for Conventional User (Athlete)
    let parsedWeight: number | undefined;
    let parsedHeight: number | undefined;

    if (activeProduct === 'USER') {
      // Weight check
      parsedWeight = parseFloat(weightKg);
      if (isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 350) {
        setErrorMsg(
          'O peso corporal é obrigatório para os cálculos metabólicos de BMR, TDEE e hidratação. Informe um valor válido entre 30 kg e 350 kg.'
        );
        return;
      }

      // Height check
      parsedHeight = parseFloat(heightCm);
      if (isNaN(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
        setErrorMsg(
          'A altura é obrigatória para o cálculo de IMC e Taxa Metabólica Basal. Informe um valor válido entre 100 cm e 250 cm.'
        );
        return;
      }

      // Biological Sex check
      if (!biologicalSex || (biologicalSex !== 'MALE' && biologicalSex !== 'FEMALE')) {
        setErrorMsg('O sexo biológico é obrigatório para a equação de Mifflin-St Jeor.');
        return;
      }

      // Date of Birth / Age check
      if (!dateOfBirth) {
        setErrorMsg('A data de nascimento é obrigatória para cálculo da idade e gasto calórico.');
        return;
      }
      const dob = new Date(dateOfBirth);
      const now = new Date();
      if (isNaN(dob.getTime())) {
        setErrorMsg('Data de nascimento inválida.');
        return;
      }
      let userAge = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        userAge--;
      }
      if (userAge < 12 || userAge > 115) {
        setErrorMsg('A idade do atleta deve estar entre 12 e 115 anos para uso seguro do app.');
        return;
      }

      // Activity level check
      if (!activityLevel) {
        setErrorMsg(
          'O nível de atividade física é obrigatório para o cálculo do TDEE e metas calóricas.'
        );
        return;
      }

      // Goal check
      if (!primaryGoal) {
        setErrorMsg('Selecione seu objetivo principal de treino.');
        return;
      }
    }

    // 4. Optional Measurements (Medidas corporais opcionais)
    const measurements =
      activeProduct === 'USER'
        ? {
            waistCm: waistCm.trim() ? parseFloat(waistCm) : undefined,
            hipCm: hipCm.trim() ? parseFloat(hipCm) : undefined,
            chestCm: chestCm.trim() ? parseFloat(chestCm) : undefined,
            armCm: armCm.trim() ? parseFloat(armCm) : undefined,
            thighCm: thighCm.trim() ? parseFloat(thighCm) : undefined,
            neckCm: neckCm.trim() ? parseFloat(neckCm) : undefined,
          }
        : undefined;

    const professionalLicense =
      targetRole === 'COACH'
        ? crefNumber.trim()
        : targetRole === 'NUTRITIONIST'
        ? crnNumber.trim()
        : targetRole === 'GYM'
        ? gymCnpj.trim()
        : undefined;

    const res = register({
      name: targetRole === 'GYM' ? `${gymName.trim()} (Resp: ${name.trim()})` : name.trim(),
      email: (email || '').trim().toLowerCase(),
      password: password.trim(),
      pin: userPin,
      role: targetRole,
      biologicalSex: targetRole === 'USER' && (biologicalSex === 'MALE' || biologicalSex === 'FEMALE') ? biologicalSex : undefined,
      dateOfBirth: targetRole === 'USER' && dateOfBirth ? dateOfBirth : undefined,
      weightKg: targetRole === 'USER' ? parsedWeight : undefined,
      heightCm: targetRole === 'USER' ? parsedHeight : undefined,
      activityLevel: targetRole === 'USER' && activityLevel ? (activityLevel as any) : undefined,
      primaryGoal: targetRole === 'USER' && primaryGoal ? (primaryGoal as any) : undefined,
      measurements,
      professionalLicense,
      organizationName: targetRole === 'GYM' ? gymName.trim() : undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao registrar conta.');
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
          <span className="text-zinc-500">JÁ TEM CONTA?</span>
          <button
            type="button"
            onClick={() => goToLoginWithProduct(activeProduct)}
            className="text-white hover:underline font-bold cursor-pointer"
          >
            FAZER LOGIN
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto my-6 space-y-6">
        {/* Dynamic App Title */}
        <div className="text-center space-y-2">
          {activeProduct === 'USER' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase">
                <Dumbbell className="w-3.5 h-3.5 text-white" />
                <span>APP DO ATLETA // NOVO CADASTRO</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Criar Conta de Atleta
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto">
                Configure seu perfil individual. O app valida os dados fisiológicos essenciais (peso, altura, idade, sexo e rotina) para calibrar suas equações determinísticas de treino e nutrição.
              </p>
            </>
          )}

          {activeProduct === 'PROFESSIONAL' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase">
                <Award className="w-3.5 h-3.5 text-white" />
                <span>APP PRO SUITE // CADASTRO PROFISSIONAL</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white">
                Credenciar Profissional do Corpo
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Prescreva treinos (CREF) ou planos alimentares (CRN) com acompanhamento direto de alunos.
              </p>
            </>
          )}

          {activeProduct === 'GYM' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-bold uppercase">
                <Building2 className="w-3.5 h-3.5 text-white" />
                <span>APP ENTERPRISE HUB // CADASTRO DE ACADEMIA</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white">
                Credenciamento da Unidade
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Cadastre seu centro de treinamento ou rede para coordenação de personais e retenção de alunos.
              </p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-black border-2 border-white text-xs text-white flex items-start gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-white mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-bold uppercase text-[11px]">Dado Pendente ou Inválido:</strong>
              <span className="font-sans leading-relaxed">{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Quick Test Helper */}
        <div className="p-3.5 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Sem dados reais para cadastrar agora?</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 uppercase font-bold">
              MODO TESTE
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Você não precisa de documentos ou balança agora para explorar. Preencha todos os campos validados com 1 clique ou acerte a tela imediatamente:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={fillTestData}
              className="flex-1 py-2 px-3 bg-black border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Preencher com Dados Válidos</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeProduct === 'PROFESSIONAL') {
                  quickAccessSampleAccount(proRole);
                } else if (activeProduct === 'GYM') {
                  quickAccessSampleAccount('GYM');
                } else {
                  quickAccessSampleAccount('USER');
                }
              }}
              className="flex-1 py-2 px-3 bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <span>Acessar Direto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-zinc-950 border border-zinc-800 space-y-6 shadow-xl">
          {/* Sub-role selector ONLY for Pro Suite (Personal vs Nutritionist) */}
          {activeProduct === 'PROFESSIONAL' && (
            <div className="space-y-2 pb-3 border-b border-zinc-900">
              <label className="block text-[10px] uppercase font-bold text-zinc-400">
                Selecione sua Habilitação Profissional:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProRole('COACH')}
                  className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    proRole === 'COACH'
                      ? 'border-white bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-bold uppercase">Personal Trainer</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-sans mt-1">Exige CREF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProRole('NUTRITIONIST')}
                  className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    proRole === 'NUTRITIONIST'
                      ? 'border-white bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-bold uppercase">Nutricionista</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-sans mt-1">Exige CRN</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Credentials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-900">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                1. Credenciais de Acesso
              </span>
              <span className="text-[9px] text-zinc-600 font-sans">* Campos Obrigatórios</span>
            </div>

            {/* Gym specific fields */}
            {activeProduct === 'GYM' && (
              <>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Nome da Unidade / Academia *
                  </label>
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    placeholder="Ex: Iron Prime CT"
                    className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
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
                    className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                {activeProduct === 'GYM' ? 'Nome do Gestor / Responsável *' : 'Nome Completo *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={activeProduct === 'GYM' ? 'Ex: Carlos Silveira' : 'Ex: Alex Vance'}
                className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                {activeProduct === 'GYM' ? 'E-mail de Acesso da Unidade *' : 'E-mail de Acesso *'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
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
                  placeholder="Opcional (4 dígitos)"
                  className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
              </div>
            </div>

            {/* Professional Specific Verification */}
            {activeProduct === 'PROFESSIONAL' && proRole === 'COACH' && (
              <div className="p-3 bg-black border border-zinc-800 space-y-1.5">
                <label className="block text-zinc-300 uppercase text-[10px] font-bold">
                  Número de Registro CREF com UF *
                </label>
                <input
                  type="text"
                  required
                  value={crefNumber}
                  onChange={(e) => setCrefNumber(e.target.value)}
                  placeholder="Ex: CREF 089142-G/SP"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
                <span className="text-[10px] text-zinc-500 font-sans block">
                  Exigido para validação do prontuário e prescrição de cargas ACWR.
                </span>
              </div>
            )}

            {activeProduct === 'PROFESSIONAL' && proRole === 'NUTRITIONIST' && (
              <div className="p-3 bg-black border border-zinc-800 space-y-1.5">
                <label className="block text-zinc-300 uppercase text-[10px] font-bold">
                  Número de Registro CRN com Região *
                </label>
                <input
                  type="text"
                  required
                  value={crnNumber}
                  onChange={(e) => setCrnNumber(e.target.value)}
                  placeholder="Ex: CRN-3 48192"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
                <span className="text-[10px] text-zinc-500 font-sans block">
                  Exigido para prescrição de macronutrientes e acompanhamento dietético.
                </span>
              </div>
            )}
          </div>

          {/* Section 2: MANDATORY Biometrics & Activity for Conventional User (Athlete) */}
          {activeProduct === 'USER' && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-900">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] uppercase font-bold text-white tracking-wider">
                    2. Dados Fisiológicos Essenciais (Obrigatórios)
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-white font-bold uppercase">
                  MÍNIMO PARA OPERAR
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                O Gym Labs utiliza equações científicas determinísticas (Mifflin-St Jeor, Tanaka, Armstrong). Os dados abaixo são <strong>indispensáveis</strong> para o cálculo basal do seu metabolismo, gasto calórico diário e zonas de treino:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Biological Sex */}
                <div>
                  <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold">
                    Sexo Biológico * <span className="text-[9px] text-zinc-500 font-sans">(Fórmula Mifflin)</span>
                  </label>
                  <select
                    value={biologicalSex}
                    onChange={(e) => setBiologicalSex(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                  >
                    <option value="">Selecione o sexo biológico...</option>
                    <option value="MALE">Masculino (Cálculo BMR MSJ Homem)</option>
                    <option value="FEMALE">Feminino (Cálculo BMR MSJ Mulher)</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center justify-between">
                    <span>
                      Data de Nascimento * <span className="text-[9px] text-zinc-500 font-sans">(Idade & FC Máx)</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">DD/MM/AAAA</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="DD/MM/AAAA (ex: 20/05/1998)"
                      maxLength={10}
                      value={dobDisplay}
                      onChange={(e) => handleDobTextChange(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono placeholder:text-zinc-600"
                    />
                    {/* Hidden native date picker accessible via calendar button */}
                    <input
                      ref={datePickerRef}
                      type="date"
                      tabIndex={-1}
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                      value={dateOfBirth}
                      onChange={(e) => handleDatePickerChange(e.target.value)}
                      className="absolute right-2 opacity-0 w-6 h-6 pointer-events-none"
                      style={{ colorScheme: 'dark' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (datePickerRef.current && 'showPicker' in datePickerRef.current) {
                            (datePickerRef.current as any).showPicker();
                          } else {
                            datePickerRef.current?.focus();
                          }
                        } catch {
                          datePickerRef.current?.focus();
                        }
                      }}
                      className="absolute right-2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Abrir calendário para selecionar"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                  {calculatedBaselines ? (
                    <span className="text-[10px] text-emerald-400 font-sans mt-1 block">
                      Idade calculada: <strong>{calculatedBaselines.age} anos</strong>
                    </span>
                  ) : dobDisplay.length === 10 && !dateOfBirth ? (
                    <span className="text-[10px] text-red-400 font-sans mt-1 block">
                      Data inválida. Digite uma data real entre 1900 e hoje.
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 font-sans mt-0.5 block">
                      Digite os dígitos diretamente ou selecione no calendário.
                    </span>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center justify-between">
                    <span>Peso Atual (kg) *</span>
                    <Scale className="w-3 h-3 text-zinc-500" />
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="350"
                    required
                    placeholder="Ex: 75.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center justify-between">
                    <span>Altura Atual (cm) *</span>
                    <Ruler className="w-3 h-3 text-zinc-500" />
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="100"
                    max="250"
                    required
                    placeholder="Ex: 175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold">
                  Nível de Atividade Física / Rotina * <span className="text-[9px] text-zinc-500 font-sans">(Fator Multiplicador TDEE)</span>
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                >
                  <option value="">Selecione o nível de atividade física...</option>
                  <option value="SEDENTARY">Sedentário — Trabalho sentado, pouco/nenhum exercício (x1.20)</option>
                  <option value="LIGHTLY_ACTIVE">Levemente Ativo — Exercício leve ou caminhada 1 a 3 dias/semana (x1.375)</option>
                  <option value="MODERATELY_ACTIVE">Moderadamente Ativo — Treino de musculação/cardio 3 a 5 dias/semana (x1.55)</option>
                  <option value="VERY_ACTIVE">Muito Ativo — Treino pesado diário ou 6 a 7 dias/semana (x1.725)</option>
                  <option value="EXTREMELY_ACTIVE">Extremamente Ativo — Atleta de elite, trabalho braçal intenso ou 2x/dia (x1.90)</option>
                </select>
              </div>

              {/* Primary Goal */}
              <div>
                <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold">
                  Objetivo Principal de Treino *
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-black border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                >
                  <option value="">Selecione o objetivo de treino...</option>
                  <option value="HYPERTROPHY">Hipertrofia Muscular (Ganho de Massa Magra)</option>
                  <option value="STRENGTH">Força Máxima (Progressão Neural & Cargas)</option>
                  <option value="FAT_LOSS">Emagrecimento / Definição (Déficit Calórico Orientado)</option>
                  <option value="LONGEVITY">Saúde Geral & Longevidade (Cardiometabólico)</option>
                  <option value="ENDURANCE">Resistência Aeróbica (Endurance / Corrida)</option>
                  <option value="MOBILITY">Mobilidade & Funcional</option>
                </select>
              </div>

              {/* Real-time Scientific Validation Pill Summary */}
              {calculatedBaselines && (
                <div className="p-3 bg-black border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-white" />
                      <span>Diagnóstico Determinístico em Tempo Real:</span>
                    </span>
                    <span className="text-zinc-300 font-bold">100% EXATO</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 bg-zinc-950 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 uppercase block font-bold">BMR Basal</span>
                      <strong className="text-xs text-white">{calculatedBaselines.bmr} kcal</strong>
                    </div>

                    <div className="p-2 bg-zinc-950 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 uppercase block font-bold">TDEE Gasto</span>
                      <strong className="text-xs text-white">{calculatedBaselines.tdee} kcal</strong>
                    </div>

                    <div className="p-2 bg-zinc-950 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 uppercase block font-bold">IMC Inicial</span>
                      <strong className="text-xs text-white">{calculatedBaselines.bmi} kg/m²</strong>
                    </div>

                    <div className="p-2 bg-zinc-950 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 uppercase block font-bold">Água Base</span>
                      <strong className="text-xs text-white">{calculatedBaselines.baseWaterMl} ml</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: OPTIONAL Body Measurements (Medidas Opcionais) */}
              <div className="p-4 bg-black border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-white" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        3. Medidas Corporais Antropométricas
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-sans block">
                        Nem todo mundo tem fita métrica agora. Fique tranquilo, são opcionais!
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOptionalMeasurements((prev) => !prev)}
                    className="px-2.5 py-1.5 border border-zinc-700 hover:border-white text-[10px] text-white font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>{showOptionalMeasurements ? 'RECOLHER' : 'PREENCHER AGORA'}</span>
                    {showOptionalMeasurements ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                    100% OPCIONAL
                  </span>
                  <span className="text-[10px] text-zinc-500 font-sans">
                    Você pode ignorar agora e registrar quando quiser na aba Saúde &gt; Corporal.
                  </span>
                </div>

                {showOptionalMeasurements && (
                  <div className="pt-3 border-t border-zinc-900 space-y-3">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 font-sans flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-white mt-0.5" />
                      <span>
                        Se você tiver uma fita métrica em mãos, insira as circunferências em centímetros (cm). Se não tiver, deixe em branco e finalize o cadastro.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1 font-bold">
                          Cintura (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 82"
                          value={waistCm}
                          onChange={(e) => setWaistCm(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1 font-bold">
                          Quadril (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 98"
                          value={hipCm}
                          onChange={(e) => setHipCm(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1 font-bold">
                          Tórax / Peito (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 104"
                          value={chestCm}
                          onChange={(e) => setChestCm(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1 font-bold">
                          Braço (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 38"
                          value={armCm}
                          onChange={(e) => setArmCm(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1 font-bold">
                          Coxa (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 58"
                          value={thighCm}
                          onChange={(e) => setThighCm(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase text-[9px] mb-1 font-bold">
                          Pescoço (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 39"
                          value={neckCm}
                          onChange={(e) => setNeckCm(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 text-white focus:border-white outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] mt-6"
          >
            <UserPlus className="w-4 h-4" />
            <span>CRIAR CONTA & ENTRAR NO APP</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setAuthView('landing')}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
          >
            ← Deseja conhecer outro aplicativo? Voltar à capa
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-xl w-full mx-auto text-center pt-6 border-t border-zinc-900 text-[11px] text-zinc-600">
        Gym Labs // 2026. Conforme LGPD e parâmetros fisiológicos internacionais.
      </div>
    </div>
  );
};
