import React, { useEffect, useRef, useState } from 'react';
import { mountIfcApp, type IfcApp } from '../../lib/ifc/app';

/**
 * Instância única do app IFC, mantida viva fora do ciclo de vida do React.
 * Ao trocar de aba, o componente é desmontado, mas a instância (cena 3D, modelo
 * carregado, análise) permanece em memória — só o DOM é destacado/reanexado.
 * Persiste até o navegador/aba ser fechado (recarregar a página zera tudo).
 */
let cachedApp: IfcApp | null = null;
let mounting: Promise<IfcApp> | null = null;

/**
 * Host React para a interface de IFC. Toda a UI (viewport 3D, árvore espacial,
 * propriedades, análise de consistência) é montada em web components do ThatOpen
 * por mountIfcApp — este componente apenas fornece o container e cuida de
 * anexar/destacar a instância persistente.
 */
export function IfcAnalysis() {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    function attach(instance: IfcApp) {
      if (disposed || !host.current) return;
      host.current.appendChild(instance.root);
      // Reanexar ao DOM não dispara o evento 'resize' do viewport — força o ajuste.
      requestAnimationFrame(() => instance.resize());
    }

    if (cachedApp) {
      attach(cachedApp);
    } else {
      // mounting evita corrida do StrictMode (efeito disparado 2x em dev).
      mounting = mounting ?? mountIfcApp();
      mounting
        .then((instance) => {
          cachedApp = instance;
          mounting = null;
          attach(instance);
        })
        .catch((e) => {
          mounting = null;
          setError(`Falha ao iniciar o visualizador IFC: ${e?.message ?? e}`);
        });
    }

    return () => {
      disposed = true;
      // Apenas destaca o DOM; a instância continua viva para a próxima visita.
      if (cachedApp?.root.parentElement) cachedApp.root.remove();
    };
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return <div ref={host} className="h-full w-full" />;
}
