# BEP.ai — Gerador Inteligente de Plano de Execução BIM + Análise de IFC

O **BEP.ai** é um protótipo web educacional que faz três coisas:

1. **Cria Planos de Execução BIM (BEP/PEB)** alinhados à **ISO 19650** e **NBR 15965**, com auxílio de IA.
2. **Visualiza modelos IFC em 3D** diretamente no navegador.
3. **Analisa a consistência** entre o modelo IFC e o BEP usando um LLM (ex.: o IFC tem as disciplinas que o BEP declarou? o LOD é compatível?).

> ⚠️ **Protótipo para ensino.** Roda 100% no navegador e a chave de API vai embutida no
> bundle — adequado para uso **local/aula**, **não para produção**. Cada pessoa usa a
> própria chave. **Nunca comite o arquivo `.env`** (ele já está no `.gitignore`).

---

## 📚 Onde estão as bibliotecas?

As bibliotecas (ThatOpen, web-ifc, three.js, React…) **não são repositórios clonados**
dentro do projeto. Elas são **dependências npm**, instaladas em **`node_modules/`** quando
você roda `npm install`. O que controla quais bibliotecas e versões é o **`package.json`**.

| Biblioteca | Versão | Onde fica (após `npm install`) | Para quê |
|---|---|---|---|
| `@thatopen/components` | 3.4.6 | `node_modules/@thatopen/components/` | Engine 3D (cena, câmera, IfcLoader) |
| `@thatopen/components-front` | 3.4.3 | `node_modules/@thatopen/components-front/` | Recursos de frontend (Highlighter/seleção) |
| `@thatopen/fragments` | 3.4.5 | `node_modules/@thatopen/fragments/` | Formato Fragments (modelos carregados) |
| `@thatopen/ui` | 3.4.3 | `node_modules/@thatopen/ui/` | Componentes de UI `<bim-*>` (web components / Lit) |
| `@thatopen/ui-obc` | 3.4.2 | `node_modules/@thatopen/ui-obc/` | Componentes de UI prontos integrados ao engine |
| `web-ifc` | 0.0.77 | `node_modules/web-ifc/` | Parser de IFC em WebAssembly |
| `three` | 0.184.0 | `node_modules/three/` | Motor 3D (base do ThatOpen) |

**WASM do web-ifc:** os binários `web-ifc.wasm` e `web-ifc-mt.wasm` foram copiados para a
pasta **`public/`** e são servidos a partir da raiz (`/web-ifc.wasm`). Isso é proposital:
carregar o WASM via CDN em runtime causava o erro `WebAssembly.instantiate ... module is
not an object`. Se você atualizar a versão do `web-ifc`, recopie os `.wasm`:

```bash
cp node_modules/web-ifc/web-ifc.wasm node_modules/web-ifc/web-ifc-mt.wasm public/
```

