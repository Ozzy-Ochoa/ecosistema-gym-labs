import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { TrainerAssessment } from '../../../types/trainer';
import {
  Activity,
  Plus,
  Dumbbell,
  TrendingUp,
  Calendar,
  CheckCircle,
  Trophy,
  X
} from 'lucide-react';

export const TrainerAssessmentsTab: React.FC = () => {
  const {
    trainerAssessments,
    trainerStudents,
    addTrainerAssessment,
  } = useGymLabs();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(trainerStudents[0]?.id || '');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form
  const [weightKg, setWeightKg] = useState(82.5);
  const [heightCm, setHeightCm] = useState(178);
  const [bodyFat, setBodyFat] = useState(13.2);
  const [muscleMass, setMuscleMass] = useState(41.8);

  // 1RM Benchmarks
  const [squat1RM, setSquat1RM] = useState(150);
  const [bench1RM, setBench1RM] = useState(115);
  const [deadlift1RM, setDeadlift1RM] = useState(180);
  const [pullUps, setPullUps] = useState(16);

  // Circumferences
  const [chestCirc, setChestCirc] = useState(105);
  const [armFlexed, setArmFlexed] = useState(40.5);
  const [waistCirc, setWaistCirc] = useState(81);
  const [thighCirc, setThighCirc] = useState(62);
  const [notes, setNotes] = useState('');

  const studentAssessments = trainerAssessments.filter(
    (a) => a.studentId === selectedStudentId || !selectedStudentId
  );

  const selectedStudent = trainerStudents.find((s) => s.id === selectedStudentId);

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));

    const newAssessment: TrainerAssessment = {
      id: `t_ass_${Date.now()}`,
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      weightKg,
      heightCm,
      bmi,
      bodyFatPercentage: bodyFat,
      muscleMassKg: muscleMass,
      circumferencesCm: {
        chest: chestCirc,
        waist: waistCirc,
        rightArmFlexed: armFlexed,
        rightThigh: thighCirc,
      },
      strengthBenchmarks: {
        squat1RMKg: squat1RM,
        benchPress1RMKg: bench1RM,
        deadlift1RMKg: deadlift1RM,
        pullUpsMaxReps: pullUps,
      },
      mobilityScore: {
        shoulderMobility: 'EXCELLENT',
        hipMobility: 'ADEQUATE',
        ankleDorsiflexion: 'ADEQUATE',
      },
      evaluatorNotes: notes || 'Avaliação de força máxima e composição corporal periódica.',
      recordedBy: 'Marcus Steel (CREF 091823-G/SP)',
    };

    addTrainerAssessment(newAssessment);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Bar */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-bold uppercase">Aluno Selecionado:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-black border border-zinc-800 px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-white"
          >
            {trainerStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.fitnessLevel} // {s.weightKg} kg)
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
          <span>REGISTRAR TESTE FÍSICO / 1RM</span>
        </button>
      </div>

      {/* 1RM Strength Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>1RM Supino Reto</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">
            {studentAssessments[0]?.strengthBenchmarks?.benchPress1RMKg || 115} kg
          </span>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
            1.40x peso corporal
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>1RM Agachamento Livre</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">
            {studentAssessments[0]?.strengthBenchmarks?.squat1RMKg || 150} kg
          </span>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
            1.82x peso corporal
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>1RM Levantamento Terra</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">
            {studentAssessments[0]?.strengthBenchmarks?.deadlift1RMKg || 180} kg
          </span>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
            2.18x peso corporal
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
            <span>Barra Fixa (Máx Reps)</span>
            <Dumbbell className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white">
            {studentAssessments[0]?.strengthBenchmarks?.pullUpsMaxReps || 16} reps
          </span>
          <span className="text-[10px] text-zinc-400 mt-1 block">Resistência Máxima</span>
        </div>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Histórico de Avaliações Físicas & Benchmarks de Performance
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">
            {studentAssessments.length} REGISTROS
          </span>
        </div>

        {studentAssessments.map((ass) => (
          <div key={ass.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white uppercase">Avaliação de {ass.date}</span>
                <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {ass.weightKg} kg • IMC: {ass.bmi}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Coach: {ass.recordedBy}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-black border border-zinc-900 space-y-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Perimetria & Circunferências (cm)
                </span>
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <div>Tórax: <span className="text-white font-bold">{ass.circumferencesCm?.chest || 105} cm</span></div>
                  <div>Braço Contraído: <span className="text-white font-bold">{ass.circumferencesCm?.rightArmFlexed || 40.5} cm</span></div>
                  <div>Cintura: <span className="text-white font-bold">{ass.circumferencesCm?.waist || 81} cm</span></div>
                  <div>Coxa: <span className="text-white font-bold">{ass.circumferencesCm?.rightThigh || 62} cm</span></div>
                </div>
              </div>

              <div className="p-3 bg-black border border-zinc-900 space-y-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Cargas 1RM Estimadas (kg)
                </span>
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <div>Supino Reto: <span className="text-emerald-400 font-bold">{ass.strengthBenchmarks?.benchPress1RMKg || 115} kg</span></div>
                  <div>Agachamento: <span className="text-emerald-400 font-bold">{ass.strengthBenchmarks?.squat1RMKg || 150} kg</span></div>
                  <div>Levantamento Terra: <span className="text-emerald-400 font-bold">{ass.strengthBenchmarks?.deadlift1RMKg || 180} kg</span></div>
                  <div>Barra Fixa: <span className="text-white font-bold">{ass.strengthBenchmarks?.pullUpsMaxReps || 16} reps</span></div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-zinc-700 pl-3">
              "{ass.evaluatorNotes}"
            </p>
          </div>
        ))}
      </div>

      {/* Modal Nova Avaliação */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Registrar Avaliação Física & Força</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Altura (cm) *</label>
                  <input
                    type="number"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">% Gordura</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Massa Muscular</label>
                  <input
                    type="number"
                    step="0.1"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-2">
                  Testes de Força 1RM (kg)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Supino 1RM</label>
                    <input
                      type="number"
                      value={bench1RM}
                      onChange={(e) => setBench1RM(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Agachamento 1RM</label>
                    <input
                      type="number"
                      value={squat1RM}
                      onChange={(e) => setSquat1RM(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Terra 1RM</label>
                    <input
                      type="number"
                      value={deadlift1RM}
                      onChange={(e) => setDeadlift1RM(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Barra Fixa (reps)</label>
                    <input
                      type="number"
                      value={pullUps}
                      onChange={(e) => setPullUps(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-2">
                  Perimetria (cm)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Tórax</label>
                    <input
                      type="number"
                      value={chestCirc}
                      onChange={(e) => setChestCirc(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Braço Contraído</label>
                    <input
                      type="number"
                      value={armFlexed}
                      onChange={(e) => setArmFlexed(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Cintura</label>
                    <input
                      type="number"
                      value={waistCirc}
                      onChange={(e) => setWaistCirc(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] mb-1">Coxa</label>
                    <input
                      type="number"
                      value={thighCirc}
                      onChange={(e) => setThighCirc(Number(e.target.value))}
                      className="w-full p-1.5 bg-black border border-zinc-700 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Parecer do Treinador</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Progresso neuromuscular, simetria de membros, recomendações..."
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
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
