import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  Dumbbell,
  Search,
  Plus,
  Filter,
  CheckCircle,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export const TrainerExercisesTab: React.FC = () => {
  const { exercises } = useGymLabs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Exercise Form
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Peito');
  const [equipment, setEquipment] = useState('Halteres');
  const [executionCues, setExecutionCues] = useState('');

  const muscles = [
    'ALL',
    'Peito',
    'Costas',
    'Quadríceps',
    'Isquiotibiais',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Abdômen',
    'Panturrilha',
  ];

  // Comprehensive Brazilian exercises catalog
  const catalog = [
    {
      name: 'Supino Reto com Barra Olímpica',
      muscle: 'Peito',
      equipment: 'Barra Olímpica',
      difficulty: 'Intermediário',
      cues: 'Retração escapular firme no banco, pés plantados no chão, descida controlada tocando o esterno.',
      alternatives: 'Supino com Halteres, Supino no Smith',
    },
    {
      name: 'Supino Inclinado com Halteres',
      muscle: 'Peito',
      equipment: 'Halteres',
      difficulty: 'Intermediário',
      cues: 'Banco a 30 graus, cotovelos flexionados a 45 graus em relação ao tronco, máxima amplitude excêntrica.',
      alternatives: 'Supino Inclinado com Barra, Crucifixo Inclinado',
    },
    {
      name: 'Puxada Alta Pronada (Pulldown)',
      muscle: 'Costas',
      equipment: 'Polia / Cabo',
      difficulty: 'Iniciante',
      cues: 'Pegada aberta pronada, puxar na direção do osso esterno deprimindo as escápulas.',
      alternatives: 'Barra Fixa Pronada, Puxada Triângulo',
    },
    {
      name: 'Remada Curvada com Barra',
      muscle: 'Costas',
      equipment: 'Barra Olímpica',
      difficulty: 'Avançado',
      cues: 'Tronco inclinado a 45 graus com coluna neutra, puxar a barra até encostar na linha da cintura.',
      alternatives: 'Remada Cavalinho, Remada Baixa na Polia',
    },
    {
      name: 'Agachamento Livre com Barra',
      muscle: 'Quadríceps',
      equipment: 'Barra Olímpica',
      difficulty: 'Avançado',
      cues: 'Barra apoiada nos trapézios, pés alinhados aos ombros, descer até que as coxas quebrem o paralelo.',
      alternatives: 'Agachamento Frontal, Leg Press 45',
    },
    {
      name: 'Leg Press 45 Graus',
      muscle: 'Quadríceps',
      equipment: 'Máquina',
      difficulty: 'Iniciante',
      cues: 'Pés na largura do quadril na plataforma, amplitude máxima sem retroversão da pelve.',
      alternatives: 'Hack Squat, Agachamento Smith',
    },
    {
      name: 'Mesa Flexora',
      muscle: 'Isquiotibiais',
      equipment: 'Máquina',
      difficulty: 'Iniciante',
      cues: 'Alinhar o eixo do joelho com o da máquina, contração completa e excêntrica lenta.',
      alternatives: 'Stiff com Barra, Cadeira Flexora',
    },
    {
      name: 'Stiff com Halteres ou Barra',
      muscle: 'Isquiotibiais',
      equipment: 'Halteres',
      difficulty: 'Intermediário',
      cues: 'Flexão primária de quadril (hip hinge), mantendo as costas retas e joelhos levemente destravados.',
      alternatives: 'Good Morning, Levantamento Terra Romeno',
    },
    {
      name: 'Desenvolvimento Militar com Halteres',
      muscle: 'Ombros',
      equipment: 'Halteres',
      difficulty: 'Intermediário',
      cues: 'Elevação vertical dos halteres sem bater no topo, mantendo abdômen contraído.',
      alternatives: 'Desenvolvimento com Barra, Máquina articulada',
    },
    {
      name: 'Elevação Lateral com Halteres',
      muscle: 'Ombros',
      equipment: 'Halteres',
      difficulty: 'Iniciante',
      cues: 'Braços levemente semiflexionados no plano escapular, elevar até a altura dos ombros.',
      alternatives: 'Elevação Lateral na Polia, Máquina de Elevação',
    },
    {
      name: 'Rosca Direta com Barra W',
      muscle: 'Bíceps',
      equipment: 'Barra W',
      difficulty: 'Iniciante',
      cues: 'Cotovelos estáveis ao lado do tronco, sem balanço corporal.',
      alternatives: 'Rosca Alternada com Halteres, Rosca Scott',
    },
    {
      name: 'Tríceps Polia com Barra Reta ou Corda',
      muscle: 'Tríceps',
      equipment: 'Polia / Cabos',
      difficulty: 'Iniciante',
      cues: 'Extensão máxima dos cotovelos, isolando a cabeça lateral e medial do tríceps.',
      alternatives: 'Tríceps Testa, Tríceps Francês',
    },
  ];

  const filtered = catalog.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.cues.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'ALL' || ex.muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-4 h-4 text-white" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              BIBLIOTECA TÉCNICA DE EXERCÍCIOS // BIOMECÂNICA APLICADA
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Catálogo de movimentos estruturado por padrões motores, execução biomecânica e exercícios alternativos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADICIONAR NOVO EXERCÍCIO</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950 p-4 border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar exercício por nome ou dica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {muscles.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase border transition-colors shrink-0 ${
                selectedMuscle === m
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {m === 'ALL' ? 'TODOS' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">{item.name}</h4>
                <div className="text-[10px] text-zinc-500">{item.muscle} • {item.equipment}</div>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 font-bold uppercase">
                {item.difficulty}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              <span className="text-zinc-500 font-bold block text-[9px] uppercase font-mono">Dica Biomecânica:</span>
              {item.cues}
            </p>

            <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-sans">
              <span className="font-bold text-zinc-400">Alternativas: </span>
              {item.alternatives}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Exercício */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Novo Exercício Customizado</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Exercício "${name}" adicionado à sua biblioteca pessoal com sucesso!`);
                setShowNewModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Nome do Exercício *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Agachamento Búlgaro com Halteres"
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Grupo Muscular</label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="Peito">Peito</option>
                    <option value="Costas">Costas</option>
                    <option value="Quadríceps">Quadríceps</option>
                    <option value="Isquiotibiais">Isquiotibiais</option>
                    <option value="Ombros">Ombros</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Panturrilha">Panturrilha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Equipamento</label>
                  <input
                    type="text"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    placeholder="Ex: Halteres, Barra, Cabo"
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Instruções Biomecânicas</label>
                <textarea
                  rows={3}
                  value={executionCues}
                  onChange={(e) => setExecutionCues(e.target.value)}
                  placeholder="Posicionamento dos pés, amplitude, cadência..."
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase hover:bg-zinc-200"
                >
                  Cadastrar Exercício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
