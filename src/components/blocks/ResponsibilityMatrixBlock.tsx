import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { ListChecks, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField } from '../ui/TableField';

interface Props {
  block: BlockData;
}

export function ResponsibilityMatrixBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();

  const handleChange = (index: number, field: string, value: string) => {
    const newTeam = [...(block.content.technical_team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    updateBlockContent(block.id, { technical_team: newTeam });
  };

  const addMember = () => {
    const newTeam = [...(block.content.technical_team || []), { role: '', name: '', registry: '', email: '', phone: '' }];
    updateBlockContent(block.id, { technical_team: newTeam });
  };

  const removeMember = (index: number) => {
    const newTeam = [...(block.content.technical_team || [])];
    newTeam.splice(index, 1);
    updateBlockContent(block.id, { technical_team: newTeam });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-orange-600" />
          Tabela 4 - Contatos da Equipe Técnica
        </h3>
        <Button variant="accent" size="sm" onClick={addMember} icon={<Plus className="w-3.5 h-3.5" />}>
          Adicionar Membro
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
          <caption className="sr-only">Contatos da equipe técnica: papel, nome, registro no conselho, e-mail e contato de cada responsável</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 border-b">Papel</th>
              <th scope="col" className="px-4 py-3 border-b">Nome</th>
              <th scope="col" className="px-4 py-3 border-b">Registro (Conselho)</th>
              <th scope="col" className="px-4 py-3 border-b">E-mail</th>
              <th scope="col" className="px-4 py-3 border-b">Contato</th>
              <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {block.content.technical_team?.map((row: any, index: number) => (
              <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-2 font-medium text-slate-700">
                  <TableTextField
                    value={row.role}
                    onChange={(e) => handleChange(index, 'role', e.target.value)}
                    placeholder="Papel..."
                    aria-label={`Papel do responsável ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="Nome..."
                    aria-label={`Nome do responsável ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.registry}
                    onChange={(e) => handleChange(index, 'registry', e.target.value)}
                    placeholder="CAU/CREA..."
                    aria-label={`Registro no conselho do responsável ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    type="email"
                    value={row.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    placeholder="E-mail..."
                    aria-label={`E-mail do responsável ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.phone}
                    onChange={(e) => handleChange(index, 'phone', e.target.value)}
                    placeholder="Tel..."
                    aria-label={`Contato do responsável ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <IconButton variant="danger" onClick={() => removeMember(index)} aria-label={`Remover responsável ${index + 1}`}>
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
