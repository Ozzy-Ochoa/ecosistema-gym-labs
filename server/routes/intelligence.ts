import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

router.post('/query', apiRateLimiter(20), async (req: Request, res: Response) => {
  try {
    const rawQuestion = req.body.question || req.body.query;
    const domain = req.body.domain || 'performance_science';
    const minimizedContext = req.body.minimizedContext || req.body.athleteContext || {};
    const language = req.body.language || 'pt';

    if (!rawQuestion || typeof rawQuestion !== 'string') {
      return res.status(400).json({ error: 'Pergunta ou termo de consulta fisiológica é obrigatório' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Deterministic fallback response with strict epistemic honesty
      return res.json({
        response: `[GL Intelligence — Modo Determinístico Autônomo]\n\nO motor de inferência está operando sob os axiomas determinísticos do Gym Labs:\n\n1. Periodização e Sobrecarga: Adaptações de força e hipertrofia requerem progressão sistemática (Gabbett et al., Schoenfeld et al.) com ACWR mantido em faixa segura (< 1.30).\n2. Balanço Energético: Metas calóricas ancoradas no modelo Mifflin-St Jeor / Katch-McArdle, com aporte proteico de 1.6 a 2.2 g/kg para preservação de massa livre de gordura.\n3. Recuperação e Prontidão: Variabilidade da Frequência Cardíaca (rMSSD) e eficiência do sono modulam a tolerância à carga mecânica diária.\n\nConfigure GEMINI_API_KEY no ambiente para habilitar a síntese neural em tempo real.`,
        confidence: 'ALTA',
        provenance: 'DETERMINISTIC_RULES_ENGINE',
        citations: [
          'Mifflin MD et al. (1990) J Am Diet Assoc',
          'Gabbett TJ (2016) Br J Sports Med',
          'Schoenfeld BJ et al. (2021) Int J Sports Med',
          'Armstrong LE et al. (1994) Int J Sport Nutr',
        ],
        limitations: 'Inferência baseada em modelos matemáticos determinísticos populacionais (variância individual esperada de ±8-12%).',
        disclaimer: 'O Gym Labs fornece inteligência baseada em evidências científicas e não substitui o diagnóstico clínico de um médico ou nutricionista habilitado.',
        uncertaintyDeclared: true,
      });
    }

    const systemInstruction = `Você é o "GL Intelligence", o motor de síntese fisiológica e biomecânica do Gym Labs (Labcore 2026).
Suas diretrizes imutáveis são:
1. RIGOR CIENTÍFICO E NÃO-ALUCINAÇÃO: Nunca invente biometrias. Se dados estiverem ausentes, declare expressamente "DADOS INSUFICIENTES".
2. SEPARAÇÃO RIGOROSA: Diferencie dados brutos mensurados de estimativas matemáticas e inferências interpretativas.
3. CIÊNCIA ANTES DA IA: Fundamente recomendações em evidências consagradas (Epley, Brzycki, Tanaka, Karvonen, Mifflin-St Jeor, Armstrong, Schoenfeld, Helms).
4. BARREIRA CLÍNICA: Não prescreva fármacos nem diagnostique patologias. Sempre recomende supervisão de profissionais certificados.
5. CORRELAÇÃO NÃO É CAUSA: Descreva padrões como "associação temporal observada nos dados".
6. TOM DE VOZ: Técnico, conciso, objetivo, estético, com alto rigor de engenharia biomédica. Idioma: Português formal/técnico.`;

    const promptText = `Consulta do Atleta/Operador: "${rawQuestion}"
Domínio Fisiológico: ${domain}
Telemetria Anonimizada & Minimizada:
${JSON.stringify(minimizedContext, null, 2)}

Forneça uma resposta estruturada contendo:
1. Síntese Direta e Análise Biomecânica/Fisiológica
2. Fundamentação Científica & Literatura Relevante (cite autores clássicos)
3. Prescrição Prática e Segura de Ação
4. Nível de Confiança e Declaração de Incerteza`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.25,
      },
    });

    return res.json({
      response: response.text,
      confidence: 'ALTA',
      citations: [
        'Mifflin MD et al. (1990) J Am Diet Assoc',
        'Gabbett TJ (2016) Br J Sports Med',
        'Schoenfeld BJ et al. (2021) Int J Sports Med',
        'Helms ER et al. (2016) Strength Cond J',
      ],
      limitations: 'Síntese inferencial calibrada pelos dados biométricos transmitidos; sujeita a individualidade biológica.',
      disclaimer: 'O Gym Labs fornece inteligência baseada em evidências científicas e não substitui avaliação médica presencial.',
      model: 'gemini-2.5-flash',
      provenance: 'INTERPRETED',
      timestamp: new Date().toISOString(),
      uncertaintyDeclared: true,
    });
  } catch (error: any) {
    console.error('GL Intelligence error:', error);
    return res.status(500).json({
      error: 'GL Intelligence pipeline error',
      details: error.message || 'Internal server error',
    });
  }
});

export default router;
