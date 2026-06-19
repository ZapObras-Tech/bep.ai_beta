import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { AiSuggestionButton } from '../ui/AiSuggestionButton';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField } from '../ui/TableField';

interface Props {
  block: BlockData;
}

export function DeliverablesBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();
  const deliverables = block.content.deliverables || [];

  const handleAiSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    const newDeliverables = suggestions.map(s => ({
      phase: s.phase || '',
      discipline: s.discipline || '',
      deliverable: s.deliverable || '',
      formats: s.formats || '',
      responsible: s.responsible || ''
    }));
    updateBlockContent(block.id, {
      deliverables: [...deliverables, ...newDeliverables]
    });
  };

  const addRow = () => {
    updateBlockContent(block.id, {
      deliverables: [...deliverables, { phase: '', discipline: '', deliverable: '', formats: '', responsible: '' }]
    });
  };

  const removeRow = (index: number) => {
    const newDeliverables = [...deliverables];
    newDeliverables.splice(index, 1);
    updateBlockContent(block.id, { deliverables: newDeliverables });
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = { ...newDeliverables[index], [field]: value };
    updateBlockContent(block.id, { deliverables: newDeliverables });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-600" />
          Matriz de Entregáveis
        </h3>
        <div className="flex gap-2">
          <AiSuggestionButton
            prompt="Liste os principais entregáveis por fase e disciplina para este projeto, retornando um array de objetos JSON com as chaves: phase, discipline, deliverable, formats, responsible."
            onSuggest={handleAiSuggest}
            json={true}
          />
          <Button variant="accent" size="sm" onClick={addRow} icon={<Plus className="w-3.5 h-3.5" />}>
            Adicionar Linha
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
          <caption className="sr-only">Matriz de entregáveis por fase, disciplina, formato e responsável</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 border-b">Fase</th>
              <th scope="col" className="px-4 py-3 border-b">Disciplina</th>
              <th scope="col" className="px-4 py-3 border-b">Entregável</th>
              <th scope="col" className="px-4 py-3 border-b">Formatos</th>
              <th scope="col" className="px-4 py-3 border-b">Responsável / Função</th>
              <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map((row: any, index: number) => (
              <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.phase}
                    onChange={(e) => handleChange(index, 'phase', e.target.value)}
                    placeholder="Fase..."
                    aria-label={`Fase, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.discipline}
                    onChange={(e) => handleChange(index, 'discipline', e.target.value)}
                    placeholder="Disciplina..."
                    aria-label={`Disciplina, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.deliverable}
                    onChange={(e) => handleChange(index, 'deliverable', e.target.value)}
                    placeholder="Entregável..."
                    aria-label={`Entregável, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.formats}
                    onChange={(e) => handleChange(index, 'formats', e.target.value)}
                    placeholder=".ifc / .rvt..."
                    aria-label={`Formatos, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.responsible}
                    onChange={(e) => handleChange(index, 'responsible', e.target.value)}
                    placeholder="Nome / Função..."
                    aria-label={`Responsável / Função, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <IconButton variant="danger" onClick={() => removeRow(index)} aria-label={`Remover linha ${index + 1}`}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
