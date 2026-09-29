import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { Building2, MapPin, CheckCircle2 } from 'lucide-react';

export const OrganizationsView: React.FC = () => {
  const { organizations } = useGymLabs();

  return (
    <div id="gymlabs-organizations-view" className="space-y-6 max-w-7xl mx-auto font-mono select-none">
      {/* Header */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Rede de Academias & Centros Homologados
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              UNIDADES PARCEIRAS
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Academias & Centros de Treinamento
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Academias e studios credenciados ao Gym Labs com suporte a sincronização de treino e gestão com seus personais e nutricionistas parceiros.
          </p>
        </div>
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="p-5 bg-black border border-zinc-800 space-y-4 hover:border-white transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase px-2 py-0.5 bg-zinc-950 text-white border border-zinc-800 font-bold">
                  {org.type}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5 uppercase">{org.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {org.locations[0]?.city}, {org.locations[0]?.country}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-zinc-950 border border-zinc-800 text-white">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] uppercase text-zinc-500 block font-bold">Unidades</span>
                <span className="font-bold text-sm text-white">{org.locations.length}</span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] uppercase text-zinc-500 block font-bold">Personais</span>
                <span className="font-bold text-sm text-white">8 Ativos</span>
              </div>
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] uppercase text-zinc-500 block font-bold">Status</span>
                <span className="font-bold text-sm text-white">CONECTADA</span>
              </div>
            </div>

            {/* Modules */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1.5 font-bold uppercase">
                Módulos de Integração na Unidade:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Transdutores Lineares', 'Balança de Bioimpedância', 'Plataforma de Força', 'Totem de Treino'].map((mod, i) => (
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
              <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="font-bold uppercase text-[11px]">Sincronização Ativa</span>
              </div>
              <button
                type="button"
                className="px-3 py-1 border border-zinc-700 hover:border-white text-white text-xs font-bold transition-all cursor-pointer uppercase"
              >
                Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
