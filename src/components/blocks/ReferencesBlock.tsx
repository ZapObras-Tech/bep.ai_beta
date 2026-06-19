import React, { useState } from 'react';
import { BlockData, useBEPStore } from '../../store/bepStore';
import { extractTextFromPDF } from '../../lib/pdf';
import { askISO } from '../../lib/gemini';
import { Upload, BookOpen, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';

interface Props {
  block: BlockData;
}

export function ReferencesBlock({ block }: Props) {
  const { updateBlockContent, setIsoContext, isoContext } = useBEPStore();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, envie um arquivo PDF.');
      return;
    }

    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      setIsoContext(text); // Store globally for context
      
      // Also add to references list
      const currentRefs = block.content.references || [];
      updateBlockContent(block.id, { 
        references: [...currentRefs, { name: file.name, date: new Date().toLocaleDateString() }] 
      });
    } catch (error) {
      console.error("PDF extraction failed", error);
      alert("Falha ao ler o PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !isoContext) return;
    
    setAsking(true);
    try {
      const response = await askISO(question, isoContext);
      setAnswer(response);
    } catch (error) {
      console.error("Ask ISO failed", error);
      alert("Falha ao consultar a IA.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-600" />
          Upload de Normas e Referências (ISO 19650 / NBR 15965)
        </label>
        
        <div className="mb-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="iso-upload"
            aria-label="Enviar PDF da Norma"
          />
          <label
            htmlFor="iso-upload"
            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors text-slate-500 text-sm"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Processando Norma..." : "Clique para enviar PDF da Norma"}
          </label>
        </div>

        {block.content.references?.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase">Documentos Carregados:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              {block.content.references.map((ref: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {ref.name} <span className="text-xs text-slate-400">({ref.date})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isoContext && (
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <h4 className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Consultar Normas Carregadas
          </h4>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Qual o processo de entrega de informação segundo a ISO 19650?"
              className="flex-1 p-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              aria-label="Pergunta sobre as normas carregadas"
            />
            <Button
              variant="primary"
              onClick={handleAsk}
              disabled={asking || !question}
              loading={asking}
              icon={<Send className="w-4 h-4" />}
              aria-label="Enviar pergunta"
            />
          </div>

          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white p-4 rounded-lg border border-orange-100 text-sm text-slate-700 leading-relaxed"
              >
                <div className="markdown-body">
                  {answer.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
