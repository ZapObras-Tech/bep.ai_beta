import * as WebIFC from 'web-ifc';

// WASM servido localmente de public/ (mesmo caminho do viewer). Evita o erro de
// instanciação que ocorre quando o binário é buscado via CDN em runtime.
const WASM_PATH = '/';

export interface IfcSummary {
  projectName: string;
  schema: string;
  storeys: string[];
  totalEntities: number;
  /** Human label -> element count, only categories actually present. */
  categoryCounts: Record<string, number>;
  /** Disciplines inferred from the categories present. */
  disciplines: string[];
}

type Discipline = 'Arquitetura' | 'Estrutura' | 'MEP / Instalações';

// Curated category map: [label, web-ifc type constant name, discipline].
// We guard against constants missing in this web-ifc version.
const CATEGORIES: Array<[string, string, Discipline]> = [
  ['Paredes', 'IFCWALL', 'Arquitetura'],
  ['Paredes (standard)', 'IFCWALLSTANDARDCASE', 'Arquitetura'],
  ['Portas', 'IFCDOOR', 'Arquitetura'],
  ['Janelas', 'IFCWINDOW', 'Arquitetura'],
  ['Lajes', 'IFCSLAB', 'Arquitetura'],
  ['Coberturas', 'IFCROOF', 'Arquitetura'],
  ['Escadas', 'IFCSTAIR', 'Arquitetura'],
  ['Guarda-corpos', 'IFCRAILING', 'Arquitetura'],
  ['Revestimentos', 'IFCCOVERING', 'Arquitetura'],
  ['Mobiliário', 'IFCFURNISHINGELEMENT', 'Arquitetura'],
  ['Espaços', 'IFCSPACE', 'Arquitetura'],
  ['Pilares', 'IFCCOLUMN', 'Estrutura'],
  ['Vigas', 'IFCBEAM', 'Estrutura'],
  ['Fundações', 'IFCFOOTING', 'Estrutura'],
  ['Estacas', 'IFCPILE', 'Estrutura'],
  ['Elementos estruturais', 'IFCMEMBER', 'Estrutura'],
  ['Tubulações (segmento)', 'IFCPIPESEGMENT', 'MEP / Instalações'],
  ['Dutos (segmento)', 'IFCDUCTSEGMENT', 'MEP / Instalações'],
  ['Conexões de fluxo', 'IFCFLOWFITTING', 'MEP / Instalações'],
  ['Segmentos de fluxo', 'IFCFLOWSEGMENT', 'MEP / Instalações'],
  ['Terminais de fluxo', 'IFCFLOWTERMINAL', 'MEP / Instalações'],
  ['Controladores de fluxo', 'IFCFLOWCONTROLLER', 'MEP / Instalações'],
  ['Eletrocalhas', 'IFCCABLECARRIERSEGMENT', 'MEP / Instalações'],
  ['Louças sanitárias', 'IFCSANITARYTERMINAL', 'MEP / Instalações'],
  ['Luminárias', 'IFCLIGHTFIXTURE', 'MEP / Instalações'],
];

function lineName(api: WebIFC.IfcAPI, modelID: number, id: number): string {
  try {
    const line: any = api.GetLine(modelID, id);
    return line?.Name?.value ?? line?.LongName?.value ?? `#${id}`;
  } catch {
    return `#${id}`;
  }
}

function firstLine(api: WebIFC.IfcAPI, modelID: number, type: number): any | null {
  const ids = api.GetLineIDsWithType(modelID, type);
  if (ids.size() === 0) return null;
  return api.GetLine(modelID, ids.get(0));
}

/** Parse an IFC file and return a compact, LLM-friendly summary. */
export async function extractIfcSummary(file: File): Promise<IfcSummary> {
  const api = new WebIFC.IfcAPI();
  api.SetWasmPath(WASM_PATH, true);
  await api.Init();

  const buffer = new Uint8Array(await file.arrayBuffer());
  const modelID = api.OpenModel(buffer);

  try {
    const project = firstLine(api, modelID, WebIFC.IFCPROJECT);
    const projectName: string = project?.Name?.value || project?.LongName?.value || file.name;

    let schema = 'desconhecido';
    try {
      schema = (api as any).GetModelSchema?.(modelID) ?? schema;
    } catch {
      /* schema lookup is best-effort */
    }

    // Storeys (pavimentos)
    const storeyIds = api.GetLineIDsWithType(modelID, WebIFC.IFCBUILDINGSTOREY);
    const storeys: string[] = [];
    for (let i = 0; i < storeyIds.size(); i++) {
      storeys.push(lineName(api, modelID, storeyIds.get(i)));
    }

    // Category counts + discipline inference
    const categoryCounts: Record<string, number> = {};
    const disciplineSet = new Set<Discipline>();
    let totalEntities = 0;

    for (const [label, constName, discipline] of CATEGORIES) {
      const type = (WebIFC as any)[constName];
      if (typeof type !== 'number') continue;
      const count = api.GetLineIDsWithType(modelID, type).size();
      if (count > 0) {
        categoryCounts[label] = count;
        totalEntities += count;
        disciplineSet.add(discipline);
      }
    }

    return {
      projectName,
      schema,
      storeys,
      totalEntities,
      categoryCounts,
      disciplines: [...disciplineSet],
    };
  } finally {
    api.CloseModel(modelID);
  }
}
