import { IIntelligenceRepository } from './interfaces/IIntelligenceRepository';
import { intelligenceApi } from '../api/intelligence.api';
import { IntelligenceQueryRequest, IntelligenceQueryResponse } from '../types/api';

export class IntelligenceRepository implements IIntelligenceRepository {
  public async query(request: IntelligenceQueryRequest): Promise<IntelligenceQueryResponse> {
    try {
      const res = await intelligenceApi.query(request);

      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // Falha de rede capturada pelo fallback determinístico abaixo
    }

    // Fallback Determinístico Local (Offline / Sem Backend)
    const lower = (request.question || '').toLowerCase();
    let responseText = '';
    let citations: string[] = [];

    if (lower.includes('acwr') || lower.includes('carga') || lower.includes('lesão') || lower.includes('volume')) {
      const ratio = request.athleteContext?.acwr !== undefined && request.athleteContext?.acwr !== null
        ? request.athleteContext.acwr
        : 1.05;
      responseText = `[Modo Offline — Axioma Científico Gabbett]\n\nSua razão Agudo:Crônico desacoplada está estimada em ${ratio}. De acordo com o modelo de Blanch & Gabbett (2016), a faixa entre 0.8 e 1.30 representa a "sweet spot" de menor risco relativo de sobrecarga mecânica. Incrementos semanais devem ser limitados a 5–10% para preservação miotendínea.`;
      citations = ['Gabbett TJ (2016) Br J Sports Med', 'Blanch P & Gabbett TJ (2016) Br J Sports Med'];
    } else if (lower.includes('creatina') || lower.includes('suplemento')) {
      responseText = `[Modo Offline — Axioma Nutricional ISSN]\n\nA suplementação de monohidrato de creatina é a intervenção ergogênica mais respaldada na literatura. O protocolo contínuo de 3 a 5 g/dia (ou 0.05 g/kg/dia) atinge saturação muscular em 3 a 4 semanas com excelente tolerabilidade gastrointestinal.`;
      citations = ['Kreider RB et al. (2017) J Int Soc Sports Nutr', 'Rawson ES & Volek JS (2003) J Strength Cond Res'];
    } else if (lower.includes('bmr') || lower.includes('tdee') || lower.includes('caloria') || lower.includes('gasto')) {
      const bmrVal = request.athleteContext?.bmr || 1800;
      const tdeeVal = request.athleteContext?.tdee || 2400;
      responseText = `[Modo Offline — Axioma Metabólico MSJ]\n\nSeu gasto basal estimado pela equação Mifflin-St Jeor é de aproximadamente ${bmrVal} kcal/dia, com TDEE projetado em ${tdeeVal} kcal/dia considerando seu nível de atividade física. Déficits superiores a 500 kcal/dia podem comprometer a síntese proteica miofibrilar.`;
      citations = ['Mifflin MD et al. (1990) J Am Diet Assoc', 'Helms ER et al. (2014) J Int Soc Sports Nutr'];
    } else {
      responseText = `[Modo Offline — Síntese Fisiológica Base]\n\nPara a questão "${request.question}", as diretrizes do Gym Labs recomendam:\n1. Sobrecarga Progressiva: Monitore as cargas executadas no console de treino ativo série a série.\n2. Recuperação Biológica: Mantenha eficiência de sono > 85% para regeneração do sistema nervoso autônomo.\n3. Balanço Hídrico: Assegure a ingestão hídrica dinâmica calculada pelo protocolo Armstrong.`;
      citations = ['Schoenfeld BJ et al. (2021) Int J Sports Med', 'Armstrong LE et al. (1994) Int J Sport Nutr'];
    }

    return {
      response: responseText,
      confidence: 'ALTA',
      citations,
      limitations: 'Síntese gerada pelo motor determinístico local autônomo de regras científicas.',
      disclaimer: 'O Gym Labs fornece inteligência baseada em evidências científicas e não substitui consulta médica ou nutricional presencial.',
      provenance: 'DETERMINISTIC_RULES_ENGINE',
      timestamp: new Date().toISOString(),
      uncertaintyDeclared: true,
    };
  }
}
