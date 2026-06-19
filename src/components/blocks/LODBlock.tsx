import React, { useState } from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { optimizeLOD } from '../../lib/gemini';
import { AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AiSuggestionButton } from '../ui/AiSuggestionButton';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField, TableSelectField } from '../ui/TableField';

interface Props {
  block: BlockData;
}

export function LODBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const requirements = block.content.requirements || [];

  const phases = ["LV", "EP", "AP / PL", "PB", "PE", "As-Built"];
  const lods = ["100", "200", "300", "350", "400", "500"];

  const handleAiSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    const newReqs = suggestions.map(s => ({
      phase: s.phase || '',
      lod: s.lod || '',
      loin: s.loin || ''
    }));
    updateBlockContent(block.id, { 
      requirements: [...requirements, ...newReqs] 
    });
  };

  const handleAnalyze = async () => {
    // Analyze the last added requirement or specific one?
    // For now, let's analyze the last one or provide a specific button per row.
    // Let's analyze the highest LOD to check for over-modeling overall.
    const highestLODReq = requirements.reduce((prev: any, current: any) => {
      return (parseInt(prev.lod) > parseInt(current.lod)) ? prev : current;
    }, requirements[0]);

    if (!highestLODReq) return;

    setLoading(true);
    setAnalysis(null);
    try {
      const result = await optimizeLOD("Modelo Geral", highestLODReq.phase, `LOD ${highestLODReq.lod}`);
      setAnalysis(JSON.parse(result));
    } catch (error) {
      console.error("LOD Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    updateBlockContent(block.id, { 
      requirements: [...requirements, { phase: '', lod: '', loin: '' }] 
    });
  };

  const removeRequirement = (index: number) => {
    const newReqs = [...requirements];
    newReqs.splice(index, 1);
    updateBlockContent(block.id, { requirements: newReqs });
  };

  const updateRequirement = (index: number, field: string, value: string) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    updateBlockContent(block.id, { requirements: newReqs });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800">Tabela 8 - Requisitos de Informação do Projeto</h3>
        <div className="flex gap-2">
          <AiSuggestionButton 
            prompt="Liste os requisitos de LOD e LOIN por fase para este projeto, retornando um array de objetos JSON com as chaves: phase, lod, loin."
            onSuggest={handleAiSuggest}
            json={true}
          />
          <Button variant="accent" size="sm" onClick={addRequirement} icon={<Plus className="w-3.5 h-3.5" />}>
            Adicionar Fase
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
          <caption className="sr-only">Tabela 8 - Requisitos de Informação do Projeto</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 border-b">Fase</th>
              <th scope="col" className="px-4 py-3 border-b">Nível de Desenvolvimento (LOD)</th>
              <th scope="col" className="px-4 py-3 border-b">Nível de Informação (LOIN)</th>
              <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((row: any, index: number) => (
              <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.phase}
                    onChange={(e) => updateRequirement(index, 'phase', e.target.value)}
                    placeholder="Fase..."
                    aria-label={`Fase linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <TableSelectField
                    value={row.lod}
                    onChange={(e) => updateRequirement(index, 'lod', e.target.value)}
                    aria-label={`Nível de Desenvolvimento (LOD) linha ${index + 1}`}
                  >
                    <option value="">Selecione...</option>
                    {lods.map(l => <option key={l} value={l}>{l}</option>)}
                  </TableSelectField>
                </td>
                <td className="px-4 py-2">
                  <TableTextField
                    value={row.loin}
                    onChange={(e) => updateRequirement(index, 'loin', e.target.value)}
                    placeholder="1, 2, 3..."
                    aria-label={`Nível de Informação (LOIN) linha ${index + 1}`}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <IconButton variant="danger" onClick={() => removeRequirement(index)} aria-label={`Remover linha ${index + 1}`}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          variant="primary"
          onClick={handleAnalyze}
          loading={loading}
          disabled={requirements.length === 0}
        >
          Verificar Over-modeling (IA)
        </Button>
      </div>

      {analysis && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            analysis.status === 'Adequado' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-start gap-3">
            {analysis.status === 'Adequado' ? (
              <CheckCircle className="w-5 h-5 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm mb-1">{analysis.status}</h4>
              <p className="text-sm opacity-90 mb-2">{analysis.reasoning}</p>
              
              {analysis.suggested_lod && (
                <div className="mt-3 flex items-center gap-3 bg-white/50 p-2 rounded-lg">
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200">
                    Sugestão: {analysis.suggested_lod}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

