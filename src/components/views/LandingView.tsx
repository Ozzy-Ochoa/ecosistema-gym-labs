import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Dumbbell,
  Activity,
  BarChart3,
  Users,
  Building2,
  ArrowRight,
  UserPlus,
  KeyRound,
  Layers,
  Award,
  FileCheck,
  ShieldCheck,
  Check,
  HeartPulse,
  TrendingUp,
  ClipboardList,
  Sparkles,
  ChevronRight,
  Database,
  CheckCircle2,
  Zap,
  DollarSign,
  Flame,
  ShoppingBag,
  Smartphone,
  Shield,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    setAuthView,
    authProduct,
    setAuthProduct,
    goToLoginWithProduct,
    goToRegisterWithProduct,
    quickAccessSampleAccount,
  } = useGymLabs();

  const [selectedProductTab, setSelectedProductTab] = useState<'USER' | 'PROFESSIONAL' | 'GYM'>('USER');

  return (
    <div id="gymlabs-landing-view" className="min-h-screen bg-black text-white font-mono select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-sm">
              GL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-widest text-white">GYM LABS</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold hidden sm:inline-block">
                  ECOSSISTEMA TRI-PORTAL
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 hidden md:block">
                ATLETA // PROFISSIONAIS DO CORPO // GESTÃO DE ACADEMIAS
              </div>
            </div>
          </div>

          {/* Quick Direct Product Links in Nav */}
          <div className="hidden lg:flex items-center gap-1 border border-zinc-800 p-1 bg-zinc-950 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedProductTab('USER')}
              className={`px-2.5 py-1 transition-all cursor-pointer ${
                selectedProductTab === 'USER' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              01. APP ATLETA
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductTab('PROFESSIONAL')}
              className={`px-2.5 py-1 transition-all cursor-pointer ${
                selectedProductTab === 'PROFESSIONAL' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              02. APP PROFISSIONAL
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductTab('GYM')}
              className={`px-2.5 py-1 transition-all cursor-pointer ${
                selectedProductTab === 'GYM' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              03. APP ACADEMIA
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => goToLoginWithProduct(selectedProductTab)}
              className="px-3 sm:px-4 py-2 border border-zinc-700 hover:border-white text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ENTRAR</span>
            </button>

            <button
              type="button"
              onClick={() => goToRegisterWithProduct(selectedProductTab)}
              className="px-3 sm:px-4 py-2 bg-white text-black font-black text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CADASTRAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-zinc-800 px-4 py-14 sm:py-20 bg-black relative">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 bg-white inline-block" />
              <span className="font-bold tracking-wider uppercase">
                ARQUITETURA SEGMENTADA: TRÊS PRODUTOS ESPECÍFICOS COM CONFIGURAÇÕES DEDICADAS
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              TRÊS PAPÉIS DISTINTOS.<br />
              TRÊS APPS ESPECIALIZADOS.<br />
              <span className="text-zinc-400">UMA SÓ BASE DE DADOS REAIS.</span>
            </h1>

            <p className="text-xs sm:text-base text-zinc-400 max-w-3xl mx-auto font-sans leading-relaxed">
              O ecossistema <strong>Gym Labs</strong> não mistura necessidades opostas no mesmo aplicativo. 
              Diferenciamos de forma estrita quem <strong>treina</strong>, quem <strong>prescreve com rigor técnico</strong> 
              e quem <strong>gerencia academias e redes esportivas</strong>. Conheça e acesse a ferramenta ideal para você:
            </p>
          </div>

          {/* Quick Evaluation Toolbar: Test any screen directly without registration */}
          <div className="p-4 bg-zinc-950 border border-zinc-700 space-y-3 max-w-4xl mx-auto shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Testar Telas sem Cadastro // Acesso Imediato de Demonstração
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                1 CLIQUE • DADOS CIENTÍFICOS PRÉ-CARREGADOS
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans">
              Não tem registros reais para cadastrar agora? Explore instantaneamente as telas especializadas de cada papel:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => quickAccessSampleAccount('COACH')}
                className="p-2.5 bg-black border border-zinc-700 hover:border-white text-white text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span className="text-[9px] uppercase font-bold text-zinc-300">01. Personal</span>
                </div>
                <div className="text-xs font-black text-white mt-1 group-hover:underline">TESTAR PERSONAL</div>
                <span className="text-[9px] text-zinc-500 font-sans mt-0.5">CREF • Prescrição ACWR</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('NUTRITIONIST')}
                className="p-2.5 bg-black border border-zinc-700 hover:border-white text-white text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <FileCheck className="w-3.5 h-3.5 text-white" />
                  <span className="text-[9px] uppercase font-bold text-zinc-300">02. Nutri</span>
                </div>
                <div className="text-xs font-black text-white mt-1 group-hover:underline">TESTAR NUTRI</div>
                <span className="text-[9px] text-zinc-500 font-sans mt-0.5">CRN • Dietas & Sawka</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('GYM')}
                className="p-2.5 bg-black border border-zinc-700 hover:border-white text-white text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[9px] uppercase font-bold text-zinc-300">03. Academia</span>
                </div>
                <div className="text-xs font-black text-white mt-1 group-hover:underline">TESTAR ACADEMIA</div>
                <span className="text-[9px] text-zinc-500 font-sans mt-0.5">CNPJ • Equipe & Churn</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('USER')}
                className="p-2.5 bg-black border border-zinc-700 hover:border-white text-white text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Dumbbell className="w-3.5 h-3.5 text-white" />
                  <span className="text-[9px] uppercase font-bold text-zinc-300">04. Atleta</span>
                </div>
                <div className="text-xs font-black text-white mt-1 group-hover:underline">TESTAR ATLETA</div>
                <span className="text-[9px] text-zinc-500 font-sans mt-0.5">Aluno • Cargas & Biometria</span>
              </button>
            </div>
          </div>

          {/* 3 Main Product Cards in Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Card 1: App do Usuário Convencional */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 border border-zinc-700 bg-black flex items-center justify-center text-white">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-700 text-zinc-300 font-bold uppercase">
                    PRODUTO 01 // B2C
                  </span>
                </div>

                <div>
                  <div className="text-xs uppercase text-zinc-400 font-bold">App do Atleta</div>
                  <h3 className="text-lg font-black text-white uppercase mt-0.5">
                    Usuário Convencional
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Para o aluno e praticante. Registro preciso de cargas, 1RM estimado, cálculo de sobrecarga progressiva, 
                  antropometria, sono, hidratação de Armstrong e calorias diárias.
                </p>

                <div className="p-3 bg-black border border-zinc-900 text-[11px] text-zinc-300 space-y-1.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Diário de Cargas e RPE por Série</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Biometria & Circunferências Corporais</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>GL Data Lab Individual de Tonelagem</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => goToLoginWithProduct('USER')}
                  className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>ENTRAR NO APP DO ATLETA</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('USER')}
                  className="w-full py-1.5 bg-black border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>TESTAR TELA DO ATLETA (1 CLIQUE)</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToRegisterWithProduct('USER')}
                  className="w-full py-1.5 border border-zinc-900 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>CRIAR CONTA DE ALUNO</span>
                </button>
              </div>
            </div>

            {/* Card 2: App dos Profissionais do Corpo */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 border border-zinc-700 bg-black flex items-center justify-center text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-700 text-zinc-300 font-bold uppercase">
                    PRODUTO 02 // PRO
                  </span>
                </div>

                <div>
                  <div className="text-xs uppercase text-zinc-400 font-bold">App Pro Suite</div>
                  <h3 className="text-lg font-black text-white uppercase mt-0.5">
                    Personais & Nutris
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Para Personal Trainers e Nutricionistas. Prescrição técnica de treinos, cálculo de fadiga crônica 
                  (ACWR de Gabbett), planos alimentares, prontuário de alunos e validação de CREF/CRN.
                </p>

                <div className="p-3 bg-black border border-zinc-900 text-[11px] text-zinc-300 space-y-1.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Prescrição com Envio Direto ao Aluno</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Cálculo Científico de ACWR & Fadiga</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Validação de Registro CREF / CRN</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => goToLoginWithProduct('PROFESSIONAL')}
                  className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>ENTRAR NO APP PROFISSIONAL</span>
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => quickAccessSampleAccount('COACH')}
                    className="py-1.5 px-2 bg-black border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                    <span>TESTAR PERSONAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAccessSampleAccount('NUTRITIONIST')}
                    className="py-1.5 px-2 bg-black border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                    <span>TESTAR NUTRI</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => goToRegisterWithProduct('PROFESSIONAL')}
                  className="w-full py-1.5 border border-zinc-900 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>AFILIAR-SE COMO PROFISSIONAL</span>
                </button>
              </div>
            </div>

            {/* Card 3: App das Academias */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 border border-zinc-700 bg-black flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-700 text-zinc-300 font-bold uppercase">
                    PRODUTO 03 // B2B
                  </span>
                </div>

                <div>
                  <div className="text-xs uppercase text-zinc-400 font-bold">App Enterprise Hub</div>
                  <h3 className="text-lg font-black text-white uppercase mt-0.5">
                    Área das Academias
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Para donos e gestores de academias e centros de treinamento. Coordenação de múltiplos personais e 
                  nutricionistas, base central de alunos matriculados e combate à evasão de mensalidades.
                </p>

                <div className="p-3 bg-black border border-zinc-900 text-[11px] text-zinc-300 space-y-1.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Gestão Central de Personais e Nutris</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Indicador de Retenção & Churn de Alunos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Gestão por Unidade / CNPJ Institucional</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => goToLoginWithProduct('GYM')}
                  className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>ENTRAR NO APP DA ACADEMIA</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('GYM')}
                  className="w-full py-1.5 bg-black border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>TESTAR TELA DA ACADEMIA (1 CLIQUE)</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToRegisterWithProduct('GYM')}
                  className="w-full py-1.5 border border-zinc-900 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>CREDENCIAR SUA ACADEMIA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 01: O QUE É O PRODUTO GYM LABS // POR QUE ESSE ECOSSISTEMA É REVOLUCIONÁRIO */}
      <section className="border-b border-zinc-800 px-4 py-16 sm:py-24 bg-zinc-950/60">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-zinc-700 text-[10px] text-zinc-300 font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>O QUE É O PRODUTO GYM LABS?</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              A Fusão Definitiva entre Treino, Nutrição e Acompanhamento Profissional
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              O <strong>Gym Labs</strong> nasceu para resolver a maior dor do mercado fitness: <strong>a fragmentação total</strong>.
              Hoje, o praticante anota treino num app, calorias em outro, fala com o personal pelo WhatsApp, envia fotos da balança por e-mail e a academia não faz ideia de quem vai cancelar a matrícula no mês que vem.
            </p>
          </div>

          {/* O Que É e Para Que Serve */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-black border border-zinc-800 space-y-3">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black uppercase text-white">
                01. Uma Só Base de Dados Sincronizada
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Toda carga erguida, RPE anotado, copo de água bebido ou pesagem feita no celular do aluno é processada instantaneamente. O personal e a nutricionista não precisam pedir planilhas: tudo está visível em tempo real.
              </p>
            </div>

            <div className="p-6 bg-black border border-zinc-800 space-y-3">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black uppercase text-white">
                02. Ciência Determinística, Zero Achismos
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Substituímos palpites por modelos fisiológicos validados: sobrecarga progressiva real, razão de carga aguda x crônica (ACWR de Gabbett), balanço hídrico de Sawka e taxa metabólica de Mifflin-St Jeor auditável.
              </p>
            </div>

            <div className="p-6 bg-black border border-zinc-800 space-y-3">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black uppercase text-white">
                03. Segurança, Privacidade & LGPD
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                O aluno é o único dono dos seus dados. O compartilhamento com o personal ou nutricionista é concedido por consentimento explícito e granular, podendo ser revogado com um clique a qualquer instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 02: O MODELO DE NEGÓCIO // O "UBER & IFOOD DO FITNESS" */}
      <section className="border-b border-zinc-800 px-4 py-16 sm:py-24 bg-black">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-700 text-[10px] text-zinc-300 font-bold uppercase">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>O UBER & IFOOD DA SAÚDE ESPORTIVA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Como o Gym Labs Conecta Alunos e Profissionais Num Só Lugar
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Exatamente como a Uber conecta motoristas a passageiros e o iFood conecta restaurantes a clientes, 
              o <strong>Gym Labs</strong> conecta o praticante da academia aos melhores Personais e Nutricionistas com facilidade e cobrança integrada.
            </p>
          </div>

          {/* Os Dois Lados da Conexão */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lado do Atleta (Cliente Convencional) */}
            <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-1 bg-black border border-zinc-700 text-zinc-300 font-bold uppercase">
                    PARA O ALUNO // CLIENTE CONVENCIONAL
                  </span>
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-xl font-black uppercase text-white">
                  Treino e Dieta num só App — com Opção de Contratar Profissionais
                </h3>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  O foco principal do app é permitir que você gerencie seu treino de musculação, cargas e dieta em um único aplicativo limpo e rápido, sem precisar pagar nada para usar de forma independente.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-black border border-zinc-900 text-xs text-zinc-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span>Plano Solo (Gratuito / Base):</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans pl-6">
                      Anote suas cargas série a série, calcule 1RM estimado, monitore sono e hidratação por conta própria.
                    </p>
                  </div>

                  <div className="p-3 bg-black border border-zinc-700 text-xs text-zinc-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-white shrink-0" />
                      <span>Quer ir mais longe? Contrate um Pro no App (Como Uber/iFood):</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans pl-6">
                      Com 1 clique, assine o plano de um <strong>Personal Trainer (CREF)</strong> ou de uma <strong>Nutricionista (CRN)</strong>. Eles recebem seus dados automaticamente, montam suas séries e ajustam suas calorias e macros direto na sua tela.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-sans">Zero atrito: contratação e gestão num só app.</span>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('USER')}
                  className="px-3 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  VER APP DO ATLETA
                </button>
              </div>
            </div>

            {/* Lado do Profissional (Personal & Nutri) */}
            <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-1 bg-black border border-zinc-700 text-zinc-300 font-bold uppercase">
                    PARA PERSONAIS & NUTRICIONISTAS
                  </span>
                  <Award className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-xl font-black uppercase text-white">
                  Alunos Quase Sem Custo de Aquisição & Renda Recorrente
                </h3>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  O maior pesadelo do personal trainer e da nutricionista é o marketing e a captação de clientes. No Gym Labs, nós mudamos o jogo completamente para os profissionais credenciados.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-black border border-zinc-900 text-xs text-zinc-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-white shrink-0" />
                      <span>Alunos Entregues na Sua Mão (Como a Uber faz com motoristas):</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans pl-6">
                      Os atletas que usam o app buscam acompanhamento diretamente no marketplace. O profissional recebe solicitações de alunos prontos para contratar e pagar mensalidades.
                    </p>
                  </div>

                  <div className="p-3 bg-black border border-zinc-700 text-xs text-zinc-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-white shrink-0" />
                      <span>Software Clínico de Alta Performance:</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans pl-6">
                      Monitore fadiga por ACWR de Gabbett, veja execução em tempo real, prescreva fichas e planos de dieta em minutos sem usar planilhas quebradas de Excel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-sans">Vantagem financeira e escala de alunos.</span>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('COACH')}
                  className="px-3 py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  VER PORTAL DO PERSONAL
                </button>
              </div>
            </div>
          </div>

          {/* O Papel das Academias no Ecossistema */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  E como entram as academias? (Enterprise Hub)
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                As academias homologam sua unidade para que seus personais internos e alunos matriculados fiquem integrados. 
                O sistema monitora a frequência real: quando um aluno fica mais de 7 dias sem registrar treinos, dispara um <strong>alerta antecipado de evasão (churn)</strong> para a recepção agir e evitar o cancelamento da mensalidade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => quickAccessSampleAccount('GYM')}
              className="px-4 py-2 bg-black border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase transition-all shrink-0 cursor-pointer"
            >
              TESTAR APP ACADEMIA
            </button>
          </div>
        </div>
      </section>
      <section className="border-b border-zinc-800 px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
            // ESPECIFICAÇÃO DE PRODUTOS & CONFIGURAÇÃO DE TELAS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Como cada App foi configurado para seu papel
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-sans">
            Cada perfil exige um conjunto de ferramentas diferente. Selecione uma das abas abaixo para analisar a 
            configuração, os módulos nativos e o propósito de cada produto:
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row border border-zinc-800 bg-zinc-950 p-1 mb-8 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setSelectedProductTab('USER')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedProductTab === 'USER'
                ? 'bg-white text-black font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>01 // APP DO ATLETA</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProductTab('PROFESSIONAL')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedProductTab === 'PROFESSIONAL'
                ? 'bg-white text-black font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>02 // APP DOS PROFISSIONAIS</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProductTab('GYM')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedProductTab === 'GYM'
                ? 'bg-white text-black font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>03 // APP DAS ACADEMIAS</span>
          </button>
        </div>

        {/* Dynamic Detailed Content by Selected Tab */}
        {selectedProductTab === 'USER' && (
          <div className="p-6 sm:p-8 bg-black border border-zinc-800 space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                    CONFIGURAÇÃO DO APP // ALUNO & PRATICANTE
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">USUÁRIO CONVENCIONAL</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                  Gym Labs Atleta // Seu Registro de Cargas & Saúde
                </h3>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => goToLoginWithProduct('USER')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>ENTRAR COMO ATLETA</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('USER')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>TESTAR COM CONTA DEMO</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">1. Treino & Sobrecarga</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Registro de repetições, peso por série, RPE subjetivo e cálculo determinístico de 1RM por Epley & Brzycki.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">2. Biometria & Corpo</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Histórico de peso, circunferências corporais, balanço de água dinâmico (Armstrong) e monitoramento de sono.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">3. GL Data Lab Pessoal</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Gráficos de tonelagem semanal acumulada, densidade de esforço e correlação entre descanso e progressão de carga.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">4. Sincronia com Personal</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Receba fichas de treino prescritas pelo seu Personal Trainer e planos alimentares calculados pela sua Nutricionista.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-white uppercase block">
                  Requisitos de Acesso para o Usuário Convencional:
                </span>
                <span className="text-zinc-400 font-sans block">
                  Cadastro simplificado com e-mail, biometria inicial (peso e altura) e meta primária. Não exige licenças profissionais.
                </span>
              </div>
              <button
                type="button"
                onClick={() => goToRegisterWithProduct('USER')}
                className="px-4 py-2 border border-zinc-600 hover:border-white text-white text-xs font-bold uppercase transition-all shrink-0 cursor-pointer"
              >
                CRIAR CONTA GRATUITA DE ATLETA
              </button>
            </div>
          </div>
        )}

        {selectedProductTab === 'PROFESSIONAL' && (
          <div className="p-6 sm:p-8 bg-black border border-zinc-800 space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                    CONFIGURAÇÃO DO APP // PERSONAIS & NUTRICIONISTAS
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">PROFISSIONAIS DO CORPO</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                  Gym Labs Pro Suite // Prescrição Técnica & Prontuário
                </h3>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => goToLoginWithProduct('PROFESSIONAL')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>ENTRAR NO APP PROFISSIONAL</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('COACH')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>TESTAR COMO PERSONAL (CREF)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">1. Prescritor de Treino</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Monte rotinas de treino para alunos, selecione exercícios validados biomecanicamente e defina tonelagem-alvo.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">2. Monitoramento de ACWR</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Cálculo automático de Acute:Chronic Workload Ratio (Gabbett, 2016) para prevenir overtraining e lesões articulares.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">3. Metabolismo Clínico</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Cálculo de BMR por Cunningham/Mifflin-St Jeor, TDEE ajustado à rotina e periodização de macronutrientes do paciente.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">4. Validação de Conselho</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Garantia de conformidade legal com validação de registro CREF (Personal Trainer) e CRN (Nutricionista).
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-white uppercase block">
                  Requisitos de Acesso para Profissionais:
                </span>
                <span className="text-zinc-400 font-sans block">
                  Exige identificação de registro profissional (CREF com UF para Personais ou CRN para Nutricionistas).
                </span>
              </div>
              <button
                type="button"
                onClick={() => goToRegisterWithProduct('PROFESSIONAL')}
                className="px-4 py-2 border border-zinc-600 hover:border-white text-white text-xs font-bold uppercase transition-all shrink-0 cursor-pointer"
              >
                AFILIAR-SE COMO PERSONAL OU NUTRI
              </button>
            </div>
          </div>
        )}

        {selectedProductTab === 'GYM' && (
          <div className="p-6 sm:p-8 bg-black border border-zinc-800 space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
                    CONFIGURAÇÃO DO APP // ACADEMIAS & CENTROS DE TREINAMENTO
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">GESTÃO CORPORATIVA B2B</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                  Gym Labs Enterprise Hub // Gestão de Equipe & Retenção
                </h3>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => goToLoginWithProduct('GYM')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>ENTRAR NO APP DA ACADEMIA</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('GYM')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>TESTAR COMO ACADEMIA (CNPJ)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">1. Coordenação de Equipe</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Vincule seus Personais e Nutricionistas contratados ou parceiros sob a mesma conta institucional.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">2. Combate à Evasão (Churn)</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Acompanhe frequência e alunos com risco de cancelamento, oferecendo suporte antes que abandonem os treinos.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">3. Gestão Multiusuário & Filiais</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Controle unidades, salas e permissões com governança de dados e conformidade estrita com a LGPD.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">4. Auditoria & Relatórios</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Relatórios de evolução do quadro de alunos, taxas de prescrição ativa e engajamento no salão de musculação.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-white uppercase block">
                  Requisitos de Acesso para Academias:
                </span>
                <span className="text-zinc-400 font-sans block">
                  Exige identificação institucional (Razão Social/Nome da Unidade, CNPJ e identificação do gestor responsável).
                </span>
              </div>
              <button
                type="button"
                onClick={() => goToRegisterWithProduct('GYM')}
                className="px-4 py-2 border border-zinc-600 hover:border-white text-white text-xs font-bold uppercase transition-all shrink-0 cursor-pointer"
              >
                CADASTRAR ACADEMIA / UNIDADE
              </button>
            </div>
          </div>
        )}
      </section>

      {/* MATRIZ COMPARATIVA DE RECURSOS ENTRE OS APPS */}
      <section className="border-b border-zinc-800 px-4 py-16 bg-zinc-950">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
              // MATRIZ TÉCNICA COMPARATIVA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              O que cada App oferece
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-sans">
              Compare visualmente as permissões e recursos liberados em cada uma das três configurações de aplicativo:
            </p>
          </div>

          <div className="overflow-x-auto border border-zinc-800 bg-black">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-300">
                  <th className="p-4 uppercase font-bold text-white">Funcionalidade / Módulo</th>
                  <th className="p-4 uppercase font-bold text-white text-center">App do Atleta</th>
                  <th className="p-4 uppercase font-bold text-white text-center">App do Profissional</th>
                  <th className="p-4 uppercase font-bold text-white text-center">App da Academia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Registro de Séries, Cargas e RPE</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Execução pessoal dos treinos diários</span>
                  </td>
                  <td className="p-4 text-center text-white font-bold">✓ Total</td>
                  <td className="p-4 text-center text-zinc-600">Somente Leitura</td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Prescrição Técnica de Treinos</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Criação de fichas e envio direto a alunos</span>
                  </td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                  <td className="p-4 text-center text-white font-bold">✓ Total (CREF)</td>
                  <td className="p-4 text-center text-zinc-600">Visualização de Auditoria</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Cálculo de Fadiga Crônica (ACWR)</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Razão de carga crônica/aguda de 28 dias</span>
                  </td>
                  <td className="p-4 text-center text-zinc-400">Resumo</td>
                  <td className="p-4 text-center text-white font-bold">✓ Avançado</td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Biometria & Circunferências Corporais</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Acompanhamento antropométrico</span>
                  </td>
                  <td className="p-4 text-center text-white font-bold">✓ Individual</td>
                  <td className="p-4 text-center text-white font-bold">✓ De Todos os Alunos</td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Metabolismo Clínico & Dietas</span>
                    <span className="text-[11px] text-zinc-500 font-sans">BMR, TDEE e prescrição dietética</span>
                  </td>
                  <td className="p-4 text-center text-zinc-400">Diário Alimentar</td>
                  <td className="p-4 text-center text-white font-bold">✓ Total (CRN)</td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Gestão de Equipe de Personais</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Coordenação de profissionais contratados</span>
                  </td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                  <td className="p-4 text-center text-white font-bold">✓ Total</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Métricas de Retenção & Churn</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Controle de evasão de mensalidades</span>
                  </td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                  <td className="p-4 text-center text-zinc-600">—</td>
                  <td className="p-4 text-center text-white font-bold">✓ Total</td>
                </tr>

                <tr>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="font-bold text-white block">Credencial Exigida</span>
                    <span className="text-[11px] text-zinc-500 font-sans">Validação regulatória na criação de conta</span>
                  </td>
                  <td className="p-4 text-center text-zinc-400 font-bold">E-mail Pessoal</td>
                  <td className="p-4 text-center text-white font-bold">CREF / CRN</td>
                  <td className="p-4 text-center text-white font-bold">CNPJ da Unidade</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FLUXO DE INTEGRAÇÃO DOS 3 APPS */}
      <section className="border-b border-zinc-800 px-4 py-16 bg-black">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
              // INTEGRAÇÃO DO ECOSSISTEMA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Como os 3 Apps se conectam na prática
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-sans">
              O ecossistema é desenhado para que a informação flua sem atrito entre a gestão, o treinador e o praticante:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
                PASSO 01
              </div>
              <h3 className="text-sm font-bold uppercase text-white">
                A Academia Organiza a Estrutura
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                A academia acessa o <strong>App Enterprise Hub</strong> com seu CNPJ, cadastra suas unidades e 
                convida seus personais e nutricionistas para a equipe oficial da unidade.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
                PASSO 02
              </div>
              <h3 className="text-sm font-bold uppercase text-white">
                O Profissional Prescreve
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                O personal trainer entra no <strong>App Pro Suite</strong> com seu CREF, seleciona o aluno e monta 
                a periodização com cálculo automatizado de ACWR e tonelagem.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
                PASSO 03
              </div>
              <h3 className="text-sm font-bold uppercase text-white">
                O Atleta Treina e Alimenta o Sistema
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                O praticante abre o <strong>App do Atleta</strong> no celular, vê o treino do dia prescrito, registra 
                as cargas reais e os dados alimentam em tempo real o treinador e a academia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-12 bg-black text-center text-xs text-zinc-500 space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400 text-xs">
          <button
            type="button"
            onClick={() => goToLoginWithProduct('USER')}
            className="hover:text-white cursor-pointer"
          >
            APP DO ATLETA (LOGIN)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => goToLoginWithProduct('PROFESSIONAL')}
            className="hover:text-white cursor-pointer"
          >
            APP PROFISSIONAL (LOGIN)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => goToLoginWithProduct('GYM')}
            className="hover:text-white cursor-pointer"
          >
            APP DA ACADEMIA (LOGIN)
          </button>
        </div>

        <p className="text-[11px] text-zinc-600">
          Gym Labs Ecosystem © 2026. Sistema Integrado de Saúde, Treino & Gestão Corporativa.
        </p>
      </footer>
    </div>
  );
};
