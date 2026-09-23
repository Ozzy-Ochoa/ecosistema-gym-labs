import React from 'react';
import { DataProvenance, ProvenanceType } from '../../types/provenance';
import { ShieldCheck, Cpu, Sparkles, HelpCircle, TestTube, AlertCircle } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance: DataProvenance;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ provenance, size = 'sm', onClick }) => {
  const getBadgeConfig = (type: ProvenanceType) => {
    switch (type) {
      case 'REAL':
        return {
          label: 'REAL',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: ShieldCheck,
        };
      case 'CALCULATED':
        return {
          label: 'CALCULATED',
          color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          icon: Cpu,
        };
      case 'ESTIMATED':
        return {
          label: 'ESTIMATED',
          color: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: Sparkles,
        };
      case 'DEMO':
        return {
          label: 'DEMO DATA',
          color: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
          icon: TestTube,
        };
      case 'INFERRED':
        return {
          label: 'INFERRED',
          color: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          icon: Sparkles,
        };
      case 'UNKNOWN':
      default:
        return {
          label: 'NO DATA',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: HelpCircle,
        };
    }
  };

  const config = getBadgeConfig(provenance.type);
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      id={`provenance-badge-${provenance.type.toLowerCase()}`}
      onClick={onClick}
      title={`${provenance.type}: ${provenance.source} (${provenance.confidence} confidence)`}
      className={`inline-flex items-center gap-1 font-mono tracking-wider font-semibold uppercase rounded-md border ${config.color} ${padding} transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{config.label}</span>
    </span>
  );
};
