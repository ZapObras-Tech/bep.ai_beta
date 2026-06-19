import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { Plus, Trash2 } from 'lucide-react';
import { AiSuggestionButton } from '../ui/AiSuggestionButton';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField, TableSelectField } from '../ui/TableField';

interface Props {
  block: BlockData;
}

export function ScopeBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();
  const goals = block.content.goals || [];

  const handleAiSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    
    // Coerção defensiva: a IA às vezes devolve priority como número e uses como
    // array. O select compara priority com strings ("1".."3") e o input de uses
    // espera string — sem coagir, o campo fica vazio/quebrado.
    const newGoals = suggestions.map((s) => ({
      priority: String(s.priority ?? '2'),
      objective: typeof s.objective === 'string' ? s.objective : String(s.objective ?? ''),
      uses: Array.isArray(s.uses) ? s.uses.join(', ') : (s.uses ?? ''),
    }));

    updateBlockContent(block.id, { 
      goals: [...goals, ...newGoals] 
    });
  };

  const addGoal = () => {
    updateBlockContent(block.id, { 
      goals: [...goals, { priority: '1', objective: '', uses: '' }] 
    });
  };

  const removeGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    updateBlockContent(block.id, { goals: newGoals });
  };

  const updateGoal = (index: number, field: string, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    updateBlockContent(block.id, { goals: newGoals });
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800">Tabela 5 - Usos BIM (Objetivos Organizacionais)</h3>
        <div className="flex gap-2">
          <AiSuggestionButton 
            prompt="Liste 3 a 5 objetivos organizacionais BIM prioritários com base no edital, retornando um array de objetos JSON com as chaves: priority (string '1', '2' ou '3'), objective (string), uses (string)."
            onSuggest={handleAiSuggest}
            json={true}
          />
          <Button variant="accent" size="sm" onClick={addGoal} icon={<Plus className="w-3.5 h-3.5" />}>
            Adicionar Objetivo
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
          <caption className="sr-only">Usos BIM e objetivos organizacionais, por prioridade</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 border-b w-28">Prioridade (1-3)</th>
              <th scope="col" className="px-4 py-3 border-b">Descrição do Objetivo</th>
              <th scope="col" className="px-4 py-3 border-b">Usos BIM Associados (Messner, 2023)</th>
              <th scope="col" className="px-4 py-3 border-b w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((row: any, index: number) => (
              <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-3 py-2">
                  <TableSelectField
                    value={row.priority}
                    onChange={(e) => updateGoal(index, 'priority', e.target.value)}
                    aria-label={`Prioridade do objetivo ${index + 1}`}
                  >
                    <option value="1">1 (Alta)</option>
                    <option value="2">2 (Média)</option>
                    <option value="3">3 (Baixa)</option>
                  </TableSelectField>
                </td>
                <td className="px-3 py-2">
                  <TableTextField
                    value={row.objective}
                    onChange={(e) => updateGoal(index, 'objective', e.target.value)}
                    placeholder="Objetivo..."
                    aria-label={`Descrição do objetivo ${index + 1}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <TableTextField
                    value={row.uses}
                    onChange={(e) => updateGoal(index, 'uses', e.target.value)}
                    placeholder="Usos BIM..."
                    aria-label={`Usos BIM do objetivo ${index + 1}`}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <IconButton
                    variant="danger"
                    onClick={() => removeGoal(index)}
                    aria-label={`Remover objetivo ${index + 1}`}
                  >
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

