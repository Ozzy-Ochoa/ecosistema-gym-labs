import React from 'react';
import { DeterministicCalculationResult } from '../../types/science';
import { ProvenanceBadge } from './ProvenanceBadge';
import { X, BookOpen, Calculator, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CalculationModalProps {
  calculation: DeterministicCalculationResult<any> | null;
  onClose: () => void;
}

export const CalculationModal: React.FC<CalculationModalProps> = ({ calculation, onClose }) => {
  if (!calculation) return null;

  return (
    <div
      id="calculation-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 font-mono select-none"
      onClick={onClose}
    >
      <div
        id="calculation-modal-container"
        className="relative w-full max-w-2xl bg-black border border-white p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] text-white max-h-[90vh] flex flex-col space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm uppercase text-white">{calculation.formulaName}</h3>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300">
                  v{calculation.formulaVersion}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">GYM LABS // MOTOR DETERMINÍSTICO</p>
            </div>
          </div>
          <button
            id="close-calculation-modal-button"
            onClick={onClose}
            className="p-1 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-5 text-xs pr-1">
          {/* Result Banner */}
          <div className="p-4 bg-zinc-950 border border-zinc-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                Resultado Computado
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {calculation.result !== null ? (
                  typeof calculation.result === 'object' ? (
                    JSON.stringify(calculation.result)
                  ) : (
                    <>
                      {calculation.result}{' '}
                      <span className="text-xs font-normal text-zinc-400">{calculation.unit}</span>
                    </>
                  )
                ) : (
                  <span className="text-zinc-400 text-base">DADOS INSUFICIENTES</span>
                )}
              </div>
            </div>
            <ProvenanceBadge provenance={calculation.provenance} size="md" />
          </div>

          {/* Mathematical Expression */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase font-bold text-zinc-400">Expressão Matemática</h4>
            <div className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px] overflow-x-auto">
              {calculation.formulaExpression}
            </div>
          </div>

          {/* Inputs Audit */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase font-bold text-zinc-400">Variáveis e Entradas</h4>
            <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2 font-mono">
              {Object.entries(calculation.inputsUsed).map(([key, input]: [string, any]) => (
                <div key={key} className="flex items-center justify-between text-[11px] border-b border-zinc-900 pb-1">
                  <span className="text-zinc-400">{key}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{String(input?.value ?? input)}</span>
                    {input?.provenance && (
                      <span className="text-[9px] px-1 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase">
                        {String(input.provenance)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Reference */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold uppercase text-[10px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Base Científica & Validação</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              {calculation.scientificBasis.authors} ({calculation.scientificBasis.year}).{' '}
              <em>{calculation.scientificBasis.title}</em>.{' '}
              {calculation.scientificBasis.journal}. DOI: {calculation.scientificBasis.doi}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Determinismo Estrito • Sem Ilusões</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white text-black font-black uppercase hover:bg-zinc-200 transition-all cursor-pointer"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
