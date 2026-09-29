import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';

export interface MuscleGroupInfo {
  id: string;
  name: string;
  latinName: string;
  weeklySets: number;
  targetSets: number;
  symmetryPct: number;
  status: 'OPTIMAL' | 'UNDERLOADED' | 'OVERLOADED';
  keyExercises: string[];
  lastTrained: string;
}

const MUSCLE_DATA: Record<string, MuscleGroupInfo> = {
  peito: {
    id: 'peito',
    name: 'Peitoral Maior & Menor',
    latinName: 'Pectoralis Major / Minor',
    weeklySets: 14,
    targetSets: 16,
    symmetryPct: 98,
    status: 'OPTIMAL',
    keyExercises: ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Crossover Polia Média'],
    lastTrained: 'Ontem',
  },
  costas: {
    id: 'costas',
    name: 'Dorsais & Trapézio',
    latinName: 'Latissimus Dorsi / Trapezius',
    weeklySets: 18,
    targetSets: 18,
    symmetryPct: 96,
    status: 'OPTIMAL',
    keyExercises: ['Barra Fixa Pronada', 'Remada Curvada com Barra', 'Pulldown Neutro'],
    lastTrained: 'Há 2 dias',
  },
  ombros: {
    id: 'ombros',
    name: 'Deltoides (Ant/Lat/Post)',
    latinName: 'Deltoideus Clavicular/Acromial/Spinal',
    weeklySets: 16,
    targetSets: 16,
    symmetryPct: 94,
    status: 'OPTIMAL',
    keyExercises: ['Desenvolvimento Overhead (OHP)', 'Elevação Lateral Polia', 'Face Pull'],
    lastTrained: 'Hoje',
  },
  bracos: {
    id: 'bracos',
    name: 'Bíceps & Tríceps',
    latinName: 'Biceps Brachii / Triceps Brachii',
    weeklySets: 12,
    targetSets: 14,
    symmetryPct: 99,
    status: 'OPTIMAL',
    keyExercises: ['Tríceps Testa Barra W', 'Rosca Inclinada Halteres', 'Tríceps Corda'],
    lastTrained: 'Hoje',
  },
  quadriceps: {
    id: 'quadriceps',
    name: 'Quadríceps Femoral',
    latinName: 'Quadriceps Femoris',
    weeklySets: 16,
    targetSets: 18,
    symmetryPct: 97,
    status: 'OPTIMAL',
    keyExercises: ['Agachamento Livre com Barra', 'Leg Press 45°', 'Cadeira Extensora Unilateral'],
    lastTrained: 'Há 3 dias',
  },
  isquiotibiais: {
    id: 'isquiotibiais',
    name: 'Posteriores de Coxa & Glúteos',
    latinName: 'Hamstrings & Gluteus Maximus',
    weeklySets: 14,
    targetSets: 16,
    symmetryPct: 95,
    status: 'OPTIMAL',
    keyExercises: ['Levantamento Terra Romeno (RDL)', 'Mesa Flexora', 'Elevação Pélvica com Barra'],
    lastTrained: 'Há 3 dias',
  },
  panturrilhas: {
    id: 'panturrilhas',
    name: 'Gastrocnêmio & Sóleo',
    latinName: 'Gastrocnemius / Soleus',
    weeklySets: 10,
    targetSets: 12,
    symmetryPct: 98,
    status: 'OPTIMAL',
    keyExercises: ['Panturrilha em Pé na Máquina', 'Panturrilha Sentado (Sóleo)'],
    lastTrained: 'Hoje',
  },
  core: {
    id: 'core',
    name: 'Reto Abdominal & Oblíquos',
    latinName: 'Rectus Abdominis / Obliques',
    weeklySets: 8,
    targetSets: 10,
    symmetryPct: 100,
    status: 'OPTIMAL',
    keyExercises: ['Abdominal Suspenso na Barra', 'Prancha Isométrica com Carga', 'Abdominal Cabo'],
    lastTrained: 'Ontem',
  },
};

