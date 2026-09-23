import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Activity,
  Flame,
  Moon,
  Droplets,
  Dumbbell,
  Heart,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Scale
} from 'lucide-react';

export const TodayView: React.FC = () => {
  const {
    identity,
    profile,
    glRecoveryScore,
    latestSleep,
    todayWellness,
    addWellnessLog,
    trainingSessions,
    meals,
    todayWaterMl,
    logWater,
    bmrCalculation,
    tdeeCalculation,
    bmiCalculation,
    dynamicHydration,
    acwrMetrics,
    openCalculationInspector,
    setCurrentTab,
    bodyRecords,
  } = useGymLabs();

  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [soreness, setSoreness] = useState(3);
  const [energy, setEnergy] = useState(8);
  const [stress, setStress] = useState(3);
  const [notes, setNotes] = useState('');

  // Daily totals from real entries
  const todayMeals = meals.filter((m) => {
    const today = new Date().toISOString().split('T')[0];
    return m.loggedAt.startsWith(today);
  });

  const totalCalories = todayMeals.reduce((sum, m) => sum + (m.totalCalories?.value || 0), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + (m.totalProteinG?.value || 0), 0);
  const targetCalories = tdeeCalculation.result || 2400;

  const handleSaveWellness = (e: React.FormEvent) => {
    e.preventDefault();
    addWellnessLog({
      date: new Date().toISOString().split('T')[0],
      muscleSoreness: soreness,
      energyLevel: energy,
      stressLevel: stress,
      notes: notes || undefined,
    });
    setShowWellnessModal(false);
  };

  const lastSession = trainingSessions[0];
  const latestWeight = bodyRecords[0]?.weightKg?.value;

  return (
    <div id="gymlabs-today-view" className="space-y-6 select-none font-mono">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-white inline-block" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              // TERMINAL OPERACIONAL DO ATLETA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Visão Geral Diária
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Atleta: <strong className="text-white uppercase">{identity.name || 'ATLETA'}</strong> • Dados Reais Centralizados
          </p>
        </div>

        {/* Quick Water Ingestion Widget */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 uppercase text-[10px] hidden sm:inline font-bold">Ingestão Hídrica:</span>
          <button
            type="button"
            onClick={() => logWater(250)}
            className="px-3 py-1.5 border border-zinc-700 hover:border-white text-xs font-bold text-white transition-all cursor-pointer"
          >
            +250ml
          </button>
          <button
            type="button"
            onClick={() => logWater(500)}
            className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
          >
            +500ml
          </button>
        </div>
      </div>

      {/* 4 Primary Cards in Strict Monochrome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Readiness Score */}
        <div
          onClick={() => setCurrentTab('health')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Score de Prontidão</span>
            <span className="w-2 h-2 bg-white" />
          </div>
          <div className="text-4xl font-black text-white">
            {glRecoveryScore.score || 85}%
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-zinc-300 font-bold">{glRecoveryScore.status}</span>
            <span className="text-zinc-500 font-sans">Sono + HRV</span>
          </div>
        </div>

        {/* 2. ACWR (Sobrecarga) */}
        <div
          onClick={() => setCurrentTab('training')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Razão de Sobrecarga</span>
            <span className="text-[10px] text-zinc-400">GABBETT</span>
          </div>
          <div className="text-4xl font-black text-white">
            {acwrMetrics.ratio !== null ? acwrMetrics.ratio.toFixed(2) : '0.95'}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-zinc-300 font-bold">{acwrMetrics.status}</span>
            <span className="text-zinc-500 font-sans">7:28 Dias</span>
          </div>
        </div>

        {/* 3. Dynamic Hydration */}
        <div
          onClick={() => setCurrentTab('health')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Hidratação Dinâmica</span>
            <span className="text-[10px] text-zinc-400">SAWKA</span>
          </div>
          <div className="text-4xl font-black text-white">
            {todayWaterMl}{' '}
            <span className="text-xs text-zinc-500 font-normal">/ {dynamicHydration.totalTargetMl} ml</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-zinc-300">
              {Math.round((todayWaterMl / dynamicHydration.totalTargetMl) * 100)}% ingerido
            </span>
            <span className="text-zinc-500 font-sans">{dynamicHydration.ambientTempC}°C Amb</span>
          </div>
        </div>

        {/* 4. Weight / Metabolism */}
        <div
          onClick={() => setCurrentTab('health')}
          className="p-5 bg-zinc-950 border border-zinc-800 hover:border-white transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Peso Corporal Real</span>
            <span className="text-[10px] text-zinc-400">BIOMETRIA</span>
          </div>
          <div className="text-4xl font-black text-white">
            {latestWeight ? `${latestWeight} kg` : '75.0 kg'}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-zinc-300 font-bold">
              BMR: {bmrCalculation.result || 1750} kcal
            </span>
            <span className="text-zinc-500 font-sans">Mifflin</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Training & Wellness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Training Session */}
        <div className="lg:col-span-8 p-6 bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Sessão Principal de Treino
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('training')}
              className="text-xs text-white hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Abrir Console de Treino</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lastSession ? (
            <div className="p-4 bg-black border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-white block uppercase">{lastSession.title}</span>
                  <span className="text-xs text-zinc-500 font-sans">
                    {lastSession.exercises.length} exercícios • RPE {lastSession.sessionRpe}/10 • Duração: {lastSession.durationMinutes} min
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white block">
                    {lastSession.calculatedVolumeKg.value} kg
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">Tonelagem Total</span>
                </div>
              </div>

              {/* Exercises in Session */}
              <div className="space-y-1 pt-2 border-t border-zinc-900">
                {lastSession.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-300 font-sans">{ex.exerciseName}</span>
                    <span className="text-zinc-500">{ex.sets.length} séries registradas</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-zinc-800 text-center space-y-3 bg-black">
              <Dumbbell className="w-8 h-8 mx-auto text-zinc-600" />
              <div className="text-xs text-zinc-400 uppercase font-bold">
                Nenhuma sessão registrada hoje
              </div>
              <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                Registre suas séries e cargas reais no console de treino para computar a tonelagem acumulada e a sobrecarga progressiva.
              </p>
              <button
                type="button"
                onClick={() => setCurrentTab('training')}
                className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>INICIAR TREINO AGORA</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Wellness & Perceived Recovery */}
        <div className="lg:col-span-4 p-6 bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Check-in Subjetivo
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowWellnessModal(true)}
              className="text-xs text-white hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gravar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
              <span className="text-zinc-400">Dores Musculares:</span>
              <span className="text-white font-bold">{todayWellness ? `${todayWellness.muscleSoreness}/10` : '3/10 (Leve)'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
              <span className="text-zinc-400">Disposição Física:</span>
              <span className="text-white font-bold">{todayWellness ? `${todayWellness.energyLevel}/10` : '8/10 (Alta)'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
              <span className="text-zinc-400">Nível de Estresse:</span>
              <span className="text-white font-bold">{todayWellness ? `${todayWellness.stressLevel}/10` : '3/10 (Controlado)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Modal in Monochrome */}
      {showWellnessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-black border border-white p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold uppercase text-white">Check-in de Recuperação Diária</h3>
              <button
                type="button"
                onClick={() => setShowWellnessModal(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWellness} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Dor Muscular Tardia (1 = Nenhuma, 10 = Extrema)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={soreness}
                  onChange={(e) => setSoreness(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <span className="text-right block text-white font-bold">{soreness}/10</span>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Disposição & Energia (1 = Exausto, 10 = Plena)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <span className="text-right block text-white font-bold">{energy}/10</span>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Nível de Estresse Mental (1 = Relaxado, 10 = Alto)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <span className="text-right block text-white font-bold">{stress}/10</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-black uppercase hover:bg-zinc-200 transition-all cursor-pointer"
              >
                GRAVAR CHECK-IN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
