import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField } from '../ui/TableField';

interface Props {
  block: BlockData;
  title: string;
  itemLabel: string;
  fieldKey: string;
}

export function ListBlock({ block, title, itemLabel, fieldKey }: Props) {
  const { updateBlockContent } = useBEPStore();
  const items = block.content[fieldKey] || [];

  const addItem = () => {
    updateBlockContent(block.id, {
      [fieldKey]: [...items, { id: Date.now(), text: '' }]
    });
  };

  const updateItem = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
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
        <Button variant="accent" size="sm" icon={<Plus className="w-3 h-3" />} onClick={addItem}>
          Adicionar {itemLabel}
        </Button>
      </div>

      {items.map((item: any, i: number) => (
        <div key={item.id} className="flex gap-2">
          <TableTextField
            value={item.text}
            onChange={(e) => updateItem(i, e.target.value)}
            className="flex-1"
            placeholder={`Descreva o ${itemLabel.toLowerCase()}...`}
            aria-label={`${itemLabel} ${i + 1}`}
          />
          <IconButton variant="danger" onClick={() => removeItem(i)} aria-label={`Remover ${itemLabel.toLowerCase()} ${i + 1}`}>
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
