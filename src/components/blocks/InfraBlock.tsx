import React, { useState } from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { validateInfrastructure } from '../../lib/gemini';
import { AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AiSuggestionButton } from '../ui/AiSuggestionButton';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TableTextField } from '../ui/TableField';

interface Props {
  block: BlockData;
}

export function InfraBlock({ block }: Props) {
  const { updateBlockContent } = useBEPStore();
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<any>(null);

  const softwareTools = block.content.software_tools || [];
  const hardwareReqs = block.content.hardware_requirements || [];

  const handleSoftwareSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    const newTools = suggestions.map(s => ({
      use: s.use || '',
      platform: s.platform || '',
      version: s.version || '',
      extension: s.extension || ''
    }));
    updateBlockContent(block.id, { 
      software_tools: [...softwareTools, ...newTools] 
    });
  };

  const handleHardwareSuggest = (suggestions: any[]) => {
    if (!Array.isArray(suggestions)) return;
    const newReqs = suggestions.map(s => ({
      purpose: s.purpose || '',
      cpu: s.cpu || '',
      ram: s.ram || '',
      gpu: s.gpu || '',
      os: s.os || '',
      hd: s.hd || ''
    }));
    updateBlockContent(block.id, { 
      hardware_requirements: [...hardwareReqs, ...newReqs] 
    });
  };

  const handleValidate = async () => {
    // Simplified validation for now, just checking the first items or overall
    const software = softwareTools.map((s: any) => s.platform).join(', ');
    const hardware = hardwareReqs.map((h: any) => `${h.cpu} ${h.ram} ${h.gpu}`).join(', ');
    
    if (!software || !hardware) return;

    setLoading(true);
    setValidation(null);
    try {
      const result = await validateInfrastructure(software, hardware);
      setValidation(JSON.parse(result));
    } catch (error) {
      console.error("Infra Validation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const addSoftware = () => {
    updateBlockContent(block.id, { 
      software_tools: [...softwareTools, { use: '', platform: '', version: '', extension: '' }] 
    });
  };

  const removeSoftware = (index: number) => {
    const newTools = [...softwareTools];
    newTools.splice(index, 1);
    updateBlockContent(block.id, { software_tools: newTools });
  };

  const updateSoftware = (index: number, field: string, value: string) => {
    const newTools = [...softwareTools];
    newTools[index] = { ...newTools[index], [field]: value };
    updateBlockContent(block.id, { software_tools: newTools });
  };

  const addHardware = () => {
    updateBlockContent(block.id, { 
      hardware_requirements: [...hardwareReqs, { purpose: '', cpu: '', ram: '', gpu: '', os: '', hd: '' }] 
    });
  };

  const removeHardware = (index: number) => {
    const newReqs = [...hardwareReqs];
    newReqs.splice(index, 1);
    updateBlockContent(block.id, { hardware_requirements: newReqs });
  };

  const updateHardware = (index: number, field: string, value: string) => {
    const newReqs = [...hardwareReqs];
    newReqs[index] = { ...newReqs[index], [field]: value };
    updateBlockContent(block.id, { hardware_requirements: newReqs });
  };

  return (
    <div className="space-y-8">
      {/* Tabela 6 - Ferramentas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">Tabela 6 - Ferramentas utilizadas no projeto</h3>
          <div className="flex gap-2">
            <AiSuggestionButton 
              prompt="Liste as ferramentas de software requeridas ou sugeridas para este projeto, retornando um array de objetos JSON com as chaves: use, platform, version, extension."
              onSuggest={handleSoftwareSuggest}
              json={true}
            />
            <Button variant="accent" size="sm" onClick={addSoftware} icon={<Plus className="w-3.5 h-3.5" />}>
              Adicionar Ferramenta
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
            <caption className="sr-only">Tabela 6 - Ferramentas utilizadas no projeto</caption>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3 border-b">Uso BIM</th>
                <th scope="col" className="px-4 py-3 border-b">Plataforma / Ferramenta</th>
                <th scope="col" className="px-4 py-3 border-b">Versão</th>
                <th scope="col" className="px-4 py-3 border-b">Extensão</th>
                <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {softwareTools.map((row: any, index: number) => (
                <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.use}
                      onChange={(e) => updateSoftware(index, 'use', e.target.value)}
                      placeholder="Uso..."
                      aria-label={`Uso BIM da ferramenta linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.platform}
                      onChange={(e) => updateSoftware(index, 'platform', e.target.value)}
                      placeholder="Software..."
                      aria-label={`Plataforma / Ferramenta linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.version}
                      onChange={(e) => updateSoftware(index, 'version', e.target.value)}
                      placeholder="2024..."
                      aria-label={`Versão linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.extension}
                      onChange={(e) => updateSoftware(index, 'extension', e.target.value)}
                      placeholder=".rvt..."
                      aria-label={`Extensão linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <IconButton variant="danger" onClick={() => removeSoftware(index)} aria-label={`Remover linha ${index + 1}`}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela 7 - Hardware */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">Tabela 7 - Equipamentos utilizados (Hardware)</h3>
          <div className="flex gap-2">
            <AiSuggestionButton 
              prompt="Liste os requisitos de hardware sugeridos para este projeto, retornando um array de objetos JSON com as chaves: purpose, cpu, ram, gpu, os, hd."
              onSuggest={handleHardwareSuggest}
              json={true}
            />
            <Button variant="accent" size="sm" onClick={addHardware} icon={<Plus className="w-3.5 h-3.5" />}>
              Adicionar Hardware
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg">
            <caption className="sr-only">Tabela 7 - Equipamentos utilizados (Hardware)</caption>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3 border-b">Propósito</th>
                <th scope="col" className="px-4 py-3 border-b">CPU</th>
                <th scope="col" className="px-4 py-3 border-b">RAM</th>
                <th scope="col" className="px-4 py-3 border-b">Vídeo</th>
                <th scope="col" className="px-4 py-3 border-b">OS</th>
                <th scope="col" className="px-4 py-3 border-b">HD</th>
                <th scope="col" className="px-4 py-3 border-b w-10 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {hardwareReqs.map((row: any, index: number) => (
                <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.purpose}
                      onChange={(e) => updateHardware(index, 'purpose', e.target.value)}
                      placeholder="Propósito..."
                      aria-label={`Propósito do hardware linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.cpu}
                      onChange={(e) => updateHardware(index, 'cpu', e.target.value)}
                      placeholder="i7..."
                      aria-label={`CPU linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.ram}
                      onChange={(e) => updateHardware(index, 'ram', e.target.value)}
                      placeholder="16GB..."
                      aria-label={`RAM linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.gpu}
                      onChange={(e) => updateHardware(index, 'gpu', e.target.value)}
                      placeholder="RTX..."
                      aria-label={`Vídeo linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.os}
                      onChange={(e) => updateHardware(index, 'os', e.target.value)}
                      placeholder="Win 10..."
                      aria-label={`OS linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TableTextField
                      value={row.hd}
                      onChange={(e) => updateHardware(index, 'hd', e.target.value)}
                      placeholder="SSD..."
                      aria-label={`HD linha ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <IconButton variant="danger" onClick={() => removeHardware(index)} aria-label={`Remover linha ${index + 1}`}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button variant="primary" onClick={handleValidate} loading={loading}>
          Validar Compatibilidade (IA)
        </Button>
      </div>

      {validation && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            validation.compatible 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            {validation.compatible ? (
              <CheckCircle className="w-5 h-5 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm mb-1">
                {validation.compatible ? "Hardware Compatível" : "Incompatibilidade Detectada"}
              </h4>
              
              {validation.warnings && validation.warnings.length > 0 && (
                <ul className="list-disc list-inside text-sm opacity-90 mb-2 space-y-1">
                  {validation.warnings.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              
              {validation.recommendation && (
                <div className="mt-2 text-sm font-medium bg-white/50 p-2 rounded-lg border border-black/5">
                  💡 Recomendação: {validation.recommendation}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
