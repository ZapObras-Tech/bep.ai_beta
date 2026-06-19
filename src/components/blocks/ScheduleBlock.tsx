import React from 'react';
import { BlockData, useBEPStore, Milestone } from '../../store/bepStore';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AiSuggestionButton } from '../ui/AiSuggestionButton';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField, TableSelectField } from '../ui/TableField';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  block: BlockData;
}

export function ScheduleBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();

  const milestones: Milestone[] = block.content.milestones || [];

  const handleAiSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    const newMilestones = suggestions.map(s => ({
      id: uuidv4(),
      item: s.item || '',
      description: s.description || '',
      duration: s.duration || '',
      start: s.start || '',
      end: s.end || '',
      status: 'todo' as const
    }));
    updateBlockContent(block.id, {
      milestones: [...milestones, ...newMilestones]
    });
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: uuidv4(),
      item: '',
      description: '',
      duration: '',
      start: '',
      end: '',
      status: 'todo'
    };
    updateBlockContent(block.id, { milestones: [...milestones, newMilestone] });
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    updateBlockContent(block.id, { milestones: newMilestones });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    updateBlockContent(block.id, { milestones: newMilestones });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-600" />
          4. CRONOGRAMA
        </h4>
        <div className="flex gap-2">
          <AiSuggestionButton
            prompt="Liste os principais marcos do projeto, retornando um array de objetos JSON com as chaves: item, description, duration, start, end."
            onSuggest={handleAiSuggest}
            json={true}
          />
          <Button variant="accent" size="sm" onClick={addMilestone} icon={<Plus className="w-3.5 h-3.5" />}>
            Adicionar Item
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
          <caption className="sr-only">Cronograma do projeto com itens, descrições, durações, datas e status</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 border-b w-16">Item</th>
              <th scope="col" className="px-4 py-3 border-b">Descrição dos serviços</th>
              <th scope="col" className="px-4 py-3 border-b w-24">Duração</th>
              <th scope="col" className="px-4 py-3 border-b w-32">Início</th>
              <th scope="col" className="px-4 py-3 border-b w-32">Término</th>
              <th scope="col" className="px-4 py-3 border-b w-32">Status</th>
              <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((row: Milestone, index: number) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.item}
                    onChange={(e) => updateMilestone(index, 'item', e.target.value)}
                    placeholder="1.0"
                    aria-label={`Item, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    placeholder="Descrição..."
                    aria-label={`Descrição dos serviços, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.duration}
                    onChange={(e) => updateMilestone(index, 'duration', e.target.value)}
                    placeholder="30 dias"
                    aria-label={`Duração, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.start}
                    onChange={(e) => updateMilestone(index, 'start', e.target.value)}
                    placeholder="dd/mm/aaaa"
                    aria-label={`Início, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.end}
                    onChange={(e) => updateMilestone(index, 'end', e.target.value)}
                    placeholder="dd/mm/aaaa"
                    aria-label={`Término, linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableSelectField
                    value={row.status}
                    onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                    aria-label={`Status, linha ${index + 1}`}
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="done">Concluído</option>
                  </TableSelectField>
                </td>
                <td className="px-4 py-2 text-center">
                  <IconButton variant="danger" onClick={() => removeMilestone(index)} aria-label={`Remover linha ${index + 1}`}>
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
