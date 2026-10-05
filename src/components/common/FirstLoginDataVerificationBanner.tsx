import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  CheckCircle2,
  AlertTriangle,
  Scale,
  Ruler,
  Activity,
  Heart,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Ruler as TapeMeasure,
  Info,
} from 'lucide-react';

export const FirstLoginDataVerificationBanner: React.FC = () => {
  const {
    identity,
    updateIdentity,
    profile,
    updateProfile,
    bodyRecords,
    addBodyRecord,
    circumferences,
    bmrCalculation,
    tdeeCalculation,
    bmiCalculation,
  } = useGymLabs();

  // Read current metrics
  const currentWeight = bodyRecords[0]?.weightKg?.value || identity.weightKg;
  const currentHeight = bodyRecords[0]?.heightCm?.value || identity.heightCm;
  const currentSex = identity.biologicalSex;
  const currentActivity = profile.activityLevel;
  const currentDob = identity.dateOfBirth;

  // Verification checks for minimal functional operation
  const isWeightValid = Boolean(currentWeight && currentWeight >= 30 && currentWeight <= 350);
  const isHeightValid = Boolean(currentHeight && currentHeight >= 100 && currentHeight <= 250);
  const isSexValid = currentSex === 'MALE' || currentSex === 'FEMALE';
  const isActivityValid = Boolean(currentActivity);
  const isDobValid = Boolean(currentDob);

  const isAllMandatoryValid =
    isWeightValid && isHeightValid && isSexValid && isActivityValid && isDobValid;

  const optionalMeasurementsCount = circumferences.length > 0 ? 1 : 0;

  // Local state for banner collapse / dismissal
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem(`gymlabs_verified_banner_${identity.id}`) === 'dismissed';
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);

  const isDemoUser = Boolean(identity.isDemo);

  // Form state for rapid completion if anything missing
  const [editWeight, setEditWeight] = useState<number | ''>(currentWeight || (isDemoUser ? 75 : ''));
  const [editHeight, setEditHeight] = useState<number | ''>(currentHeight || (isDemoUser ? 175 : ''));
  const [editSex, setEditSex] = useState<'MALE' | 'FEMALE' | ''>(
    currentSex === 'FEMALE' || currentSex === 'MALE' ? currentSex : (isDemoUser ? 'MALE' : '')
  );
  const [editDob, setEditDob] = useState<string>(currentDob || (isDemoUser ? '1998-05-20' : ''));
  const [editActivity, setEditActivity] = useState<string>(currentActivity || (isDemoUser ? 'MODERATELY_ACTIVE' : ''));

  if (isDismissed && isAllMandatoryValid) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`gymlabs_verified_banner_${identity.id}`, 'dismissed');
  };

  const handleSaveMissingData = (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();

    updateIdentity({
      biologicalSex: editSex,
      dateOfBirth: editDob,
      weightKg: Number(editWeight),
      heightCm: Number(editHeight),
    });

    updateProfile({
      activityLevel: editActivity,
    });

    addBodyRecord({
      id: `bdy_fix_${Date.now()}`,
      userId: identity.id,
      timestamp: nowIso,
      method: 'SELF_REPORT',
      weightKg: {
        value: Number(editWeight),
        unit: 'kg',
        provenance: {
          type: 'REAL',
          source: 'Verificação Cadastral Obrigatória',
          recordedAt: nowIso,
          confidence: 'HIGH',
        },
      },
      heightCm: {
        value: Number(editHeight),
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Verificação Cadastral Obrigatória',
          recordedAt: nowIso,
          confidence: 'HIGH',
        },
      },
      provenance: {
        type: 'REAL',
        source: 'Verificação Cadastral Obrigatória',
        recordedAt: nowIso,
        confidence: 'HIGH',
      },
    });

    setIsEditingModalOpen(false);
  };

  return (
    <>
      <div
        id="first-login-verification-card"
        className={`p-4 border transition-all ${
          isAllMandatoryValid
            ? 'bg-zinc-950 border-zinc-800'
            : 'bg-black border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 border shrink-0 ${
                isAllMandatoryValid
                  ? 'bg-black border-zinc-700 text-white'
                  : 'bg-white border-white text-black'
              }`}
            >
              {isAllMandatoryValid ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-black" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  // DIAGNÓSTICO DE PRIMEIRO CADASTRO
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 font-bold uppercase ${
                    isAllMandatoryValid
                      ? 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                      : 'bg-white text-black font-black'
                  }`}
                >
                  {isAllMandatoryValid
                    ? '100% VALIDADO PARA CÁLCULOS METABÓLICOS'
                    : 'DADOS OBRIGATÓRIOS PENDENTES'}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-tight">
                {isAllMandatoryValid
                  ? 'Todos os Dados Mínimos Obrigatórios Foram Verificados com Sucesso'
                  : 'Atenção: Complete os Parâmetros Obrigatórios para o App Funcionar'}
              </h3>

              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                {isAllMandatoryValid
                  ? 'Peso, altura, sexo biológico, idade e nível de atividade estão integrados aos motores Mifflin-St Jeor e TDEE. Medidas corporais continuam opcionais para você preencher quando quiser.'
                  : 'Para que as equações científicas determinísticas (BMR, TDEE, IMC, hidratação) funcionem com exatidão, o app requer minimamente os dados obrigatórios abaixo. Medidas corporais são opcionais.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!isAllMandatoryValid ? (
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(true)}
                className="px-3 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
              >
                <span>Completar Dados</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 text-[10px] text-zinc-300 font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'Recolher' : 'Verificar Parâmetros'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  title="Ocultar diagnóstico"
                  className="p-1.5 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Detailed Verification Checklist Grid */}
        {(isExpanded || !isAllMandatoryValid) && (
          <div className="mt-4 pt-3 border-t border-zinc-900 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              {/* Weight */}
              <div
                className={`p-2.5 border ${
                  isWeightValid
                    ? 'bg-black border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-white text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500 mb-1">
                  <span>Peso (Obrigatório)</span>
                  <Scale className="w-3 h-3 text-white" />
                </div>
                <strong className="block text-xs text-white">
                  {currentWeight ? `${currentWeight} kg` : 'NÃO INFORMADO'}
                </strong>
                <span className="text-[9px] font-sans text-zinc-400 block mt-0.5">
                  {isWeightValid ? '✓ Verificado' : '⚠️ Falta preencher'}
                </span>
              </div>

              {/* Height */}
              <div
                className={`p-2.5 border ${
                  isHeightValid
                    ? 'bg-black border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-white text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500 mb-1">
                  <span>Altura (Obrigatório)</span>
                  <Ruler className="w-3 h-3 text-white" />
                </div>
                <strong className="block text-xs text-white">
                  {currentHeight ? `${currentHeight} cm` : 'NÃO INFORMADA'}
                </strong>
                <span className="text-[9px] font-sans text-zinc-400 block mt-0.5">
                  {isHeightValid ? '✓ Verificado' : '⚠️ Falta preencher'}
                </span>
              </div>

              {/* Sex */}
              <div
                className={`p-2.5 border ${
                  isSexValid
                    ? 'bg-black border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-white text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500 mb-1">
                  <span>Sexo (Obrigatório)</span>
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <strong className="block text-xs text-white">
                  {currentSex === 'MALE'
                    ? 'MASCULINO'
                    : currentSex === 'FEMALE'
                    ? 'FEMININO'
                    : 'INDEFINIDO'}
                </strong>
                <span className="text-[9px] font-sans text-zinc-400 block mt-0.5">
                  {isSexValid ? '✓ Mifflin-St Jeor' : '⚠️ Falta definir'}
                </span>
              </div>

              {/* Activity */}
              <div
                className={`p-2.5 border ${
                  isActivityValid
                    ? 'bg-black border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-white text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500 mb-1">
                  <span>Atividade (Obrigatório)</span>
                  <Activity className="w-3 h-3 text-white" />
                </div>
                <strong className="block text-[11px] text-white truncate">
                  {currentActivity || 'INDEFINIDA'}
                </strong>
                <span className="text-[9px] font-sans text-zinc-400 block mt-0.5">
                  {isActivityValid ? '✓ Multiplicador TDEE' : '⚠️ Falta definir'}
                </span>
              </div>

              {/* Date of Birth */}
              <div
                className={`p-2.5 border ${
                  isDobValid
                    ? 'bg-black border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border-white text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500 mb-1">
                  <span>Idade / Data (Obrigatório)</span>
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <strong className="block text-xs text-white">
                  {currentDob || 'INDEFINIDA'}
                </strong>
                <span className="text-[9px] font-sans text-zinc-400 block mt-0.5">
                  {isDobValid ? '✓ Idade Ativa' : '⚠️ Falta definir'}
                </span>
              </div>

              {/* Optional Measurements */}
              <div className="p-2.5 border bg-black border-zinc-800 text-zinc-300">
                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-zinc-500 mb-1">
                  <span>Medidas (Opcional)</span>
                  <TapeMeasure className="w-3 h-3 text-zinc-400" />
                </div>
                <strong className="block text-xs text-white">
                  {optionalMeasurementsCount > 0 ? 'REGISTRADAS' : 'NÃO INFORMADAS'}
                </strong>
                <span className="text-[9px] font-sans text-zinc-400 block mt-0.5">
                  ✓ Opcional (adicione depois)
                </span>
              </div>
            </div>

            {/* Explanatory footer note */}
            <div className="p-2.5 bg-black border border-zinc-800 text-[11px] text-zinc-400 font-sans flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-white mt-0.5" />
              <span>
                <strong>Por que essa verificação existe?</strong> O ecossistema Gym Labs rejeita dados fictícios. Os dados mínimos garantem que seus cálculos de BMR ({bmrCalculation.result} kcal), TDEE ({tdeeCalculation.result} kcal) e IMC ({bmiCalculation.result.bmi}) sejam matematicamente exatos. As medidas antropométricas (cintura, quadril, tórax, braço) permanecem <strong>opcionais</strong> e podem ser preenchidas a qualquer hora na aba Corporal.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Completion Modal if user needs to fill missing data */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold uppercase text-white">
                  Completar Dados Básicos Obrigatórios
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMissingData} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="350"
                    required
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="100"
                    max="250"
                    required
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Sexo Biológico *
                  </label>
                  <select
                    value={editSex}
                    required
                    onChange={(e) => setEditSex(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Nível de Atividade Diária *
                </label>
                <select
                  value={editActivity}
                  onChange={(e) => setEditActivity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-white outline-none"
                >
                  <option value="SEDENTARY">Sedentário (x1.20)</option>
                  <option value="LIGHTLY_ACTIVE">Levemente Ativo (x1.375)</option>
                  <option value="MODERATELY_ACTIVE">Moderadamente Ativo (x1.55)</option>
                  <option value="VERY_ACTIVE">Muito Ativo (x1.725)</option>
                  <option value="EXTREMELY_ACTIVE">Extremamente Ativo (x1.90)</option>
                </select>
              </div>

              <div className="p-2 bg-black border border-zinc-800 text-[10px] text-zinc-400 font-sans">
                ℹ️ Medidas corporais (cintura, quadril, braço, tórax) são opcionais e podem ser registradas a qualquer momento na aba Saúde &gt; Corporal.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Dados</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
