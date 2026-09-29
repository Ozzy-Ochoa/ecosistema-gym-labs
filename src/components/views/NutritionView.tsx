import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ARMSTRONG_URINE_SCALE } from '../../science/hydration';
import {
  Utensils,
  Plus,
  Droplets,
  Flame,
  X,
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
    activePrescribedMealPlan,
  } = useGymLabs();

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [mealType, setMealType] = useState<MealEntry['mealType']>('LUNCH');
  const [mealName, setMealName] = useState('Frango Grelhado, Arroz Integral & Legumes');
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
      source: 'Diário Alimentar do Atleta',
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
    <div id="gymlabs-nutrition-view" className="space-y-6 font-mono select-none">
      {/* Header Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Nutrição & Balanço Hídrico Dinâmico
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              CÁLCULO DETERMINÍSTICO
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Nutrição & Balanço Hídrico
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Mifflin-St Jeor / Katch-McArdle, Escala de Armstrong (1994) e Sawka et al. (2007).
          </p>
        </div>

        {/* Action Button: Log Meal */}
        <button
          type="button"
          onClick={() => setShowAddMealModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTRAR REFEIÇÃO</span>
        </button>
      </div>

      {/* Goal Strategy Selector (Cutting, Maintenance, Bulking) */}
      <div className="p-4 bg-black border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-white" />
          <span className="text-xs uppercase text-zinc-400 font-bold">Objetivo Energético Ativo:</span>
        </div>

        <div className="flex items-center gap-2">
          {(['CUTTING', 'MAINTENANCE', 'BULKING'] as const).map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setNutritionalGoal(goal)}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                nutritionalGoal === goal
                  ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                  : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {goal === 'CUTTING' ? 'Cutting (-500 kcal)' : goal === 'BULKING' ? 'Bulking (+300 kcal)' : 'Manutenção (0 kcal)'}
            </button>
          ))}
        </div>
      </div>

      {/* Prescribed Meal Plan by Clinical Nutritionist (Gym Labs Connected) */}
      {activePrescribedMealPlan && (
        <div className="p-5 bg-zinc-950 border border-emerald-900/60 shadow-[0_0_20px_rgba(16,185,129,0.1)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 text-black font-black flex items-center justify-center text-xs">
                NUT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    PLANO ALIMENTAR PRESCRIÇÃO NUTRICIONISTA // GYM LABS NUTRI
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                    SINCRONIZADO
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Prescrito por: <strong className="text-white">{activePrescribedMealPlan.authorName}</strong> • {activePrescribedMealPlan.title} (v{activePrescribedMealPlan.version})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddMealModal(true)}
                className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>REGISTRAR REFEIÇÃO DO PLANO</span>
              </button>
            </div>
          </div>

          {/* Target Macros Badge Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 bg-black border border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase block font-bold">Meta Calórica</span>
              <span className="text-sm font-black text-white">{activePrescribedMealPlan.totalCaloriesTarget} kcal</span>
            </div>
            <div className="p-2.5 bg-black border border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase block font-bold">Proteína Alvo</span>
              <span className="text-sm font-black text-emerald-400">{activePrescribedMealPlan.totalProteinGTarget}g</span>
            </div>
            <div className="p-2.5 bg-black border border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase block font-bold">Carboidrato Alvo</span>
              <span className="text-sm font-black text-amber-400">{activePrescribedMealPlan.totalCarbsGTarget}g</span>
            </div>
            <div className="p-2.5 bg-black border border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase block font-bold">Gordura Alvo</span>
              <span className="text-sm font-black text-rose-400">{activePrescribedMealPlan.totalFatGTarget}g</span>
            </div>
            <div className="p-2.5 bg-black border border-zinc-900 col-span-2 sm:col-span-1">
              <span className="text-[9px] text-zinc-500 uppercase block font-bold">Hidratação Mínima</span>
              <span className="text-sm font-black text-cyan-400">{activePrescribedMealPlan.waterIntakeMlTarget} ml</span>
            </div>
          </div>

          {/* Planned Meals Details */}
          <div className="space-y-3 pt-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              Refeições Prescritas na Rotina:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePrescribedMealPlan.meals.map((meal) => (
                <div key={meal.id} className="p-3 bg-black border border-zinc-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="font-bold text-white uppercase">{meal.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">[{meal.time}] • {meal.calories} kcal</span>
                  </div>
                  <div className="space-y-1.5">
                    {meal.items.map((item) => (
                      <div key={item.id} className="text-[11px] leading-snug">
                        <div className="text-zinc-200 font-bold">• {item.name} <span className="text-zinc-400 font-normal">({item.portion})</span></div>
                        {item.substitutions && item.substitutions.length > 0 && (
                          <div className="text-[10px] text-amber-400/80 font-sans pl-2">
                            ↳ Opção: {item.substitutions.join(' | ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activePrescribedMealPlan.guidanceNotes && (
            <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-emerald-600 pl-3 pt-1">
              "{activePrescribedMealPlan.guidanceNotes}"
            </p>
          )}
        </div>
      )}

      {/* Energy & Macros Telemetry Grid (Strict Monochrome) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div
          onClick={() => openCalculationInspector(tdeeCalculation)}
          className="p-4 bg-zinc-950 border border-zinc-800 space-y-2 cursor-pointer hover:border-white transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Balanço Calórico</span>
            <ProvenanceBadge provenance={tdeeCalculation.provenance} size="sm" />
          </div>
          <div className="text-3xl font-black text-white">
            {totalCalories}{' '}
            <span className="text-xs text-zinc-500 font-normal">/ {targetCalories} kcal</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px]">
            <span className="text-white font-bold">
              {caloricDelta > 0 ? `+${caloricDelta} kcal` : `${caloricDelta} kcal`}
            </span>
            <span className="text-zinc-500 font-sans">TDEE Calibrado</span>
          </div>
        </div>

        {/* Protein Card (Helms & Morton 1.6 - 2.2 g/kg) */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Proteínas (1.8 g/kg)</span>
            <span className="text-white font-bold">META: 150g</span>
          </div>
          <div className="text-3xl font-black text-white">
            {Math.round(totalProtein)} <span className="text-xs text-zinc-500 font-normal">g</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            {Math.round((totalProtein / 150) * 100)}% da meta de síntese proteica
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Carboidratos</span>
            <span className="text-zinc-300 font-bold">META: 260g</span>
          </div>
          <div className="text-3xl font-black text-white">
            {Math.round(totalCarbs)} <span className="text-xs text-zinc-500 font-normal">g</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Repleção de glicogênio muscular
          </div>
        </div>

        {/* Fats Card */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Lipídios Totais</span>
            <span className="text-zinc-300 font-bold">META: 70g</span>
          </div>
          <div className="text-3xl font-black text-white">
            {Math.round(totalFats)} <span className="text-xs text-zinc-500 font-normal">g</span>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans">
            Suporte hormonal e celular
          </div>
        </div>
      </div>

      {/* DYNAMIC HYDRATION ENGINE (SAWKA & ARMSTRONG MODEL) */}
      <div className="p-5 bg-black border border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Modelo Dinâmico de Hidratação // Sawka et al. (2007)
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
            CÁLCULO INDIVIDUALIZADO
          </span>
        </div>

        {/* Dynamic Controls: Temp, Sweat Rate, Creatine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Ambient Temp */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 uppercase font-bold">Temperatura Ambiente</span>
              <span className="text-xs font-bold text-white">{ambientTempC}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(Number(e.target.value))}
              className="w-full accent-white"
            />
            <div className="text-[10px] text-zinc-500 font-sans">
              {ambientTempC > 25 ? `+${dynamicHydration.thermalAdditionMl} ml (estresse térmico)` : 'Temperatura termoneutra'}
            </div>
          </div>

          {/* Sweat Rate */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-400 uppercase block font-bold">Taxa de Sudorese</span>
            <div className="grid grid-cols-3 gap-1">
              {(['LOW', 'MODERATE', 'HIGH'] as const).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSweatRate(rate)}
                  className={`py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    sweatRate === rate
                      ? 'bg-white text-black'
                      : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {rate === 'LOW' ? 'Baixa' : rate === 'MODERATE' ? 'Média' : 'Alta'}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">
              +{dynamicHydration.exerciseAdditionMl} ml (reposição de esforço)
            </div>
          </div>

          {/* Creatine Supplementation */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 uppercase font-bold">Creatina</span>
              <button
                type="button"
                onClick={() => setTakingCreatine(!takingCreatine)}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer ${
                  takingCreatine ? 'bg-white text-black' : 'bg-black border border-zinc-700 text-zinc-500'
                }`}
              >
                {takingCreatine ? 'EM USO (+600ml)' : 'NÃO USA'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-sans">
              Compensação osmótica intramuscular para evitar desidratação celular
            </p>
          </div>
        </div>

        {/* Dynamic Water Target & Ingestion Controls */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block font-bold">
              Meta Hídrica Individualizada
            </span>
            <div className="text-3xl font-black text-white mt-0.5">
              {todayWaterMl}{' '}
              <span className="text-sm text-zinc-500 font-normal">
                / {dynamicHydration.totalTargetMl} ml
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 font-sans">
              Base: {dynamicHydration.baselineMl}ml • Térmico: +{dynamicHydration.thermalAdditionMl}ml • Treino: +{dynamicHydration.exerciseAdditionMl}ml
            </div>
          </div>

          {/* Quick Log Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => logWater(250)}
              className="px-3 py-1.5 border border-zinc-700 text-xs font-bold text-white hover:bg-zinc-900 cursor-pointer"
            >
              +250 ml
            </button>
            <button
              type="button"
              onClick={() => logWater(500)}
              className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              +500 ml
            </button>
            <button
              type="button"
              onClick={() => logWater(750)}
              className="px-3 py-1.5 border border-zinc-700 text-xs font-bold text-white hover:bg-zinc-900 cursor-pointer"
            >
              +750 ml
            </button>
          </div>
        </div>

        {/* ARMSTRONG URINE COLOR SCALE (ARMSTRONG ET AL. 1994) */}
        <div className="space-y-3 pt-3 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Escala de Coloração Urinária de Armstrong (Armstrong et al., 1994)
            </span>
            <span className="text-[10px] text-zinc-400">
              Índice Clínico USG
            </span>
          </div>

          {/* 5-Level Monochrome Grayscale Bar */}
          <div className="grid grid-cols-5 gap-2">
            {ARMSTRONG_URINE_SCALE.map((level) => {
              const isSelected = armstrongUrineLevel === level.level;
              return (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => setArmstrongUrineLevel(level.level)}
                  className={`p-3 border text-left transition-all relative cursor-pointer ${
                    isSelected ? 'border-white bg-zinc-900 shadow-[2px_2px_0px_0px_#FFFFFF]' : 'border-zinc-800 bg-black opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className="w-full h-3 mb-2 border border-zinc-700"
                    style={{ backgroundColor: level.colorHex }}
                  />
                  <span className="text-[10px] font-bold text-white block">
                    Nível {level.level}
                  </span>
                  <span className="text-[9px] text-zinc-400 block truncate">
                    {level.state}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Armstrong Directive */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-zinc-900">
              <span className="text-white font-bold">
                {currentArmstrongDetails.label} — {currentArmstrongDetails.usgRange}
              </span>
              <span className="text-zinc-500 font-sans">Diretriz Prática</span>
            </div>
            <p className="text-zinc-300 font-sans pt-1">
              {currentArmstrongDetails.actionText}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Meals Archive */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Diário Nutricional da Sessão
          </h3>
          <span className="text-xs text-zinc-500 font-bold">{todayMeals.length} REFEIÇÕES</span>
        </div>

        <div className="space-y-2">
          {todayMeals.map((meal) => (
            <div
              key={meal.id}
              className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">{meal.name}</span>
                <span className="text-[10px] text-zinc-500 font-sans">
                  {meal.mealType} • {new Date(meal.loggedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white block">
                  {meal.totalCalories.value} kcal
                </span>
                <span className="text-[10px] text-zinc-400">
                  P: {meal.totalProteinG.value}g • C: {meal.totalCarbsG.value}g • L: {meal.totalFatsG.value}g
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMeal}
            className="w-full max-w-md p-6 bg-black border border-white space-y-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Refeição</h3>
              <button
                type="button"
                onClick={() => setShowAddMealModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Nome da Refeição</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Tipo</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
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
                <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Porções</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Alimento Base</label>
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
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
                className="px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
