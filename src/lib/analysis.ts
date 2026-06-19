import { aiProvider, parseJSON } from './ai';
import type { BlockData } from '../store/bepStore';
import type { IfcSummary } from './ifc/extract';

export interface ConsistencyCheck {
  item: string;
  status: 'ok' | 'alerta' | 'erro';
  detail: string;
}

export interface ConsistencyReport {
  summary: string;
  checks: ConsistencyCheck[];
}

const SYSTEM = `
Você é um auditor BIM especializado em ISO 19650 e NBR 15965.
Sua tarefa é comparar um modelo IFC (resumo extraído) com o Plano de Execução BIM (BEP)
e apontar inconsistências objetivas: disciplinas declaradas no BEP que não aparecem no IFC,
níveis de desenvolvimento (LOD) incompatíveis com o conteúdo do modelo, entregáveis/fases
sem correspondência, etc. Seja técnico, conciso e prático.
`;

/** Condense the BEP store into a compact object for the LLM prompt. */
export function summarizeBEP(blocks: BlockData[]): Record<string, unknown> {
  const byType = (type: string) => blocks.find((b) => b.type === type)?.content ?? {};

  const general = byType('general_project') as any;
  const requirements = (byType('project_requirements') as any).requirements ?? [];
  const deliverables = (byType('deliverables_matrix') as any).deliverables ?? [];
  const goals = (byType('bim_uses_goals') as any).goals ?? [];
  const infra = byType('bim_uses_infra') as any;
  const matrix = (byType('responsibility_matrix') as any).technical_team ?? [];

  return {
    projeto: general.project_name || '',
    uso_previsto: general.intended_use || '',
    requisitos_lod_loin: requirements,
    entregaveis: deliverables,
    usos_bim: goals,
    softwares: infra.software_tools ?? [],
    equipe_tecnica: matrix.map((m: any) => m.role).filter(Boolean),
  };
}

/** Ask the active AI provider to audit IFC vs BEP and return a structured report. */
export async function analyzeConsistency(
  ifc: IfcSummary,
  blocks: BlockData[],
): Promise<ConsistencyReport> {
  const bep = summarizeBEP(blocks);

  const prompt = `
Compare o RESUMO DO MODELO IFC com o RESUMO DO BEP e produza um relatório de consistência.

RESUMO DO MODELO IFC (JSON):
${JSON.stringify(ifc, null, 2)}

RESUMO DO BEP (JSON):
${JSON.stringify(bep, null, 2)}

Retorne APENAS um JSON válido (sem blocos de código) com esta estrutura:
{
  "summary": "Parágrafo curto com o veredito geral da consistência.",
  "checks": [
    { "item": "Disciplina MEP", "status": "erro|alerta|ok", "detail": "Explicação objetiva." }
  ]
}
Gere de 4 a 8 checagens cobrindo disciplinas, LOD/LOIN, entregáveis e pavimentos.
`;

  const raw = await aiProvider.generate({ prompt, system: SYSTEM, json: true, tier: 'pro' });
  return parseJSON<ConsistencyReport>(raw);
}
