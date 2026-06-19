import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useBEPStore } from '../../store/bepStore';
import { suggestContent } from '../../lib/gemini';
import { Button } from './Button';

interface Props {
  prompt: string;
  onSuggest: (suggestion: any) => void;
  className?: string;
  label?: string;
  json?: boolean;
}

export function AiSuggestionButton({ prompt, onSuggest, className, label = "Sugerir", json = false }: Props) {
  const { isoContext, aiProviderId, notebookId } = useBEPStore();
  const [loading, setLoading] = useState(false);

  const usingNotebookLM = aiProviderId === 'notebooklm';
  const ready = usingNotebookLM ? Boolean(notebookId) : Boolean(isoContext);

  const handleSuggest = async () => {
    if (!ready) {
      alert(
        usingNotebookLM
          ? 'Selecione um projeto do NotebookLM no topo antes de usar a IA.'
          : 'Por favor, importe um PDF (EIR) primeiro para usar a IA.'
      );
      return;
    }

    setLoading(true);
    try {
      const suggestion = await suggestContent(isoContext, prompt, json);
      if (!json) {
        onSuggest(suggestion);
        return;
      }
      const parsed = JSON.parse(suggestion);
      // O modo json_object da IA frequentemente devolve a lista dentro de um
      // objeto ({ goals: [...] }) em vez de um array puro. TODOS os consumidores
      // (ScopeBlock, InfraBlock, LODBlock, etc.) esperam array e descartam objeto
      // em silêncio. Normaliza: se vier objeto com uma propriedade array, usa ela.
      const normalized =
        parsed && !Array.isArray(parsed) && typeof parsed === 'object'
          ? (Object.values(parsed).find((v) => Array.isArray(v)) ?? parsed)
          : parsed;
      onSuggest(normalized);
    } catch (error) {
      console.error("Suggestion failed", error);
      alert("Falha ao gerar sugestão.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <Button
      variant="accent"
      size="sm"
      onClick={handleSuggest}
      loading={loading}
      icon={<Sparkles className="w-3.5 h-3.5" />}
      className={className}
      title="Gerar sugestão com base no Edital/EIR"
    >
      {label}
    </Button>
  );
}
