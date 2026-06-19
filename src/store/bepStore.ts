import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type BlockType = 
  | 'general_project' 
  | 'general_team' 
  | 'responsibility_matrix' 
  | 'deliverables_matrix' 
  | 'bim_uses_goals' 
  | 'bim_uses_infra' 
  | 'project_requirements' 
  | 'schedule' 
  | 'roles_responsibilities' 
  | 'references' 
  | 'attachments';

export interface BlockData {
  id: string;
  type: BlockType;
  title: string;
  content: any; // Flexible content structure depending on block type
  isExpanded: boolean;
}

export interface Milestone {
  id: string;
  item: string;
  description: string;
  duration: string;
  start: string;
  end: string;
  status: 'todo' | 'in_progress' | 'done';
}

interface BEPState {
  blocks: BlockData[];
  isoContext: string; // Store extracted ISO text for context
  activeView: 'home' | 'editor' | 'kanban' | 'ifc';
  setActiveView: (view: 'home' | 'editor' | 'kanban' | 'ifc') => void;
  setIsoContext: (text: string) => void;
  loadProject: (data: { blocks: BlockData[]; isoContext?: string }) => void;
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, data: Partial<BlockData>) => void;
  updateBlockContent: (id: string, content: any) => void;
  reorderBlocks: (oldIndex: number, newIndex: number) => void;
  toggleBlock: (id: string) => void;
  expandAllBlocks: () => void;
}

