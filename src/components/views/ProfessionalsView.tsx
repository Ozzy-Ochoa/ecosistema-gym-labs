import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ProfessionalProfile } from '../../types/professional';
import { ConsentGrant, ConsentScope } from '../../types/consent';
import {
  Users,
  ShieldCheck,
  Lock,
  Plus,
  X,
  Award,
  CheckCircle2,
  FileCheck,
  Zap,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  Sparkles,
  Check,
  Dumbbell,
  Droplet,
  MessageSquare,
  KeyRound,
  UserX,
  Clock,
  Send,
} from 'lucide-react';
import { ChatMessengerModal } from '../chat/ChatMessengerModal';

export const ProfessionalsView: React.FC = () => {
  const {
    identity,
    professionals,
    consents,
    grantConsent,
    revokeConsent,
    setCurrentTab,
    healthTeamMembers,
    invitations,
    acceptInvitation,
    rejectInvitation,
    terminateRelationship,
  } = useGymLabs();

  const [selectedPlan, setSelectedPlan] = useState<'NONE' | 'COACH' | 'NUTRITIONIST' | 'COMBO'>('COMBO');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState<string>('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [targetProId, setTargetProId] = useState(professionals[0]?.id || '');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState('pro_coach_marcus');

  const handleOpenChat = (proId?: string) => {
    if (proId) setChatRecipientId(proId);
    setIsChatOpen(true);
  };
  const [selectedScopes, setSelectedScopes] = useState<ConsentScope[]>([
    'TRAINING_READ',
    'TRAINING_WRITE',
    'RECOVERY_READ',
    'NUTRITION_READ',
  ]);
  const [purpose, setPurpose] = useState('Acompanhamento profissional integrado de treino e nutrição');

  const ALL_SCOPES: { id: ConsentScope; label: string; description: string }[] = [
    { id: 'TRAINING_READ', label: 'Ler Histórico de Treino', description: 'Acessar séries, repetições, tonelagem e RPE real' },
    { id: 'TRAINING_WRITE', label: 'Prescrever Fichas', description: 'Inserir rotinas, periodização e metas de sobrecarga' },
    { id: 'BODY_READ', label: 'Ver Biometria & Circunferências', description: 'Acessar peso corporal e medidas antropométricas' },
    { id: 'NUTRITION_READ', label: 'Ver Plano Nutricional', description: 'Consultar calorias diárias e macronutrientes' },
    { id: 'RECOVERY_READ', label: 'Acessar HRV, Sono & Fadiga', description: 'Ver escore de recuperação e prontidão neuromuscular' },
  ];

  const handleToggleScope = (scope: ConsentScope) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleQuickHirePro = (proId: string, proName: string, roleType: 'COACH' | 'NUTRITIONIST') => {
    const scopes: ConsentScope[] =
      roleType === 'COACH'
        ? ['TRAINING_READ', 'TRAINING_WRITE', 'RECOVERY_READ', 'BODY_READ']
        : ['NUTRITION_READ', 'BODY_READ', 'RECOVERY_READ'];

    const newGrant: ConsentGrant = {
      id: `cst-${Date.now()}`,
      grantorUserId: identity.id,
      granteeId: proId,
      granteeName: proName,
      granteeType: 'PROFESSIONAL',
      scopes,
      purpose:
        roleType === 'COACH'
          ? 'Prescrição técnica de treinos, monitoramento de sobrecarga e ACWR'
          : 'Periodização de macronutrientes e protocolo de hidratação de Sawka',
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      status: 'ACTIVE',
    };

    grantConsent(newGrant);
    setSuccessNotice(`Parabéns! Você se conectou a ${proName}. Suas métricas estão sincronizadas e o acompanhamento está ativo.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleGrantConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const pro = professionals.find((p) => p.id === targetProId);
    if (!pro) return;

    const proName = pro.name || (pro as any).fullName || 'Profissional';

    const newGrant: ConsentGrant = {
      id: `cst-${Date.now()}`,
      grantorUserId: identity.id,
      granteeId: pro.id,
      granteeName: proName,
      granteeType: 'PROFESSIONAL',
      scopes: selectedScopes,
      purpose,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      status: 'ACTIVE',
    };

    grantConsent(newGrant);
    setShowGrantModal(false);
    setSuccessNotice(`Acesso autorizado para ${proName}.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const activeConsents = (consents || []).filter((c) => c && c.status === 'ACTIVE');
  const hasConnectedCoach = activeConsents.some((c) => {
    const nameLower = (c?.granteeName || '').toLowerCase();
    const scopes = c?.scopes || [];
    return nameLower.includes('lucas') || nameLower.includes('coach') || nameLower.includes('personal') || scopes.includes('TRAINING_WRITE');
  });
  const hasConnectedNutri = activeConsents.some((c) => {
    const nameLower = (c?.granteeName || '').toLowerCase();
    const scopes = c?.scopes || [];
    return nameLower.includes('elena') || nameLower.includes('nutri') || scopes.includes('NUTRITION_READ');
  });

  return (
    <div id="gymlabs-professionals-view" className="space-y-8 max-w-7xl mx-auto font-mono select-none">
      {/* Header Banner - Equipe de Saúde Integrada */}
      <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                PRO CONNECT // EQUIPE DE SAÚDE INTEGRADA
              </span>
              <span className="text-[9px] px-2 py-0.5 bg-white text-black font-black uppercase">
                CONEXÃO PROFISSIONAL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Conecte Personal Trainer e Nutricionista num só App
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl font-sans leading-relaxed">
              O ecossistema Gym Labs permite que você treine de forma autônoma ou <strong>conecte-se a profissionais homologados (CREF / CRN)</strong> para receber fichas de treino periodizadas e planos alimentares calculados diretamente no seu celular.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowGrantModal(true)}
              className="px-4 py-2 border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>GERENCIAR PERMISSÕES</span>
            </button>
          </div>
        </div>

        {/* Status of Current Connection & Invitations HUD */}
        <div className="p-4 bg-black border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <span>Status da Conexão:</span>
                  <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-white font-bold">
                    {healthTeamMembers.filter((m) => m.status === 'ACTIVE').length > 0 || activeConsents.length > 0
                      ? `${Math.max(healthTeamMembers.filter((m) => m.status === 'ACTIVE').length, activeConsents.length)} PROFISSIONAL(IS) CONECTADO(S)`
                      : 'MODO SOLO (PLANO BASE)'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  {healthTeamMembers.filter((m) => m.status === 'ACTIVE').length > 0
                    ? 'Seus dados de sobrecarga, prescrição e acompanhamento estão sincronizados em tempo real com sua equipe técnica.'
                    : 'Você está no modo individual. Contrate um profissional credenciado ou insira o código de convite enviado pelo seu Personal/Nutri.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {hasConnectedCoach && (
                <button
                  type="button"
                  onClick={() => handleOpenChat('pro_coach_marcus')}
                  className="text-[10px] px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-white text-white font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                  <span>CHAT PERSONAL</span>
                </button>
              )}
              {hasConnectedNutri && (
                <button
                  type="button"
                  onClick={() => handleOpenChat('pro_nutri_elena')}
                  className="text-[10px] px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-white text-white font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-400" />
                  <span>CHAT NUTRI</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenChat()}
                className="text-[10px] px-2.5 py-1 bg-white text-black font-black uppercase flex items-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>ABRIR CANAL DE CHAT</span>
              </button>
            </div>
          </div>

          {/* Código de Convite Direto Aluno <-> Profissional */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white uppercase block">
                  Vincular com Código de Convite do Personal / Nutricionista
                </span>
                <span className="text-[10px] text-zinc-500 font-sans block">
                  Recebeu um código GL-XXXXXX do seu profissional? Insira abaixo para aprovar o acompanhamento.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Ex: GL-489123"
                value={inviteCodeInput}
                onChange={(e) => {
                  setInviteCodeInput(e.target.value.toUpperCase());
                  setInviteError(null);
                }}
                className="px-3 py-1.5 bg-black border border-zinc-700 text-white font-mono text-xs uppercase focus:border-white outline-none w-full md:w-40"
              />
              <button
                type="button"
                onClick={() => {
                  if (!inviteCodeInput.trim()) {
                    setInviteError('Informe o código do convite.');
                    return;
                  }
                  const ok = acceptInvitation(inviteCodeInput.trim(), { id: identity.id, name: identity.name });
                  if (ok) {
                    setSuccessNotice(`Código ${inviteCodeInput.trim()} validado com sucesso! Vínculo profissional ativado.`);
                    setInviteCodeInput('');
                    setInviteError(null);
                    setTimeout(() => setSuccessNotice(null), 4000);
                  } else {
                    setInviteError('Código de convite inválido, expirado ou já utilizado.');
                  }
                }}
                className="px-3 py-1.5 bg-white text-black text-xs font-bold uppercase hover:bg-zinc-200 transition-colors shrink-0 cursor-pointer"
              >
                Ativar Vínculo
              </button>
            </div>
          </div>
          {inviteError && (
            <p className="text-[11px] text-red-400 font-sans">{inviteError}</p>
          )}

          {/* Convites Pendentes Recebidos */}
          {invitations.filter((inv) => inv.status === 'PENDING' && (inv.targetEmail === identity.email || inv.targetRole === 'USER')).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Solicitações de Vínculo Pendentes:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {invitations
                  .filter((inv) => inv.status === 'PENDING' && (inv.targetEmail === identity.email || inv.targetRole === 'USER'))
                  .map((inv) => (
                    <div key={inv.id} className="p-3 bg-zinc-950 border border-zinc-700 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white uppercase">{inv.senderName}</div>
                        <div className="text-[10px] text-zinc-400 font-sans">{inv.senderRole === 'COACH' ? 'Personal Trainer' : 'Nutricionista'} • Código: {inv.code}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => acceptInvitation(inv.code, { id: identity.id, name: identity.name })}
                          className="px-2 py-1 bg-white text-black text-[10px] font-bold uppercase hover:bg-zinc-200 cursor-pointer"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectInvitation(inv.code, 'Recusado pelo atleta')}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase hover:text-white cursor-pointer"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-black border border-white text-xs text-white flex items-center gap-3 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="font-bold">{successNotice}</span>
        </div>
      )}

      {/* PLANOS DE ACOMPANHAMENTO PROFISSIONAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase">
              // PLANOS DE ACOMPANHAMENTO INTEGRADO
            </div>
            <h2 className="text-lg font-black uppercase text-white">
              Escolha seu Nível de Acompanhamento no App
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
            Cobrança mensal simplificada • Cancele quando quiser
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plano 01: Personal Trainer */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-black border border-zinc-700 flex items-center justify-center text-white">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                  PLANO TREINO
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase">Personal Trainer (CREF)</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">R$ 149</span>
                  <span className="text-xs text-zinc-400 font-sans">/mês</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Prescrição de fichas de treino personalizadas direto na sua tela, monitoramento de sobrecarga e cálculo de risco ACWR.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Fichas semanais ajustadas por carga real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Cálculo científico de ACWR contra lesão</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Feedback das séries direto no app</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickHirePro('pro_lucas_silva', 'Dr. Lucas Silva', 'COACH')}
              className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <span>{hasConnectedCoach ? 'PLANO ATIVO' : 'CONTRATAR PERSONAL'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plano 02: Nutricionista Esportiva */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-black border border-zinc-700 flex items-center justify-center text-white">
                  <Droplet className="w-4 h-4" />
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                  PLANO DIETA
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase">Nutricionista (CRN)</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">R$ 129</span>
                  <span className="text-xs text-zinc-400 font-sans">/mês</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Metas diárias de calorias e macros calculadas por g/kg, balanço hídrico individual de Sawka e acompanhamento metabólico.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Periodização de macros (g/kg corporal)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Protocolo Sawka de hidratação por suor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Ajustes semanais de gasto calórico TDEE</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickHirePro('pro_elena_vance', 'Elena Vance', 'NUTRITIONIST')}
              className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <span>{hasConnectedNutri ? 'PLANO ATIVO' : 'CONTRATAR NUTRI'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plano 03: Combo Completo */}
          <div className="p-6 bg-zinc-950 border border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-4 px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase">
              MAIS POPULAR • ECONOMIZE R$ 49
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-black border border-white text-white font-bold uppercase">
                  COMBO COMPLETO
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase">Personal + Nutri 360°</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">R$ 229</span>
                  <span className="text-xs text-zinc-400 font-sans">/mês</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Treinador e Nutricionista trabalhando juntos na mesma base de dados. O personal enxerga sua ingestão e a nutri enxerga seu gasto real de treino.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Sincronia total entre treino e dieta</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Personal (CREF) + Nutricionista (CRN) dedicados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Resultados até 3x mais rápidos com suporte</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleQuickHirePro('pro_lucas_silva', 'Dr. Lucas Silva', 'COACH');
                handleQuickHirePro('pro_elena_vance', 'Elena Vance', 'NUTRITIONIST');
              }}
              className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <span>{hasConnectedCoach && hasConnectedNutri ? 'COMBO 360° ATIVO' : 'CONTRATAR COMBO 360°'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VITRINE DE PROFISSIONAIS VERIFICADOS (SELEÇÃO DIRETA) */}
      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase">
              // ESPECIALISTAS HOMOLOGADOS PELO GYM LABS
            </div>
            <h2 className="text-lg font-black uppercase text-white">
              Escolha seu Profissional com CREF e CRN Auditados
            </h2>
          </div>
          <span className="text-xs text-zinc-500">{professionals.length} verificados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((pro) => {
            const proName = pro.name || (pro as any).fullName || 'Profissional';
            const proTitle = pro.title || (pro as any).specialty || (pro.specialties && pro.specialties.join(', ')) || 'Especialista';
            const credNumber = pro.credentials?.[0]?.credentialNumber || (pro as any).licenseNumber || 'REGISTRO ATIVO';
            const proJurisdiction = pro.credentials?.[0]?.jurisdiction || (pro as any).jurisdiction || pro.country || 'BR';

            const isConnected = activeConsents.some(
              (c) => (c?.granteeId && c.granteeId === pro.id) || (c?.granteeName && c.granteeName === proName)
            );

            const titleLower = (proTitle || '').toLowerCase();
            const specLower = ((pro.specialties || []).join(' ')).toLowerCase();
            const isCoach = titleLower.includes('personal') || titleLower.includes('coach') || specLower.includes('hypertrophy') || credNumber.includes('CREF');

            return (
              <div
                key={pro.id}
                className={`p-5 bg-black border transition-all flex flex-col justify-between space-y-4 ${
                  isConnected
                    ? 'border-white bg-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.12)]'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm uppercase">{proName}</h4>
                        {isConnected && (
                          <span className="text-[8px] px-1.5 py-0.2 bg-white text-black font-black uppercase">
                            CONECTADO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-sans block mt-0.5">{proTitle}</span>
                    </div>

                    <span
                      title="Registro homologado pelo Conselho de Classe"
                      className="p-1 border border-zinc-700 bg-zinc-900 text-white"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-2 font-sans line-clamp-3 leading-relaxed">
                    {pro.bio}
                  </p>

                  <div className="mt-4 space-y-1.5 text-[11px] text-zinc-400 border-t border-zinc-900 pt-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Registro Oficial:</span>
                      <span className="text-white font-bold">{credNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Jurisdição:</span>
                      <span className="text-zinc-300">{proJurisdiction}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Avaliação Média:</span>
                      <span className="text-white font-bold">★ 4.9 / 5.0 (42 alunos)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickHirePro(pro.id, proName, isCoach ? 'COACH' : 'NUTRITIONIST')}
                    className={`w-full py-2 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isConnected
                        ? 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white'
                        : 'bg-white text-black hover:bg-zinc-200 font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>SINCRONIZADO // ATIVO</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>CONTRATAR / CONECTAR (1 CLIQUE)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EQUIPE DE SAÚDE VINCULADA (MEMBROS ATIVOS) */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Equipe Técnica Vinculada ({healthTeamMembers.filter((m) => m.status === 'ACTIVE').length})
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            Vínculos Ativos com Autorização Técnica
          </span>
        </div>

        {healthTeamMembers.filter((m) => m.status === 'ACTIVE').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthTeamMembers
              .filter((m) => m.status === 'ACTIVE')
              .map((member) => (
                <div key={member.id} className="p-4 bg-black border border-zinc-700 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 border border-zinc-700 bg-zinc-900 flex items-center justify-center font-bold text-xs text-white">
                          {member.role === 'COACH' ? 'PT' : member.role === 'NUTRITIONIST' ? 'NT' : 'AC'}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white uppercase">{member.name}</div>
                          <div className="text-[10px] text-zinc-400 font-sans">{member.credentialNumber} • {member.specialty}</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold uppercase">
                        ATIVO
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-900">
                      <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Escopos Autorizados:</span>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.canViewWorkouts && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">Treinos (ACWR)</span>
                        )}
                        {member.permissions.canViewDiet && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">Plano Nutricional</span>
                        )}
                        {member.permissions.canViewBodyMetrics && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">Biometria & Cargas</span>
                        )}
                        {member.permissions.canViewHydrationAndSleep && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">Sono, HRV & Hidratação</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-sans">
                      Conectado desde: {member.connectedSince}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenChat(member.professionalId)}
                        className="text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-white font-bold uppercase cursor-pointer"
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente encerrar o vínculo profissional com ${member.name}? O acesso aos seus dados de saúde será revogado imediatamente.`)) {
                            terminateRelationship(member.id, 'Encerrado pelo atleta via interface');
                          }
                        }}
                        className="text-[10px] px-2 py-1 text-red-400 hover:text-red-300 hover:underline uppercase font-bold cursor-pointer"
                      >
                        Encerrar Vínculo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 font-sans">
            Nenhum profissional vinculado diretamente à sua equipe no momento.
          </p>
        )}
      </div>

      {/* PAINEL DE CONTROLE DE PERMISSÕES & LGPD */}
      <div className="p-5 bg-black border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Autorizações Ativas de Compartilhamento ({activeConsents.length})
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            Controle Soberano do Atleta (LGPD)
          </span>
        </div>

        {activeConsents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeConsents.map((consent) => (
              <div
                key={consent.id}
                className="p-4 bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase">{consent.granteeName}</span>
                    <span className="text-[9px] px-2 py-0.5 font-bold uppercase border border-white text-white">
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
                        className="text-[9px] px-1.5 py-0.5 bg-black border border-zinc-800 text-zinc-300 uppercase"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-sans">
                    Expira em: {new Date(consent.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => revokeConsent(consent.id, 'Revogado pelo usuário')}
                    className="text-[11px] text-red-400 hover:text-red-300 hover:underline font-bold transition-colors cursor-pointer uppercase"
                  >
                    Revogar Acesso
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 py-2 font-sans">
            Você não compartilhou dados com nenhum profissional externo. Sua telemetria está privada e isolada neste dispositivo.
          </p>
        )}
      </div>

      {/* Grant Consent Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <form
            onSubmit={handleGrantConsent}
            className="w-full max-w-lg bg-black border border-white p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Ajustar Permissões Fisiológicas</h3>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Profissional Credenciado</label>
              <select
                value={targetProId}
                onChange={(e) => setTargetProId(e.target.value)}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono text-xs"
              >
                {professionals.map((p) => {
                  const pName = p.name || (p as any).fullName || 'Profissional';
                  const pTitle = p.title || (p as any).specialty || 'Especialista';
                  const pCred = p.credentials?.[0]?.credentialNumber || (p as any).licenseNumber || '';
                  return (
                    <option key={p.id} value={p.id}>
                      {pName} ({pTitle} {pCred ? `• ${pCred}` : ''})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-bold">Finalidade do Compartilhamento</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-700 text-white outline-none focus:border-white font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-400 block font-bold">Escopos de Acesso Permitidos:</label>
              {ALL_SCOPES.map((sc) => {
                const isChecked = selectedScopes.includes(sc.id);
                return (
                  <div
                    key={sc.id}
                    onClick={() => handleToggleScope(sc.id)}
                    className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-white bg-zinc-950 text-white'
                        : 'border-zinc-800 bg-black text-zinc-500'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase">{sc.label}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">{sc.description}</div>
                    </div>
                    <div
                      className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                        isChecked ? 'border-white bg-white text-black font-bold' : 'border-zinc-700'
                      }`}
                    >
                      {isChecked ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="px-4 py-2 border border-zinc-700 text-xs text-zinc-400 hover:text-white cursor-pointer uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
              >
                Salvar Permissões
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Chat Modal */}
      <ChatMessengerModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        defaultContactId={chatRecipientId}
      />
    </div>
  );
};
