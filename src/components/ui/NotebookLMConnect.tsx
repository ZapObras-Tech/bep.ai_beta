import React, { useState, useRef, useEffect } from 'react';
import { useBEPStore } from '../../store/bepStore';
import {
  listNotebooks,
  bridgeStatus,
  loginNotebookLM,
  type NotebookInfo,
} from '../../lib/ai/providers/notebooklm';
import { BookOpen, Loader2, Check, RefreshCw, ChevronDown, LogIn } from 'lucide-react';

// Painel de conexão com o NotebookLM. Fluxo direto pelo app:
//   trocar para NotebookLM → (se preciso) login no Chromium → escolher notebook.
export function NotebookLMConnect() {
  const { aiProviderId, notebookId, setAiProvider, setNotebookId } = useBEPStore();
  const [open, setOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<NotebookInfo[]>([]);
  const [loading, setLoading] = useState(false); // carregando notebooks
  const [loggingIn, setLoggingIn] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null); // null = ainda não checado
  const [cliFound, setCliFound] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNB = aiProviderId === 'notebooklm';
  const selected = notebooks.find((n) => n.id === notebookId);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fecha o painel com Escape ou clique fora — comportamento esperado de menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const loadNotebooks = async () => {
    setLoading(true);
    setError(null);
    try {
      setNotebooks(await listNotebooks());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao listar notebooks.');
    } finally {
      setLoading(false);
    }
  };

  // Checa CLI + auth; se já autenticado, já busca os notebooks.
  const refreshStatus = async () => {
    setError(null);
    const s = await bridgeStatus();
    setCliFound(s.cliFound);
    setAuthed(s.authenticated);
    if (s.cliFound && s.authenticated) await loadNotebooks();
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    setError(null);
    try {
      await loginNotebookLM(); // abre o Chromium; resolve ao concluir o OAuth
      await refreshStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no login.');
    } finally {
      setLoggingIn(false);
    }
  };

  const chooseProvider = (id: string) => {
    setAiProvider(id);
    if (id === 'notebooklm' && authed === null) refreshStatus();
  };

  const togglePanel = () => {
    const next = !open;
    setOpen(next);
    if (next && isNB && authed === null) refreshStatus();
  };

  const label = isNB ? (selected ? `NotebookLM: ${selected.title}` : 'NotebookLM') : 'IA: DeepSeek';

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={togglePanel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 h-11 px-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
        title="Escolher o motor de IA e o projeto NotebookLM"
      >
        <BookOpen className="w-4 h-4 text-orange-600" />
        <span className="max-w-[180px] truncate">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 space-y-4">
          {/* Toggle de provedor */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Motor de IA</p>
            <div className="flex gap-2">
              {[
                { id: 'deepseek', name: 'DeepSeek' },
                { id: 'notebooklm', name: 'NotebookLM' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => chooseProvider(p.id)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                    aiProviderId === p.id
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {isNB && (
            <div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md p-2 mb-2">{error}</p>
              )}

              {/* CLI ausente */}
              {!cliFound && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md p-2">
                  CLI do NotebookLM não encontrado. Rode <code>npm run setup</code> uma vez e reabra o terminal.
                </p>
              )}

              {/* Precisa logar */}
              {cliFound && authed === false && (
                <button
                  onClick={handleLogin}
                  disabled={loggingIn}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {loggingIn ? 'Aguardando login no navegador…' : 'Entrar com Google'}
                </button>
              )}

              {/* Checando */}
              {cliFound && authed === null && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Verificando conexão…
                </p>
              )}

              {/* Autenticado: escolher notebook */}
              {cliFound && authed === true && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Projeto (notebook)</p>
                    <button
                      onClick={loadNotebooks}
                      disabled={loading}
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Atualizar
                    </button>
                  </div>

                  {notebooks.length === 0 && !loading && (
                    <p className="text-xs text-slate-400">Nenhum notebook encontrado nesta conta.</p>
                  )}

                  <div role="listbox" aria-label="Projetos do NotebookLM" className="max-h-56 overflow-y-auto space-y-1">
                    {notebooks.map((n) => (
                      <button
                        key={n.id}
                        role="option"
                        aria-selected={n.id === notebookId}
                        onClick={() => setNotebookId(n.id)}
                        className={`w-full flex items-center gap-2 px-3 min-h-[44px] rounded-md text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                          n.id === notebookId ? 'bg-orange-100 text-orange-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {n.id === notebookId ? (
                          <Check className="w-4 h-4 shrink-0 text-orange-600" />
                        ) : (
                          <span className="w-4 shrink-0" />
                        )}
                        <span className="truncate">{n.title}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                    A fonte (edital) deve estar dentro do notebook. Cada "Gerar IA" consulta esse projeto.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
