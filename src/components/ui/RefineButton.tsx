import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { refineText } from '../../lib/gemini';
import { IconButton } from './IconButton';

interface Props {
  text: string;
  onRefine: (newText: string) => void;
  className?: string;
}

export function RefineButton({ text, onRefine, className }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRefine = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const refined = await refineText(text);
      onRefine(refined);
    } catch (error) {
      console.error("Refinement failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      onClick={handleRefine}
      disabled={loading || !text}
      aria-label="Refinar texto para linguagem técnica (ISO 19650)"
      title="Refinar texto para linguagem técnica (ISO 19650)"
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
      ) : (
        <Sparkles className="w-4 h-4 text-orange-600" />
      )}
    </IconButton>
  );
}
