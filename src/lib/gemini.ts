// BEP-specific AI tasks. Prompt engineering lives here; the provider/model
// plumbing lives in ./ai (swap providers there, not here).
import { aiProvider } from './ai';

// System instruction for BEP.ai
const SYSTEM_INSTRUCTION = `
Você é o "BEP.ai", um agente de Inteligência Artificial especializado em BIM (Building Information Modeling).
Sua função é auxiliar na criação de Planos de Execução BIM (BEP/PEB) alinhados à ISO 19650 e NBR 15965.

Diretrizes:
- Seja técnico, preciso e normativo.
- Use terminologia correta (CDE, EIR, OIR, IFC, BCF, LOD, LOIN).
- Não invente normas.
- Se faltar dados, faça perguntas curtas para esclarecer.
- Formate a saída em Markdown limpo ou JSON quando solicitado.
`;

export async function suggestContent(context: string, prompt: string, json: boolean = false) {
  const fullPrompt = `
  Contexto do Projeto (Edital/EIR):
  "${context.substring(0, 10000)}"

  Tarefa:
  ${prompt}

  ${json ? "Formato de Resposta: APENAS um JSON válido (sem blocos de código ```json). Se for uma lista, retorne um array." : "Responda apenas com o conteúdo solicitado, de forma direta e técnica (ISO 19650)."}
  `;

  return aiProvider.generate({ prompt: fullPrompt, system: SYSTEM_INSTRUCTION, json, tier: 'fast' });
}

export async function extractEIR(text: string) {
  const prompt = `
  Analise o seguinte texto de um Edital/EIR e extraia os dados principais para a Tabela 1 do BEP.

  Texto do Edital:
  "${text}"

  Saída esperada (JSON):
  {
    "contract_number": "Número do Edital ou Contrato",
    "client_name": "Nome do Órgão Contratante ou Cliente",
    "project_name": "Nome do Objeto/Projeto",
    "modality": "Modalidade de Licitação (se houver)",
    "summary": "Resumo técnico das exigências BIM (máx 3 linhas)"
  }
  `;

  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, json: true, tier: 'fast' });
}

export async function analyzeFullBEP(text: string) {
  const prompt = `
  Você é um especialista em BIM. Analise o texto completo de um Edital/EIR (Exchange Information Requirements) e extraia TODAS as informações possíveis para preencher um Plano de Execução BIM (BEP).

  Texto do Edital:
  "${text.substring(0, 90000)}"

  Retorne um JSON único com a seguinte estrutura exata (se não encontrar algo, deixe como string vazia ou array vazio):

  {
    "general_project": {
      "project_name": "",
      "address": "",
      "neighborhood": "",
      "municipality": "",
      "contract_number": "",
      "client_name": "",
      "modality": "",
      "intended_use": "",
      "target_audience": "",
      "project_deadline": "",
      "construction_deadline": "",
      "standard": "",
      "sustainability_indicators": "",
      "lot_area": "",
      "construction_area": "",
      "floors_count": "",
      "population_forecast": "",
      "oir_description": "",
      "eir_description": "",
      "bidder_company": "",
      "bidder_representatives": ["", ""],
      "proposal_date": ""
    },
    "general_team": {
      "contractor_team": [
        { "role": "CONTRATANTE", "name": "", "education": "", "email": "", "phone": "" },
        { "role": "GESTOR (CONTRATO)", "name": "", "education": "", "email": "", "phone": "" }
      ],
      "bidder_team": []
    },
    "responsibility_matrix": {
      "technical_team": [
        { "role": "COORDENADOR BIM", "name": "", "registry": "", "email": "", "phone": "" }
      ]
    },
    "deliverables_matrix": {
      "deliverables": [
        { "phase": "", "discipline": "", "deliverable": "", "formats": "", "responsible": "" }
      ]
    },
    "bim_uses_goals": {
      "goals": [
        { "priority": "1", "objective": "", "uses": "" }
      ]
    },
    "bim_uses_infra": {
      "software_tools": [
        { "use": "", "platform": "", "version": "", "extension": "" }
      ],
      "hardware_requirements": [
        { "purpose": "", "cpu": "", "ram": "", "gpu": "", "os": "", "hd": "" }
      ]
    },
    "project_requirements": {
      "requirements": [
        { "phase": "", "lod": "", "loin": "" }
      ]
    },
    "schedule": {
      "milestones": [
        { "item": "", "description": "", "duration": "", "start": "", "end": "" }
      ]
    },
    "roles_responsibilities": {
      "roles": [
        { "role": "", "responsibility": "" }
      ]
    }
  }
  `;

  // Full-context analysis uses the 'pro' tier.
  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, json: true, tier: 'pro' });
}

export async function suggestBIMUses(projectType: string, currentUses: string[]) {
  const prompt = `
  O projeto é do tipo: "${projectType}".
  Usos BIM atuais: ${JSON.stringify(currentUses)}.

  Sugira 3 a 5 Usos BIM adicionais preditivos e justifique brevemente com base no tipo do projeto.
  Exemplo: Se for Industrial, sugira Clash Detection. Se for Residencial, sugira Extração de Quantitativos.

  Retorne apenas a lista de sugestões em formato JSON:
  [
    { "use": "Nome do Uso", "justification": "Justificativa técnica" }
  ]
  `;

  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, json: true, tier: 'fast' });
}

export async function optimizeLOD(element: string, phase: string, requestedLOD: string) {
  const prompt = `
  Analise o seguinte requisito de LOD/LOIN:
  Elemento: "${element}"
  Fase do Projeto: "${phase}"
  LOD Solicitado: "${requestedLOD}"

  Verifique se há "over-modeling" (modelagem excessiva desnecessária).
  Se o LOD for muito alto para a fase (ex: LOD 400 em Estudo Preliminar), sugira um rebaixamento justificado (ex: LOD 200 ou 300).
  Se estiver adequado, confirme.

  Saída esperada (JSON):
  {
    "status": "Adequado" | "Over-modeling Detectado",
    "suggested_lod": "LOD Sugerido",
    "reasoning": "Explicação técnica baseada no BIM Fórum ou práticas de mercado"
  }
  `;

  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, json: true, tier: 'fast' });
}

export async function validateInfrastructure(software: string, hardware: string) {
  const prompt = `
  Valide a compatibilidade de hardware para o software BIM.
  Software de Autoria: "${software}"
  Hardware Disponível: "${hardware}"

  Verifique requisitos de CPU, RAM e GPU.

  Saída esperada (JSON):
  {
    "compatible": boolean,
    "warnings": ["Lista de alertas se houver gargalos (ex: RAM insuficiente)"],
    "recommendation": "Recomendação de upgrade se necessário"
  }
  `;

  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, json: true, tier: 'fast' });
}

export async function refineText(text: string) {
  const prompt = `
  Reescreva o seguinte texto informal para um jargão técnico de engenharia/BIM, alinhado à ISO 19650.
  Mantenha o sentido original, mas torne-o profissional e contratual.

  Texto Original: "${text}"

  Saída: Apenas o texto reescrito.
  `;

  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, tier: 'fast' });
}

export async function askISO(question: string, context: string) {
  const prompt = `
  Você é um especialista em normas BIM (ISO 19650 e NBR 15965).
  Use o seguinte contexto extraído de um arquivo PDF (Norma ou Documento de Referência) para responder à pergunta do usuário.

  Contexto:
  "${context.substring(0, 100000)}"

  Pergunta:
  "${question}"

  Responda de forma técnica, citando a norma quando possível.
  `;

  return aiProvider.generate({ prompt, system: SYSTEM_INSTRUCTION, tier: 'fast' });
}
