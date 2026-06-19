# Plano: Preenchimento robusto do BEP (multi-projeto · multi-documento · geração por seção)

## Context

O preenchimento automático do BEP varia muito com o mesmo documento. Duas causas
confirmadas no código:
1. **Sem determinismo** — `src/lib/ai/providers/groq.ts` não envia `temperature` nem
   `seed`, então a Groq usa aleatoriedade alta por padrão.
2. **Um JSON gigante** — `analyzeFullBEP` (`src/lib/gemini.ts`) pede TODAS as seções do
   BEP numa única chamada, o que o modelo cumpre de forma inconsistente.

O usuário quer evoluir o fluxo para: receber vários tipos de documento (edital, EIR, ata
de reunião) em PDF, **convertê-los com markitdown (Microsoft)**, **gerenciar vários
projetos** com seus documentos salvos, e **gerar cada seção do BEP por um botão** com
prompt focado. Resultado esperado: preenchimento consistente, rastreável e organizado por
projeto. Continua sendo protótipo para ensino (rodar localmente).

## Decisões do dono (2026-06-19)
- **Conversão:** markitdown (backend Python).
- **Armazenamento:** multi-projeto, no backend, em disco (alinha com "salvar no diretório").
- **Geração:** botão por seção (sob demanda), não auto-preenchimento.

## Fase 0 — Salvar plano + publicar no GitHub (antes de codar)
- Salvar este plano no projeto como `docs/PLANO.md` (versionado junto ao código).
- Verificar `.gitignore`: garantir que `.env`, `node_modules/`, `dist/`, `backend/data/`
  e venv NÃO sejam commitados (o `.env` com a chave Groq jamais vai ao repo público).
- Repositório existente do dono: **https://github.com/bicalhobim/BEP.ai_beta** (público).
  Adicionar como remote (se ausente), commitar o estado atual e dar push para `main`.
- Só depois iniciar as Fases A→C abaixo (cada fase = seu próprio commit/PR).

## Arquitetura — 3 camadas (faseadas)

### Fase A — Determinismo + geração por seção (IA)  ⟵ maior ganho, sem backend
Ataca a variância direto e pode ser entregue primeiro, isoladamente.

- Estender `GenerateRequest` (`src/lib/ai/types.ts`) com `temperature?`, `seed?`, `schema?`.
- `src/lib/ai/providers/groq.ts`: enviar `temperature` (default **0.2**), `seed` (fixo,
  ex. 42), `top_p: 1`. Quando `schema` for passado, usar `response_format:
  { type: 'json_schema', json_schema: {...} }` (Structured Outputs da Groq) com fallback
  para `json_object`.
- Novo `src/lib/bep/sections.ts`: um registro `BlockType → { system, buildPrompt(ctx),
  schema }`, cobrindo as 9 seções geráveis (general_project, general_team,
  responsibility_matrix, deliverables_matrix, bim_uses_goals, bim_uses_infra,
  project_requirements, schedule, roles_responsibilities). Os schemas espelham os
  formatos de `content` já definidos em `src/store/bepStore.ts`. Função
  `generateSection(type, ctx)` → `aiProvider.generate({schema, json, tier:'pro'})` →
  `parseJSON` → retorna o `content` do bloco.
- Aposentar `analyzeFullBEP`; cada bloco passa a ter um botão **"Gerar seção com IA"**
  (padronizar a partir de `src/components/ui/AiSuggestionButton.tsx`), que usa como
  contexto os documentos do projeto ativo.

### Fase B — Backend (Python · FastAPI · markitdown)
Pasta `backend/`. Pequeno, file-based (sem banco).
- Endpoints:
  - `POST /api/convert` (multipart) → `{ markdown }` via `markitdown` (grava o upload em
    arquivo temporário e converte).
  - Projetos, persistidos em `backend/data/projects/<id>/` (`project.json` com blocos +
    metadados; `documents/<docId>.md`):
    - `GET /api/projects`, `POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}`
    - `POST /api/projects/{id}/documents` (file + `type`: edital|eir|ata) → converte e
      salva o `.md`; `GET /api/projects/{id}/documents`
- CORS liberado para a origem do Vite. `backend/requirements.txt`
  (fastapi, uvicorn, `markitdown[all]`, python-multipart) e `backend/README.md` com o
  passo a passo (`pip install -r requirements.txt` + `uvicorn main:app --port 8000`).

### Fase C — Frontend multi-projeto
- `src/lib/api.ts`: cliente REST do backend (base em `VITE_API_URL`, default
  `http://localhost:8000`).
- Estado: `src/store/projectStore.ts` (projeto ativo, lista de projetos, documentos) —
  o `bepStore` passa a refletir os blocos do projeto ativo (carregar/salvar via API).
- UI: seletor de projetos (criar/abrir/excluir) e gerenciador de documentos (upload com
  tipo + lista), no `Sidebar`/`Home`. Os botões "Gerar seção" usam o markdown dos
  documentos do projeto ativo como contexto.

## Arquivos críticos
- IA: `src/lib/ai/types.ts`, `src/lib/ai/providers/groq.ts`, novo `src/lib/bep/sections.ts`.
- Blocos/UI: `src/components/ui/AiSuggestionButton.tsx` (generalizar p/ "gerar seção"),
  `src/components/blocks/*`, aposentar `analyzeFullBEP` em `src/lib/gemini.ts` e a
  importação global em `src/App.tsx`.
- Backend: `backend/main.py`, `backend/requirements.txt`, `backend/README.md`.
- Frontend projetos: `src/lib/api.ts`, `src/store/projectStore.ts`,
  `src/components/layout/Sidebar.tsx` / `Home.tsx`, `src/App.tsx`.
- Config: `.env` / `.env.example` (`VITE_API_URL`), `README.md`, `.gitignore`
  (ignorar `backend/data/` e venv).

## Reuso (não reinventar)
- Camada de IA pronta: `aiProvider` + `parseJSON` (`src/lib/ai/index.ts`), config central.
- `AiSuggestionButton` / `RefineButton` / `suggestContent` já fazem geração por bloco —
  generalizar em vez de criar do zero.
- Formatos de `content` por bloco já existem em `src/store/bepStore.ts` → base dos schemas.
- Salvar/carregar projeto `.json` já existe em `App.tsx` (migra para a API do backend).
- `pdf.js` (`src/lib/pdf.ts`) permanece como fallback de leitura client-side se o backend
  estiver indisponível (opcional).

## Verificação (ponta a ponta)
1. Backend: `uvicorn main:app --port 8000`; `curl -F file=@edital.pdf
   localhost:8000/api/convert` retorna markdown; CRUD de projeto e upload de documento ok.
2. Frontend: criar projeto → anexar um edital (PDF) → vira `.md` salvo no projeto.
3. Em um bloco, clicar **"Gerar seção com IA"** preenche a seção a partir dos documentos.
4. **Teste de consistência:** rodar a mesma seção 2× com o mesmo documento → resultados
   praticamente iguais (graças a temperature baixa + seed fixo).
5. `npm run lint` + `npm run build` limpos; app roda na 8801 com backend na 8000.

## Fora de escopo (manter enxuto)
- Proxy do Groq pelo backend (esconder a chave) — natural agora que há backend, mas fica
  como opção futura; segue client-side por ora.
- Chunking/RAG de documentos muito grandes — por enquanto envia-se o markdown (truncado a
  um orçamento de tokens) por seção; revisitar se necessário.
- "Gerar todas as seções" de uma vez — trivial de adicionar depois (loop nos botões), mas
  o fluxo primário é por seção.
