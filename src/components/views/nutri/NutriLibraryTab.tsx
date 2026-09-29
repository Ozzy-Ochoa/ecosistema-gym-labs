import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Utensils,
  Droplet,
  Sparkles,
  Download,
  Check
} from 'lucide-react';

export const NutriLibraryTab: React.FC = () => {
  const { nutriLibrary } = useGymLabs();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Hardcoded rich Brazilian TACO / USDA sports nutrition database
  const foodDatabase = [
    { name: 'Peito de Frango cozido/grelhado', portion: '100g', kcal: 159, ptn: 32, cho: 0, lip: 2.5, group: 'Proteínas Magras' },
    { name: 'Ovo de galinha inteiro cozido', portion: '50g (1 un)', kcal: 74, ptn: 6.3, cho: 0.5, lip: 5.3, group: 'Proteínas / Ovos' },
    { name: 'Clara de ovo pasteurizada', portion: '100g', kcal: 52, ptn: 11, cho: 0.7, lip: 0.2, group: 'Proteínas Magras' },
    { name: 'Filé de Tilápia grelhado', portion: '100g', kcal: 128, ptn: 26, cho: 0, lip: 2.7, group: 'Pescados' },
    { name: 'Patinho bovino moído grelhado', portion: '100g', kcal: 185, ptn: 30, cho: 0, lip: 7.3, group: 'Carnes Bovinas' },
    { name: 'Salmão fresco grelhado', portion: '100g', kcal: 206, ptn: 22, cho: 0, lip: 13, group: 'Pescados / Ômega-3' },
    { name: 'Arroz branco cozido', portion: '100g', kcal: 130, ptn: 2.7, cho: 28, lip: 0.3, group: 'Carboidratos' },
    { name: 'Arroz integral cozido', portion: '100g', kcal: 124, ptn: 2.6, cho: 25.8, lip: 1, group: 'Carboidratos' },
    { name: 'Batata doce cozida', portion: '100g', kcal: 86, ptn: 1.6, cho: 20.1, lip: 0.1, group: 'Carboidratos' },
    { name: 'Batata inglesa cozida', portion: '100g', kcal: 77, ptn: 2, cho: 17.5, lip: 0.1, group: 'Carboidratos' },
    { name: 'Mandioca / Aipim cozido', portion: '100g', kcal: 125, ptn: 0.6, cho: 30.1, lip: 0.3, group: 'Carboidratos' },
    { name: 'Feijão carioca cozido 50% caldo', portion: '100g', kcal: 76, ptn: 4.8, cho: 13.6, lip: 0.5, group: 'Leguminosas' },
    { name: 'Aveia em flocos finos', portion: '100g', kcal: 389, ptn: 16.9, cho: 66.3, lip: 6.9, group: 'Cereais / Fibras' },
    { name: 'Banana prata', portion: '100g (1 un)', kcal: 98, ptn: 1.3, cho: 26, lip: 0.1, group: 'Frutas' },
    { name: 'Pasta de amendoim integral', portion: '100g', kcal: 588, ptn: 25, cho: 20, lip: 50, group: 'Gorduras / Oleaginosas' },
    { name: 'Azeite de oliva extra virgem', portion: '10ml (1 colher)', kcal: 88, ptn: 0, cho: 0, lip: 10, group: 'Gorduras Boas' },
    { name: 'Whey Protein Isolado (80% ptn)', portion: '30g', kcal: 115, ptn: 24, cho: 1.5, lip: 0.8, group: 'Suplementos' },
    { name: 'Creatina Monohidratada 100%', portion: '5g', kcal: 0, ptn: 0, cho: 0, lip: 0, group: 'Ergogênicos' },
  ];

  const recipes = [
    {
      title: 'Panqueca Anabólica Hiperproteica',
      calories: 380,
      macros: '38g Ptn | 35g Cho | 8g Lip',
      prepTime: '8 minutos',
      ingredients: '3 claras de ovos, 1 ovo inteiro, 40g farelo de aveia, 15g whey de baunilha, canela a gosto.',
      instructions: 'Bata os ingredientes no liquidificador ou garfo e doure em frigideira antiaderente levemente untada.',
    },
    {
      title: 'Smoothie Termogênico Pós-Treino',
      calories: 290,
      macros: '30g Ptn | 32g Cho | 4g Lip',
      prepTime: '5 minutos',
      ingredients: '1 scoop de Whey Protein sabor morango, 100g frutas vermelhas congeladas, 150ml água de coco, 5g creatina.',
      instructions: 'Bata tudo no liquidificador com gelo picado até consistência cremosa.',
    },
    {
      title: 'Mingau Noturno de Liberação Lenta',
      calories: 340,
      macros: '28g Ptn | 38g Cho | 7g Lip',
      prepTime: '6 minutos',
      ingredients: '45g de aveia em flocos finos, 200ml leite sem lactose/desnatado, 20g caseína micelar ou albumina, canela.',
      instructions: 'Cozinhe a aveia com o leite em fogo brando. Desligue o fogo e adicione a caseína mexendo vigorosamente.',
    },
  ];

  const filteredFoods = foodDatabase.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-white" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              BIBLIOTECA NUTRICIONAL DO PROFISSIONAL // TACO, RECEITAS & PROTOCOLOS
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Tabela de composição de alimentos de alta precisão, acervo de preparações culinárias e cartilhas clínicas prontas.
          </p>
        </div>
      </div>

      {/* Tabs / Subsections: Alimentos, Receitas, Protocolos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tabela de Alimentos */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tabela de Alimentos & Micronutrientes (TACO / USDA)
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">100g BASE</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Pesquisar alimento por nome ou grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-white"
              />
            </div>

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black text-zinc-500 border-b border-zinc-900 text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5">Alimento</th>
                    <th className="p-2.5">Porção</th>
                    <th className="p-2.5">Kcal</th>
                    <th className="p-2.5">Ptn (g)</th>
                    <th className="p-2.5">Cho (g)</th>
                    <th className="p-2.5">Lip (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredFoods.map((food, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-2.5">
                        <div className="text-white font-bold">{food.name}</div>
                        <div className="text-[9px] text-zinc-500">{food.group}</div>
                      </td>
                      <td className="p-2.5 text-zinc-400">{food.portion}</td>
                      <td className="p-2.5 text-white font-bold">{food.kcal}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{food.ptn}</td>
                      <td className="p-2.5 text-amber-400 font-bold">{food.cho}</td>
                      <td className="p-2.5 text-rose-400 font-bold">{food.lip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Receitas Funcionais & Cartilhas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Receitas Funcionais Prontas para Prescrição
              </h3>
            </div>

            <div className="space-y-3">
              {recipes.map((r, i) => (
                <div key={i} className="p-3.5 bg-black border border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase">{r.title}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">{r.prepTime}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">
                    {r.calories} kcal • {r.macros}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-sans">
                    <span className="text-zinc-500 font-bold block text-[10px] uppercase">Ingredientes:</span>
                    {r.ingredients}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans italic border-l border-zinc-800 pl-2">
                    {r.instructions}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Protocol Guides */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Materiais Educativos & Protocolos
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-black border border-zinc-900 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold uppercase text-[11px]">
                    Guia de Hidratação Sawka & Eletrólitos
                  </div>
                  <span className="text-[10px] text-zinc-500">PDF Clínico • 12 páginas</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Download do protocolo Sawka iniciado.')}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-black border border-zinc-900 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold uppercase text-[11px]">
                    Timing de Creatina, Cafeína & Beta-Alanina
                  </div>
                  <span className="text-[10px] text-zinc-500">Infográfico para Pacientes</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Download do infográfico iniciado.')}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
