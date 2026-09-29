import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { MetricCard } from '../common/MetricCard';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { BodyCompositionRecord, CircumferenceRecord } from '../../types/body';
import { User, Plus, Scale, Activity, Ruler, Calendar, Info, X } from 'lucide-react';

export const BodyView: React.FC = () => {
  const {
    identity,
    bodyRecords,
    addBodyRecord,
    circumferences,
    addCircumference,
    bmiCalculation,
    openCalculationInspector,
  } = useGymLabs();

  const [showLogModal, setShowLogModal] = useState(false);
  const [showCircModal, setShowCircModal] = useState(false);
  const [weightKg, setWeightKg] = useState<number>(identity.weightKg || 80);
  const [bodyFatPct, setBodyFatPct] = useState<string>('');
  const [measurementMethod, setMeasurementMethod] = useState<BodyCompositionRecord['method']>('BIA_HOME');
  const [sourceName, setSourceName] = useState('Balança de Bioimpedância');

  // Circumference state
  const [waistCm, setWaistCm] = useState(82);
  const [hipCm, setHipCm] = useState(98);
  const [chestCm, setChestCm] = useState(104);
  const [armCm, setArmCm] = useState(38);
  const [thighCm, setThighCm] = useState(58);

  const latestRecord = bodyRecords[0] || null;
  const latestCirc = circumferences[0] || null;

  // Cardiometabolic Ratios
  const currentWaist = latestCirc?.waistCm?.value || waistCm;
  const currentHip = latestCirc?.hipCm?.value || hipCm;
  const currentHeight = identity.heightCm || 178;

  const whtr = currentHeight && currentWaist ? Number((currentWaist / currentHeight).toFixed(2)) : 0;
  const whr = currentHip && currentWaist ? Number((currentWaist / currentHip).toFixed(2)) : 0;

  const handleSaveCircumferences = (e: React.FormEvent) => {
    e.preventDefault();
    const newCirc: CircumferenceRecord = {
      id: `circ-${Date.now()}`,
      userId: identity.id,
      timestamp: new Date().toISOString(),
      waistCm: {
        value: waistCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Fita Antropométrica ISAK',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      hipCm: {
        value: hipCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Fita Antropométrica ISAK',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      chestCm: {
        value: chestCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Fita Antropométrica ISAK',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      leftArmCm: {
        value: armCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Fita Antropométrica ISAK',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      leftThighCm: {
        value: thighCm,
        unit: 'cm',
        provenance: {
          type: 'REAL',
          source: 'Fita Antropométrica ISAK',
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      provenance: {
        type: 'REAL',
        source: 'Fita Antropométrica ISAK',
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
    };

    addCircumference(newCirc);
    setShowCircModal(false);
  };

  const handleSaveBodyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const bfNumber = bodyFatPct ? parseFloat(bodyFatPct) : undefined;
    const leanMass = bfNumber ? Number((weightKg * (1 - bfNumber / 100)).toFixed(1)) : undefined;

    const newRecord: BodyCompositionRecord = {
      id: `rec-${Date.now()}`,
      userId: identity.id,
      timestamp: new Date().toISOString(),
      weightKg: {
        value: weightKg,
        unit: 'kg',
        provenance: {
          type: 'REAL',
          source: sourceName,
          recordedAt: new Date().toISOString(),
          confidence: 'HIGH',
        },
      },
      bodyFatPercent: bfNumber
        ? {
            value: bfNumber,
            unit: '%',
            provenance: {
              type: measurementMethod === 'DEXA' ? 'REAL' : 'ESTIMATED',
              source: sourceName,
              recordedAt: new Date().toISOString(),
              confidence: measurementMethod === 'DEXA' ? 'HIGH' : 'MEDIUM',
            },
          }
        : undefined,
      leanMassKg: leanMass
        ? {
            value: leanMass,
            unit: 'kg',
            provenance: {
              type: 'CALCULATED',
              source: 'Peso * (1 - % Gordura)',
              recordedAt: new Date().toISOString(),
              confidence: 'MEDIUM',
            },
          }
        : undefined,
      method: measurementMethod,
      provenance: {
        type: 'REAL',
        source: sourceName,
        recordedAt: new Date().toISOString(),
        confidence: 'HIGH',
      },
    };

    addBodyRecord(newRecord);
    setShowLogModal(false);
  };

  return (
    <div id="gymlabs-body-view" className="space-y-6 font-mono select-none">
      {/* Header */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Antropometria & Composição Corporal
            </span>
            <ProvenanceBadge
              provenance={{
                type: 'REAL',
                source: 'Registros Fidedignos',
                recordedAt: new Date().toISOString(),
                confidence: 'HIGH',
              }}
              size="sm"
            />
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Composição e Antropometria
          </h1>
          <p className="text-xs text-zinc-400 font-sans max-w-xl">
            Monitoramento de massa corporal, percentual lipídico e perímetros com distinção rigorosa de proveniência de dados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCircModal(true)}
            className="px-3 py-2 border border-zinc-700 bg-black text-white text-xs font-bold uppercase hover:border-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>FITA DE PERÍMETROS</span>
          </button>
          <button
            id="open-body-log-modal-btn"
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 bg-white text-black text-xs font-black uppercase hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTRAR PESAGEM</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Current Weight, Body Fat, Lean Mass, BMI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="body-metric-weight"
          title="Massa Corporal Total"
          value={latestRecord?.weightKg?.value || identity.weightKg || null}
          unit="kg"
          subtitle={latestRecord ? `Método: ${latestRecord.method}` : 'Sem pesagens recentes'}
          provenance={latestRecord?.weightKg?.provenance}
          icon={Scale}
        />

        <MetricCard
          id="body-metric-body-fat"
          title="Percentual de Gordura"
          value={latestRecord?.bodyFatPercent?.value || null}
          unit="%"
          subtitle={
            latestRecord?.bodyFatPercent
              ? `Fonte: ${latestRecord.bodyFatPercent.provenance.source}`
              : 'Não aferido'
          }
          provenance={latestRecord?.bodyFatPercent?.provenance}
          icon={Activity}
        />

        <MetricCard
          id="body-metric-lean-mass"
          title="Massa Livre de Gordura"
          value={latestRecord?.leanMassKg?.value || null}
          unit="kg"
          subtitle="Massa Magra (FFM)"
          provenance={latestRecord?.leanMassKg?.provenance}
          icon={User}
        />

        <MetricCard
          id="body-metric-bmi"
          title="Índice de Quetelet (IMC)"
          value={bmiCalculation.result?.bmi || null}
          unit="kg/m²"
          subtitle={`Classificação: ${bmiCalculation.result?.category || 'Indeterminado'}`}
          provenance={bmiCalculation.provenance}
          onClickInspect={() => openCalculationInspector(bmiCalculation)}
        />
      </div>

      {/* Main Grid: Body Composition History & Circumferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Measurement History Table */}
        <div className="lg:col-span-2 p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-white uppercase">Histórico de Pesagens & Biometria</h3>
              <p className="text-xs text-zinc-400 font-sans">Livro-razão cronológico com carimbo de proveniência</p>
            </div>
            <span className="text-xs text-zinc-500 font-bold">{bodyRecords.length} REGISTROS</span>
          </div>

          {bodyRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-400 uppercase">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Peso</th>
                    <th className="py-2 px-3">% Gordura</th>
                    <th className="py-2 px-3">Massa Magra</th>
                    <th className="py-2 px-3">Metodologia</th>
                    <th className="py-2 px-3">Proveniência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {bodyRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-950 transition-colors">
                      <td className="py-2.5 px-3 text-zinc-300">
                        {new Date(record.timestamp).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {record.weightKg.value} {record.weightKg.unit}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">
                        {record.bodyFatPercent?.value ? `${record.bodyFatPercent.value}%` : '---'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-200 font-bold">
                        {record.leanMassKg?.value ? `${record.leanMassKg.value} kg` : '---'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 text-[11px]">{record.method}</td>
                      <td className="py-2.5 px-3">
                        <ProvenanceBadge provenance={record.provenance} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-zinc-800 text-zinc-500 space-y-2">
              <Scale className="w-8 h-8 mx-auto text-zinc-600" />
              <div className="text-xs font-bold text-white uppercase">Nenhum registro biométrico cadastrado</div>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                Registre seu peso de jejum matinal para ativar as fórmulas de taxa metabólica basal.
              </p>
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="mt-2 px-4 py-1.5 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-all cursor-pointer"
              >
                REGISTRAR PESO AGORA
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Circumference Tracker & Ratios */}
        <div className="p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-white" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Perímetros Corporais
              </h3>
            </div>
            <button
              onClick={() => setShowCircModal(true)}
              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold uppercase"
            >
              <Plus className="w-3 h-3" />
              <span>Inserir Fita</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
              OPCIONAL
            </span>
            <p className="text-xs text-zinc-400 font-sans">
              Medidas corporais são opcionais e podem ser preenchidas ou atualizadas a qualquer momento.
            </p>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Cintura (Umbilical)', value: latestCirc?.waistCm?.value, unit: 'cm' },
              { label: 'Tórax (Mesosternal)', value: latestCirc?.chestCm?.value, unit: 'cm' },
              { label: 'Quadril (Glúteo Máx.)', value: latestCirc?.hipCm?.value, unit: 'cm' },
              { label: 'Braço (Bíceps Contraído)', value: latestCirc?.leftArmCm?.value, unit: 'cm' },
              { label: 'Coxa (Medial)', value: latestCirc?.leftThighCm?.value, unit: 'cm' },
            ].map((circ, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800"
              >
                <span className="text-xs text-zinc-400 font-sans">{circ.label}</span>
                <span className="text-xs font-bold text-white">
                  {circ.value !== undefined && circ.value !== null ? `${circ.value} ${circ.unit}` : '---'}
                </span>
              </div>
            ))}
          </div>

          {/* Cardiometabolic Risk Ratios (Ashwell / OMS) */}
          <div className="pt-3 border-t border-zinc-900 space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
              Índices Cardiometabólicos
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-sans">Cintura/Estatura</span>
                <span className="text-base font-black text-white">
                  {whtr || '---'}
                </span>
                <span className="text-[9px] text-zinc-500 block font-sans">Ref: &lt; 0.50 (Ashwell)</span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-sans">Cintura/Quadril</span>
                <span className="text-base font-black text-white">
                  {whr || '---'}
                </span>
                <span className="text-[9px] text-zinc-500 block font-sans">OMS: &le; 0.90 (M)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Circumferences Modal */}
      {showCircModal && (
        <div
          id="circ-log-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        >
          <div className="bg-black border border-white p-6 w-full max-w-md shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Perímetros (Fita)</h3>
              <button
                onClick={() => setShowCircModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCircumferences} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Quadril (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hipCm}
                    onChange={(e) => setHipCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Tórax (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={chestCm}
                    onChange={(e) => setChestCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Braço (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={armCm}
                    onChange={(e) => setArmCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Coxa (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={thighCm}
                    onChange={(e) => setThighCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCircModal(false)}
                  className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold uppercase hover:bg-zinc-200 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Body Weight Modal */}
      {showLogModal && (
        <div
          id="body-log-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        >
          <div className="bg-black border border-white p-6 w-full max-w-md shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Pesagem / Biometria</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBodyLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Peso Corporal (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">% de Gordura (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 14.5"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Método Utilizado</label>
                <select
                  value={measurementMethod}
                  onChange={(e) => setMeasurementMethod(e.target.value as any)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                >
                  <option value="BIA_HOME">Bioimpedância Residencial (Balança)</option>
                  <option value="BIA_CLINICAL">Bioimpedância Clínica (InBody / Seca)</option>
                  <option value="SKINFOLD">Adipometria (Dobras Cutâneas ISAK)</option>
                  <option value="DEXA">Densitometria DXA (Padrão-Ouro)</option>
                  <option value="SCALE_ONLY">Apenas Balança Convencional</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Origem / Aparelho</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="Ex: Balança Tanita / InBody 270"
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-bold uppercase hover:bg-zinc-200 cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
