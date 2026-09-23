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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="calculation-modal-container"
        className="relative w-full max-w-2xl bg-[#0F172A] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B111E]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-white">{calculation.formulaName}</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  v{calculation.formulaVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">Gym Labs Deterministic Science Engine</p>
            </div>
          </div>
          <button
            id="close-calculation-modal-button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Result Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-300 font-mono">Calculated Output</span>
              <div className="text-2xl font-bold text-white font-mono-num mt-0.5">
                {calculation.result !== null ? (
                  typeof calculation.result === 'object' ? (
                    JSON.stringify(calculation.result)
                  ) : (
                    <>
                      {calculation.result}{' '}
                      <span className="text-sm font-normal text-cyan-300">{calculation.unit}</span>
                    </>
                  )
                ) : (
                  <span className="text-amber-400 text-lg">INSUFFICIENT DATA</span>
                )}
              </div>
            </div>
            <ProvenanceBadge provenance={calculation.provenance} size="md" />
          </div>

          {/* Mathematical Expression */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              Mathematical Formula
            </h4>
            <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
              {calculation.mathematicalExpression}
            </div>
          </div>

          {/* Inputs Record */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Verified Input Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(calculation.inputs).map(([key, value]) => (
                <div key={key} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{key}</span>
                  <span className="text-xs font-semibold text-slate-200 font-mono-num">
                    {value !== null && value !== undefined ? String(value) : 'null'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Evidence & Citation */}
          {calculation.evidenceCitation && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Primary Scientific Evidence
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Level: {calculation.evidenceCitation.evidenceLevel}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">
                  {calculation.evidenceCitation.shortCitation} — {calculation.evidenceCitation.fullTitle}
                </p>
                <p className="text-[11px] text-slate-400 italic mt-0.5">
                  {calculation.evidenceCitation.journal} ({calculation.evidenceCitation.year})
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300">
                <span className="font-semibold text-emerald-300">Key Finding: </span>
                {calculation.evidenceCitation.keyFinding}
              </div>
            </div>
          )}

          {/* Limitations & Uncertainty */}
          {calculation.provenance.limitations && calculation.provenance.limitations.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Declared Scientific Limitations
              </h4>
              <ul className="space-y-1.5">
                {calculation.provenance.limitations.map((limitation, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clinical Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-300">Gym Labs Safety Boundary:</strong>{' '}
              {calculation.clinicalBoundaryDisclaimer}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B111E] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reproducible Deterministic Calculation</span>
          </div>
          <button
            id="calculation-modal-done-btn"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
