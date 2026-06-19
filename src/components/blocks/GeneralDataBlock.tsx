import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { RefineButton } from '../ui/RefineButton';

interface Props {
  block: BlockData;
}

export function GeneralDataBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();

  const handleChange = (field: string, value: string) => {
    updateBlockContent(block.id, { [field]: value });
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const currentArray = block.content[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateBlockContent(block.id, { [field]: newArray });
  };

  return (
    <div className="space-y-8">
      {/* Tabela 1 - Dados Gerais do Contrato */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Tabela 1 - Dados Gerais do Contrato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Nome do Projeto', key: 'project_name' },
            { label: 'Endereço', key: 'address' },
            { label: 'Bairro', key: 'neighborhood' },
            { label: 'Município', key: 'municipality' },
            { label: 'Número do Edital', key: 'contract_number' },
            { label: 'Órgão Contratante', key: 'client_name' },
            { label: 'Modalidade de Contratação', key: 'modality' },
            { label: 'Uso Pretendido', key: 'intended_use' },
            { label: 'Público-Alvo', key: 'target_audience' },
            { label: 'Prazo do Projeto', key: 'project_deadline' },
            { label: 'Prazo da Obra', key: 'construction_deadline' },
            { label: 'Padrão', key: 'standard' },
            { label: 'Indicativos de Sustentabilidade', key: 'sustainability_indicators' },
            { label: 'Área do Lote', key: 'lot_area' },
            { label: 'Área a Construir', key: 'construction_area' },
            { label: 'Número de Pavimentos', key: 'floors_count' },
            { label: 'População Prevista', key: 'population_forecast' },
          ].map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">{field.label}</label>
              <input
                type="text"
                value={block.content[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                aria-label={field.label}
                className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Requisitos ISO 19650 */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Requisitos - ISO 19650 (Contrato)</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase">Descrição (OIR)</label>
              <RefineButton 
                text={block.content.oir_description || ''} 
                onRefine={(newText) => handleChange('oir_description', newText)}
              />
            </div>
            <textarea
              value={block.content.oir_description || ''}
              onChange={(e) => handleChange('oir_description', e.target.value)}
              aria-label="Descrição (OIR)"
              className="w-full h-20 p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase">Descrição (EIR)</label>
              <RefineButton 
                text={block.content.eir_description || ''} 
                onRefine={(newText) => handleChange('eir_description', newText)}
              />
            </div>
            <textarea
              value={block.content.eir_description || ''}
              onChange={(e) => handleChange('eir_description', e.target.value)}
              aria-label="Descrição (EIR)"
              className="w-full h-20 p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Tabela 2 - Dados Gerais da Licitante */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Tabela 2 - Dados Gerais da Licitante</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Empresa ou Consórcio</label>
            <input
              type="text"
              value={block.content.bidder_company || ''}
              onChange={(e) => handleChange('bidder_company', e.target.value)}
              aria-label="Empresa ou Consórcio"
              className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Representantes</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Representante 1"
                value={block.content.bidder_representatives?.[0] || ''}
                onChange={(e) => handleArrayChange('bidder_representatives', 0, e.target.value)}
                aria-label="Representante 1"
                className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="text"
                placeholder="Representante 2"
                value={block.content.bidder_representatives?.[1] || ''}
                onChange={(e) => handleArrayChange('bidder_representatives', 1, e.target.value)}
                aria-label="Representante 2"
                className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Data da Proposta</label>
            <input
              type="date"
              value={block.content.proposal_date || ''}
              onChange={(e) => handleChange('proposal_date', e.target.value)}
              aria-label="Data da Proposta"
              className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none text-slate-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

