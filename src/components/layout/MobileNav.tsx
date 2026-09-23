import React from 'react';
import { useGymLabs, NavigationTab } from '../../context/GymLabsContext';
import { Sun, Dumbbell, Utensils, Moon, LineChart, MoreHorizontal } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useGymLabs();

  const mobileTabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'training', label: 'Training', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'recovery', label: 'Recovery', icon: Moon },
    { id: 'datalab', label: 'Data Lab', icon: LineChart },
  ];

  return (
    <nav
      id="gymlabs-mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around"
    >
      {mobileTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`mobile-nav-${tab.id}`}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1 font-mono">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Settings dropdown quick action */}
      <button
        id="mobile-nav-more"
        onClick={() => setCurrentTab(currentTab === 'settings' ? 'trust' : 'settings')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
          currentTab === 'settings' || currentTab === 'trust' || currentTab === 'professionals' || currentTab === 'intelligence'
            ? 'text-cyan-400 font-semibold'
            : 'text-slate-400'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-mono">More</span>
      </button>
    </nav>
  );
};
