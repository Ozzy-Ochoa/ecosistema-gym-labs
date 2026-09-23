import React from 'react';
import { HelpCircle, PlusCircle, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  protocolTip?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  protocolTip,
  actionLabel,
  onAction,
  icon: Icon = HelpCircle,
}) => {
  return (
    <div className="p-8 rounded-2xl bg-[#0F172A]/70 border border-dashed border-slate-800 text-center max-w-lg mx-auto my-4">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
      
      {protocolTip && (
        <div className="mb-5 p-3 rounded-lg bg-[#070B13] border border-slate-800 text-left text-[11px] text-slate-300">
          <span className="font-mono font-semibold text-cyan-400 block mb-0.5 uppercase tracking-wider">
            Scientific Protocol Standard
          </span>
          {protocolTip}
        </div>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
