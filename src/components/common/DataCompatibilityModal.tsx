import React, { useState, useMemo, useEffect } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { calculateBMI } from '../../science/bmi';
import { calculateBMR } from '../../science/bmr';
import { calculateTDEE } from '../../science/tdee';
import { calculateDynamicHydration } from '../../science/hydration';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Scale,
  Ruler,
  Activity,
  Heart,
  Calendar,
  Save,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const DataCompatibilityModal: React.FC = () => {
  const {
    isQuickVerifyModalOpen,
    setIsQuickVerifyModalOpen,
    identity,
    profile,
    latestBodyRecord,
    confirmDataCompatibility,
  } = useGymLabs();

  if (!isQuickVerifyModalOpen) return null;

  const initialWeight = identity.weightKg || latestBodyRecord?.weightKg?.value || 75;
  const initialHeight = identity.heightCm || 175;
  const initialSex = identity.biologicalSex === 'FEMALE' ? 'FEMALE' : 'MALE';
  const initialActivity = profile.activityLevel || 'MODERATELY_ACTIVE';
  const initialDob = identity.dateOfBirth || '1996-05-14';

  const [weight, setWeight] = useState<number>(initialWeight);
  const [height, setHeight] = useState<number>(initialHeight);
  const [sex, setSex] = useState<'MALE' | 'FEMALE'>(initialSex);
  const [activity, setActivity] = useState<any>(initialActivity);
  const [dob, setDob] = useState<string>(initialDob);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Sync state if initial identity updates
  useEffect(() => {
    setWeight(initialWeight);
    setHeight(initialHeight);
    setSex(initialSex);
    setActivity(initialActivity);
    setDob(initialDob);
  }, [initialWeight, initialHeight, initialSex, initialActivity, initialDob]);

  // Calculate age from DOB
  const calculatedAge = useMemo(() => {
    if (!dob) return 28;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(12, Math.min(120, age || 28));
  }, [dob]);

  // Deterministic calculations
  const bmiResult = useMemo(() => {
    return calculateBMI(weight, height);
  }, [weight, height]);

  const bmrResult = useMemo(() => {
    return calculateBMR({
      weightKg: weight,
      heightCm: height,
      ageYears: calculatedAge,
      biologicalSex: sex,
    });
  }, [weight, height, calculatedAge, sex]);

  const tdeeResult = useMemo(() => {
    return calculateTDEE(
      {
        weightKg: weight,
        heightCm: height,
        ageYears: calculatedAge,
        biologicalSex: sex,
      },
      activity
    );
  }, [weight, height, calculatedAge, sex, activity]);

  const dynamicWaterResult = useMemo(() => {
    return calculateDynamicHydration({
      weightKg: weight,
      ambientTempC: 26,
      workoutDurationMinutes: 0,
      sweatRate: 'MODERATE',
      takingCreatine: false,
    });
  }, [weight]);

  const handleConfirmSame = () => {
    confirmDataCompatibility();
    setFeedbackSuccess('Dados revalidados! Seus parâmetros continuam 100% sincronizados pelos próximos 14 dias.');
    setTimeout(() => {
      setFeedbackSuccess(null);
      setIsQuickVerifyModalOpen(false);
    }, 1200);
  };

  const handleSaveUpdated = (e: React.FormEvent) => {
    e.preventDefault();
    confirmDataCompatibility({
      weightKg: Number(weight),
      heightCm: Number(height),
      biologicalSex: sex,
      activityLevel: activity,
    });
    setFeedbackSuccess('Parâmetros fisiológicos atualizados com sucesso e histórico revalidado!');
    setTimeout(() => {
      setFeedbackSuccess(null);
      setIsQuickVerifyModalOpen(false);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-zinc-950 border-2 border-zinc-700 max-w-xl w-full p-5 sm:p-6 text-zinc-100 font-mono shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide text-white uppercase">
                Verificação de Compatibilidade de Dados
              </h2>
              <p className="text-[10px] text-zinc-400">
                Checagem periódica dos parâmetros fisiológicos do atleta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQuickVerifyModalOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
            title="Fechar verificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedbackSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-950 border border-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">{feedbackSuccess}</h3>
            <span className="text-xs text-zinc-400">Fechando modal de verificação...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveUpdated} className="space-y-4">
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
              O organismo oscila frequentemente de peso, composição corporal e rotina. Confirme ou ajuste seus dados abaixo para assegurar que seus cálculos matemáticos de TDEE, BMR e água permaneçam fidedignos.
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Peso */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                  <Scale className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Peso Atual (kg) *</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="350"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white font-bold focus:border-white focus:outline-none"
                  required
                />
              </div>

              {/* Altura */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                  <Ruler className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Altura (cm) *</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white font-bold focus:border-white focus:outline-none"
                  required
                />
              </div>

              {/* Sexo Biológico */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                  <Heart className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Sexo Biológico *</span>
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white font-bold focus:border-white focus:outline-none"
                >
                  <option value="MALE">MASCULINO (FÓRMULA MIFFLIN)</option>
                  <option value="FEMALE">FEMININO (FÓRMULA MIFFLIN)</option>
                </select>
              </div>

              {/* Nível de Atividade */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                  <Activity className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Nível de Atividade Diária *</span>
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-black border border-zinc-700 px-3 py-2 text-white font-bold focus:border-white focus:outline-none text-[11px]"
                >
                  <option value="SEDENTARY">Sedentário (x1.20)</option>
                  <option value="LIGHTLY_ACTIVE">Levemente Ativo (x1.375)</option>
                  <option value="MODERATELY_ACTIVE">Moderadamente Ativo (x1.55)</option>
                  <option value="VERY_ACTIVE">Muito Ativo (x1.725)</option>
                  <option value="EXTREMELY_ACTIVE">Extremamente Ativo (x1.90)</option>
                </select>
              </div>
            </div>

            {/* Live Deterministic Preview */}
            <div className="p-3.5 bg-black border border-zinc-800 space-y-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                PRÉ-VISUALIZAÇÃO MATEMÁTICA RESULTANTE
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-zinc-950 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase block">IMC</span>
                  <span className="text-sm font-black text-white">{bmiResult.result?.bmi || '--'}</span>
                  <span className="text-[8px] text-zinc-400 block truncate">{bmiResult.result?.category || 'NORMAL'}</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase block">BMR BASAL</span>
                  <span className="text-sm font-black text-white">{bmrResult.result || '--'}</span>
                  <span className="text-[8px] text-zinc-400 block">kcal/dia</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase block">TDEE GASTO</span>
                  <span className="text-sm font-black text-white">{tdeeResult.result || '--'}</span>
                  <span className="text-[8px] text-zinc-400 block">kcal/dia</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase block">ÁGUA RECOM.</span>
                  <span className="text-sm font-black text-white">{dynamicWaterResult.baselineMl || '--'}</span>
                  <span className="text-[8px] text-zinc-400 block">ml/dia</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleConfirmSame}
                className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirmar Dados Compatíveis</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
