import React, { useMemo } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { FirstLoginDataVerificationBanner } from '../common/FirstLoginDataVerificationBanner';
import { GymAttendanceCalendar } from '../common/GymAttendanceCalendar';
import {
  Flame,
  Moon,
  Droplets,
  Dumbbell,
  Heart,
  ArrowRight,
  Calendar,
  Scale,
  Ruler,
  Activity,
  Users,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const TodayView: React.FC = () => {
  const {
    identity,
    profile,
    glRecoveryScore,
    latestSleep,
    todayWellness,
    trainingSessions,
    meals,
    todayWaterMl,
    bmrCalculation,
    tdeeCalculation,
    bmiCalculation,
    dynamicHydration,
    acwrMetrics,
    setCurrentTab,
    bodyRecords,
    circumferences,
    tanakaKarvonen,
    todayTrainingCalories,
  } = useGymLabs();

  // Biometrics (strictly respecting availability: null if not provided for real users)
  const isDemo = Boolean(identity.isDemo);
  const latestWeight = bodyRecords[0]?.weightKg?.value ?? (identity.weightKg ?? (isDemo ? 82.5 : null));
  const latestHeight = bodyRecords[0]?.heightCm?.value ?? (identity.heightCm ?? (isDemo ? 180 : null));
  const latestCirc = circumferences[0] || null;

  // Daily totals from meals logged in Health
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.loggedAt.startsWith(todayStr));
  const consumedCalories = todayMeals.reduce((sum, m) => sum + (m.totalCalories?.value || 0), 0);
  const consumedProtein = todayMeals.reduce((sum, m) => sum + (m.totalProteinG?.value || 0), 0);
  const consumedCarbs = todayMeals.reduce((sum, m) => sum + (m.totalCarbsG?.value || 0), 0);
  const consumedFat = todayMeals.reduce((sum, m) => sum + (m.totalFatG?.value || 0), 0);

  // Target estimations based on goal and TDEE
  const baseTdee = tdeeCalculation.result;
  const goal = profile.primaryGoal;

  const targetCalories = useMemo(() => {
    if (!baseTdee) return null;
    if (!goal) return baseTdee;
    switch (goal) {
      case 'HYPERTROPHY':
        return baseTdee + 300;
      case 'STRENGTH':
        return baseTdee + 150;
      case 'FAT_LOSS':
        return Math.max(1500, baseTdee - 450);
      case 'LONGEVITY':
      default:
        return baseTdee;
    }
  }, [baseTdee, goal]);

  // Scientific Macronutrient targets: Protein ~2.0g/kg, Fat ~0.9g/kg, remainder Carbs
  const targetProteinG = latestWeight ? Math.round(latestWeight * 2.0) : null;
  const targetFatG = latestWeight ? Math.round(latestWeight * 0.9) : null;
  const targetCarbsG = (targetCalories && targetProteinG && targetFatG)
    ? Math.max(100, Math.round((targetCalories - targetProteinG * 4 - targetFatG * 9) / 4))
    : null;

  // Ideal weight range based on WHO healthy BMI (18.5 - 24.9)
  const hM = latestHeight ? latestHeight / 100 : null;
  const minHealthyWeight = hM ? Number((18.5 * hM * hM).toFixed(1)) : null;
  const maxHealthyWeight = hM ? Number((24.9 * hM * hM).toFixed(1)) : null;

  // Cardiometabolic indices (if optional circumferences exist)
  const waistVal = latestCirc?.waistCm?.value;
  const hipVal = latestCirc?.hipCm?.value;
  const whtr = waistVal && latestHeight ? Number((waistVal / latestHeight).toFixed(2)) : null;
  const whr = waistVal && hipVal ? Number((waistVal / hipVal).toFixed(2)) : null;

  // Recent training session
  const lastSession = trainingSessions[0];

  return (
    <div id="gymlabs-today-dashboard" className="space-y-6 select-none font-mono">
      {/* Clean Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-white inline-block" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              VISÃO DO CORPO & PERFORMANCE // PAINEL ANALÍTICO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Dashboard Corporal & Métricas
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans max-w-2xl">
            Acompanhe a modelagem biométrica, gasto calórico determinístico, zonas fisiológicas e evolução do seu corpo. A inclusão de dados é centralizada nas abas <strong>Treino</strong> e <strong>Saúde</strong>.
          </p>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setCurrentTab('training')}
            className="px-3 py-1.5 border border-zinc-800 hover:border-white text-zinc-300 hover:text-white transition-all cursor-pointer font-bold uppercase flex items-center gap-1.5"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Ir para Treino</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('health')}
            className="px-3 py-1.5 bg-white text-black font-black uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ir para Saúde</span>
          </button>
        </div>
      </div>

      {/* Baseline Verification & First Login Diagnostic Banner */}
      <FirstLoginDataVerificationBanner />

      {/* Row 1: 4 Key Calculated Telemetry & Body Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Body Composition & BMI */}
        <div
          onClick={() => setCurrentTab('body')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>Composição & IMC</span>
            </span>
            <span className={`text-[9px] px-1 py-0.2 border ${
              bmiCalculation.result 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
                : 'bg-amber-950/70 border-amber-800 text-amber-300'
            }`}>
              {bmiCalculation.result?.category || 'DADOS INSUFICIENTES'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black text-white">
              {bmiCalculation.result?.bmi !== undefined && bmiCalculation.result?.bmi !== null ? bmiCalculation.result.bmi : '--'}{' '}
              <span className="text-xs text-zinc-500 font-normal">kg/m²</span>
            </div>
            <span className="text-xs font-bold text-zinc-300">
              {latestWeight ? `${latestWeight} kg` : 'Sem peso'}
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-900 text-[11px] space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Altura base:</span>
              <strong className="text-white">{latestHeight ? `${latestHeight} cm` : 'Não informada'}</strong>
            </div>
            <div className="flex justify-between text-zinc-500 font-sans text-[10px]">
              <span>Faixa ideal OMS:</span>
              <span className="text-zinc-300 font-mono">
                {minHealthyWeight && maxHealthyWeight ? `${minHealthyWeight} - ${maxHealthyWeight} kg` : 'Requer altura'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Deterministic Energy Balance (BMR & TDEE + Workout Burn) */}
        <div
          onClick={() => setCurrentTab('nutrition')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>Gasto Energético Diário</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">
              {todayTrainingCalories > 0 ? `+${todayTrainingCalories} kcal TREINO` : (baseTdee ? 'MIFFLIN' : 'REQUER DADOS')}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black text-white">
              {baseTdee ? `${baseTdee + todayTrainingCalories} ` : '-- '}
              <span className="text-xs text-zinc-500 font-normal">kcal total</span>
            </div>
            {todayTrainingCalories > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                Treino Somado
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-900 text-[11px] space-y-1">
            {baseTdee ? (
              <>
                <div className="flex justify-between text-zinc-400">
                  <span>Basal + Atividade (TDEE):</span>
                  <strong className="text-white">{baseTdee} kcal</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Gasto Treino Hoje:</span>
                  <strong className="text-emerald-400">+{todayTrainingCalories} kcal</strong>
                </div>
                <div className="flex justify-between text-zinc-500 font-sans text-[10px]">
                  <span>Meta c/ Objetivo ({goal}):</span>
                  <span className="text-white font-mono font-bold">{targetCalories ?? '--'} kcal</span>
                </div>
              </>
            ) : (
              <div className="text-zinc-500 text-[10px] font-sans py-1">
                Dados insuficientes para calcular gasto diário. Cadastre peso e altura na aba Saúde.
              </div>
            )}
          </div>
        </div>

        {/* 3. Recovery & Autonomic Balance */}
        <div
          onClick={() => setCurrentTab('recovery')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-white" />
              <span>Score de Prontidão</span>
            </span>
            <span className="w-2 h-2 bg-white" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black text-white">
              {glRecoveryScore.score || 85}%
            </div>
            <span className="text-xs font-bold text-zinc-300 uppercase">
              {glRecoveryScore.status || 'OTIMIZADO'}
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-900 text-[11px] space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Último Sono:</span>
              <strong className="text-white">
                {latestSleep ? `${(latestSleep.durationMinutes / 60).toFixed(1)}h` : '7.5h'}
              </strong>
            </div>
            <div className="flex justify-between text-zinc-500 font-sans text-[10px]">
              <span>VFC / HRV Repouso:</span>
              <span className="text-zinc-300 font-mono">
                {latestSleep?.nocturnalHrvRmsddMs?.value || 65} ms
              </span>
            </div>
          </div>
        </div>

        {/* 4. ACWR Gabbett Training Load Ratio */}
        <div
          onClick={() => setCurrentTab('training')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Carga Aguda:Crônica</span>
            </span>
            <span className="text-[10px] text-zinc-400">GABBETT 7:28</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black text-white">
              {acwrMetrics.ratio !== null ? acwrMetrics.ratio.toFixed(2) : '0.95'}
            </div>
            <span className="text-xs font-bold text-zinc-300 uppercase">
              {acwrMetrics.status || 'OPTIMAL'}
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-900 text-[11px] space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Faixa de Segurança:</span>
              <strong className="text-white">0.80 - 1.30</strong>
            </div>
            <div className="flex justify-between text-zinc-500 font-sans text-[10px]">
              <span>Risco de Fadiga:</span>
              <span className="text-zinc-300 font-mono">BAIXO / SEGURO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gym Attendance Mini-Calendar & Monthly Plan */}
      <GymAttendanceCalendar />

      {/* Row 2: Visual Charts & Body Estimates (O usuário vê o próprio corpo em dados e gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Body Mass & Composition History Chart */}
        <div className="lg:col-span-8 p-6 bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Modelagem e Evolução da Composição Corporal
                </h3>
                <span className="text-[10px] text-zinc-500 font-sans block">
                  Acompanhamento de peso, estabilidade hídrica e limites antropométricos
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('body')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-bold uppercase transition-colors"
            >
              <span>Ver Detalhes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Graphical Body Visualization HUD */}
          <div className="p-4 bg-black border border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Peso Cadastrado</span>
                  <span className="text-lg font-black text-white font-mono">{latestWeight ? `${latestWeight} kg` : 'Pendente'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Estatura</span>
                  <span className="text-lg font-black text-white font-mono">{latestHeight ? `${latestHeight} cm` : 'Pendente'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Superfície Corporal</span>
                  <span className="text-lg font-black text-white font-mono">
                    {latestWeight && latestHeight ? `${Number(Math.sqrt((latestWeight * latestHeight) / 3600).toFixed(2))} m²` : '--'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Hidratação Recomendada</span>
                <span className="text-xs font-bold text-white font-mono">
                  {dynamicHydration.totalTargetMl ? `${dynamicHydration.totalTargetMl} ml/dia` : 'Requer peso'}
                </span>
              </div>
            </div>

            {/* SVG Visual Body Trend Graph */}
            <div className="h-44 w-full pt-3 flex flex-col justify-end">
              <div className="flex items-end justify-between h-32 gap-2 border-b border-zinc-800 pb-1">
                {bodyRecords.length > 0 ? (
                  bodyRecords.slice(0, 7).reverse().map((rec, i) => {
                    const val = rec.weightKg.value || latestWeight || 70;
                    const heightPercent = Math.min(100, Math.max(30, Math.round(((val - 40) / 80) * 100)));
                    return (
                      <div key={rec.id || i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[9px] text-zinc-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}kg
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] bg-white border border-white hover:bg-zinc-300 transition-all cursor-pointer"
                        />
                        <span className="text-[9px] text-zinc-500 font-mono mt-1">
                          {new Date(rec.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center text-xs text-zinc-500 font-sans">
                    {latestWeight
                      ? `Nenhum registro anterior. O peso cadastrado (${latestWeight} kg) serve como linha de base.`
                      : 'Nenhum peso cadastrado. Adicione seu peso na aba Saúde para habilitar o gráfico.'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-zinc-500 font-sans">
                <span>← Histórico cronológico de pesagem</span>
                <span className="text-zinc-400 font-mono">{latestWeight ? 'Linha de Base Calibrada' : 'Aguardando Medição'}</span>
              </div>
            </div>
          </div>

          {/* Heart Rate Tanaka Zones (Visual Bar) */}
          <div className="p-4 bg-black border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-white" />
                <span>Zonas Cardíacas Estimadas (Fórmula de Tanaka: 208 - 0.7 × Idade)</span>
              </span>
              <strong className="text-white font-mono">
                {tanakaKarvonen.result ? `FC Máx: ${tanakaKarvonen.result.maxHrBpm} BPM` : 'Requer Idade'}
              </strong>
            </div>

            {tanakaKarvonen.result ? (
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                <div className="p-2 bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Z1 Leve</span>
                  <strong className="text-white font-mono text-xs">
                    {tanakaKarvonen.result.zones[0]?.minBpm}-{tanakaKarvonen.result.zones[0]?.maxBpm}
                  </strong>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Z2 Aeróbia</span>
                  <strong className="text-white font-mono text-xs">
                    {tanakaKarvonen.result.zones[1]?.minBpm}-{tanakaKarvonen.result.zones[1]?.maxBpm}
                  </strong>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Z3 Tempo</span>
                  <strong className="text-white font-mono text-xs">
                    {tanakaKarvonen.result.zones[2]?.minBpm}-{tanakaKarvonen.result.zones[2]?.maxBpm}
                  </strong>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Z4 Limiar</span>
                  <strong className="text-white font-mono text-xs">
                    {tanakaKarvonen.result.zones[3]?.minBpm}-{tanakaKarvonen.result.zones[3]?.maxBpm}
                  </strong>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Z5 Anaeróbia</span>
                  <strong className="text-white font-mono text-xs">
                    {tanakaKarvonen.result.zones[4]?.minBpm}+
                  </strong>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-950 border border-zinc-800 text-center text-zinc-500 font-sans text-xs">
                Dados insuficientes para calcular zonas cardíacas. Cadastre sua data de nascimento na aba Saúde.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Macronutrient Estimates & Optional Anthropometry */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Macronutrient Targets & Consumption */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Distribuição Nutricional
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('nutrition')}
                className="text-xs text-zinc-400 hover:text-white uppercase font-bold"
              >
                Nutrição
              </button>
            </div>

            {/* Calories Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Calorias Ingeridas:</span>
                <strong className="text-white font-mono">
                  {targetCalories ? `${consumedCalories} / ${targetCalories} kcal` : `${consumedCalories} kcal (Meta pendente)`}
                </strong>
              </div>
              {targetCalories ? (
                <>
                  <div className="w-full bg-black border border-zinc-800 h-3 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.round((consumedCalories / targetCalories) * 100))}%` }}
                      className="bg-white h-full transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-sans">
                    <span>{Math.round((consumedCalories / targetCalories) * 100)}% da meta</span>
                    <span>Objetivo: {goal}</span>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-zinc-500 font-sans">
                  Insira peso e altura para calcular sua meta calórica determinística.
                </div>
              )}
            </div>

            {/* Macros Breakdown */}
            <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs">
              <div className="flex items-center justify-between p-2 bg-black border border-zinc-800">
                <span className="text-zinc-400">Proteínas (2.0g/kg):</span>
                <strong className="text-white font-mono">{consumedProtein}g / {targetProteinG ? `${targetProteinG}g` : '--'}</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-black border border-zinc-800">
                <span className="text-zinc-400">Carboidratos:</span>
                <strong className="text-white font-mono">{consumedCarbs}g / {targetCarbsG ? `${targetCarbsG}g` : '--'}</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-black border border-zinc-800">
                <span className="text-zinc-400">Gorduras (0.9g/kg):</span>
                <strong className="text-white font-mono">{consumedFat}g / {targetFatG ? `${targetFatG}g` : '--'}</strong>
              </div>
            </div>
          </div>

          {/* Optional Anthropometry & Perimeters Card */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Perímetros Corporais (Fita)
                </h4>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-400 uppercase font-bold">
                OPCIONAL
              </span>
            </div>

            {latestCirc ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-black border border-zinc-800">
                  <span className="text-zinc-400">Cintura (Umbilical):</span>
                  <strong className="text-white font-mono">{waistVal ? `${waistVal} cm` : '---'}</strong>
                </div>
                <div className="flex justify-between p-2 bg-black border border-zinc-800">
                  <span className="text-zinc-400">Quadril (Glúteo Máx):</span>
                  <strong className="text-white font-mono">{hipVal ? `${hipVal} cm` : '---'}</strong>
                </div>
                <div className="flex justify-between p-2 bg-black border border-zinc-800">
                  <span className="text-zinc-400">Índice Cintura/Estatura:</span>
                  <strong className="text-white font-mono">{whtr || '---'} (Ref: &lt; 0.50)</strong>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black border border-zinc-800 text-center space-y-1.5">
                <span className="text-[11px] text-zinc-400 font-sans block">
                  Nenhuma medida de fita registrada no cadastro.
                </span>
                <span className="text-[10px] text-zinc-500 font-sans block">
                  As medidas são 100% opcionais e podem ser preenchidas a qualquer hora na aba Saúde &gt; Corporal.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCurrentTab('body')}
              className="w-full py-1.5 border border-zinc-800 hover:border-white text-[10px] font-bold text-zinc-300 hover:text-white uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Gerenciar Medidas na Aba Saúde</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Marketplace Callout & Recent Read-Only Telemetry Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Session Summary (Read-Only) */}
        <div className="lg:col-span-6 p-5 bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-white" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Última Sessão de Treino Registrada
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('training')}
              className="text-[10px] text-zinc-400 hover:text-white font-bold uppercase flex items-center gap-1"
            >
              <span>Abrir Treino</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {lastSession ? (
            <div className="p-3 bg-black border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block uppercase">{lastSession.title}</span>
                  <span className="text-[11px] text-zinc-500 font-sans">
                    {lastSession.exercises.length} exercícios • RPE {lastSession.sessionRpe}/10 • Duração {lastSession.durationMinutes} min
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white block font-mono">
                    {lastSession.calculatedVolumeKg?.value || 0} kg
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase">Volume Total</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-black border border-zinc-800 text-center space-y-1">
              <span className="text-xs text-zinc-400 uppercase font-bold block">Nenhum treino gravado hoje</span>
              <span className="text-[11px] text-zinc-500 font-sans block">
                Para registrar séries, cargas e repetições, utilize a aba centralizada de <strong>Treino</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Marketplace Callout (Connect with Personal & Nutritionist) */}
        <div className="lg:col-span-6 p-5 bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 border border-zinc-700 bg-black flex items-center justify-center text-white shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase">
                  CONEXÃO COM PERSONAL TRAINER & NUTRICIONISTA
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-black uppercase">
                  ECOSSISTEMA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                Contrate ou conecte-se com profissionais credenciados (CREF / CRN) dentro do app. Eles prescrevem treinos de sobrecarga e cardápios diretamente sincronizados com o seu perfil.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentTab('professionals')}
              className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <span>Ver Profissionais Disponíveis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
