import React from 'react';
import { HelpCircle, PlusCircle } from 'lucide-react';

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
    <div className="p-8 bg-black border border-dashed border-zinc-800 text-center max-w-lg mx-auto my-4 font-mono select-none">
      <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 text-white mx-auto flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">{description}</p>

      {protocolTip && (
        <div className="mb-4 p-3 bg-zinc-950 border border-zinc-800 text-left text-xs text-zinc-300">
          <span className="text-[10px] font-bold text-white block mb-0.5 uppercase tracking-wider">
            Protocolo Fisiológico
          </span>
          <p className="text-zinc-400 font-sans">{protocolTip}</p>
        </div>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
