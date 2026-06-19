import React, { useState, lazy, Suspense } from 'react';
import { useBEPStore } from './store/bepStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Sidebar } from './components/layout/Sidebar';
import { Editor } from './components/layout/Editor';
import { KanbanBoard } from './components/layout/KanbanBoard';
import { Home } from './components/layout/Home';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileDown, Upload, Loader2, Sparkles, Save, FolderOpen } from 'lucide-react';
import { exportToPDF } from './lib/export';
import { extractTextFromPDF } from './lib/pdf';
import { analyzeFullBEP } from './lib/gemini';

// Code-split the IFC viewer: three.js + ThatOpen are heavy and shouldn't be in
// the initial bundle.
const IfcAnalysis = lazy(() =>
  import('./components/layout/IfcAnalysis').then((m) => ({ default: m.IfcAnalysis })),
);

function App() {
  const { blocks, reorderBlocks, updateBlockContent, expandAllBlocks, setIsoContext, isoContext, loadProject, activeView } = useBEPStore();
  const [isImporting, setIsImporting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      reorderBlocks(oldIndex, newIndex);
    }
  }

  const handleSaveProject = () => {
    const project = { version: 1, blocks, isoContext };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bep_projeto.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.blocks)) throw new Error('Arquivo inválido.');
      loadProject({ blocks: data.blocks, isoContext: data.isoContext });
      alert('Projeto carregado com sucesso.');
    } catch (err) {
      console.error('Load project failed', err);
      alert('Falha ao carregar o projeto. Verifique se o arquivo .json é válido.');
    } finally {
      e.target.value = '';
    }
  };

  const handleExportHTML = () => {
    expandAllBlocks();
    
    // Wait for expansion to complete
    setTimeout(() => {
      const content = document.getElementById('bep-editor-content');
      if (!content) return;

      // Deep clone to not mess with the actual app DOM
      const clone = content.cloneNode(true) as HTMLElement;

      // Sync values from REAL DOM to CLONE
      const realInputs = content.querySelectorAll('input, textarea, select');
      const cloneInputs = clone.querySelectorAll('input, textarea, select');

      realInputs.forEach((real: any, i) => {
        const cloned = cloneInputs[i] as any;
        if (!cloned) return;

        if (real.tagName === 'INPUT') {
            if (real.type === 'checkbox' || real.type === 'radio') {
                if (real.checked) cloned.setAttribute('checked', '');
            } else {
                cloned.setAttribute('value', real.value);
            }
        } else if (real.tagName === 'TEXTAREA') {
            cloned.innerHTML = real.value;
        } else if (real.tagName === 'SELECT') {
            const options = cloned.querySelectorAll('option');
            options.forEach((opt: any) => {
                if (opt.value === real.value) {
                    opt.setAttribute('selected', '');
                }
            });
        }
      });

      // Remove buttons and interactive elements from clone
      const elementsToRemove = clone.querySelectorAll('button, .no-print');
      elementsToRemove.forEach(el => el.remove());

      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BEP.ai - Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #fff; color: #0f172a; padding: 40px; }
    input, textarea, select { background: transparent; border: none; width: 100%; font-family: inherit; color: inherit; resize: none; outline: none; }
    /* Ensure tables look good */
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    th { background-color: #f8fafc; text-align: left; padding: 0.75rem 1rem; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    td { padding: 0.5rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; color: #334155; }
    h1 { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    h3, h4 { font-weight: 700; color: #1e293b; margin-bottom: 1rem; margin-top: 2rem; }
    
    /* Hide empty rows or specific UI artifacts if needed */
    .dnd-kit-drag-overlay { display: none; }
  </style>
</head>
<body>
  <div class="max-w-5xl mx-auto">
    <div class="mb-10 text-center border-b pb-8">
      <h1>BEP.ai - Plano de Execução BIM</h1>
      <p class="text-slate-500">Gerado automaticamente via BEP Generator</p>
    </div>
    ${clone.innerHTML}
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BEP_Export.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  };

  const handleGlobalImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, envie um arquivo PDF.');
      return;
    }

    setIsImporting(true);
    try {
      // 1. Extract text
      const text = await extractTextFromPDF(file);
      setIsoContext(text); // Save context for AI suggestions
      
      // 2. Analyze with AI
      const result = await analyzeFullBEP(text);
      const parsedData = JSON.parse(result);

      // 3. Populate blocks
      // We iterate over the keys in parsedData and update corresponding blocks
      Object.keys(parsedData).forEach(key => {
        const block = blocks.find(b => b.type === key);
        if (block) {
          updateBlockContent(block.id, parsedData[key]);
        }
      });

      alert("Dados importados com sucesso! Revise os campos preenchidos.");
    } catch (error) {
      console.error("Global Import Failed", error);
      alert("Falha na importação. Verifique o arquivo ou a chave de API.");
    } finally {
      setIsImporting(false);
    }
  };

  if (activeView === 'home') {
    return <Home />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden" id="main-scroll">
        {activeView === 'ifc' ? (
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Carregando visualizador 3D...
              </div>
            }
          >
            <IfcAnalysis />
          </Suspense>
        ) : (
        <div className="max-w-4xl mx-auto h-full overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <header className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">BEP.ai</h1>
                    <p className="text-slate-500 mt-2">
                      ISO 19650 & NBR 15965 Compliant Generator
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleGlobalImport}
                        className="hidden"
                        id="global-import"
                        disabled={isImporting}
                      />
                      <label
                        htmlFor="global-import"
                        className={`flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors shadow-sm font-medium text-sm cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isImporting ? "Analisando..." : "Importar EIR (PDF)"}
                      </label>
                    </div>

                    <input
                      type="file"
                      accept=".json"
                      onChange={handleLoadProject}
                      className="hidden"
                      id="load-project"
                    />
                    <label
                      htmlFor="load-project"
                      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Carregar
                    </label>

                    <button
                      onClick={handleSaveProject}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </button>

                    <button
                      onClick={handleExportHTML}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      EXPORTAR
                    </button>
                  </div>
                </header>

                <div id="bep-editor-content" className="bg-slate-50 p-4 rounded-xl"> 
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={blocks.map(b => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <Editor blocks={blocks} />
                    </SortableContext>
                  </DndContext>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <KanbanBoard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        )}
      </main>
    </div>
  );
}

export default App;
