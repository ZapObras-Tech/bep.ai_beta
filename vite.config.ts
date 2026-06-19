import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {notebooklmBridge} from './vite-plugin-notebooklm.mjs';

// No API keys: the app's only AI provider is NotebookLM, reached via the local
// bridge plugin below (/api/notebooklm), which shells out to the `notebooklm` CLI.
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), notebooklmBridge()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
