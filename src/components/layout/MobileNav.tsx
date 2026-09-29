import React from 'react';
import { useGymLabs, NavigationTab } from '../../context/GymLabsContext';
import { Sun, Dumbbell, Utensils, Moon, LineChart, MoreHorizontal } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useGymLabs();

  const mobileTabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Hoje', icon: Sun },
    { id: 'training', label: 'Treino', icon: Dumbbell },
    { id: 'nutrition', label: 'Dieta', icon: Utensils },
    { id: 'recovery', label: 'Sono', icon: Moon },
    { id: 'datalab', label: 'Ciência', icon: LineChart },
  ];

  return (
    <nav
      id="gymlabs-mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-zinc-800 px-2 py-1.5 flex items-center justify-around font-mono"
    >
      {mobileTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`mobile-nav-${tab.id}`}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2.5 transition-all cursor-pointer ${
              isActive ? 'text-white font-bold' : 'text-zinc-500'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
            <span className="text-[10px] mt-0.5 uppercase">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Settings dropdown quick action */}
      <button
        id="mobile-nav-more"
        onClick={() => setCurrentTab('settings')}
        className={`flex flex-col items-center py-1 px-2.5 transition-all cursor-pointer ${
          currentTab === 'settings' || currentTab === 'body' || currentTab === 'professionals' || currentTab === 'intelligence' || currentTab === 'organizations'
            ? 'text-white font-bold'
            : 'text-zinc-500'
        }`}
      >
        <MoreHorizontal className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 uppercase">Mais</span>
      </button>
    </nav>
  );
};
