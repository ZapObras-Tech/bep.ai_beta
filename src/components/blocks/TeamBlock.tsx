import React from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField } from '../ui/TableField';

interface Props {
  block: BlockData;
}

export function TeamBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();

  const handleContractorChange = (index: number, field: string, value: string) => {
    const newTeam = [...(block.content.contractor_team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    updateBlockContent(block.id, { contractor_team: newTeam });
  };

  const addContractor = () => {
    const newTeam = [...(block.content.contractor_team || []), { role: '', name: '', education: '', email: '', phone: '' }];
    updateBlockContent(block.id, { contractor_team: newTeam });
  };

  const removeContractor = (index: number) => {
    const newTeam = [...(block.content.contractor_team || [])];
    newTeam.splice(index, 1);
    updateBlockContent(block.id, { contractor_team: newTeam });
  };

  const handleBidderChange = (index: number, field: string, value: string) => {
    const newTeam = [...(block.content.bidder_team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    updateBlockContent(block.id, { bidder_team: newTeam });
  };

  const addBidder = () => {
    const newTeam = [...(block.content.bidder_team || []), { role: '', name: '', education: '', email: '', phone: '' }];
    updateBlockContent(block.id, { bidder_team: newTeam });
  };

  const removeBidder = (index: number) => {
    const newTeam = [...(block.content.bidder_team || [])];
    newTeam.splice(index, 1);
    updateBlockContent(block.id, { bidder_team: newTeam });
  };

  const renderTable = (
    data: any[],
    onChange: (index: number, field: string, value: string) => void,
    onRemove: (index: number) => void,
    caption: string
  ) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
          <tr>
            <th scope="col" className="px-4 py-3 border-b">Papel</th>
            <th scope="col" className="px-4 py-3 border-b">Nome</th>
            <th scope="col" className="px-4 py-3 border-b">Formação</th>
            <th scope="col" className="px-4 py-3 border-b">E-mail</th>
            <th scope="col" className="px-4 py-3 border-b">Telefone</th>
            <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
              <td className="px-4 py-2 font-medium text-slate-700">
                <TableTextField
                  value={row.role}
                  onChange={(e) => onChange(index, 'role', e.target.value)}
                  placeholder="Papel..."
                  aria-label={`Papel do membro ${index + 1}`}
                />
              </td>
              <td className="px-4 py-2">
                <TableTextField
                  value={row.name}
                  onChange={(e) => onChange(index, 'name', e.target.value)}
                  placeholder="Nome..."
                  aria-label={`Nome do membro ${index + 1}`}
                />
              </td>
              <td className="px-4 py-2">
                <TableTextField
                  value={row.education}
                  onChange={(e) => onChange(index, 'education', e.target.value)}
                  placeholder="Formação..."
                  aria-label={`Formação do membro ${index + 1}`}
                />
              </td>
              <td className="px-4 py-2">
                <TableTextField
                  type="email"
                  value={row.email}
                  onChange={(e) => onChange(index, 'email', e.target.value)}
                  placeholder="E-mail..."
                  aria-label={`E-mail do membro ${index + 1}`}
                />
              </td>
              <td className="px-4 py-2">
                <TableTextField
                  value={row.phone}
                  onChange={(e) => onChange(index, 'phone', e.target.value)}
                  placeholder="Tel..."
                  aria-label={`Telefone do membro ${index + 1}`}
                />
              </td>
              <td className="px-4 py-2 text-center">
                <IconButton variant="danger" onClick={() => onRemove(index)} aria-label={`Remover membro ${index + 1}`}>
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            Dados do Contratante
          </h3>
          <Button variant="accent" size="sm" onClick={addContractor} icon={<Plus className="w-3.5 h-3.5" />}>
            Adicionar Membro
          </Button>
        </div>
        {renderTable(block.content.contractor_team || [], handleContractorChange, removeContractor, 'Equipe do contratante: papel, nome, formação, e-mail e telefone de cada membro')}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            Dados do Licitante
          </h3>
          <Button variant="accent" size="sm" onClick={addBidder} icon={<Plus className="w-3.5 h-3.5" />}>
            Adicionar Membro
          </Button>
        </div>
        {renderTable(block.content.bidder_team || [], handleBidderChange, removeBidder, 'Equipe do licitante: papel, nome, formação, e-mail e telefone de cada membro')}
      </div>
    </div>
  );
}
