import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { NutriAssessment } from '../../../types/nutri';
import {
  Activity,
  Plus,
  TrendingDown,
  TrendingUp,
  Scale,
  Calendar,
  Layers,
  Percent,
  CheckCircle,
  X
} from 'lucide-react';

export const NutriAssessmentsTab: React.FC = () => {
  const {
    nutriAssessments,
    nutriPatients,
    addNutriAssessment,
  } = useGymLabs();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(nutriPatients[0]?.id || '');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form State
  const [weightKg, setWeightKg] = useState(82.5);
  const [heightCm, setHeightCm] = useState(178);
  const [bodyFatPercentage, setBodyFatPercentage] = useState(13.2);
  const [muscleMassKg, setMuscleMassKg] = useState(41.8);
  const [visceralFatLevel, setVisceralFatLevel] = useState(4);
  const [hydrationPercentage, setHydrationPercentage] = useState(62.4);

  // Skinfolds
  const [tricepsFold, setTricepsFold] = useState(8);
  const [subscapularFold, setSubscapularFold] = useState(11);
  const [suprailiacFold, setSuprailiacFold] = useState(9);
  const [abdominalFold, setAbdominalFold] = useState(12);
  const [thighFold, setThighFold] = useState(10);
  const [chestFold, setChestFold] = useState(7);

  // Circumferences
  const [waistCirc, setWaistCirc] = useState(81);
  const [abdomenCirc, setAbdomenCirc] = useState(84);
  const [hipCirc, setHipCirc] = useState(98);
  const [chestCirc, setChestCirc] = useState(104);
  const [armCirc, setArmCirc] = useState(39.5);
  const [thighCirc, setThighCirc] = useState(61);
  const [notes, setNotes] = useState('');

  const patientAssessments = nutriAssessments.filter(
    (a) => a.patientId === selectedPatientId || !selectedPatientId
  );

  const selectedPatient = nutriPatients.find((p) => p.id === selectedPatientId);

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
    const fatMass = Number(((weightKg * bodyFatPercentage) / 100).toFixed(1));

    const newAssessment: NutriAssessment = {
      id: `ass_${Date.now()}`,
      patientId: selectedPatient.id,
      date: new Date().toISOString().split('T')[0],
      weightKg,
      heightCm,
      bmi,
      bodyFatPercentage,
      muscleMassKg,
      fatMassKg: fatMass,
      visceralFatLevel,
      skinfoldsMm: {
        triceps: tricepsFold,
        subscapular: subscapularFold,
        suprailiac: suprailiacFold,
        abdominal: abdominalFold,
        thigh: thighFold,
        chest: chestFold,
      },
      circumferencesCm: {
        waist: waistCirc,
        abdomen: abdomenCirc,
        hip: hipCirc,
        chest: chestCirc,
        rightArm: armCirc,
        rightThigh: thighCirc,
      },
      hydrationLevelPercentage: hydrationPercentage,
      clinicalNotes: notes || 'Avaliação física antropométrica e bioimpedância de rotina.',
      recordedBy: 'Dra. Elena Vance (CRN-3 48192)',
    };

    addNutriAssessment(newAssessment);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-bold uppercase">Paciente Selecionado:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-black border border-zinc-800 px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-white"
          >
            {nutriPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.weightKg} kg // {p.primaryGoal})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NOVA AVALIAÇÃO ANTROPOMÉTRICA</span>
        </button>
      </div>

      {/* Evolution Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Massa Corporal Total</span>
          <span className="text-xl font-black text-white">{selectedPatient?.weightKg || 82.5} kg</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
            <TrendingUp className="w-3 h-3" /> +1.2 kg de massa magra
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">% Gordura (Bioimpedância)</span>
          <span className="text-xl font-black text-white">
            {patientAssessments[0]?.bodyFatPercentage || 13.2}%
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
            <TrendingDown className="w-3 h-3" /> -0.8% adiposidade
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Massa Esquelética</span>
          <span className="text-xl font-black text-white">
            {patientAssessments[0]?.muscleMassKg || 41.8} kg
          </span>
          <span className="text-[10px] text-zinc-400 mt-1 block">50.6% peso total</span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Água Corporal Intracelular</span>
          <span className="text-xl font-black text-cyan-400">
            {patientAssessments[0]?.hydrationLevelPercentage || 62.4}%
          </span>
          <span className="text-[10px] text-zinc-400 mt-1 block">Sawka: Adequado</span>
        </div>
      </div>

      {/* History of Assessments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Histórico Antropométrico & Composição Corporal
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">
            {patientAssessments.length} AVALIAÇÕES REGISTRADAS
          </span>
        </div>

        {patientAssessments.map((ass) => (
          <div key={ass.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white uppercase">Avaliação de {ass.date}</span>
                <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                  IMC: {ass.bmi} kg/m²
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Avaliador: {ass.recordedBy}</span>
            </div>

            {/* Circumferences and Skinfolds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Circumferences */}
              <div className="p-3 bg-black border border-zinc-900 space-y-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Circunferências Corporais (cm)
                </span>
                <div className="grid grid-cols-3 gap-2 text-zinc-300">
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Tórax:</span>
                    <span className="font-bold text-white">{ass.circumferencesCm?.chest || 104} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Cintura:</span>
                    <span className="font-bold text-white">{ass.circumferencesCm?.waist || 81} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Abdômen:</span>
                    <span className="font-bold text-white">{ass.circumferencesCm?.abdomen || 84} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Quadril:</span>
                    <span className="font-bold text-white">{ass.circumferencesCm?.hip || 98} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Braço D:</span>
                    <span className="font-bold text-white">{ass.circumferencesCm?.rightArm || 39.5} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Coxa D:</span>
                    <span className="font-bold text-white">{ass.circumferencesCm?.rightThigh || 61} cm</span>
                  </div>
                </div>
              </div>

              {/* Skinfolds */}
              <div className="p-3 bg-black border border-zinc-900 space-y-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Dobras Cutâneas (Protocolo Pollock 7 Dobras - mm)
                </span>
                <div className="grid grid-cols-3 gap-2 text-zinc-300">
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Tricipital:</span>
                    <span className="font-bold text-white">{ass.skinfoldsMm?.triceps || 8} mm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Subescapular:</span>
                    <span className="font-bold text-white">{ass.skinfoldsMm?.subscapular || 11} mm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Suprailíaca:</span>
                    <span className="font-bold text-white">{ass.skinfoldsMm?.suprailiac || 9} mm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Abdominal:</span>
                    <span className="font-bold text-white">{ass.skinfoldsMm?.abdominal || 12} mm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Coxa:</span>
                    <span className="font-bold text-white">{ass.skinfoldsMm?.thigh || 10} mm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">Peitoral:</span>
                    <span className="font-bold text-white">{ass.skinfoldsMm?.chest || 7} mm</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-zinc-700 pl-3">
              "{ass.clinicalNotes}"
            </p>
          </div>
        ))}
      </div>

      {/* Modal: Nova Avaliação */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl p-6 space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Avaliação Antropométrica</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Altura (cm) *</label>
                  <input
                    type="number"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">% Gordura *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bodyFatPercentage}
                    onChange={(e) => setBodyFatPercentage(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Massa Muscular (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={muscleMassKg}
                    onChange={(e) => setMuscleMassKg(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Gordura Visceral</label>
                  <input
                    type="number"
                    value={visceralFatLevel}
                    onChange={(e) => setVisceralFatLevel(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Hidratação %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hydrationPercentage}
                    onChange={(e) => setHydrationPercentage(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-2">
                  Dobras Cutâneas (mm)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Tríceps</label>
                    <input
                      type="number"
                      value={tricepsFold}
                      onChange={(e) => setTricepsFold(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Subescapular</label>
                    <input
                      type="number"
                      value={subscapularFold}
                      onChange={(e) => setSubscapularFold(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Suprailíaca</label>
                    <input
                      type="number"
                      value={suprailiacFold}
                      onChange={(e) => setSuprailiacFold(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Abdominal</label>
                    <input
                      type="number"
                      value={abdominalFold}
                      onChange={(e) => setAbdominalFold(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Coxa</label>
                    <input
                      type="number"
                      value={thighFold}
                      onChange={(e) => setThighFold(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Peitoral</label>
                    <input
                      type="number"
                      value={chestFold}
                      onChange={(e) => setChestFold(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Observações Clínicas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Evolução muscular, simetria, comentários..."
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase hover:bg-zinc-200"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
