import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Dumbbell,
  Utensils,
  Building2,
  Users,
  ShieldCheck,
  Check,
  KeyRound,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Flame,
  Clock,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    goToLoginWithProduct,
    goToRegisterWithProduct,
    quickAccessSampleAccount,
  } = useGymLabs();

  const [activeProfileTab, setActiveProfileTab] = useState<'USER' | 'PROFESSIONAL' | 'GYM'>('USER');

  return (
    <div id="gymlabs-landing-view" className="min-h-screen bg-black text-white font-mono select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-900 bg-black/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-sm">
              GL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-widest text-white">GYM LABS</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold hidden sm:inline-block">
                  ECOSSISTEMA INTEGRADO
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 hidden md:block">
                ALUNOS // PERSONAL TRAINERS // NUTRICIONISTAS // ACADEMIAS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => goToLoginWithProduct(activeProfileTab)}
              className="px-3 sm:px-4 py-2 border border-zinc-700 hover:border-white text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ENTRAR</span>
            </button>

            <button
              type="button"
              onClick={() => goToRegisterWithProduct(activeProfileTab)}
              className="px-3 sm:px-4 py-2 bg-white text-black font-black text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CADASTRAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Quick Demo Toolbar */}
      <section className="border-b border-zinc-900 px-4 py-10 sm:py-14 bg-black relative">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
            <span className="w-1.5 h-1.5 bg-white inline-block shadow-[0_0_6px_#fff]" />
            <span className="font-bold tracking-wider uppercase">
              APRESENTAÇÃO DO SISTEMA // GYM LABS GLOBAL
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Tudo o que Você Precisa para Treinar, Prescrever e Gerenciar
          </h1>

          <p className="text-xs sm:text-base text-zinc-400 max-w-3xl mx-auto font-sans leading-relaxed">
            O <strong>Gym Labs</strong> é uma plataforma didática e inteligente que conecta o praticante individual, os profissionais de saúde e a academia. Cada usuário tem seu próprio ambiente exclusivo com as ferramentas certas para o seu dia a dia.
          </p>

          {/* TEST ACCESS TOOLBAR - PRESERVED FOR INSTANT SWITCHING */}
          <div className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 text-left space-y-3 max-w-4xl mx-auto shadow-2xl mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 inline-block animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Acessos de Teste do Sistema // Clique para Testar Qualquer Ambiente
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">1 CLIQUE DIRETO</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickAccessSampleAccount('usr_gymlabs_master')}
                className="p-3 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-700 text-white font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer group"
              >
                <Users className="w-4 h-4 text-zinc-400 group-hover:text-black" />
                <span className="text-[10px] font-black uppercase">ALUNO</span>
                <span className="text-[8px] text-zinc-400 group-hover:text-zinc-700">Alex Vance</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('usr_gymlabs_trainer')}
                className="p-3 bg-zinc-900 hover:bg-blue-500 hover:text-white border border-zinc-700 text-white font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer group"
              >
                <Dumbbell className="w-4 h-4 text-blue-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase">PERSONAL</span>
                <span className="text-[8px] text-zinc-400 group-hover:text-zinc-200">Coach Marcus</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('usr_gymlabs_nutri')}
                className="p-3 bg-zinc-900 hover:bg-emerald-500 hover:text-white border border-zinc-700 text-white font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer group"
              >
                <Utensils className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase">NUTRI</span>
                <span className="text-[8px] text-zinc-400 group-hover:text-zinc-200">Dra. Elena</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('usr_gymlabs_gym')}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer group"
              >
                <Building2 className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase">ACADEMIA</span>
                <span className="text-[8px] text-zinc-400">Iron Gym Club</span>
              </button>

              <button
                type="button"
                onClick={() => quickAccessSampleAccount('usr_gymlabs_admin')}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer group col-span-2 sm:col-span-1"
              >
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase">ADMIN</span>
                <span className="text-[8px] text-zinc-400">Auditoria</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Organized by Profiles */}
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            CONHEÇA O SISTEMA SEPARADAMENTE POR USUÁRIO
          </span>
          <h2 className="text-xl sm:text-3xl font-black uppercase text-white">
            Soluções Claras para Cada Tipo de Usuário
          </h2>
          <p className="text-xs text-zinc-400 font-sans max-w-xl mx-auto">
            Sem informações repetidas: clique em cada perfil abaixo para entender exatamente o que ele fornece, suas vantagens e o diferencial do Gym Labs.
          </p>

          {/* Profile Switcher Tabs */}
          <div className="inline-flex p-1 bg-zinc-950 border border-zinc-800 text-xs gap-1 mt-3">
            <button
              type="button"
              onClick={() => setActiveProfileTab('USER')}
              className={`px-4 py-2 font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeProfileTab === 'USER' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Aluno Convencional</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('PROFESSIONAL')}
              className={`px-4 py-2 font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeProfileTab === 'PROFESSIONAL' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>2. Profissionais (Nutri & Personal)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('GYM')}
              className={`px-4 py-2 font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeProfileTab === 'GYM' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3. Academias & Studios</span>
            </button>
          </div>
        </div>

        {/* 1. USUÁRIO CONVENCIONAL */}
        {activeProfileTab === 'USER' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
                <div className="w-9 h-9 bg-white text-black font-black flex items-center justify-center text-sm">
                  01
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-white">
                    App do Aluno / Usuário Convencional
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Feito para quem treina na academia com autonomia total ou acompanhado por profissionais.
                  </p>
                </div>
              </div>

              {/* 3 Columns: O Que Fornece, Vantagens, Nosso Diferencial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. O Que Fornece */}
                <div className="p-4 bg-black border border-zinc-900 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                      <Dumbbell className="w-3.5 h-3.5 text-white" />
                      <span>O Que Fornece:</span>
                    </div>

                    <ul className="space-y-2 text-zinc-300 font-sans">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Treino Sugerido Inteligente:</strong> gerado conforme seu objetivo (Hipertrofia, Força, Emagrecimento) e 100% editável.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Montar o Seu Próprio Treino:</strong> defina os dias da semana, crie suas divisões (A, B, C...), adicione exercícios, séries, repetições e cargas (que podem ser deixadas em branco para preencher na hora).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Console de Treino Ativo:</strong> cronômetro de sessão em tempo real, ajuste de peso e repetições na hora de fazer, botão de falha muscular e temporizador de descanso entre as séries.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Gasto Calórico Real Integrado:</strong> cálculo automático das calorias queimadas no treino somadas ao gasto do seu dia na aba de Início e Saúde.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Widget Minimalista de Frequência:</strong> veja sua assiduidade e o treino de hoje num componente compacto e elegante.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. Vantagens */}
                <div className="p-4 bg-black border border-zinc-900 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                      <span>Vantagens no Dia a Dia:</span>
                    </div>

                    <ul className="space-y-2 text-zinc-300 font-sans">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong>Sem Fichas de Papel:</strong> todo o seu histórico de cargas, tonelagem e evolução salvo na nuvem com gráficos claros.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong>Descanso Controlado:</strong> o temporizador de descanso apita e avisa a hora exata da próxima série, garantindo a intensidade certa.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong>Progressão Real:</strong> o motor de sobrecarga avisa quando aumentar a carga ou quando você bateu um novo recorde pessoal (PR).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong>Hidratação Científica:</strong> meta de água ajustada pelo seu peso, taxa de suor e temperatura ambiente (Armstrong & Sawka).</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 3. Nosso Diferencial */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>O Nosso Diferencial:</span>
                    </div>

                    <p className="text-zinc-300 font-sans leading-relaxed">
                      Você é livre para treinar de forma 100% autônoma. Porém, se você contratar um personal trainer parceiro, <strong>a ficha técnica dele substitui automaticamente a rotina</strong>, sincronizando séries e cargas direto no seu app.
                    </p>
                    <p className="text-zinc-400 font-sans leading-relaxed">
                      E se conectar uma nutricionista esportiva, a dieta completa com horários, substituições e macros entra direto na sua aba de nutrição, sem você precisar digitar nada!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => quickAccessSampleAccount('usr_gymlabs_master')}
                    className="w-full mt-3 py-2 bg-white text-black font-black uppercase text-[11px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Experimentar App do Aluno</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROFISSIONAIS (NUTRI & PERSONAL) */}
        {activeProfileTab === 'PROFESSIONAL' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
                <div className="w-9 h-9 bg-white text-black font-black flex items-center justify-center text-sm">
                  02
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-white">
                    Sistemas Profissionais: Gym Labs Trainer & Gym Labs Nutri
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Plataformas profissionais completas para atendimento presencial e consultoria online.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Gym Labs Trainer */}
                <div className="p-4 bg-black border border-blue-900/50 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-blue-400" />
                        <h4 className="font-bold text-white uppercase text-sm">Gym Labs Trainer (CREF)</h4>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                        PORTAL DO COACH
                      </span>
                    </div>

                    <div className="text-zinc-300 font-sans space-y-1.5">
                      <p>• <strong>O Que Fornece:</strong> Prontuário esportivo do aluno (lesões, nível), construtor de treinos com publicação instantânea para o app do atleta, testes de força máxima (1RM), agenda de aulas e controle financeiro de mensalidades.</p>
                      <p>• <strong>Vantagens:</strong> Chega de enviar fichas em PDF no WhatsApp. Acompanhe em tempo real as cargas que o aluno executou na academia e monitore o índice de esforço (ACWR de Gabbett).</p>
                      <p>• <strong>Diferencial:</strong> Canal direto de comunicação com a nutricionista do mesmo aluno para alinhar volume de treino com aporte calórico.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => quickAccessSampleAccount('usr_gymlabs_trainer')}
                    className="w-full mt-2 py-2 bg-zinc-900 hover:bg-blue-500 hover:text-white border border-zinc-700 text-white font-bold uppercase transition-all text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir Portal Gym Labs Trainer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gym Labs Nutri */}
                <div className="p-4 bg-black border border-emerald-900/50 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-white uppercase text-sm">Gym Labs Nutri (CRN)</h4>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        PORTAL DO NUTRICIONISTA
                      </span>
                    </div>

                    <div className="text-zinc-300 font-sans space-y-1.5">
                      <p>• <strong>O Que Fornece:</strong> Prontuário clínico completo, avaliação física por bioimpedância e 7 dobras cutâneas (Pollock), criador de planos alimentares com substituições e tabela TACO, agenda de consultas e fluxo financeiro.</p>
                      <p>• <strong>Vantagens:</strong> Em 1 clique o plano alimentar é publicado no app do paciente, com horários e opções de troca já calculadas em macronutrientes.</p>
                      <p>• <strong>Diferencial:</strong> Acesso aos dados de gasto calórico real do treino do aluno registrado pelo personal trainer, ajustando a dieta com exatidão.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => quickAccessSampleAccount('usr_gymlabs_nutri')}
                    className="w-full mt-2 py-2 bg-zinc-900 hover:bg-emerald-500 hover:text-white border border-zinc-700 text-white font-bold uppercase transition-all text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir Portal Gym Labs Nutri</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ACADEMIAS & STUDIOS */}
        {activeProfileTab === 'GYM' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
                <div className="w-9 h-9 bg-white text-black font-black flex items-center justify-center text-sm">
                  03
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-white">
                    App para Academias & Studios Esportivos
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Transforme sua academia em um centro integrado de performance e reduza a evasão.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-black border border-zinc-900 space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">1. O Que Fornece</span>
                  <h4 className="text-white font-bold uppercase text-sm">Telemetria de Frequência</h4>
                  <p className="text-zinc-400 font-sans leading-relaxed">
                    Monitore a assiduidade dos matriculados em tempo real, veja quem está sem treinar há mais de 7 dias e atue proativamente.
                  </p>
                </div>

                <div className="p-4 bg-black border border-zinc-900 space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">2. Vantagens Reais</span>
                  <h4 className="text-white font-bold uppercase text-sm">Redução do Churn (Cancelamentos)</h4>
                  <p className="text-zinc-400 font-sans leading-relaxed">
                    Alunos que acompanham cargas e têm suporte de treinos estruturados têm uma taxa de retenção até 3 vezes maior do que academias com fichas convencionais.
                  </p>
                </div>

                <div className="p-4 bg-black border border-zinc-900 space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">3. Nosso Diferencial</span>
                  <h4 className="text-white font-bold uppercase text-sm">Integração Total do Espaço</h4>
                  <p className="text-zinc-400 font-sans leading-relaxed">
                    Permita que os personais e nutricionistas que atendem no seu espaço usem uma plataforma unificada que valoriza a estrutura física da sua academia.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => quickAccessSampleAccount('usr_gymlabs_gym')}
                  className="px-5 py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Experimentar Portal da Academia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Differentiators */}
        <div className="border-t border-zinc-900 pt-8 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              POR QUE SOMOS ESPECIAIS
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase text-white">
              O Diferencial Exclusivo do Ecossistema Gym Labs
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="text-white font-black uppercase block text-sm">1. Ciência Real</span>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Fórmulas fisiológicas validadas (Mifflin-St Jeor, ACWR de Gabbett, 1RM de Epley e Armstrong/Sawka).
              </p>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="text-white font-black uppercase block text-sm">2. Sincronia em Tempo Real</span>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                A ficha ajustada pelo personal ou a dieta pela nutri entra na hora no app do aluno.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="text-white font-black uppercase block text-sm">3. Flexibilidade Total</span>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Treino sugerido inteligente e editável, ou liberdade para montar seu treino do zero como preferir.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="text-white font-black uppercase block text-sm">4. Alinhamento Multidisciplinar</span>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                O personal e a nutricionista conversam em canal seguro nativo, alinhando gasto energético e dieta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black px-4 py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">GYM LABS</span>
            <span>• Ecossistema de Saúde, Treino e Gestão Profissional</span>
          </div>
          <div className="text-[10px] text-zinc-600">
            © 2026 GYM LABS GLOBAL • DETERMINISMO FISIOLÓGICO & PRIVACIDADE
          </div>
        </div>
      </footer>
    </div>
  );
};
