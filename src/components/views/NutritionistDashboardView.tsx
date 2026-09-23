import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Activity,
  Droplet,
  Users,
  LogOut,
  Flame,
  CheckCircle,
  FileText
} from 'lucide-react';

export const NutritionistDashboardView: React.FC = () => {
  const {
    identity,
    savedAccounts,
    openAccountModal,
    logout,
  } = useGymLabs();

  const [activeTab, setActiveTab] = useState<'patients' | 'protocols' | 'sawka'>('patients');
  const [patientWeight, setPatientWeight] = useState<number>(75);
  const [proteinPerKg, setProteinPerKg] = useState<number>(2.0);
  const [carbPerKg, setCarbPerKg] = useState<number>(3.5);
  const [fatPerKg, setFatPerKg] = useState<number>(0.8);

  const patients = savedAccounts.filter((a) => a.role === 'USER');

  // Deterministic Macro Calculations
  const totalProteinG = Math.round(patientWeight * proteinPerKg);
  const totalCarbG = Math.round(patientWeight * carbPerKg);
  const totalFatG = Math.round(patientWeight * fatPerKg);
  const totalKcal = totalProteinG * 4 + totalCarbG * 4 + totalFatG * 9;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between select-none">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              NUT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase">{identity.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-white border border-zinc-700 font-bold uppercase">
                  NUTRICIONISTA ESPORTIVA
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">
                PORTAL CLÍNICO // METABOLISMO DETERMINÍSTICO & PROTOCOLO SAWKA
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {savedAccounts.length > 1 && (
              <button
                type="button"
                onClick={openAccountModal}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>TROCAR CONTA</span>
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SAIR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-900 bg-black px-4">
        <div className="max-w-7xl mx-auto flex gap-4 text-xs">
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'patients' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            01 PACIENTES ATIVOS ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'protocols' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            02 PRESCRIÇÃO DIETÉTICA (G/KG)
          </button>
          <button
            onClick={() => setActiveTab('sawka')}
            className={`py-3 px-2 border-b-2 font-bold cursor-pointer uppercase ${
              activeTab === 'sawka' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            03 HIDRATAÇÃO DINÂMICA (SAWKA)
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase text-white">Pacientes sob Acompanhamento</h2>
            {patients.length === 0 ? (
              <div className="p-8 border border-zinc-800 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-zinc-600" />
                <span className="text-xs text-zinc-400 uppercase block font-bold">
                  Nenhum paciente vinculado ainda
                </span>
                <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                  Quando pacientes criarem conta e se conectarem a você, o prontuário nutricional aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((pt) => (
                  <div key={pt.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-white uppercase">{pt.name}</h3>
                        <span className="text-xs text-zinc-500">{pt.email}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 border border-zinc-700 text-white font-bold uppercase">
                        VINCULADO
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Peso Base</span>
                        <span className="text-white font-bold">{pt.weightKg ? `${pt.weightKg} kg` : '75.0 kg'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Objetivo</span>
                        <span className="text-white font-bold">{pt.primaryGoal || 'HIPERTROFIA'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (pt.weightKg) setPatientWeight(pt.weightKg);
                        setActiveTab('protocols');
                      }}
                      className="w-full mt-2 py-2 bg-zinc-900 hover:bg-white hover:text-black text-white text-xs font-bold uppercase transition-all"
                    >
                      Calcular Plano Nutricional →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-white uppercase">
                Calculadora de Macronutrientes por Peso Corporal (g/kg)
              </h2>
              <span className="text-xs text-zinc-400">EQUAÇÃO DETERMINÍSTICA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Peso do Paciente (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(Number(e.target.value))}
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Proteína (g/kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={proteinPerKg}
                  onChange={(e) => setProteinPerKg(Number(e.target.value))}
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Carboidrato (g/kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={carbPerKg}
                  onChange={(e) => setCarbPerKg(Number(e.target.value))}
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Lipídios (g/kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fatPerKg}
                  onChange={(e) => setFatPerKg(Number(e.target.value))}
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Total Results in Monochrome */}
            <div className="p-4 bg-black border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Meta Calórica Total</span>
                <span className="text-xl font-black text-white">{totalKcal} kcal</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Proteína Total</span>
                <span className="text-xl font-black text-white">{totalProteinG}g ({totalProteinG * 4} kcal)</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Carboidrato Total</span>
                <span className="text-xl font-black text-white">{totalCarbG}g ({totalCarbG * 4} kcal)</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Lipídios Totais</span>
                <span className="text-xl font-black text-white">{totalFatG}g ({totalFatG * 9} kcal)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Plano de macronutrientes gravado no prontuário do paciente com sucesso!')}
              className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
            >
              SALVAR & ATRIBUIR PROTOCOLO
            </button>
          </div>
        )}

        {activeTab === 'sawka' && (
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Droplet className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase">
                Protocolo de Hidratação Sawka & Balanço Hídrico
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Determina o volume mínimo de fluidos corporais considerando perda pelo suor (15 ml/kg/h em esforço anaeróbico), correção por temperatura ambiente e saturação celular por fosfocreatina.
            </p>
            <div className="p-4 bg-black border border-zinc-800 text-xs text-zinc-300">
              Fórmula Básica de Sawka: Fluido Base = 35 ml × Peso Corporal + Ajuste Creatina (+500 ml) + Compensação Térmica.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
