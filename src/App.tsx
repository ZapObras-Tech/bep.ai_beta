import React, { useState, lazy, Suspense } from 'react';
import { useBEPStore } from './store/bepStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Sidebar } from './components/layout/Sidebar';
import { Editor } from './components/layout/Editor';
import { KanbanBoard } from './components/layout/KanbanBoard';
import { Home } from './components/layout/Home';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileDown, Upload, Loader2, Sparkles, Save, FolderOpen, CheckCircle2, X } from 'lucide-react';
import { exportToPDF } from './lib/export';
import { extractTextFromPDF } from './lib/pdf';
import { NotebookLMConnect } from './components/ui/NotebookLMConnect';
import { Button } from './components/ui/Button';

// Code-split the IFC viewer: three.js + ThatOpen are heavy and shouldn't be in
// the initial bundle.
const IfcAnalysis = lazy(() =>
  import('./components/layout/IfcAnalysis').then((m) => ({ default: m.IfcAnalysis })),
);

function App() {
  const { blocks, reorderBlocks, expandAllBlocks, setIsoContext, isoContext, importedFileName, importProject, currentProjectName, activeView } = useBEPStore();
  const [isImporting, setIsImporting] = useState(false);
  // Toast efêmero (some sozinho). Substitui o alert() bloqueante de sucesso.
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

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
    const project = { version: 1, name: currentProjectName, blocks, isoContext };
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
      const name = data.name || file.name.replace(/\.json$/i, '');
      importProject({ blocks: data.blocks, isoContext: data.isoContext }, name);
      alert('Projeto importado com sucesso.');
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
      // Extrai o texto do PDF e guarda como contexto. O preenchimento agora é
      // feito por seção (botão "Gerar IA" em cada bloco), o que reduz a variância.
      const text = await extractTextFromPDF(file);
      setIsoContext(text, file.name);
      showToast('Documento importado! Use "Gerar IA" em cada seção para preencher.');
    } catch (error) {
      console.error("Global Import Failed", error);
      alert(error instanceof Error ? error.message : "Falha na importação do PDF.");
    } finally {
      setIsImporting(false);
    }
  };

  if (activeView === 'home') {
    return <Home />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Toast efêmero (some sozinho após ~3,5s) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-4 pr-2 py-3 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-lg max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{toast}</span>
            <button
              onClick={() => setToast(null)}
              aria-label="Fechar notificação"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <h1 className="text-3xl font-bold text-slate-900">{currentProjectName || 'BEP.ai'}</h1>
                    <p className="text-slate-500 mt-2">
                      ISO 19650 & NBR 15965 · Plano de Execução BIM
                    </p>
                    {isoContext && (
                      <p className="text-xs text-orange-700 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Documento carregado{importedFileName ? `: ${importedFileName}` : ''} · disponível para "Gerar IA" (mantido até fechar o navegador)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <NotebookLMConnect />
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleGlobalImport}
                        className="sr-only peer"
                        id="global-import"
                        disabled={isImporting}
                      />
                      <label
                        htmlFor="global-import"
                        className={`inline-flex items-center gap-2 h-11 px-4 bg-orange-100 text-orange-800 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors shadow-sm font-medium text-sm cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-1 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isImporting ? "Importando..." : "Importar Documento (PDF)"}
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleLoadProject}
                        className="sr-only peer"
                        id="load-project"
                      />
                      <label
                        htmlFor="load-project"
                        className="inline-flex items-center gap-2 h-11 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-1"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Carregar
                      </label>
                    </div>

                    <Button variant="secondary" noPrint onClick={handleSaveProject} icon={<Save className="w-4 h-4" />}>
                      Salvar
                    </Button>

                    <Button variant="primary" noPrint onClick={handleExportHTML} icon={<FileDown className="w-4 h-4" />}>
                      EXPORTAR
                    </Button>
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
