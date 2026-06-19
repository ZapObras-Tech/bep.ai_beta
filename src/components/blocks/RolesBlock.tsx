import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { Plus, Trash2 } from 'lucide-react';
import { AiSuggestionButton } from '../ui/AiSuggestionButton';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextArea } from '../ui/TableField';

interface Props {
  block: BlockData;
  title: string;
  itemLabel: string;
  fieldKey: string;
}

export function RolesBlock({ block, title, itemLabel, fieldKey }: Props) {
  const { updateBlockContent } = useBEPStore();
  const items = block.content[fieldKey] || [];

  const handleAiSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    const newItems = suggestions.map(s => ({
      role: s.role || '',
      responsibility: s.responsibility || ''
    }));
    updateBlockContent(block.id, {
      [fieldKey]: [...items, ...newItems]
    });
  };

  const addItem = () => {
    updateBlockContent(block.id, {
      [fieldKey]: [...items, { role: '', responsibility: '' }]
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateBlockContent(block.id, { [fieldKey]: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    updateBlockContent(block.id, { [fieldKey]: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-700">{title}</h4>
        <div className="flex gap-2">
          <AiSuggestionButton
            prompt="Liste os principais papéis e responsabilidades BIM para este projeto, retornando um array de objetos JSON com as chaves: role, responsibility."
            onSuggest={handleAiSuggest}
            json={true}
          />
          <Button variant="accent" size="sm" icon={<Plus className="w-3 h-3" />} onClick={addItem}>
            Adicionar {itemLabel}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
          <caption className="sr-only">{title}: papéis e responsabilidades</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 border-b w-1/3">Papéis</th>
              <th scope="col" className="px-4 py-3 border-b">Responsabilidades</th>
              <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-2 align-top">
                  <TableTextArea
                    value={item.role}
                    onChange={(e) => updateItem(index, 'role', e.target.value)}
                    placeholder="Papel..."
                    aria-label={`Papel ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <TableTextArea
                    value={item.responsibility}
                    onChange={(e) => updateItem(index, 'responsibility', e.target.value)}
                    placeholder="Responsabilidades..."
                    aria-label={`Responsabilidades do papel ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2 text-center align-top pt-3">
                  <IconButton variant="danger" onClick={() => removeItem(index)} aria-label={`Remover papel ${index + 1}`}>
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
