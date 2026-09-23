import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ProfessionalProfile } from '../../types/professional';
import { ConsentGrant, ConsentScope } from '../../types/consent';
import {
  Users,
  ShieldCheck,
  Award,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
  Info,
  Sparkles,
  ShieldAlert,
  X
} from 'lucide-react';

export const ProfessionalsView: React.FC = () => {
  const {
    identity,
    professionals,
    consents,
    grantConsent,
    revokeConsent,
  } = useGymLabs();

  const [selectedPro, setSelectedPro] = useState<ProfessionalProfile | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [targetProId, setTargetProId] = useState(professionals[0]?.id || '');
  const [selectedScopes, setSelectedScopes] = useState<ConsentScope[]>([
    'TRAINING_READ',
    'TRAINING_WRITE',
    'RECOVERY_READ',
  ]);
  const [purpose, setPurpose] = useState('Prescrição de treino e monitoramento de recuperação neuromuscular');

  const ALL_SCOPES: { id: ConsentScope; label: string; description: string }[] = [
    { id: 'TRAINING_READ', label: 'Ler Histórico de Treino', description: 'Acessar séries, repetições, tonelagem e RPE' },
    { id: 'TRAINING_WRITE', label: 'Prescrever Fichas', description: 'Inserir rotinas, periodização e metas de carga' },
    { id: 'BODY_READ', label: 'Ver Biometria & ISAK', description: 'Acessar peso, dobras cutâneas e circunferências' },
    { id: 'NUTRITION_READ', label: 'Ver Plano Nutricional', description: 'Consultar calorias diárias e macronutrientes' },
    { id: 'RECOVERY_READ', label: 'Acessar HRV & Prontidão', description: 'Ver escore de sono e prontidão autonômica' },
  ];

  const handleToggleScope = (scope: ConsentScope) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleGrantConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const pro = professionals.find((p) => p.id === targetProId);
    if (!pro) return;

    const newGrant: ConsentGrant = {
      id: `cst-${Date.now()}`,
      grantorUserId: identity.id,
      granteeId: pro.id,
      granteeName: pro.fullName,
      granteeType: 'PROFESSIONAL',
      scopes: selectedScopes,
      purpose,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), // 90 days
      status: 'ACTIVE',
    };

    grantConsent(newGrant);
    setShowGrantModal(false);
  };

  return (
    <div id="gymlabs-professionals-view" className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header Banner */}
      <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
              // ECOSSISTEMA DO ATLETA • MEUS PROFISSIONAIS
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 font-bold">
              LGPD ART. 18
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Personais & Nutricionistas Conectados
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Gerencie o compartilhamento consentido das suas métricas biométricas com seu Personal Trainer e Nutricionista credenciados pelo Gym Labs.
          </p>
        </div>

        <button
          id="open-grant-consent-modal-btn"
          onClick={() => setShowGrantModal(true)}
          className="px-4 py-2 neo-box bg-[#00F0FF] text-black font-black text-xs uppercase flex items-center gap-2 hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>CONCEDER ACESSO A PROFISSIONAL</span>
        </button>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 neo-box flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 font-sans space-y-1">
          <p className="font-bold text-white font-mono uppercase text-xs">
            Controle Soberano do Aluno / Usuário Final
          </p>
          <p className="text-zinc-400 text-xs">
            Personal Trainers e Nutricionistas operam através de seus próprios sistemas ou portais profissionais do Gym Labs. Neste terminal de usuário, você tem autoridade total para visualizar quem tem acesso aos seus dados e revogar permissões instantaneamente.
          </p>
        </div>
      </div>

      {/* Active Consents Bar */}
      <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#39FF14]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autorizações Ativas de Acesso ({consents.filter((c) => c.status === 'ACTIVE').length})
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Soberania estrita de dados
          </span>
        </div>

        {consents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="p-4 bg-black border-2 border-zinc-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase">{consent.granteeName}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 font-bold uppercase border ${
                        consent.status === 'ACTIVE'
                          ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30'
                          : 'bg-[#FF0055]/15 text-[#FF0055] border-[#FF0055]/30'
                      }`}
                    >
                      {consent.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                    <strong className="text-zinc-300">Finalidade:</strong> {consent.purpose}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {consent.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[#00F0FF]"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {consent.status === 'ACTIVE' && (
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      Expira em: {new Date(consent.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      onClick={() => revokeConsent(consent.id, 'Revogado pelo usuário na Central de Soberania')}
                      className="text-[11px] text-[#FF0055] hover:underline font-bold transition-colors"
                    >
                      Revogar Acesso Imediatamente
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 py-2 font-sans">
            Você não compartilhou dados com nenhum profissional externo. Sua telemetria está 100% privada e isolada neste dispositivo.
          </p>
        )}
      </div>

      {/* Directory of Verified Specialists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Profissionais Homologados pelo Gym Labs
          </h3>
          <span className="text-xs text-zinc-500">{professionals.length} verificados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="p-5 bg-[#050505] border-2 border-zinc-800 hover:border-[#00F0FF] transition-all flex flex-col justify-between space-y-4 neo-box"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase">{pro.fullName}</h4>
                    <span className="text-xs text-[#00F0FF]">{pro.specialty}</span>
                  </div>
                  {pro.verifiedByGymLabs && (
                    <span
                      title="Registro verificado no respectivo Conselho (CREF/CRN)"
                      className="p-1 neo-box bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-2 font-sans line-clamp-2">{pro.bio}</p>

                <div className="mt-3 space-y-1 text-[11px] text-zinc-400 border-t border-zinc-900 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Registro Profissional:</span>
                    <span className="text-white font-bold">{pro.licenseNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Região de Atuação:</span>
                    <span className="text-zinc-300">{pro.jurisdiction}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Atletas em Acompanhamento:</span>
                    <span className="text-white">{pro.activeClientsCount}</span>
                  </div>
                </div>

                {pro.credentials && pro.credentials.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {pro.credentials.map((cred, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 bg-black border border-zinc-800 text-zinc-300"
                      >
                        {cred}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setTargetProId(pro.id);
                  setShowGrantModal(true);
                }}
                className="w-full py-2 neo-box bg-black border border-zinc-700 hover:border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black text-xs font-bold transition-all uppercase"
              >
                Conectar & Autorizar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grant Consent Modal */}
      {showGrantModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setShowGrantModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#050505] border-2 border-zinc-800 neo-box-thick p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Termo de Consentimento Granular (LGPD)
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Defina exatamente quais dados o profissional poderá acessar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGrantConsent} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Profissional Destinatário
                </label>
                <select
                  value={targetProId}
                  onChange={(e) => setTargetProId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-[#00F0FF]"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} — {p.specialty} ({p.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Finalidade do Acesso
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 bg-black border border-zinc-700 text-white outline-none focus:border-[#00F0FF]"
                  placeholder="Ex: Prescrição de treino e periodização de força"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                  Escopos de Acesso Autorizados
                </label>
                <div className="space-y-2 mt-1">
                  {ALL_SCOPES.map((sc) => {
                    const isChecked = selectedScopes.includes(sc.id);
                    return (
                      <div
                        key={sc.id}
                        onClick={() => handleToggleScope(sc.id)}
                        className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'border-[#00F0FF] bg-[#00F0FF]/5 text-white'
                            : 'border-zinc-800 bg-black text-zinc-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs uppercase">{sc.label}</div>
                          <div className="text-[10px] text-zinc-500 font-sans">{sc.description}</div>
                        </div>
                        <div
                          className={`w-4 h-4 border flex items-center justify-center ${
                            isChecked ? 'border-[#00F0FF] bg-[#00F0FF] text-black font-bold' : 'border-zinc-700'
                          }`}
                        >
                          {isChecked && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 neo-box bg-[#00F0FF] text-black font-bold text-xs uppercase hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)]"
                >
                  EMITIR TERMO & AUTORIZAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
