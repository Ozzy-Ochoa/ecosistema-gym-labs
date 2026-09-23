import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ARMSTRONG_URINE_SCALE } from '../../science/hydration';
import {
  Utensils,
  Plus,
  Droplets,
  Flame,
  Apple,
  Search,
  Check,
  AlertCircle,
  Info,
  Thermometer,
  Shield,
  Activity,
} from 'lucide-react';
import { MealEntry, MealItem, FoodItem } from '../../types/nutrition';
import { DataProvenance } from '../../types/provenance';

export const NutritionView: React.FC = () => {
  const {
    identity,
    meals,
    addMeal,
    foods,
    todayWaterMl,
    logWater,
    tdeeCalculation,
    bmrCalculation,
    dynamicHydration,
    ambientTempC,
    setAmbientTempC,
    sweatRate,
    setSweatRate,
    takingCreatine,
    setTakingCreatine,
    armstrongUrineLevel,
    setArmstrongUrineLevel,
    currentArmstrongDetails,
    openCalculationInspector,
  } = useGymLabs();

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [mealType, setMealType] = useState<MealEntry['mealType']>('LUNCH');
  const [mealName, setMealName] = useState('Frango, Arroz Integral & Brócolis');
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0]?.id || '');
  const [servings, setServings] = useState(2);

  // Nutritional Goal State
  const [nutritionalGoal, setNutritionalGoal] = useState<'CUTTING' | 'MAINTENANCE' | 'BULKING'>('MAINTENANCE');

  // Today's Totals
  const todayMeals = meals.filter((m) => {
    const today = new Date().toISOString().split('T')[0];
    return m.loggedAt.startsWith(today);
  });

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.totalCalories.value, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.totalProteinG.value, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.totalCarbsG.value, 0);
  const totalFats = todayMeals.reduce((sum, m) => sum + m.totalFatsG.value, 0);

  const baselineTdee = tdeeCalculation.result || 2400;
  const goalAdjustment = nutritionalGoal === 'CUTTING' ? -500 : nutritionalGoal === 'BULKING' ? 300 : 0;
  const targetCalories = baselineTdee + goalAdjustment;
  const caloricDelta = totalCalories - targetCalories;

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const food = foods.find((f) => f.id === selectedFoodId) || foods[0];
    const items: MealItem[] = [{ food, quantity: servings }];

    const mealCals = Math.round(food.caloriesKcal * (food.servingSizeGrams / 100) * servings);
    const mealProt = Number((food.proteinG * (food.servingSizeGrams / 100) * servings).toFixed(1));
    const mealCarbs = Number((food.carbsG * (food.servingSizeGrams / 100) * servings).toFixed(1));
    const mealFats = Number((food.fatsG * (food.servingSizeGrams / 100) * servings).toFixed(1));

    const provenanceObj: DataProvenance = {
      type: 'REAL',
      source: 'User Self-Reported Meal Intake',
      recordedAt: new Date().toISOString(),
      confidence: 'HIGH',
    };

    const newMeal: MealEntry = {
      id: `meal-${Date.now()}`,
      userId: identity.id,
      name: mealName,
      mealType,
      loggedAt: new Date().toISOString(),
      items,
      totalCalories: {
        value: mealCals,
        unit: 'KCAL',
        provenance: provenanceObj,
      },
      totalProteinG: {
        value: mealProt,
        unit: 'GRAMS',
        provenance: provenanceObj,
      },
      totalCarbsG: {
        value: mealCarbs,
        unit: 'GRAMS',
        provenance: provenanceObj,
      },
      totalFatsG: {
        value: mealFats,
        unit: 'GRAMS',
        provenance: provenanceObj,
      },
    };

    addMeal(newMeal);
    setShowAddMealModal(false);
  };

  return (
    <div id="gymlabs-nutrition-view" className="space-y-8 select-none">
      {/* Editorial Header / HUD Telemetry */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
              // LABCORE 2026 : NUTRIÇÃO BASEADA EM EVIDÊNCIAS & HIDRATAÇÃO DINÂMICA
            </span>
            <span className="w-1.5 h-1.5 bg-[#00F0FF] animate-ping" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-mono uppercase tracking-tight text-white">
            Nutrição & Balanço Hídrico
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
            Mifflin-St Jeor / Katch-McArdle, Escala Urinária de Armstrong (1994) e Sawka (2007)
          </p>
        </div>

        {/* Action Button: Log Meal */}
        <button
          type="button"
          onClick={() => setShowAddMealModal(true)}
          className="neo-box px-5 py-3 text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 border-2 border-[#00F0FF] bg-black text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,240,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Refeição</span>
        </button>
      </div>

      {/* Goal Strategy Selector (Cutting, Maintenance, Bulking) */}
      <div className="neo-box-thick p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FFB800]" />
          <span className="text-xs uppercase text-zinc-400">Objetivo Energético Ativo:</span>
        </div>

        <div className="flex items-center gap-2">
          {(['CUTTING', 'MAINTENANCE', 'BULKING'] as const).map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setNutritionalGoal(goal)}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                nutritionalGoal === goal
                  ? 'bg-[#00F0FF] text-black border border-[#00F0FF] shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)]'
                  : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {goal === 'CUTTING' ? 'Cutting (-500 kcal)' : goal === 'BULKING' ? 'Bulking (+300 kcal)' : 'Manutenção (0 kcal)'}
            </button>
          ))}
        </div>
      </div>

      {/* Energy & Macros Protagonist Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Calories Card */}
        <div
          onClick={() => openCalculationInspector(tdeeCalculation)}
          className="neo-box-thick p-5 cursor-pointer hover:border-[#00F0FF] transition-all"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Balanço Calórico</span>
            <ProvenanceBadge provenance="DETERMINISTIC_CALCULATION" size="sm" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {totalCalories}{' '}
            <span className="text-xs text-zinc-400 font-normal">/ {targetCalories} kcal</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900 text-[11px]">
            <span className={caloricDelta > 0 ? 'text-[#FFB800]' : 'text-[#39FF14]'}>
              {caloricDelta > 0 ? `+${caloricDelta} kcal` : `${caloricDelta} kcal`}
            </span>
            <span className="text-zinc-400">TDEE Calibrado</span>
          </div>
        </div>

        {/* Protein Card (Helms & Morton 1.6 - 2.2 g/kg) */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Proteínas (1.8 g/kg)</span>
            <span className="text-[#00F0FF] font-bold">ALVO: 150g</span>
          </div>
          <div className="text-3xl font-black text-[#00F0FF] mt-2">
            {Math.round(totalProtein)} <span className="text-xs text-zinc-400 font-normal">g</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
            {Math.round((totalProtein / 150) * 100)}% da meta de síntese proteica
          </div>
        </div>

        {/* Carbs Card */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Carboidratos</span>
            <span className="text-[#39FF14] font-bold">ALVO: 260g</span>
          </div>
          <div className="text-3xl font-black text-[#39FF14] mt-2">
            {Math.round(totalCarbs)} <span className="text-xs text-zinc-400 font-normal">g</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
            Repleção de glicogênio muscular
          </div>
        </div>

        {/* Fats Card */}
        <div className="neo-box-thick p-5">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase">
            <span>Lipídios Totais</span>
            <span className="text-[#FFB800] font-bold">ALVO: 70g</span>
          </div>
          <div className="text-3xl font-black text-[#FFB800] mt-2">
            {Math.round(totalFats)} <span className="text-xs text-zinc-400 font-normal">g</span>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
            Suporte hormonal e esteroidogênese
          </div>
        </div>
      </div>

      {/* DYNAMIC HYDRATION ENGINE (SAWKA & ARMSTRONG MODEL) */}
      <div className="neo-box-thick p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Modelo Dinâmico de Hidratação // Sawka et al. (2007)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF] px-2 py-0.5">
            FIM DO "2L PARA TODOS" // CÁLCULO FISIOLÓGICO INDIVIDUAL
          </span>
        </div>

        {/* Dynamic Controls: Temp, Sweat Rate, Creatine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Ambient Temp */}
          <div className="p-4 bg-[#050505] border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 uppercase">Temperatura Ambiente</span>
              <span className="text-sm font-bold text-[#FFB800]">{ambientTempC}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(Number(e.target.value))}
              className="w-full accent-[#00F0FF]"
            />
            <div className="text-[10px] text-zinc-500">
              {ambientTempC > 25 ? `+${dynamicHydration.thermalAdditionMl} ml (estresse térmico)` : 'Temperatura termoneutra'}
            </div>
          </div>

          {/* Sweat Rate */}
          <div className="p-4 bg-[#050505] border border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-400 uppercase block">Taxa de Sudorese Estimada</span>
            <div className="grid grid-cols-3 gap-1">
              {(['LOW', 'MODERATE', 'HIGH'] as const).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSweatRate(rate)}
                  className={`py-1 text-[10px] font-bold transition-all ${
                    sweatRate === rate
                      ? 'bg-[#00F0FF] text-black font-mono'
                      : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {rate === 'LOW' ? 'Baixa' : rate === 'MODERATE' ? 'Média' : 'Alta'}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-zinc-500">
              +{dynamicHydration.exerciseAdditionMl} ml (reposição de esforço físico)
            </div>
          </div>

          {/* Creatine Supplementation */}
          <div className="p-4 bg-[#050505] border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 uppercase">Creatina Monoidratada</span>
              <button
                type="button"
                onClick={() => setTakingCreatine(!takingCreatine)}
                className={`px-2 py-0.5 text-[10px] font-bold ${
                  takingCreatine ? 'bg-[#39FF14] text-black' : 'bg-black border border-zinc-700 text-zinc-500'
                }`}
              >
                {takingCreatine ? 'EM USO (+600ml)' : 'NÃO USA'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Compensação osmótica intramuscular para evitar desidratação celular
            </p>
          </div>
        </div>

        {/* Dynamic Water Target & Ingestion Controls */}
        <div className="p-6 bg-black border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono">
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">
              Meta Hídrica Personalizada de Hoje
            </span>
            <div className="text-4xl font-black text-[#00F0FF] mt-1">
              {todayWaterMl}{' '}
              <span className="text-base text-zinc-400 font-normal">
                / {dynamicHydration.totalTargetMl} ml
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Base: {dynamicHydration.baselineMl}ml (40ml/kg) • Térmico: +{dynamicHydration.thermalAdditionMl}ml • Treino: +{dynamicHydration.exerciseAdditionMl}ml
            </div>
          </div>

          {/* Quick Log Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => logWater(250)}
              className="px-3 py-2 neo-box text-xs font-bold text-white hover:text-[#00F0FF] hover:border-[#00F0FF]"
            >
              +250 ml
            </button>
            <button
              type="button"
              onClick={() => logWater(500)}
              className="px-3 py-2 neo-box text-xs font-bold text-[#00F0FF] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
            >
              +500 ml
            </button>
            <button
              type="button"
              onClick={() => logWater(750)}
              className="px-3 py-2 neo-box text-xs font-bold text-white hover:text-[#00F0FF] hover:border-[#00F0FF]"
            >
              +750 ml
            </button>
          </div>
        </div>

        {/* ARMSTRONG URINE COLOR SCALE (ARMSTRONG ET AL. 1994) */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Escala de Coloração Urinária de Armstrong (Armstrong et al., 1994)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Índice Clínico USG
            </span>
          </div>

          {/* 5-Level Chromatic Bar */}
          <div className="grid grid-cols-5 gap-2 font-mono">
            {ARMSTRONG_URINE_SCALE.map((level) => {
              const isSelected = armstrongUrineLevel === level.level;
              return (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => setArmstrongUrineLevel(level.level)}
                  className={`p-3 border text-left transition-all relative ${
                    isSelected ? 'border-white shadow-[2px_2px_0px_0px_#FFFFFF]' : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: '#050505' }}
                >
                  <div
                    className="w-full h-4 mb-2 border border-black"
                    style={{ backgroundColor: level.colorHex }}
                  />
                  <span className="text-[10px] font-bold text-white block">
                    Nível {level.level}
                  </span>
                  <span className="text-[9px] text-zinc-400 block truncate">
                    {level.state}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00F0FF]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Armstrong Directive */}
          <div className="p-4 bg-black border border-zinc-800 font-mono text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-zinc-900">
              <span className="text-[#00F0FF] font-bold">
                {currentArmstrongDetails.label} — {currentArmstrongDetails.usgRange}
              </span>
              <span className="text-zinc-500">Diretriz Prática Imediata</span>
            </div>
            <p className="text-zinc-300 pt-1">
              {currentArmstrongDetails.actionText}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Meals Archive */}
      <div className="neo-box-thick p-6 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Diário Nutricional da Sessão
          </h3>
          <span className="text-xs text-zinc-400">{todayMeals.length} refeições registradas</span>
        </div>

        <div className="space-y-3">
          {todayMeals.map((meal) => (
            <div
              key={meal.id}
              className="p-3 bg-[#050505] border border-zinc-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">{meal.name}</span>
                <span className="text-[10px] text-zinc-500">
                  {meal.mealType} • {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#00F0FF] block">
                  {meal.totalCalories.value} kcal
                </span>
                <span className="text-[10px] text-zinc-400">
                  P: {meal.totalProteinG.value}g • C: {meal.totalCarbsG.value}g • G: {meal.totalFatsG.value}g
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMeal}
            className="w-full max-w-md neo-box-thick p-6 bg-black border-2 border-[#00F0FF] space-y-4 font-mono"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Refeição</h3>
              <button
                type="button"
                onClick={() => setShowAddMealModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Nome da Refeição</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Tipo</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                >
                  <option value="BREAKFAST">Café da Manhã</option>
                  <option value="LUNCH">Almoço</option>
                  <option value="DINNER">Jantar</option>
                  <option value="SNACK">Lanche</option>
                  <option value="PRE_WORKOUT">Pré-Treino</option>
                  <option value="POST_WORKOUT">Pós-Treino</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Porções</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Alimento Base</label>
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              >
                {foods.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.caloriesKcal} kcal / {f.servingSizeGrams}g)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddMealModal(false)}
                className="px-3 py-1.5 neo-box text-xs text-zinc-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 neo-box bg-[#00F0FF] text-black font-bold text-xs uppercase"
              >
                Confirmar Refeição
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
