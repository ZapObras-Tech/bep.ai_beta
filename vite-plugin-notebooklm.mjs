import { spawn } from 'node:child_process';

// Ponte local NotebookLM embutida no dev server do Vite.
//
// Por que aqui e não num servidor separado: o app é só frontend (navegador) e
// NÃO pode chamar o CLI `notebooklm` nem alcançar o RPC do Google diretamente.
// Como middleware do Vite, as rotas ficam na MESMA origem (localhost:3000),
// sem CORS e sem 2º processo — `npm run dev` já sobe tudo. Pensado para aula.
//
// Pré-requisito (uma vez por máquina):
//   pip install notebooklm-py
//   notebooklm login   (abre o Chromium para login Google)
//
// Rotas:
//   GET  /api/notebooklm/health    → { ok, cliFound }
//   GET  /api/notebooklm/status    → { cliFound, authenticated }
//   POST /api/notebooklm/login     → { ok } | { error }   (abre o Chromium p/ OAuth)
//   GET  /api/notebooklm/notebooks → { notebooks: [{id,title}] }
//   POST /api/notebooklm/ask       → { answer } | { error }   (body: {notebookId, prompt})

const PREFIX = '/api/notebooklm';
const ASK_TIMEOUT_MS = 120_000;
const LOGIN_TIMEOUT_MS = 240_000; // login interativo: aguarda o OAuth no navegador

// Formas de invocar o CLI, em ordem de tentativa. O pip às vezes instala o
// `notebooklm.exe` num diretório fora do PATH (ex.: user site Scripts), então
// `python -m notebooklm` costuma ser o caminho confiável.
const INVOCATIONS = [
  { cmd: 'notebooklm', base: [] },
  { cmd: 'python', base: ['-m', 'notebooklm'] },
  { cmd: 'py', base: ['-m', 'notebooklm'] },
  { cmd: 'python3', base: ['-m', 'notebooklm'] },
];

let resolvedInvocation = null; // cacheado após a 1ª detecção bem-sucedida

// Spawn de baixo nível: roda `cmd args` e resolve com stdout (ou rejeita).
function spawnCli(cmd, args, { timeout }) {
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(cmd, args, { shell: false, windowsHide: true });
    } catch (e) {
      reject(Object.assign(new Error('spawn failed'), { code: 'ENOENT', cause: e }));
      return;
    }
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }));
    }, timeout);

    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err); // ENOENT = executável não encontrado
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(Object.assign(new Error(stderr || `exit ${code}`), { code: 'ECLI', exitCode: code }));
    });
  });
}

// Descobre uma invocação que funcione (testa `--version`). Cacheia o resultado.
async function resolveInvocation() {
  if (resolvedInvocation) return resolvedInvocation;
  for (const inv of INVOCATIONS) {
    try {
      await spawnCli(inv.cmd, [...inv.base, '--version'], { timeout: 10_000 });
      resolvedInvocation = inv;
      return inv;
    } catch (e) {
      if (e.code === 'ENOENT') continue; // tenta a próxima forma
      // Comando existe mas erro inesperado: ainda assim é uma invocação válida.
      resolvedInvocation = inv;
      return inv;
    }
  }
  throw Object.assign(new Error('CLI notebooklm indisponível'), { code: 'ENOENT' });
}

// Executa o CLI com os args dados, usando a invocação detectada.
async function runCli(args, { timeout = 30_000 } = {}) {
  const inv = await resolveInvocation();
  return spawnCli(inv.cmd, [...inv.base, ...args], { timeout });
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(body);
}

function cliMissing(res) {
  sendJSON(res, 503, {
    error:
      'CLI "notebooklm" não encontrado no PATH. Rode (uma vez): pip install notebooklm-py && notebooklm login',
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

/** @returns {import('vite').Plugin} */
export function notebooklmBridge() {
  return {
    name: 'notebooklm-bridge',
    apply: 'serve', // só no dev server
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith(PREFIX)) return next();
        const route = req.url.split('?')[0].slice(PREFIX.length);

        try {
          if (route === '/health') {
            let cliFound = true;
            try {
              await runCli(['--version'], { timeout: 8000 });
            } catch (e) {
              cliFound = e.code !== 'ENOENT' ? true : false;
            }
            return sendJSON(res, 200, { ok: true, cliFound });
          }

          if (route === '/status' && req.method === 'GET') {
            // `auth check` só inspeciona cookies em disco: retorna status='ok'
            // mesmo com o TOKEN EXPIRADO (token_fetch=null). Isso dava um falso
            // "autenticado" e escondia o botão de login. O sinal confiável é o
            // próprio `list` funcionar — se a sessão expirou, ele falha (exit !=0
            // com "Authentication expired"), então tratamos como não-autenticado.
            let cliFound = true;
            let authenticated = false;
            try {
              await runCli(['list', '--json'], { timeout: 30_000 });
              authenticated = true;
            } catch (e) {
              cliFound = e.code !== 'ENOENT';
              authenticated = false;
            }
            return sendJSON(res, 200, { cliFound, authenticated });
          }

          if (route === '/login' && req.method === 'POST') {
            // Bloqueia até o usuário concluir o OAuth no Chromium que o CLI abre.
            //
            // O perfil persistente do Chromium (browser_profile/) às vezes fica
            // corrompido/preso de uma sessão anterior — o login então falha com
            // "The browser window was closed during login" (exit 1). Nesse caso
            // repetimos com `--fresh`, que descarta o perfil e abre uma sessão
            // limpa. Erros de timeout/ENOENT não são recuperáveis aqui e sobem.
            try {
              await runCli(['login'], { timeout: LOGIN_TIMEOUT_MS });
            } catch (e) {
              if (e.code !== 'ECLI') throw e; // timeout/ENOENT: deixa o catch geral tratar
              await runCli(['login', '--fresh'], { timeout: LOGIN_TIMEOUT_MS });
            }
            return sendJSON(res, 200, { ok: true });
          }

          if (route === '/notebooks' && req.method === 'GET') {
            const out = await runCli(['list', '--json'], { timeout: 30_000 });
            const data = JSON.parse(out);
            const notebooks = (data.notebooks ?? []).map((n) => ({ id: n.id, title: n.title }));
            return sendJSON(res, 200, { notebooks });
          }

          if (route === '/ask' && req.method === 'POST') {
            const { notebookId, prompt } = await readBody(req);
            if (!notebookId) return sendJSON(res, 400, { error: 'notebookId ausente' });
            if (!prompt) return sendJSON(res, 400, { error: 'prompt ausente' });
            const out = await runCli(['ask', prompt, '--json', '--notebook', notebookId], {
              timeout: ASK_TIMEOUT_MS,
            });
            const data = JSON.parse(out);
            return sendJSON(res, 200, { answer: data.answer ?? '', references: data.references ?? [] });
          }

          return next();
        } catch (e) {
          if (e.code === 'ENOENT') return cliMissing(res);
          if (e.code === 'ETIMEDOUT')
            return sendJSON(res, 504, { error: 'NotebookLM demorou demais (timeout).' });
          return sendJSON(res, 500, { error: String(e.message || e) });
        }
      });
    },
  };
}
