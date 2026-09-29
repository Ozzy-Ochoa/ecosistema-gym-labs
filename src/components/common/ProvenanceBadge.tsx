import React from 'react';
import { DataProvenance, ProvenanceType } from '../../types/provenance';
import { ShieldCheck, Cpu, Sparkles, HelpCircle, TestTube } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance?: DataProvenance | string | null;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ provenance, size = 'sm', onClick }) => {
  const getBadgeConfig = (type: ProvenanceType) => {
    switch (type) {
      case 'REAL':
        return {
          label: 'DADO REAL',
          color: 'bg-black text-white border-white',
          icon: ShieldCheck,
        };
      case 'CALCULATED':
        return {
          label: 'CALCULADO',
          color: 'bg-zinc-950 text-white border-zinc-500',
          icon: Cpu,
        };
      case 'ESTIMATED':
        return {
          label: 'ESTIMADO',
          color: 'bg-zinc-950 text-zinc-300 border-zinc-700',
          icon: Sparkles,
        };
      case 'DEMO':
        return {
          label: 'DEMO',
          color: 'bg-zinc-950 text-zinc-400 border-zinc-800',
          icon: TestTube,
        };
      case 'INFERRED':
        return {
          label: 'INFERIDO',
          color: 'bg-zinc-950 text-zinc-400 border-zinc-800',
          icon: Sparkles,
        };
      case 'UNKNOWN':
      default:
        return {
          label: 'SEM DADOS',
          color: 'bg-zinc-950 text-zinc-500 border-zinc-800',
          icon: HelpCircle,
        };
    }
  };

  // Normalize provenance input safely whether it is an object, string, or undefined/null
  let resolvedType: ProvenanceType = 'UNKNOWN';
  let resolvedSource = 'GYM LABS Core';
  let resolvedMethod = 'Fórmula Determinística';

  if (typeof provenance === 'string') {
    const rawUpper = provenance.toUpperCase();
    if (rawUpper.includes('REAL')) {
      resolvedType = 'REAL';
    } else if (rawUpper.includes('CALCUL') || rawUpper.includes('DETERMINISTIC')) {
      resolvedType = 'CALCULATED';
    } else if (rawUpper.includes('ESTIMAT')) {
      resolvedType = 'ESTIMATED';
    } else if (rawUpper.includes('DEMO')) {
      resolvedType = 'DEMO';
    } else if (rawUpper.includes('INFER')) {
      resolvedType = 'INFERRED';
    } else {
      resolvedType = 'CALCULATED';
    }
    resolvedSource = provenance;
  } else if (provenance && typeof provenance === 'object') {
    if (provenance.type) {
      resolvedType = provenance.type;
    }
    if (provenance.source) {
      resolvedSource = provenance.source;
    }
    if ((provenance as any).method || (provenance as any).calculationMethod) {
      resolvedMethod = (provenance as any).method || (provenance as any).calculationMethod;
    }
  }

  const config = getBadgeConfig(resolvedType);
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[11px]';
  const typeKey = (resolvedType || 'unknown').toString().toLowerCase();

  return (
    <span
      id={`provenance-badge-${typeKey}`}
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider border select-none ${config.color} ${padding} ${
        onClick ? 'cursor-pointer hover:bg-white hover:text-black transition-colors' : ''
      }`}
      title={`Fonte: ${resolvedSource} | Método: ${resolvedMethod}`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{config.label}</span>
    </span>
  );
};

