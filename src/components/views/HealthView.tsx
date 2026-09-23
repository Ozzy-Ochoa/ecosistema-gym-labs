import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { BodyView } from './BodyView';
import { NutritionView } from './NutritionView';
import { RecoveryView } from './RecoveryView';
import { Activity, Scale, Utensils, Moon } from 'lucide-react';

export const HealthView: React.FC = () => {
  const [subTab, setSubTab] = useState<'body' | 'nutrition' | 'recovery'>('body');

  return (
    <div className="space-y-4">
      {/* Sub-navigation for Health Domain */}
      <div className="border-b border-zinc-800 bg-zinc-950 p-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-mono">
          <span className="text-zinc-500 font-bold px-2 uppercase text-[10px] hidden sm:inline">
            // SUB-DOMÍNIOS DE SAÚDE:
          </span>

          <button
            type="button"
            onClick={() => setSubTab('body')}
            className={`px-3 py-1.5 border font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
              subTab === 'body'
                ? 'border-white bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>01 BIOMETRIA & COMPOSIÇÃO</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('nutrition')}
            className={`px-3 py-1.5 border font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
              subTab === 'nutrition'
                ? 'border-white bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>02 NUTRIÇÃO & HIDRATAÇÃO</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('recovery')}
            className={`px-3 py-1.5 border font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
              subTab === 'recovery'
                ? 'border-white bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>03 SONO & PRONTIDÃO (HRV)</span>
          </button>
        </div>
      </div>

      {/* Render selected sub-view */}
      <div>
        {subTab === 'body' && <BodyView />}
        {subTab === 'nutrition' && <NutritionView />}
        {subTab === 'recovery' && <RecoveryView />}
      </div>
    </div>
  );
};
