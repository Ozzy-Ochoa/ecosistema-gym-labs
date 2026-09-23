import React from 'react';
import { DataProvenance } from '../../types/provenance';
import { ProvenanceBadge } from './ProvenanceBadge';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle?: string;
  provenance?: DataProvenance;
  trend?: {
    delta: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'slate';
  onClickInspect?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  subtitle,
  provenance,
  trend,
  icon: Icon,
  accentColor = 'cyan',
  onClickInspect,
}) => {
  const getBorder = () => {
    switch (accentColor) {
      case 'emerald':
        return 'hover:border-emerald-500/40 border-slate-800/80';
      case 'amber':
        return 'hover:border-amber-500/40 border-slate-800/80';
      case 'violet':
        return 'hover:border-violet-500/40 border-slate-800/80';
      case 'cyan':
      default:
        return 'hover:border-cyan-500/40 border-slate-800/80';
    }
  };

  return (
    <div
      id={id}
      className={`p-4 rounded-2xl bg-[#0F172A]/90 border ${getBorder()} transition-all duration-200 flex flex-col justify-between group relative overflow-hidden`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/50">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-medium text-slate-300 tracking-wide">{title}</span>
        </div>
        {provenance && (
          <ProvenanceBadge
            provenance={provenance}
            size="sm"
            onClick={onClickInspect}
          />
        )}
      </div>

      {/* Main value */}
      <div className="my-1">
        {value !== null && value !== undefined ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono-num">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-slate-400 font-mono">{unit}</span>}
          </div>
        ) : (
          <div className="text-sm font-mono text-amber-400/90 py-1">INSUFFICIENT DATA</div>
        )}
      </div>

      {/* Subtitle / Footer with Inspection trigger */}
      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          {trend && (
            <span
              className={`flex items-center gap-0.5 font-mono font-medium ${
                trend.direction === 'up'
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend.delta}
            </span>
          )}
          <span className="truncate">{subtitle || (trend ? trend.label : '')}</span>
        </div>

        {onClickInspect && (
          <button
            onClick={onClickInspect}
            title="Inspect Calculation Details & Evidence"
            className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors ml-2 shrink-0"
          >
            <Info className="w-3 h-3" />
            <span>Formula</span>
          </button>
        )}
      </div>
    </div>
  );
};
