import React, { useState, useMemo } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Settings,
  Globe,
  User,
  Check,
  Save,
  Users,
  UserCheck,
  UserPlus,
  Trash2,
  Lock,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Scale,
  Ruler,
  Activity,
  Flame,
  Calendar,
  Heart,
  X,
  CheckCircle2,
  Bell,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { UserIdentity, UserProfile } from '../../types/user';

export const SettingsView: React.FC = () => {
  const {
    identity,
    updateIdentity,
    updateAccountEmail,
    profile,
    updateProfile,
    savedAccounts,
    activeAccountId,
    activeAccount,
    switchAccount,
    openAccountModal,
    removeSavedAccount,
    bodyRecords,
    addBodyRecord,
    notifications,
    unreadNotificationsCount,
    setIsNotificationCenterOpen,
    setIsQuickVerifyModalOpen,
    clearAllNotifications,
    triggerPeriodicCheckSimulation,
  } = useGymLabs();

  // Read initial physiological baseline
  const initialWeight = bodyRecords[0]?.weightKg?.value || identity.weightKg || 75;
  const initialHeight = bodyRecords[0]?.heightCm?.value || identity.heightCm || 175;

  // Editable Mandatory Biological Constants
  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [heightCm, setHeightCm] = useState<number>(initialHeight);
  const [dateOfBirth, setDateOfBirth] = useState<string>(identity.dateOfBirth || '1998-05-20');
  const [biologicalSex, setBiologicalSex] = useState<UserIdentity['biologicalSex']>(
    identity.biologicalSex || 'MALE'
  );
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(
    profile.activityLevel || 'MODERATELY_ACTIVE'
  );
  const [primaryGoal, setPrimaryGoal] = useState<UserProfile['primaryGoal']>(
    profile.primaryGoal || 'HYPERTROPHY'
  );
  const [preferredName, setPreferredName] = useState<string>(identity.preferredName || '');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Secure Email Rotation Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [confirmNewEmail, setConfirmNewEmail] = useState<string>('');
  const [emailSecurityError, setEmailSecurityError] = useState<string | null>(null);
  const [emailSecuritySuccess, setEmailSecuritySuccess] = useState<string | null>(null);

  // Live preview of updated scientific parameters
  const liveEstimates = useMemo(() => {
    const w = Number(weightKg);
    const h = Number(heightCm);
    if (!w || !h || isNaN(w) || isNaN(h)) return null;

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

    const bmr =
      biologicalSex === 'MALE'
        ? 10 * w + 6.25 * h - 5 * age + 5
        : 10 * w + 6.25 * h - 5 * age - 161;

    const mults: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9,
    };
    const mult = mults[activityLevel] || 1.55;
    const tdee = Math.round(bmr * mult);
    const bmi = Number((w / ((h / 100) * (h / 100))).toFixed(1));

    return {
      age,
      bmr: Math.round(bmr),
      tdee,
      bmi,
    };
  }, [weightKg, heightCm, biologicalSex, dateOfBirth, activityLevel]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate physiological limits
    if (!weightKg || weightKg < 30 || weightKg > 350) {
      setErrorMsg('Peso inválido. Informe um valor entre 30 kg e 350 kg.');
      return;
    }

    if (!heightCm || heightCm < 100 || heightCm > 250) {
      setErrorMsg('Altura inválida. Informe um valor entre 100 cm e 250 cm.');
      return;
    }

    if (!dateOfBirth) {
      setErrorMsg('A data de nascimento é obrigatória para o cálculo metabólico.');
      return;
    }

    // 1. Update Identity
    updateIdentity({
      preferredName: preferredName.trim() || undefined,
      dateOfBirth,
      biologicalSex,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
    });

    // 2. Update Profile
    updateProfile({
      activityLevel,
      primaryGoal,
    });

    // 3. Add fresh body composition record if weight or height changed
    const nowIso = new Date().toISOString();
    addBodyRecord({
      id: `bdy_set_${Date.now()}`,
      userId: identity.id,
      timestamp: nowIso,
      method: 'SELF_REPORT',
      weightKg: {
        value: Number(weightKg),
        unit: 'kg',
        provenance: {
          type: 'REAL',
          source: 'Ajuste Cadastral em Configurações',
          recordedAt: nowIso,
          confidence: 'HIGH',
        },
      },
      heightCm: {
        value: Number(heightCm),
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Ajuste Cadastral em Configurações',
          recordedAt: nowIso,
          confidence: 'HIGH',
        },
      },
      provenance: {
        type: 'REAL',
        source: 'Ajuste Cadastral em Configurações',
        recordedAt: nowIso,
        confidence: 'HIGH',
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleExecuteEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSecurityError(null);
    setEmailSecuritySuccess(null);

    if (!currentPassword) {
      setEmailSecurityError('Digite a sua senha de acesso atual para autorizar a operação.');
      return;
    }

    const cleanEmail = (newEmail || '').toLowerCase().trim();
    const cleanConfirm = (confirmNewEmail || '').toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailSecurityError('Digite um novo e-mail válido (ex: seu.novo.email@exemplo.com).');
      return;
    }

    if (cleanEmail !== cleanConfirm) {
      setEmailSecurityError('Os dois campos do novo e-mail não coincidem.');
      return;
    }

    if (cleanEmail === identity.email.toLowerCase()) {
      setEmailSecurityError('O novo e-mail informado é igual ao e-mail atual da conta.');
      return;
    }

    const res = updateAccountEmail(cleanEmail, currentPassword);
    if (!res.success) {
      setEmailSecurityError(res.error || 'Falha ao atualizar e-mail.');
      return;
    }

    setEmailSecuritySuccess(`E-mail de acesso atualizado com sucesso para: ${cleanEmail}`);
    setCurrentPassword('');
    setNewEmail('');
    setConfirmNewEmail('');
    setTimeout(() => {
      setIsEmailModalOpen(false);
      setEmailSecuritySuccess(null);
    }, 2500);
  };

  return (
    <div id="gymlabs-settings-view" className="space-y-6 max-w-5xl mx-auto font-mono select-none">
      {/* Header Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Configurações & Parâmetros Fisiológicos
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              CONTA & DADOS OBRIGATÓRIOS
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Dados do Cadastro & Constantes Corporais
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-2xl">
            Edite e calibre os parâmetros obrigatórios do sistema (peso, altura, sexo, idade e atividade física) para garantir a precisão matemática dos cálculos de BMR, TDEE e IMC.
          </p>
        </div>

        {savedAccounts.length > 1 && (
          <button
            type="button"
            onClick={openAccountModal}
            className="px-4 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>TROCAR PERFIL ({savedAccounts.length})</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-black border-2 border-white text-xs text-white flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-white shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Non-editable Identity Fields with Secure Email Recovery Flow */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              1. Identidade Oficial & Chave de Acesso (Dados Protegidos)
            </h3>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold uppercase flex items-center gap-1">
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>PROTEGIDO CONTRA ALTERAÇÃO DIRETA</span>
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Por integridade cadastral e segurança da conta, o <strong>Nome Oficial</strong> e o <strong>E-mail</strong> são chaves primárias protegidas. Se você perdeu o acesso ao e-mail cadastrado ou precisa substituí-lo, utilize o procedimento seguro abaixo com validação de senha.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Official Name (Locked) */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Nome Oficial Registrado</span>
              <Lock className="w-3 h-3 text-zinc-600" />
            </div>
            <div className="text-sm font-bold text-zinc-200 uppercase font-mono">
              {identity.name}
            </div>
            <span className="text-[10px] text-zinc-600 font-sans block">
              Registro imutável para validade de prontuário e prescrições.
            </span>
          </div>

          {/* Email (Locked with Secure Change Button) */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">E-mail Primário de Login</span>
              <Lock className="w-3 h-3 text-zinc-600" />
            </div>
            <div className="text-sm font-bold text-zinc-200 font-mono truncate">
              {identity.email}
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmailSecurityError(null);
                  setEmailSecuritySuccess(null);
                  setIsEmailModalOpen(true);
                }}
                className="w-full py-1.5 px-3 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-black"
              >
                <KeyRound className="w-3 h-3" />
                <span>Alterar E-mail com Senha de Segurança</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preferred HUD Name (User can customize their display greeting) */}
        <div>
          <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
            Apelido / Nome de Preferência no HUD (Opcional)
          </label>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="Como você quer ser chamado na interface (ex: Alex)"
            className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white text-xs font-mono"
          />
        </div>
      </div>

      {/* Section 2: EDITABLE Mandatory Physiological Registration Data */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-white" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                2. Dados Cadastrais Fisiológicos Obrigatórios (Totalmente Editáveis)
              </h3>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-white font-bold uppercase">
              REQUISITOS DO SISTEMA
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Se o seu peso mudou, ou se você deseja ajustar seu nível de atividade física e objetivo, atualize os campos abaixo. O sistema recalculará imediatamente seu BMR, TDEE, IMC e metas nutricionais:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono"
              />
              <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">
                Base para BMR, hidratação e IMC.
              </span>
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
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono"
              />
              <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">
                Base para IMC e equações corporais.
              </span>
            </div>

            {/* Biological Sex */}
            <div>
              <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center justify-between">
                <span>Sexo Biológico *</span>
                <Heart className="w-3 h-3 text-zinc-500" />
              </label>
              <select
                value={biologicalSex}
                onChange={(e) => setBiologicalSex(e.target.value as any)}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono"
              >
                <option value="MALE">Masculino (MSJ Homem)</option>
                <option value="FEMALE">Feminino (MSJ Mulher)</option>
              </select>
              <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">
                Fórmula Mifflin-St Jeor.
              </span>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center justify-between">
                <span>Data de Nascimento *</span>
                <Calendar className="w-3 h-3 text-zinc-500" />
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono text-xs"
              />
              {liveEstimates && (
                <span className="text-[9px] text-zinc-400 font-sans block mt-0.5">
                  Idade calculada: <strong>{liveEstimates.age} anos</strong>
                </span>
              )}
            </div>

            {/* Activity Level */}
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center justify-between">
                <span>Nível de Atividade Física / Rotina *</span>
                <Activity className="w-3 h-3 text-zinc-500" />
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono"
              >
                <option value="SEDENTARY">Sedentário (x1.20 - Trabalho de escritório, pouco exercício)</option>
                <option value="LIGHTLY_ACTIVE">Levemente Ativo (x1.375 - Exercício leve 1 a 3x por semana)</option>
                <option value="MODERATELY_ACTIVE">Moderadamente Ativo (x1.55 - Treino consistente 3 a 5x por semana)</option>
                <option value="VERY_ACTIVE">Muito Ativo (x1.725 - Treinos intensos 6 a 7x por semana)</option>
                <option value="EXTREMELY_ACTIVE">Extremamente Ativo (x1.90 - Atleta duplo turno / trabalho braçal)</option>
              </select>
              <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">
                Multiplicador direto do Gasto Diário (TDEE).
              </span>
            </div>

            {/* Primary Goal */}
            <div className="sm:col-span-3">
              <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold">
                Objetivo Principal de Treino & Metabolismo *
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as any)}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono"
              >
                <option value="HYPERTROPHY">Hipertrofia Muscular (Foco em Ganho de Massa Magra / Superávit Leve)</option>
                <option value="STRENGTH">Força Máxima / Powerlifting (Sobrecarga Neural e Cargas 1RM)</option>
                <option value="FAT_LOSS">Emagrecimento & Definição (Déficit Calórico Orientado)</option>
                <option value="LONGEVITY">Saúde Cardiometabólica & Longevidade (Equilíbrio Geral)</option>
                <option value="ENDURANCE">Resistência Aeróbica / Corrida (Endurance)</option>
                <option value="MOBILITY">Mobilidade & Funcional</option>
              </select>
            </div>
          </div>

          {/* Live Recalculation Diagnostic Preview */}
          {liveEstimates && (
            <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Prévia Determinística dos Cálculos com seus Parâmetros:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-black border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Taxa Basal (BMR)</span>
                  <strong className="text-white text-xs">{liveEstimates.bmr} kcal/dia</strong>
                </div>
                <div className="p-2 bg-black border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Gasto Diário (TDEE)</span>
                  <strong className="text-white text-xs">{liveEstimates.tdee} kcal/dia</strong>
                </div>
                <div className="p-2 bg-black border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Índice IMC</span>
                  <strong className="text-white text-xs">{liveEstimates.bmi} kg/m²</strong>
                </div>
                <div className="p-2 bg-black border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Status dos Motores</span>
                  <strong className="text-white text-xs">100% CALIBRADO</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {savedSuccess && (
              <span className="text-xs text-white font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>PARÂMETROS CADASTRAIS ATUALIZADOS E RECALCULADOS!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SALVAR ALTERAÇÕES CADASTRAIS</span>
          </button>
        </div>
      </form>

      {/* Section 2.5: Verificação Periódica e Notificações do Sistema */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Verificação Periódica & Notificações do Sistema
            </h3>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-white font-bold uppercase">
            COMPATIBILIDADE CONTÍNUA
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          O aplicativo verifica a cada 14 dias se os seus dados biométricos e parâmetros corporais continuam compatíveis com sua rotina atual. Quando necessário, o sistema lança um pop-up de alerta na tela e guarda o histórico na barra superior (ao lado de Sair).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">Frequência de Checagem</span>
            <strong className="text-white text-xs">A cada 14 dias</strong>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">Caixa de Notificações</span>
            <strong className="text-white text-xs">{notifications.length} registros ({unreadNotificationsCount} novas)</strong>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">Estado dos Dados</span>
            <strong className="text-emerald-400 text-xs">Compatibilidade Ativa</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsQuickVerifyModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Abrir Verificação de Compatibilidade</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNotificationCenterOpen(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-white" />
            <span>Ver Caixa de Notificações</span>
          </button>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900 text-red-300 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Limpar Caixa</span>
            </button>
          )}

          <button
            type="button"
            onClick={triggerPeriodicCheckSimulation}
            className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Dispara teste de verificação periódica imediata"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Testar Pop-up Periódico</span>
          </button>
        </div>
      </div>

      {/* Section 3: Multi-Accounts Switcher on This Device */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              3. Perfis Salvos Neste Dispositivo ({savedAccounts.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={openAccountModal}
            className="px-3 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>GERENCIAR PERFIS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedAccounts.map((acc) => {
            const isCurrent = acc.id === activeAccountId;
            return (
              <div
                key={acc.id}
                className={`p-4 border transition-all ${
                  isCurrent
                    ? 'border-white bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'
                    : 'border-zinc-800 bg-black'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-zinc-700 bg-black flex items-center justify-center font-bold text-xs text-white">
                      {acc.name ? acc.name.substring(0, 2).toUpperCase() : 'GL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-white">{acc.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                            ATIVO
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-sans block">{acc.email}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">{acc.tagline || 'Atleta'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {savedAccounts.length > 1 && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => removeSavedAccount(acc.id)}
                        className="p-1 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                        title="Remover perfil deste dispositivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => switchAccount(acc.id)}
                    className="mt-3 w-full py-1.5 border border-zinc-700 hover:border-white text-[11px] font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer uppercase"
                  >
                    <span>Alternar para este perfil</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secure Email Change Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border-2 border-white p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  Alteração Segura de E-mail de Acesso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              O e-mail é a chave primária de identificação da sua conta. Para evitar riscos de perda de conta ou acesso não autorizado, informe sua senha de acesso atual para autorizar a substituição:
            </p>

            {emailSecurityError && (
              <div className="p-2.5 bg-black border border-white text-xs text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailSecurityError}</span>
              </div>
            )}

            {emailSecuritySuccess && (
              <div className="p-2.5 bg-black border border-white text-xs text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                <span>{emailSecuritySuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteEmailChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  E-mail Atual Cadastrado
                </label>
                <input
                  type="text"
                  disabled
                  value={identity.email}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-zinc-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold">
                  Novo E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  placeholder="novo.email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold">
                  Confirmação do Novo E-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="novo.email@exemplo.com"
                  value={confirmNewEmail}
                  onChange={(e) => setConfirmNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
              </div>

              <div className="pt-2 border-t border-zinc-900">
                <label className="block text-zinc-300 uppercase text-[10px] mb-1 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-white" />
                  <span>Senha de Acesso Atual (Autorização) *</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha cadastrada"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none font-mono text-xs"
                />
                {identity.isDemo && (
                  <span className="text-[9px] text-zinc-500 font-sans block mt-1">
                    Para contas de teste, a senha padrão é: <strong className="text-zinc-400">password123</strong>
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 py-2 border border-zinc-800 text-zinc-400 hover:text-white uppercase font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Confirmar Novo E-mail</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
