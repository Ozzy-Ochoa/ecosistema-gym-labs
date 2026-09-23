import React from 'react';
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
  Sparkles,
  Award
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    setAuthView,
    savedAccounts,
  } = useGymLabs();

  return (
    <div id="gymlabs-landing-view" className="min-h-screen bg-black text-white font-mono select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-sm">
              GL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-widest text-white">GYM LABS</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold">
                  SISTEMA DE SAÚDE & TREINO
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 hidden sm:block">
                CENTRALIZAÇÃO FÍSICA // DADOS REAIS & PROSPECÇÃO
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="px-4 py-2 border border-zinc-700 hover:border-white text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ENTRAR</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthView('register')}
              className="px-4 py-2 bg-white text-black font-black text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CADASTRAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-zinc-800 px-4 py-16 sm:py-24 bg-black relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
            <span className="w-1.5 h-1.5 bg-white inline-block" />
            <span className="font-bold tracking-wider uppercase">
              TUDO QUE SEU CORPO PRECISA EM UM ÚNICO APLICATIVO
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            ORGANIZE SUA VIDA FÍSICA.<br />
            CONECTE SEUS DADOS.<br />
            <span className="text-zinc-400">EVOLUA COM PRECISÃO.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            O <strong>Gym Labs</strong> reúne musculação, biometria corporal, nutrição, hidratação e recuperação 
            num só lugar. Tenha clareza absoluta sobre suas cargas, calcule sua taxa metabólica real e use o histórico 
            de cada repetição para projetar novos patamares físicos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
            >
              <KeyRound className="w-4 h-4" />
              <span>ACESSAR O APLICATIVO</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthView('register')}
              className="w-full sm:w-auto px-8 py-3.5 border border-zinc-600 hover:border-white text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>CRIAR CONTA GRATUITA</span>
            </button>
          </div>
        </div>
      </section>

      {/* O QUE CONTÉM O GYM LABS (Funcionalidades Essenciais) */}
      <section className="border-b border-zinc-800 px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
            // O QUE É O PRODUTO
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Sua Vida Física Organizada e Mensurável
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-sans">
            Chega de planilhas espalhadas e anotações perdidas. O Gym Labs consolida cada variável da sua saúde em 4 módulos principais:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-black border border-zinc-800 hover:border-white transition-all space-y-3">
            <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-white">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">1. Treino & Sobrecarga</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Registre séries, repetições e cargas reais de cada exercício. Monitore tonelagem acumulada por grupo muscular e evolução de 1RM.
            </p>
          </div>

          <div className="p-6 bg-black border border-zinc-800 hover:border-white transition-all space-y-3">
            <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">2. Saúde & Biometria</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Acompanhamento de peso, circunferências corporais, IMC, horas reais de sono e balanço de hidratação diária ajustado ao seu peso.
            </p>
          </div>

          <div className="p-6 bg-black border border-zinc-800 hover:border-white transition-all space-y-3">
            <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">3. GL Data Lab</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Gráficos de tonelagem semanal, densidade de treino e correlação direta entre o seu descanso e sua capacidade de carga.
            </p>
          </div>

          <div className="p-6 bg-black border border-zinc-800 hover:border-white transition-all space-y-3">
            <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase">4. Prospecção de Metas</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Use o histórico de dados reais para planejar os próximos ciclos de treino, ajustando volume e intensidade com fundamentação.
            </p>
          </div>
        </div>
      </section>

      {/* AFILIAÇÃO PARA PERSONAIS, NUTRICIONISTAS & ACADEMIAS */}
      <section className="border-b border-zinc-800 px-4 py-16 bg-black">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
              // ECOSSISTEMA PROFISSIONAL & AFILIAÇÃO
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Conecte-se com Alunos e Escale seus Resultados
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-sans">
              O Gym Labs não é apenas para o praticante final. Criamos portas de entrada profissionais para transformar acompanhamento em receita:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Personais & Nutricionistas */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-bold">
                    PARA PERSONAL TRAINERS & NUTRICIONISTAS
                  </span>
                </div>
                <h3 className="text-base font-bold text-white uppercase">
                  Afiliar-se para Conquistar e Reter Alunos
                </h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Profissionais de Educação Física e Nutrição podem se afiliar ao Gym Labs como canal de captação de clientes. 
                  Prescreva treinos ou dietas diretamente no aplicativo do seu aluno, receba dados reais das sessões e mantenha 
                  uma carteira recorrente de consultoria com ferramentas profissionais validadas.
                </p>
                <div className="p-3 bg-black border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                  <div>✓ Cadastro profissional com verificação de registro (CREF / CRN)</div>
                  <div>✓ Visualização do progresso dos seus alunos em tempo real</div>
                  <div>✓ Canal direto de atração de novos praticantes no app</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="w-full py-2.5 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <span>AFILIAR-SE COMO PERSONAL OU NUTRI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Box 2: Academias & Centros de Treinamento */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-bold">
                    PARA ACADEMIAS & CENTROS DE TREINAMENTO
                  </span>
                </div>
                <h3 className="text-base font-bold text-white uppercase">
                  O Sistema Integrado para sua Academia
                </h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Sua academia pode adotar o Gym Labs para gerenciar seus personais, nutricionistas e alunos sob uma mesma infraestrutura. 
                  Aumente o engajamento e a retenção de mensalidades oferecendo aos alunos uma experiência tecnológica superior no salão de musculação.
                </p>
                <div className="p-3 bg-black border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                  <div>✓ Gestão da equipe de personais e nutricionistas parceiros</div>
                  <div>✓ Redução comprovada de evasão escolar e desistência de treinos</div>
                  <div>✓ Criação de um ecossistema completo de saúde para seus membros</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="w-full py-2.5 border border-zinc-700 hover:border-white text-white font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <span>CADASTRAR ACADEMIA / UNIDADE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-8 bg-black text-center text-xs text-zinc-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-zinc-400 text-xs">
          <span>TREINO & SOBRECARGA</span>
          <span>•</span>
          <span>BIOMETRIA & NUTRIÇÃO</span>
          <span>•</span>
          <span>DADOS REAIS</span>
        </div>
        <p className="text-[11px] text-zinc-600">
          Gym Labs © 2026. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
