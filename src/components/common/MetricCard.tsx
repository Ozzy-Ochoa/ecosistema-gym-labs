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
  accentColor?: string;
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
  onClickInspect,
}) => {
  return (
    <div
      id={id}
      className="p-4 bg-zinc-950 border border-zinc-800 hover:border-white transition-all duration-200 flex flex-col justify-between select-none font-mono"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 border border-zinc-700 bg-black text-white">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
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
      <div className="my-1.5">
        {value !== null && value !== undefined ? (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono-num tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs text-zinc-500 font-sans">{unit}</span>}
          </div>
        ) : (
          <div className="text-xs font-mono text-zinc-500 py-1 uppercase font-bold">
            SEM REGISTRO
          </div>
        )}
        {subtitle && <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{subtitle}</p>}
      </div>

      {/* Bottom row: Trend or inspect */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] text-zinc-500">
        {trend ? (
          <div className="flex items-center gap-1 font-mono font-bold text-white">
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-white" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-zinc-400" />}
            <span>{trend.delta}</span>
            {trend.label && <span className="text-zinc-500 font-normal font-sans ml-1">{trend.label}</span>}
          </div>
        ) : (
          <span />
        )}

        {onClickInspect && (
          <button
            type="button"
            onClick={onClickInspect}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase font-bold"
          >
            <Info className="w-3 h-3" />
            <span>Ver auditoria</span>
          </button>
        )}
      </div>
    </div>
  );
};
