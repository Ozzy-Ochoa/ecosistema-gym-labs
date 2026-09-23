import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { Building2, MapPin, Users, Dumbbell, ShieldCheck, CheckCircle2, ChevronRight, Sparkles, Activity } from 'lucide-react';

export const OrganizationsView: React.FC = () => {
  const { organizations } = useGymLabs();

  return (
    <div id="gymlabs-organizations-view" className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
              // ECOSSISTEMA DO ATLETA • UNIDADES HOMOLOGADAS
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
              LABCORE FACILITY
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Academias & Centros de Treinamento
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Academias, boxes e studios credenciados ao Gym Labs com hardware de biometria integrada (balanças bioimpedância, encoders lineares e catracas biométricas).
          </p>
        </div>
      </div>

      {/* Scope Clarification Banner */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 neo-box flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 font-sans space-y-1">
          <p className="font-bold text-white font-mono uppercase text-xs">
            Sincronização de Treino em Unidades Físicas
          </p>
          <p className="text-zinc-400 text-xs">
            Como usuário final, ao realizar check-in nas unidades abaixo, suas anotações de carga e métricas de repetição podem ser sincronizadas automaticamente nos equipamentos e totens cadastrados.
          </p>
        </div>
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="p-6 bg-[#050505] border-2 border-zinc-800 hover:border-[#00F0FF] transition-all space-y-4 neo-box"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase px-2 py-0.5 bg-black text-[#00F0FF] border border-zinc-800 font-bold">
                  {org.type}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5 uppercase">{org.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>
                    {org.locations[0]?.city}, {org.locations[0]?.country} ({org.jurisdiction})
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-black border border-zinc-800 text-[#00F0FF] neo-box">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="p-3 bg-black border border-zinc-800 text-center">
                <span className="text-[10px] uppercase text-zinc-500 block font-bold">Unidades</span>
                <span className="font-bold text-sm text-white">{org.locations.length}</span>
              </div>
              <div className="p-3 bg-black border border-zinc-800 text-center">
                <span className="text-[10px] uppercase text-zinc-500 block font-bold">Corpo Técnico</span>
                <span className="font-bold text-sm text-white">8 Coaches</span>
              </div>
              <div className="p-3 bg-black border border-zinc-800 text-center">
                <span className="text-[10px] uppercase text-zinc-500 block font-bold">Status</span>
                <span className="font-bold text-sm text-[#39FF14]">HOMOLOGADA</span>
              </div>
            </div>

            {/* Telemetry Integration Modules */}
            <div>
              <span className="text-[11px] text-zinc-400 block mb-1.5 font-bold uppercase">
                Módulos de Telemetria Instalados na Unidade:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Transdutores Lineares (VBT)', 'Balança de Bioimpedância BLE', 'Plataforma de Força', 'Totem de Check-in GymLabs'].map((mod, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-300"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            {/* Check-in / Connection status */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#39FF14]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold">CONVÊNIO ATIVO // CHECK-IN LIBERADO</span>
              </div>
              <button
                type="button"
                className="px-3 py-1 neo-box border border-zinc-700 hover:border-[#00F0FF] text-white hover:text-[#00F0FF] text-xs font-bold transition-all"
              >
                DETALHES
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
