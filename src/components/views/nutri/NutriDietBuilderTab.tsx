import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { NutriMealPlan, NutriMeal, NutriFoodItem, NutriPatient } from '../../../types/nutri';
import {
  Utensils,
  Plus,
  Trash2,
  Send,
  Save,
  Copy,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface NutriDietBuilderTabProps {
  initialPatient?: NutriPatient | null;
}

export const NutriDietBuilderTab: React.FC<NutriDietBuilderTabProps> = ({
  initialPatient,
}) => {
  const {
    nutriMealPlans,
    nutriPatients,
    addNutriMealPlan,
    publishNutriMealPlan,
  } = useGymLabs();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient?.id || nutriPatients[0]?.id || ''
  );

  const selectedPatient = nutriPatients.find((p) => p.id === selectedPatientId) || nutriPatients[0];

  // Active Plan Form State
  const [title, setTitle] = useState(
    selectedPatient ? `Plano Nutricional - ${selectedPatient.primaryGoal}` : 'Plano Hipertrofia Limpa'
  );
  const [objective, setObjective] = useState(selectedPatient?.primaryGoal || 'HYPERTROPHY');
  const [targetCalories, setTargetCalories] = useState<number>(2800);
  const [targetProtein, setTargetProtein] = useState<number>(180);
  const [targetCarbs, setTargetCarbs] = useState<number>(340);
  const [targetFat, setTargetFat] = useState<number>(75);
  const [targetWater, setTargetWater] = useState<number>(3500);
  const [guidanceNotes, setGuidanceNotes] = useState(
    'Distribuir a ingestão de água ao longo do dia. Consumir a refeição pré-treino 90 minutos antes do início do esforço anaeróbico.'
  );

  // Initial Meals
  const [meals, setMeals] = useState<NutriMeal[]>([
    {
      id: 'meal_1',
      name: 'Café da Manhã Anabólico',
      time: '07:30',
      calories: 620,
      proteinG: 42,
      carbsG: 78,
      fatG: 14,
      items: [
        {
          id: 'item_1_1',
          name: 'Ovos inteiros mexidos',
          portion: '3 unidades (150g)',
          quantity: 3,
          calories: 210,
          proteinG: 18,
          carbsG: 1.5,
          fatG: 14,
          substitutions: ['120g de queijo cottage 0% + 2 claras'],
        },
        {
          id: 'item_1_2',
          name: 'Aveia em flocos finos com canela',
          portion: '60g',
          quantity: 1,
          calories: 230,
          proteinG: 9,
          carbsG: 40,
          fatG: 4.5,
          substitutions: ['80g de farinha de aveia ou granola sem açúcar'],
        },
        {
          id: 'item_1_3',
          name: 'Banana prata fatiada com mel',
          portion: '100g (1 unidade)',
          quantity: 1,
          calories: 100,
          proteinG: 1.2,
          carbsG: 26,
          fatG: 0.3,
          substitutions: ['150g de mamão papaia ou 120g morangos'],
        },
        {
          id: 'item_1_4',
          name: 'Whey Protein Isolado (Gym Labs)',
          portion: '25g (1 scoop)',
          quantity: 1,
          calories: 95,
          proteinG: 22,
          carbsG: 1,
          fatG: 0.5,
          substitutions: ['120g iogurte grego proteico'],
        },
      ],
    },
    {
      id: 'meal_2',
      name: 'Almoço Principal de Alta Performance',
      time: '12:30',
      calories: 840,
      proteinG: 55,
      carbsG: 110,
      fatG: 18,
      items: [
        {
          id: 'item_2_1',
          name: 'Peito de frango grelhado em tiras',
          portion: '180g (pesado pronto)',
          quantity: 1,
          calories: 290,
          proteinG: 52,
          carbsG: 0,
          fatG: 6,
          substitutions: ['190g filé de tilápia ou 170g patinho moído'],
        },
        {
          id: 'item_2_2',
          name: 'Arroz branco ou parboilizado',
          portion: '220g cozido',
          quantity: 1,
          calories: 280,
          proteinG: 5,
          carbsG: 62,
          fatG: 0.6,
          substitutions: ['280g de batata inglesa assada ou 250g mandioca'],
        },
        {
          id: 'item_2_3',
          name: 'Feijão carioca em caldo grosso',
          portion: '100g (1 concha)',
          quantity: 1,
          calories: 90,
          proteinG: 5,
          carbsG: 16,
          fatG: 0.5,
          substitutions: ['100g de lentilha ou grão de bico'],
        },
        {
          id: 'item_2_4',
          name: 'Azeite de oliva extra virgem',
          portion: '10ml (1 colher de sopa)',
          quantity: 1,
          calories: 90,
          proteinG: 0,
          carbsG: 0,
          fatG: 10,
        },
      ],
    },
    {
      id: 'meal_3',
      name: 'Lanche Pré-Treino Energético',
      time: '16:00',
      calories: 450,
      proteinG: 28,
      carbsG: 65,
      fatG: 8,
      items: [
        {
          id: 'item_3_1',
          name: 'Pão de forma integral 100%',
          portion: '2 fatias (50g)',
          quantity: 1,
          calories: 120,
          proteinG: 5,
          carbsG: 22,
          fatG: 1.5,
        },
        {
          id: 'item_3_2',
          name: 'Pasta de amendoim integral',
          portion: '20g',
          quantity: 1,
          calories: 125,
          proteinG: 6,
          carbsG: 4,
          fatG: 10,
        },
        {
          id: 'item_3_3',
          name: 'Whey Protein com Creatina (5g)',
          portion: '1 dose (30g)',
          quantity: 1,
          calories: 120,
          proteinG: 24,
          carbsG: 2,
          fatG: 1,
        },
      ],
    },
    {
      id: 'meal_4',
      name: 'Jantar Reparador & Reposição de Glicogênio',
      time: '20:30',
      calories: 720,
      proteinG: 50,
      carbsG: 85,
      fatG: 16,
      items: [
        {
          id: 'item_4_1',
          name: 'Patinho moído de primeira refogado',
          portion: '160g',
          quantity: 1,
          calories: 280,
          proteinG: 48,
          carbsG: 0,
          fatG: 9,
          substitutions: ['180g de salmão grelhado ou 200g filé de frango'],
        },
        {
          id: 'item_4_2',
          name: 'Batata doce cozida ou assada',
          portion: '220g',
          quantity: 1,
          calories: 220,
          proteinG: 3,
          carbsG: 51,
          fatG: 0.4,
          substitutions: ['200g arroz integral com legumes'],
        },
      ],
    },
  ]);

  // Recalculate totals from meals
  const computedCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const computedProtein = meals.reduce((sum, m) => sum + m.proteinG, 0);
  const computedCarbs = meals.reduce((sum, m) => sum + m.carbsG, 0);
  const computedFat = meals.reduce((sum, m) => sum + m.fatG, 0);

  // New Food Item Form Helper
  const [activeMealForAdd, setActiveMealForAdd] = useState<string | null>(null);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPortion, setNewFoodPortion] = useState('100g');
  const [newFoodCal, setNewFoodCal] = useState<number>(150);
  const [newFoodPtn, setNewFoodPtn] = useState<number>(20);
  const [newFoodCho, setNewFoodCho] = useState<number>(10);
  const [newFoodLip, setNewFoodLip] = useState<number>(3);
  const [newFoodSubs, setNewFoodSubs] = useState('');

  const handleAddFoodItem = (mealId: string) => {
    if (!newFoodName) return;
    const newItem: NutriFoodItem = {
      id: `food_${Date.now()}`,
      name: newFoodName,
      portion: newFoodPortion,
      quantity: 1,
      calories: newFoodCal,
      proteinG: newFoodPtn,
      carbsG: newFoodCho,
      fatG: newFoodLip,
      substitutions: newFoodSubs ? [newFoodSubs] : undefined,
    };

    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          calories: m.calories + newFoodCal,
          proteinG: m.proteinG + newFoodPtn,
          carbsG: m.carbsG + newFoodCho,
          fatG: m.fatG + newFoodLip,
          items: [...m.items, newItem],
        };
      })
    );

    setActiveMealForAdd(null);
    setNewFoodName('');
  };

  const handleRemoveFoodItem = (mealId: string, itemId: string) => {
    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;
        const itemToRemove = m.items.find((i) => i.id === itemId);
        if (!itemToRemove) return m;
        return {
          ...m,
          calories: Math.max(0, m.calories - itemToRemove.calories),
          proteinG: Math.max(0, m.proteinG - itemToRemove.proteinG),
          carbsG: Math.max(0, m.carbsG - itemToRemove.carbsG),
          fatG: Math.max(0, m.fatG - itemToRemove.fatG),
          items: m.items.filter((i) => i.id !== itemId),
        };
      })
    );
  };

  const handleSaveAndPublish = () => {
    if (!selectedPatient) return;

    const newPlan: NutriMealPlan = {
      id: `plan_${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      authorId: 'usr_gymlabs_nutri',
      authorName: 'Dra. Elena Vance (CRN-3 48192)',
      title,
      objective,
      version: 2.1,
      status: 'PUBLISHED',
      totalCaloriesTarget: targetCalories,
      totalProteinGTarget: targetProtein,
      totalCarbsGTarget: targetCarbs,
      totalFatGTarget: targetFat,
      waterIntakeMlTarget: targetWater,
      meals,
      guidanceNotes,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    addNutriMealPlan(newPlan);
    publishNutriMealPlan(newPlan.id);
    alert(`Plano "${title}" publicado com sucesso para o paciente ${selectedPatient.name}! O plano já está sincronizado e ativo no app do aluno.`);
  };

  const handleLoadTemplate = (type: 'BULK' | 'CUT' | 'RECOMP') => {
    if (type === 'BULK') {
      setTitle('Protocolo Superávit Miofibrilar (Bulking Limpo)');
      setTargetCalories(3200);
      setTargetProtein(190);
      setTargetCarbs(420);
      setTargetFat(80);
    } else if (type === 'CUT') {
      setTitle('Protocolo Déficit Calórico Agressivo (Cutting)');
      setTargetCalories(2100);
      setTargetProtein(185);
      setTargetCarbs(170);
      setTargetFat(55);
    } else {
      setTitle('Protocolo Recomposição Isocalórica');
      setTargetCalories(2600);
      setTargetProtein(180);
      setTargetCarbs(280);
      setTargetFat(70);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Config & Patient Selector */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                CONSTRUTOR DE PLANO ALIMENTAR // DIET BUILDER PROFISSIONAL
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Monte refeições personalizadas com alimentos, porções, macronutrientes e opções de substituição.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndPublish}
              className="px-5 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>PUBLICAR PLANO PARA O PACIENTE</span>
            </button>
          </div>
        </div>

        {/* Patient Selection & Plan Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Paciente Destinatário</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
            >
              {nutriPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.weightKg} kg // {p.primaryGoal})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Título do Protocolo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-bold"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Modelos Salvos (Templates)</label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadTemplate('BULK')}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold uppercase text-zinc-300 border border-zinc-800"
              >
                Bulking
              </button>
              <button
                type="button"
                onClick={() => handleLoadTemplate('CUT')}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold uppercase text-zinc-300 border border-zinc-800"
              >
                Cutting
              </button>
              <button
                type="button"
                onClick={() => handleLoadTemplate('RECOMP')}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold uppercase text-zinc-300 border border-zinc-800"
              >
                Recomp
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional Targets vs Computed */}
        <div className="p-4 bg-black border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Calorias Calculadas</span>
            <div className="text-xl font-black text-white">{computedCalories} kcal</div>
            <span className="text-[10px] text-zinc-400">Meta: {targetCalories} kcal</span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Proteína Total</span>
            <div className="text-xl font-black text-white">{computedProtein}g</div>
            <span className="text-[10px] text-zinc-400">
              {((computedProtein * 4 * 100) / (computedCalories || 1)).toFixed(0)}% das kcal
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Carboidrato Total</span>
            <div className="text-xl font-black text-white">{computedCarbs}g</div>
            <span className="text-[10px] text-zinc-400">
              {((computedCarbs * 4 * 100) / (computedCalories || 1)).toFixed(0)}% das kcal
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Lipídios Totais</span>
            <div className="text-xl font-black text-white">{computedFat}g</div>
            <span className="text-[10px] text-zinc-400">
              {((computedFat * 9 * 100) / (computedCalories || 1)).toFixed(0)}% das kcal
            </span>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Refeições Estruturadas ({meals.length} refeições programadas)
          </h3>
          <button
            type="button"
            onClick={() => {
              const newMealNumber = meals.length + 1;
              setMeals([
                ...meals,
                {
                  id: `meal_${Date.now()}`,
                  name: `Refeição ${newMealNumber}`,
                  time: '15:00',
                  calories: 0,
                  proteinG: 0,
                  carbsG: 0,
                  fatG: 0,
                  items: [],
                },
              ]);
            }}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Refeição</span>
          </button>
        </div>

        {meals.map((meal) => (
          <div key={meal.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold">
                  <Clock className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase">{meal.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">[{meal.time}]</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {meal.calories} kcal • {meal.proteinG}g Ptn • {meal.carbsG}g Cho • {meal.fatG}g Lip
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMealForAdd(meal.id)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase border border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Alimento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMeals(meals.filter((m) => m.id !== meal.id))}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                  title="Remover refeição"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Food Items Table */}
            <div className="space-y-2">
              {meal.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-black border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1">
                    <div className="text-white font-bold">{item.name}</div>
                    <div className="text-[10px] text-zinc-400">
                      Porção: <span className="text-zinc-200">{item.portion}</span> • {item.calories} kcal (
                      {item.proteinG}g Ptn | {item.carbsG}g Cho | {item.fatG}g Lip)
                    </div>
                    {item.substitutions && item.substitutions.length > 0 && (
                      <div className="text-[10px] text-amber-400/90 font-sans mt-0.5">
                        <span className="font-bold">Substituição: </span>
                        {item.substitutions.join(' | ')}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFoodItem(meal.id, item.id)}
                    className="text-zinc-600 hover:text-red-400 p-1 self-end sm:self-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {meal.items.length === 0 && (
                <div className="p-4 border border-dashed border-zinc-900 text-center text-zinc-500 text-xs">
                  Nenhum alimento nesta refeição. Clique em "Adicionar Alimento".
                </div>
              )}
            </div>

            {/* Add Food Form Drawer inside meal */}
            {activeMealForAdd === meal.id && (
              <div className="p-4 bg-zinc-900/80 border border-zinc-700 space-y-3 mt-3">
                <div className="text-[10px] text-white font-bold uppercase">
                  Adicionar Alimento a {meal.name}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nome do alimento (ex: Peito de Frango, Arroz, Ovos)"
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Porção (ex: 150g, 2 fatias)"
                      value={newFoodPortion}
                      onChange={(e) => setNewFoodPortion(e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Kcal"
                      value={newFoodCal}
                      onChange={(e) => setNewFoodCal(Number(e.target.value))}
                      className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Proteína (g)</label>
                    <input
                      type="number"
                      value={newFoodPtn}
                      onChange={(e) => setNewFoodPtn(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Carboidrato (g)</label>
                    <input
                      type="number"
                      value={newFoodCho}
                      onChange={(e) => setNewFoodCho(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">Lipídios (g)</label>
                    <input
                      type="number"
                      value={newFoodLip}
                      onChange={(e) => setNewFoodLip(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Opção de substituição (ex: 160g de filé de tilápia grelhado)"
                    value={newFoodSubs}
                    onChange={(e) => setNewFoodSubs(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMealForAdd(null)}
                    className="px-3 py-1 text-zinc-400 hover:text-white uppercase font-bold text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddFoodItem(meal.id)}
                    className="px-4 py-1.5 bg-white text-black font-black uppercase text-[10px] hover:bg-zinc-200 cursor-pointer"
                  >
                    Confirmar Alimento
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clinical Guidance Notes */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-2">
        <label className="block text-zinc-400 uppercase text-[10px] font-bold">
          Orientações Clínicas e Suplementares ao Paciente
        </label>
        <textarea
          rows={3}
          value={guidanceNotes}
          onChange={(e) => setGuidanceNotes(e.target.value)}
          placeholder="Instruções sobre timing de nutrientes, uso de creatina, refeição livre planejada..."
          className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white text-xs font-mono"
        />
      </div>

      {/* Bottom Publish Bar */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          Status atual: <span className="text-amber-400 font-bold uppercase">Rascunho Pronto</span>
        </div>
        <button
          type="button"
          onClick={handleSaveAndPublish}
          className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>PUBLICAR PARA O PACIENTE AGORA</span>
        </button>
      </div>
    </div>
  );
};
