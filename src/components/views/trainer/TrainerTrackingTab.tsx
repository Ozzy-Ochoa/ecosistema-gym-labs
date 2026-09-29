import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import {
  Activity,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  TrendingUp,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

export const TrainerTrackingTab: React.FC = () => {
  const { trainingSessions, trainerStudents } = useGymLabs();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_alex_vance');

  // Realistic sample of student execution logs
  const sessions = [
    {
      id: 'sess_log_1',
      date: '2026-09-28',
      title: 'Treino A: Peitoral, Deltoide Anterior & Tríceps',
      studentName: 'Alex Vance',
      durationMinutes: 62,
      rpe: 8.5,
      totalTonnageKg: 8420,
      completedSetsCount: 19,
      feedback: 'Sentiu boa estabilidade no supino inclinado. Carga de 85kg no reto mantida com cadência limpa.',
      exercisesPerformed: [
        { name: 'Supino Reto com Barra', sets: 4, bestLoad: '85 kg', reps: '8, 8, 7, 6' },
        { name: 'Supino Inclinado com Halteres', sets: 4, bestLoad: '32 kg/lado', reps: '10, 10, 8, 8' },
        { name: 'Crucifixo Polia Média', sets: 3, bestLoad: '20 kg', reps: '15, 12, 12' },
        { name: 'Desenvolvimento Militar', sets: 4, bestLoad: '50 kg', reps: '10, 8, 8, 7' },
        { name: 'Tríceps Testa Barra W', sets: 4, bestLoad: '34 kg', reps: '12, 10, 10, 8' },
      ],
    },
    {
      id: 'sess_log_2',
      date: '2026-09-26',
      title: 'Treino C: Quadríceps, Isquiotibiais & Panturrilhas',
      studentName: 'Alex Vance',
      durationMinutes: 70,
      rpe: 9.0,
      totalTonnageKg: 12150,
      completedSetsCount: 22,
      feedback: 'Agachamento com 120kg executado com profundidade válida. Sem dor patelar relatada.',
      exercisesPerformed: [
        { name: 'Agachamento Livre com Barra', sets: 4, bestLoad: '120 kg', reps: '8, 8, 6, 6' },
        { name: 'Leg Press 45', sets: 4, bestLoad: '280 kg', reps: '12, 12, 10, 10' },
        { name: 'Mesa Flexora', sets: 4, bestLoad: '55 kg', reps: '12, 10, 10, 8' },
      ],
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              ACOMPANHAMENTO EM TEMPO REAL // LOGS EXECUTADOS PELO ALUNO
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Visualize os treinos que seus alunos concluíram no aplicativo Gym Labs, incluindo tonelagem levantada, RPE real e percepção de esforço.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-bold uppercase">Aluno:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-black border border-zinc-800 px-3 py-1.5 text-xs text-white outline-none focus:border-white"
          >
            {trainerStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tonnage & Volume KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Tonelagem Semanal</span>
          <span className="text-2xl font-black text-white">20.570 kg</span>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
            +8.5% progressão
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">RPE Médio da Semana</span>
          <span className="text-2xl font-black text-amber-400">8.75 / 10</span>
          <span className="text-[10px] text-zinc-400 mt-1 block">Alta intensidade</span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Tempo sob Tensão (Médio)</span>
          <span className="text-2xl font-black text-white">66 min/treino</span>
          <span className="text-[10px] text-zinc-400 mt-1 block">Intervalo: 90-120s</span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Aderência à Ficha</span>
          <span className="text-2xl font-black text-emerald-400">96.8%</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Excelente fidelidade</span>
        </div>
      </div>

      {/* Session Logs Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sessões Concluídas Recentemente
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">SINCRONIZADO VIA GYM LABS APP</span>
        </div>

        {sessions.map((log) => (
          <div key={log.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">{log.title}</h4>
                  <div className="text-[10px] text-zinc-400">
                    {log.studentName} • {log.date} • {log.durationMinutes} minutos • RPE {log.rpe}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-800 text-zinc-300 font-mono">
                  Volume: <span className="text-emerald-400 font-bold">{log.totalTonnageKg.toLocaleString('pt-BR')} kg</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-white font-bold">
                  {log.completedSetsCount} Séries
                </span>
              </div>
            </div>

            {/* Exercise Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black text-zinc-500 border-b border-zinc-900 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Exercício</th>
                    <th className="p-2.5">Séries</th>
                    <th className="p-2.5">Melhor Carga</th>
                    <th className="p-2.5">Repetições Reais Registradas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {log.exercisesPerformed.map((ex, i) => (
                    <tr key={i} className="hover:bg-zinc-900/40">
                      <td className="p-2.5 font-bold text-white uppercase">{ex.name}</td>
                      <td className="p-2.5 text-zinc-400">{ex.sets} séries</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{ex.bestLoad}</td>
                      <td className="p-2.5 text-zinc-300 font-bold">{ex.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-blue-500 pl-3">
              Feedback do Aluno: "{log.feedback}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