export const useBEPStore = create<BEPState>()(
  persist(
    (set) => ({
  blocks: [
    {
      id: '1',
      type: 'general_project',
      title: '1. INFORMAÇÕES GERAIS DO PROJETO',
      content: {
        // Tabela 1
        project_name: '',
        address: '',
        neighborhood: '',
        municipality: '',
        contract_number: '', // Número do Edital
        client_name: '', // Órgão Contratante
        modality: '',
        intended_use: '',
        target_audience: '',
        project_deadline: '',
        construction_deadline: '',
        standard: '',
        sustainability_indicators: '',
        lot_area: '',
        construction_area: '',
        floors_count: '',
        population_forecast: '',
        // Requisitos ISO 19650
        oir_description: '',
        eir_description: '',
        // Tabela 2
        bidder_company: '',
        bidder_representatives: ['', ''],
        proposal_date: ''
      },
      isExpanded: true,
    },
    {
      id: '2',
      type: 'general_team',
      title: '2. INFORMAÇÕES GERAIS – EQUIPE DO PROJETO',
      content: { 
        // Tabela 3
        contractor_team: [
          { role: 'CONTRATANTE', name: '', education: '', email: '', phone: '' },
          { role: 'GESTOR (CONTRATO)', name: '', education: '', email: '', phone: '' },
          { role: 'GESTOR (SUBSTITUTO)', name: '', education: '', email: '', phone: '' },
        ],
        bidder_team: [
          { role: 'EMPRESA OU CONSÓRCIO', name: '', education: '', email: '', phone: '' },
          { role: 'REPRESENTANTE', name: '', education: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (ARQ.)', name: '', education: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (INF.)', name: '', education: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (MEP.)', name: '', education: '', email: '', phone: '' },
          { role: 'OUTRAS DISCIPLINAS', name: '', education: '', email: '', phone: '' },
        ]
      },
      isExpanded: false,
    },
    {
      id: '3',
      type: 'responsibility_matrix',
      title: '3. MATRIZ DE RESPONSABILIDADES',
      content: { 
        // Tabela 4
        technical_team: [
          { role: 'COORDENADOR BIM (BIM MANAGER)', name: '', registry: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (ARQ.)', name: '', registry: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (ENG.)', name: '', registry: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (ENG.)', name: '', registry: '', email: '', phone: '' },
          { role: 'RESPONSÁVEL TÉCNICO (ENG.)', name: '', registry: '', email: '', phone: '' },
          { role: 'OUTRAS DISCIPLINAS', name: '', registry: '', email: '', phone: '' },
        ]
      },
      isExpanded: false,
    },
    {
      id: '4',
      type: 'deliverables_matrix',
      title: '4. MATRIZ DE ENTREGÁVEIS',
      content: { 
        deliverables: [
          { phase: '', discipline: '', deliverable: '', formats: '', responsible: '' },
        ] 
      },
      isExpanded: false,
    },
    {
      id: '5',
      type: 'bim_uses_goals',
      title: '5. USOS BIM (OBJETIVOS ORGANIZACIONAIS)',
      content: { 
        // Tabela 5
        goals: [
          { priority: '', objective: '', uses: '' },
        ]
      },
      isExpanded: false,
    },
    {
      id: '6',
      type: 'bim_uses_infra',
      title: '6. USOS BIM (INFRAESTRUTURA TECNOLÓGICA)',
      content: { 
        // Tabela 6
        software_tools: [
          { use: '', platform: '', version: '', extension: '' },
        ],
        // Tabela 7
        hardware_requirements: [
          { purpose: '', cpu: '', ram: '', gpu: '', os: '', hd: '' },
        ]
      },
      isExpanded: false,
    },
    {
      id: '7',
      type: 'project_requirements',
      title: '7. REQUISITOS DO PROJETO (LOIN / LOD)',
      content: { 
        // Tabela 8
        requirements: [
          { phase: '', lod: '', loin: '' },
        ]
      },
      isExpanded: false,
    },
    {
      id: '8',
      type: 'schedule',
      title: '8. PRINCIPAIS MARCOS DO PROJETO',
      content: { 
        milestones: [
          { id: uuidv4(), item: '1.0', description: 'Início do Projeto', duration: '1 dia', start: '', end: '', status: 'todo' },
        ] 
      },
      isExpanded: false,
    },
    {
      id: '9',
      type: 'roles_responsibilities',
      title: '9. PAPÉIS E RESPONSABILIDADES',
      content: { 
        // Tabela 9
        roles: [
          { role: '', responsibility: '' },
        ] 
      },
      isExpanded: false,
    },
    {
      id: '10',
      type: 'references',
      title: '10. REFERÊNCIAS',
      content: { references: [] },
      isExpanded: false,
    },
    {
      id: '11',
      type: 'attachments',
      title: '11. ANEXOS',
      content: { attachments: [] },
      isExpanded: false,
    }
  ],
  isoContext: '',
  activeView: 'home',
  setActiveView: (view) => set({ activeView: view }),
  setIsoContext: (text) => set({ isoContext: text }),
  loadProject: (data) =>
    set({ blocks: data.blocks, isoContext: data.isoContext ?? '' }),
  addBlock: (type) => set((state) => {
    const titles: Record<BlockType, string> = {
      general_project: '1. INFORMAÇÕES GERAIS DO PROJETO',
      general_team: '2. INFORMAÇÕES GERAIS – EQUIPE DO PROJETO',
      responsibility_matrix: '3. MATRIZ DE RESPONSABILIDADES',
      deliverables_matrix: '4. MATRIZ DE ENTREGÁVEIS',
      bim_uses_goals: '5. USOS BIM (OBJETIVOS ORGANIZACIONAIS)',
      bim_uses_infra: '6. USOS BIM (INFRAESTRUTURA TECNOLÓGICA)',
      project_requirements: '7. REQUISITOS DO PROJETO (LOIN / LOD)',
      schedule: '8. PRINCIPAIS MARCOS DO PROJETO',
      roles_responsibilities: '9. PAPÉIS E RESPONSABILIDADES',
      references: '10. REFERÊNCIAS',
      attachments: '11. ANEXOS'
    };

    return {
      blocks: [
        ...state.blocks,
        {
          id: uuidv4(),
          type,
          title: titles[type],
          content: {},
          isExpanded: true,
        }
      ]
    };
  }),
  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((b) => b.id !== id)
  })),
  updateBlock: (id, data) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...data } : b))
  })),
  updateBlockContent: (id, content) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b))
  })),
  reorderBlocks: (oldIndex, newIndex) => set((state) => {
    const newBlocks = [...state.blocks];
    const [movedBlock] = newBlocks.splice(oldIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    return { blocks: newBlocks };
  }),
  toggleBlock: (id) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, isExpanded: !b.isExpanded } : b))
  })),
  expandAllBlocks: () => set((state) => ({
    blocks: state.blocks.map((b) => ({ ...b, isExpanded: true }))
  })),
    }),
    {
      name: 'bep-ai-store',
      version: 1,
      // Persist the document and extracted context; keep transient UI view out.
      partialize: (state) => ({ blocks: state.blocks, isoContext: state.isoContext }),
    }
  )
);