export const BodyHudCanvas: React.FC = () => {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('peito');
  const [viewOrientation, setViewOrientation] = useState<'ANTERIOR' | 'POSTERIOR'>('ANTERIOR');

  const current = MUSCLE_DATA[selectedMuscle] || MUSCLE_DATA.peito;

  return (
    <div className="p-6 bg-black border border-zinc-800 text-zinc-100 font-mono select-none">
      {/* Corner HUD Markers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-white" />
            <h3 className="text-xs uppercase tracking-widest text-white font-bold">
              Visualizador Anatômico HUD // Mapeamento Muscular
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Renderização vetorial anatômica interativa — monitoramento de simetria e volume por grupamento
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-zinc-800 bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => setViewOrientation('ANTERIOR')}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              viewOrientation === 'ANTERIOR'
                ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Vista Anterior
          </button>
          <button
            type="button"
            onClick={() => setViewOrientation('POSTERIOR')}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              viewOrientation === 'POSTERIOR'
                ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Vista Posterior
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Anatomical Vector Diagram in strict monochrome */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 relative">
          <div className="relative w-64 h-96 flex items-center justify-center">
            <svg
              viewBox="0 0 200 320"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head / Cranium */}
              <circle
                cx="100"
                cy="28"
                r="18"
                fill="#000000"
                stroke="#52525B"
                strokeWidth="1.5"
              />
              {/* Neck */}
              <rect x="94" y="46" width="12" height="12" fill="#000000" stroke="#52525B" strokeWidth="1" />

              {viewOrientation === 'ANTERIOR' ? (
                <>
                  {/* Pectorals / Chest */}
                  <path
                    d="M 75 58 L 125 58 L 130 92 L 100 96 L 70 92 Z"
                    fill={selectedMuscle === 'peito' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'peito' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'peito' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('peito')}
                  />

                  {/* Core / Abdominals */}
                  <path
                    d="M 80 98 L 120 98 L 115 150 L 85 150 Z"
                    fill={selectedMuscle === 'core' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'core' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'core' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('core')}
                  />

                  {/* Left Shoulder */}
                  <circle
                    cx="60"
                    cy="68"
                    r="12"
                    fill={selectedMuscle === 'ombros' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'ombros' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'ombros' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('ombros')}
                  />

                  {/* Right Shoulder */}
                  <circle
                    cx="140"
                    cy="68"
                    r="12"
                    fill={selectedMuscle === 'ombros' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'ombros' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'ombros' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('ombros')}
                  />

                  {/* Left Arm */}
                  <rect
                    x="48"
                    y="84"
                    width="12"
                    height="58"
                    rx="2"
                    fill={selectedMuscle === 'bracos' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'bracos' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'bracos' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('bracos')}
                  />

                  {/* Right Arm */}
                  <rect
                    x="140"
                    y="84"
                    width="12"
                    height="58"
                    rx="2"
                    fill={selectedMuscle === 'bracos' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'bracos' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'bracos' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('bracos')}
                  />

                  {/* Pelvis */}
                  <path d="M 85 152 L 115 152 L 120 170 L 80 170 Z" fill="#09090B" stroke="#3F3F46" strokeWidth="1" />

                  {/* Left Quad */}
                  <path
                    d="M 76 174 L 96 174 L 92 235 L 72 235 Z"
                    fill={selectedMuscle === 'quadriceps' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'quadriceps' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'quadriceps' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('quadriceps')}
                  />

                  {/* Right Quad */}
                  <path
                    d="M 104 174 L 124 174 L 128 235 L 108 235 Z"
                    fill={selectedMuscle === 'quadriceps' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'quadriceps' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'quadriceps' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('quadriceps')}
                  />

                  {/* Calves */}
                  <rect
                    x="70"
                    y="245"
                    width="18"
                    height="55"
                    rx="2"
                    fill={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'panturrilhas' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('panturrilhas')}
                  />
                  <rect
                    x="112"
                    y="245"
                    width="18"
                    height="55"
                    rx="2"
                    fill={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'panturrilhas' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('panturrilhas')}
                  />
                </>
              ) : (
                <>
                  {/* Posterior: Back */}
                  <path
                    d="M 70 56 L 130 56 L 122 135 L 100 145 L 78 135 Z"
                    fill={selectedMuscle === 'costas' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'costas' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'costas' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('costas')}
                  />

                  {/* Rear Deltoids */}
                  <circle
                    cx="60"
                    cy="68"
                    r="12"
                    fill={selectedMuscle === 'ombros' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'ombros' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'ombros' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('ombros')}
                  />
                  <circle
                    cx="140"
                    cy="68"
                    r="12"
                    fill={selectedMuscle === 'ombros' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'ombros' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'ombros' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('ombros')}
                  />

                  {/* Triceps */}
                  <rect
                    x="48"
                    y="84"
                    width="12"
                    height="58"
                    rx="2"
                    fill={selectedMuscle === 'bracos' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'bracos' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'bracos' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('bracos')}
                  />
                  <rect
                    x="140"
                    y="84"
                    width="12"
                    height="58"
                    rx="2"
                    fill={selectedMuscle === 'bracos' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'bracos' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'bracos' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('bracos')}
                  />

                  {/* Hamstrings / Gluteals */}
                  <path
                    d="M 74 165 L 126 165 L 122 235 L 102 235 L 98 235 L 78 235 Z"
                    fill={selectedMuscle === 'isquiotibiais' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'isquiotibiais' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'isquiotibiais' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('isquiotibiais')}
                  />

                  {/* Calves */}
                  <rect
                    x="70"
                    y="245"
                    width="18"
                    height="55"
                    rx="2"
                    fill={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'panturrilhas' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('panturrilhas')}
                  />
                  <rect
                    x="112"
                    y="245"
                    width="18"
                    height="55"
                    rx="2"
                    fill={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#18181B'}
                    fillOpacity={selectedMuscle === 'panturrilhas' ? 0.9 : 0.6}
                    stroke={selectedMuscle === 'panturrilhas' ? '#FFFFFF' : '#71717A'}
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:fill-zinc-300"
                    onClick={() => setSelectedMuscle('panturrilhas')}
                  />
                </>
              )}
            </svg>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 mt-2">
            [ Clique em qualquer grupamento para examinar a telemetria mecânica ]
          </div>
        </div>

        {/* Selected Muscle Telemetry Card */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-zinc-950 border border-zinc-800 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                  ALVO BIOMECÂNICO // {current.latinName}
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5 uppercase">{current.name}</h4>
              </div>
              <span className="px-2 py-0.5 border border-white text-white text-[10px] font-bold">
                {current.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-3 bg-black border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Séries Semanais</span>
                <div className="text-2xl font-black text-white mt-1">
                  {current.weeklySets} <span className="text-xs text-zinc-500 font-normal">/ {current.targetSets}</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 mt-2">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${Math.min(100, (current.weeklySets / current.targetSets) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-black border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Índice Simetria</span>
                <div className="text-2xl font-black text-white mt-1">
                  {current.symmetryPct}%
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1 font-sans">E/D Balanceamento</span>
              </div>
            </div>

            {/* Key Exercises in Current Mesocycle */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                Exercícios Principais (Mesociclo Ativo):
              </span>
              <div className="space-y-1">
                {current.keyExercises.map((ex, i) => (
                  <div
                    key={i}
                    className="p-2 bg-black border border-zinc-900 text-xs text-zinc-300 font-sans flex items-center justify-between"
                  >
                    <span>{ex}</span>
                    <span className="text-[10px] font-mono text-zinc-500">Primário</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Última estimulação: {current.lastTrained}</span>
            <span className="text-white font-bold">RECUPERADO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
