import React, { useEffect, useRef, useState } from 'react';
import { mountIfcApp, type IfcApp } from '../../lib/ifc/app';

/**
 * Host React para a interface de IFC. Toda a UI (viewport 3D, árvore espacial,
 * propriedades, análise de consistência) é montada em web components do ThatOpen
 * por mountIfcApp — este componente apenas fornece o container e cuida do ciclo de vida.
 */
export function IfcAnalysis() {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let app: IfcApp | null = null;
    let disposed = false;

    if (host.current) {
      mountIfcApp(host.current)
        .then((instance) => {
          if (disposed) instance.dispose();
          else app = instance;
        })
        .catch((e) => setError(`Falha ao iniciar o visualizador IFC: ${e?.message ?? e}`));
    }

    return () => {
      disposed = true;
      app?.dispose();
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