> Os repositórios oficiais (caso queira estudar o código-fonte): GitHub
> [ThatOpen/engine_components](https://github.com/ThatOpen/engine_components),
> [ThatOpen/engine_web-ifc](https://github.com/ThatOpen/engine_web-ifc),
> [ThatOpen/engine_ui-components](https://github.com/ThatOpen/engine_ui-components).
> No app, porém, usamos as versões publicadas no npm — não é preciso clonar nada.

---

## 🏁 Como executar (passo a passo)

Pré-requisito: **Node.js 20+**.

```bash
# 1. Instale as dependências (cria a pasta node_modules/)
npm install

# 2. Configure a chave de IA
cp .env.example .env
#   edite .env e preencha VITE_GROQ_API_KEY (https://console.groq.com/keys)

# 3. Rode em desenvolvimento
npm run dev
#   abra http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (porta 3000) |
| `npm run lint` | checagem de tipos (`tsc --noEmit`) |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build de produção |

> ⚠️ **Modelo de IA:** use um modelo de **texto/chat** (ex.: `llama-3.3-70b-versatile`).
> Modelos `whisper-*` são de **transcrição de áudio** e **não funcionam** para gerar/analisar texto.

---

## ✨ Funcionalidades

- **Editor de BEP modular** — blocos arrastáveis (dados gerais, equipe, matriz de
  responsabilidades, entregáveis, usos BIM, LOD/LOIN, cronograma, papéis…).
- **Importar EIR (PDF)** — extrai o texto do edital (pdf.js) e auto-preenche o BEP com IA.
- **Sugestões e refino com IA** dentro dos blocos.
- **Kanban** dos marcos do projeto (drag-and-drop).
- **Visualizador IFC 3D** — carregar arquivo local, navegar, selecionar elementos, enquadrar.
- **Análise de Consistência IFC × BEP** — relatório (ok / alerta / erro por item) gerado por IA.
- **Salvar/Carregar projeto** em `.json` + persistência automática (localStorage).
- **Exportação** do documento para HTML/PDF.

---

## 🗂️ Estrutura do projeto

```
BEP.ai_beta/
├─ public/                      # arquivos servidos na raiz
│  ├─ web-ifc.wasm              # parser IFC (WASM) — NÃO remover
│  └─ web-ifc-mt.wasm
├─ src/
│  ├─ main.tsx                  # ponto de entrada (monta React + ErrorBoundary)
│  ├─ App.tsx                   # layout, troca de telas, salvar/carregar projeto
│  ├─ index.css                 # estilos (Tailwind)
│  ├─ vite-env.d.ts             # tipos das variáveis VITE_*
│  │
│  ├─ store/
│  │  └─ bepStore.ts            # estado global (Zustand + persist no localStorage)
│  │
│  ├─ lib/
│  │  ├─ ai/                    # 🧠 camada de IA agnóstica de provedor
│  │  │  ├─ types.ts            # interface AIProvider
│  │  │  ├─ config.ts           # provedor ativo + modelos (1 lugar p/ trocar)
│  │  │  ├─ index.ts            # registro de provedores + parseJSON
│  │  │  └─ providers/
│  │  │     ├─ groq.ts          # Groq (padrão, compatível com OpenAI)
│  │  │     └─ gemini.ts        # Google Gemini (alternativa)
│  │  ├─ gemini.ts              # prompts do BEP (delegam para a camada ai/)
│  │  ├─ pdf.ts                 # extração de texto de PDF (pdf.js)
│  │  ├─ ifc/
│  │  │  ├─ viewer.ts           # visualizador 3D (ThatOpen Engine)
│  │  │  └─ extract.ts          # extração de dados do IFC (web-ifc puro)
│  │  ├─ analysis.ts            # resume o BEP + pede análise IFC×BEP à IA
│  │  └─ export.ts              # exportação PDF (jsPDF)
│  │
│  └─ components/
│     ├─ ErrorBoundary.tsx      # captura erros de render
│     ├─ layout/
│     │  ├─ Sidebar.tsx         # navegação (Início/Editor/Kanban/IFC)
│     │  ├─ Home.tsx            # tela inicial
│     │  ├─ Editor.tsx          # orquestra os blocos do BEP
│     │  ├─ KanbanBoard.tsx     # quadro Kanban dos marcos
│     │  └─ IfcAnalysis.tsx     # tela IFC: viewer 3D + relatório (lazy-loaded)
│     ├─ blocks/                # os blocos do documento BEP
│     └─ ui/                    # botões de IA (sugerir/refinar)
├─ .env.example                 # modelo de variáveis de ambiente
├─ package.json                 # dependências e scripts
└─ vite.config.ts               # config do Vite (injeta as chaves de API)
```

---

## 🧠 Como funciona a IA (camada agnóstica)

Toda chamada de IA passa por `src/lib/ai/`. Isso permite **trocar de modelo/provedor em um
único lugar**, sem mexer no resto do app.

- `config.ts` → `ACTIVE_PROVIDER` define o provedor (padrão `'groq'`) e os modelos.
- `providers/groq.ts` e `providers/gemini.ts` implementam a interface `AIProvider`.
- `gemini.ts` (apesar do nome) só monta os **prompts** do BEP e chama `aiProvider`.

**Trocar o modelo:** edite `VITE_GROQ_MODEL` no `.env`.
**Trocar o provedor:** mude `ACTIVE_PROVIDER` em `config.ts`.
**Adicionar um novo provedor (ex.: Claude):** crie `providers/claude.ts` implementando
`AIProvider`, registre-o em `index.ts` e aponte `ACTIVE_PROVIDER` para ele.

---

## 🧱 Como funciona o IFC

- **`viewer.ts`** monta a cena 3D com o ThatOpen Engine (SimpleScene/SimpleCamera/
  SimpleRenderer), carrega o arquivo via `IfcLoader` (WASM local de `public/`) e enquadra
  a câmera com `fitToSphere`. Inclui Highlighter (clique para selecionar).
- **`extract.ts`** lê o mesmo arquivo com o `web-ifc` puro e gera um **resumo compacto**
  (projeto, schema, pavimentos, contagem por categoria, disciplinas) — propositalmente
  separado do viewer para a análise não depender da API 3D.
- **`analysis.ts`** junta esse resumo com um resumo do BEP e pede à IA um relatório de
  consistência estruturado.

---

## 🔄 Fluxo de uso em aula

1. **Editor** → importe um EIR (PDF) ou preencha os blocos (gera com IA via Groq).
2. **IFC / Análise** → "Carregar IFC" (arquivo próprio) ou **"Carregar exemplo"** (modelo
   `public/exemplo.ifc` que já vem no projeto) para abrir um modelo em 3D + ver o resumo.
3. **"Analisar consistência"** → a IA compara IFC × BEP e gera o relatório.
4. **Salvar** o projeto em `.json` para reabrir/compartilhar depois.

---

## 🛠️ Stack

- **Frontend:** React 19 + TypeScript + Vite 6
- **Estilo:** Tailwind CSS · ícones Lucide · animações Motion
- **Estado:** Zustand (com `persist` em localStorage)
- **IA:** camada própria em `src/lib/ai/` — padrão **Groq** (compatível com OpenAI)
- **IFC / 3D:** ThatOpen Engine + web-ifc (WASM) + three.js
- **PDF:** pdf.js (leitura) · jsPDF / html-to-image (exportação)

---

## ⚠️ Segurança

- A chave de API é embutida no bundle do navegador (limitação aceita no protótipo).
  Para **produção**, use um backend que faça proxy das chamadas de IA.
- `.env` está no `.gitignore`. **Se uma chave vazar, revogue-a imediatamente** no console
  do provedor e gere outra.
