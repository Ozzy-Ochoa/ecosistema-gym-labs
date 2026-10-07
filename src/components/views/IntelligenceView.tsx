import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { GymLabsService } from '../../services/GymLabsService';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import {
  Send,
  BookOpen,
  Lock,
  Info,
  Shield,
  Activity,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  citations?: string[];
  uncertaintyDeclared?: string;
  clinicalDisclaimer?: string;
}

export const IntelligenceView: React.FC = () => {
  const {
    identity,
    latestBodyRecord,
    latestSleep,
    todayWellness,
    glRecoveryScore,
    acwrMetrics,
    bmrCalculation,
    tdeeCalculation,
  } = useGymLabs();

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      text: `Olá ${identity.preferredName || identity.name || 'Atleta'}. Este é o Motor de Síntese Científica Gym Labs. Minhas respostas são estritamente fundamentadas em fisiologia do exercício peer-reviewed e nas suas telemetrias reais registradas. Não invento dados, não prescrevo substâncias controladas e não diagnostico lesões clínicas. Em que posso auxiliá-lo tecnicamente hoje?`,
      clinicalDisclaimer:
        'Gym Labs Intelligence é uma ferramenta de suporte à decisão fisiológica fundamentada em evidências. Não substitui consulta médica ou nutricional presencial.',
    },
  ]);

  // Data Minimization Controls
  const [includeTraining, setIncludeTraining] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [includeRecovery, setIncludeRecovery] = useState(true);

  const executeQuery = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: userText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const athleteContext = {
        weightKg: includeNutrition ? latestBodyRecord?.weightKg?.value : undefined,
        heightCm: identity.heightCm,
        biologicalSex: identity.biologicalSex,
        bmr: includeNutrition ? bmrCalculation.result?.bmrKcal : undefined,
        tdee: includeNutrition ? tdeeCalculation.result || undefined : undefined,
        recoveryScore: includeRecovery ? glRecoveryScore.result?.score : undefined,
        acwr: includeTraining && acwrMetrics.uncoupledRatio !== null ? acwrMetrics.uncoupledRatio : undefined,
      };

      const result = await GymLabsService.getInstance().queryIntelligence({
        question: userText.trim(),
        athleteContext,
        domain: 'performance_science',
        language: 'pt',
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: result.timestamp || new Date().toISOString(),
        text: result.response,
        citations: result.citations || [],
        uncertaintyDeclared: result.limitations || 'Resumo biomecânico gerado a partir de correlações determinísticas dos parâmetros registrados.',
        clinicalDisclaimer: result.disclaimer || 'Diretriz estritamente informativa baseada em literatura científica.',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: 'Não foi possível completar a síntese no momento. O motor determinístico de regras permanece ativo localmente.',
        citations: ['Gabbett TJ (2016)', 'Mifflin MD (1990)'],
        clinicalDisclaimer: 'Diretriz informativa.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="gymlabs-intelligence-view" className="space-y-6 font-mono select-none">
      {/* Header */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Síntese Fisiológica Determinística
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              MOTOR BASEADO EM EVIDÊNCIAS
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
            Gym Labs Intel // Consulta Científica
          </h1>
          <p className="text-xs text-zinc-400 font-sans max-w-xl">
            Fundamentação direta em periódicos científicos internacionais de fisiologia e cineantropometria.
          </p>
        </div>

        {/* Data Minimization Toggles */}
        <div className="flex items-center gap-3 text-xs bg-black border border-zinc-800 p-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={includeTraining}
              onChange={(e) => setIncludeTraining(e.target.checked)}
              className="accent-white"
            />
            <span className="text-[10px] uppercase font-bold">Treino</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={includeNutrition}
              onChange={(e) => setIncludeNutrition(e.target.checked)}
              className="accent-white"
            />
            <span className="text-[10px] uppercase font-bold">Nutrição</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={includeRecovery}
              onChange={(e) => setIncludeRecovery(e.target.checked)}
              className="accent-white"
            />
            <span className="text-[10px] uppercase font-bold">HRV / Sono</span>
          </label>
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-black border border-zinc-800 p-5 space-y-4">
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 border ${
                msg.sender === 'user'
                  ? 'border-white bg-zinc-950 text-white ml-8 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'
                  : 'border-zinc-800 bg-black text-zinc-200 mr-8'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900 mb-2 text-[10px] text-zinc-500 font-bold uppercase">
                <span>{msg.sender === 'user' ? 'Você (Atleta)' : 'Motor Científico GL'}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs font-sans leading-relaxed text-zinc-100">{msg.text}</p>

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-zinc-900 text-[10px] space-y-1">
                  <span className="text-zinc-400 font-bold uppercase block">Citações Indexadas:</span>
                  {msg.citations.map((cite, i) => (
                    <div key={i} className="text-zinc-500 font-mono">
                      [{i + 1}] {cite}
                    </div>
                  ))}
                </div>
              )}

              {msg.clinicalDisclaimer && (
                <div className="mt-2 text-[9px] text-zinc-500 font-sans">
                  * {msg.clinicalDisclaimer}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="p-3 border border-zinc-800 text-xs text-zinc-400 animate-pulse">
              Consultando bases de dados científicos e telemetrias biométricas...
            </div>
          )}
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeQuery(query);
          }}
          className="flex items-center gap-2 pt-3 border-t border-zinc-900"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Como modular meu volume de treino com ACWR em 1.15? Ou qual a evidência para creatina?"
            className="flex-1 p-3 bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-white font-mono"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-5 py-3 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ENVIAR</span>
          </button>
        </form>
      </div>
    </div>
  );
};
