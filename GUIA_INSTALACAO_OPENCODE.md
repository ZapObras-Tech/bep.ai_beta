# 🚀 Guia de Instalação Passo a Passo (via OpenCode)

> **Para quem é este guia?** Para alunos **totalmente iniciantes**, que nunca
> programaram. Você vai usar o **OpenCode** (um assistente de IA que roda comandos
> por você no terminal) para deixar o projeto **BEP.ai** funcionando do zero.
>
> **O que vamos fazer, em palavras simples:**
> 1. Instalar o **Node.js** (motor que roda o app no navegador).
> 2. Instalar o **Python** (necessário para a parte do NotebookLM).
> 3. Rodar o comando mágico **`npm run setup`** (instala tudo de uma vez).
> 4. Ligar o app com **`npm run dev`**.
>
> ⏱️ Tempo estimado: **20 a 40 minutos** (depende da sua internet).

---

## 📋 Antes de começar — o que é cada coisa

| Palavra | O que significa (em português claro) |
|---|---|
| **Terminal** | A "tela preta" onde você digita comandos para o computador. |
| **OpenCode** | Um robô de IA que entende o que você pede e digita os comandos por você. |
| **Node.js** | Programa que faz o site/app funcionar. |
| **Python** | Outra linguagem, usada aqui só para a função do NotebookLM. |
| **`npm`** | "Loja de peças" do Node.js — baixa as bibliotecas que o app precisa. |
| **`pip`** | A "loja de peças" do Python. |

> 💡 **Regra de ouro:** quando eu disser **"peça ao OpenCode"**, é só **digitar a
> frase em português** dentro do OpenCode e apertar **Enter**. O OpenCode mostra o
> comando que vai rodar e pede sua confirmação — basta **aceitar**.

---

## ✅ PASSO 0 — Abrir o projeto no OpenCode

1. Abra o **OpenCode**.
2. Abra a pasta do projeto. A pasta certa é a que tem o arquivo **`package.json`**:

   ```
   C:\Users\Luiz Sales\Downloads\01_Projetos\IFC.AI Beta\BEP.ai_beta
   ```

3. Para confirmar que está na pasta certa, **peça ao OpenCode**:

   > **Liste os arquivos desta pasta e me diga se existe um arquivo package.json aqui.**

   ✔️ **Resultado esperado:** ele deve mostrar `package.json`, `README.md`, a pasta
   `src/`, etc. Se aparecer **"package.json não encontrado"**, você abriu a pasta
   errada — volte e abra a pasta `BEP.ai_beta`.

---

## ✅ PASSO 1 — Verificar se Node.js e Python já existem

Às vezes já vêm instalados. Vamos checar antes de instalar à toa.

**Peça ao OpenCode:**

> **Verifique se o Node.js e o Python estão instalados. Rode `node -v`, `npm -v`,
> `python --version` e `pip --version` e me diga o resultado de cada um.**

✔️ **Resultado esperado (exemplo bom):**

```
node -v     ->  v20.11.0   (ou maior, ex.: v22)
npm -v      ->  10.2.4
python ...  ->  Python 3.11.5   (ou 3.10/3.12/3.13)
pip ...     ->  pip 23.x
```

- Se **todos** mostrarem um número de versão → **pule para o PASSO 4**. 🎉
- Se algum disser **"não é reconhecido como comando"** ou **"command not found"** →
  esse programa **falta**. Siga o passo correspondente abaixo.

> ⚠️ **Importante:** o Node.js precisa ser **versão 20 ou maior**. Se aparecer
> `v18` ou menor, instale a versão nova (Passo 2).

---

## ✅ PASSO 2 — Instalar o Node.js (se faltar)

**Peça ao OpenCode:**

> **Instale o Node.js versão LTS no Windows usando o winget. Use o comando
> `winget install OpenJS.NodeJS.LTS` e me avise quando terminar.**

O OpenCode vai mostrar algo como:

```
winget install OpenJS.NodeJS.LTS
```

➡️ **Confirme/aceite** quando ele pedir. Pode aparecer uma janela do Windows
pedindo permissão de administrador — clique em **"Sim"**.

> 🔁 **Não tem `winget`?** (Windows mais antigo) Então **peça ao OpenCode**:
> > **O winget não funcionou. Me dê o link oficial para baixar o instalador do
> > Node.js LTS e o passo a passo para instalar manualmente.**
> Ele vai te mandar para **https://nodejs.org** → baixe o botão **"LTS"** → execute
> o arquivo `.msi` → clique **Next / Next / Install** até o fim (pode deixar tudo no
> padrão).

### ⚠️ Passo crítico depois de instalar: REINICIE o terminal

O Windows só "enxerga" o Node.js novo depois de reabrir o terminal.

**Peça ao OpenCode:**

> **Acabei de instalar o Node.js. Preciso reiniciar o terminal? Depois rode
> `node -v` e `npm -v` de novo para confirmar que funcionou.**

✔️ **Resultado esperado:** `node -v` agora mostra `v20...` ou maior.
Se ainda disser "não reconhecido", **feche o OpenCode por completo e abra de novo**,
depois repita a verificação.

---

## ✅ PASSO 3 — Instalar o Python (se faltar)

**Peça ao OpenCode:**

> **Instale o Python no Windows usando o winget. Use
> `winget install Python.Python.3.12` e me avise quando terminar.**

➡️ **Confirme/aceite** os pedidos de permissão.

> 🔁 **Sem `winget`?** **Peça ao OpenCode:**
> > **Me dê o link oficial para baixar o Python e como instalar manualmente no
> > Windows. Lembre de marcar a opção "Add Python to PATH".**
> No instalador do **https://python.org**, **MARQUE a caixinha**
> **"Add Python to PATH"** na primeira tela — **isso é obrigatório**, senão o
> `pip` não funciona.

### Reinicie o terminal de novo

**Peça ao OpenCode:**

> **Instalei o Python. Reinicie o terminal se necessário e rode
> `python --version` e `pip --version` para confirmar.**

✔️ **Resultado esperado:** as duas linhas mostram versões (ex.: `Python 3.12.x` e
`pip 24.x`).

> 🪟 **Dica Windows:** se `python` não funcionar mas `py` funcionar, tudo bem — o
> projeto também aceita o comando `py`. Avise o OpenCode se isso acontecer.

---

## ✅ PASSO 4 — Rodar o `npm run setup` (o comando que instala tudo)

Este é o comando principal. Ele faz **3 coisas de uma vez**:

```
npm run setup
```

que por dentro executa:

```
1) npm install                              -> baixa as bibliotecas do app (Node)
2) pip install "notebooklm-py[browser]"     -> instala o NotebookLM (Python)
3) python -m playwright install chromium    -> baixa o navegador do login
```

**Peça ao OpenCode:**

> **Estamos na pasta do projeto BEP.ai_beta. Rode o comando `npm run setup` e
> acompanhe a saída. Se aparecer algum erro, pare e me explique em português
> simples o que deu errado e como resolver.**

### ⏳ O que você vai ver (é normal e demora):

- **Parte 1 (`npm install`):** muitas linhas correndo, uma barra de progresso. Pode
  levar de 2 a 10 minutos. No fim aparece algo como `added 320 packages`.
- **Parte 2 (`pip install`):** linhas com `Downloading...` e `Successfully
  installed notebooklm-py ...`.
- **Parte 3 (`playwright install chromium`):** baixa um navegador (uns 150 MB).
  Aparece `Downloading Chromium ...` e no fim `Chromium ... downloaded`.

✔️ **Deu certo quando:** o comando termina e **volta o cursor** sem nenhuma mensagem
em vermelho dizendo `Error`.

---

## 🆘 PASSO 4.1 — Se der erro no `npm run setup`

Não entre em pânico. Erros aqui são comuns e quase sempre fáceis. **Copie a mensagem
de erro e peça ao OpenCode:**

> **O `npm run setup` deu este erro: [cole aqui o texto vermelho]. Explique em
> português simples o que é e me dê o comando para corrigir.**

Erros mais comuns e a causa:

| Mensagem que aparece | O que significa | O que fazer |
|---|---|---|
| `'npm' não é reconhecido` | Node.js não instalado ou terminal não reiniciado | Volte ao **Passo 2** e reinicie o OpenCode. |
| `'pip' não é reconhecido` | Python sem "Add to PATH" | Reinstale o Python marcando **"Add Python to PATH"** (Passo 3). |
| `The browser window was closed during login` (depois, no app) | Faltou o Chromium | Rode só a parte 3: peça ao OpenCode **"rode `python -m playwright install chromium`"**. |
| `EACCES` / `permission denied` | Falta de permissão | Peça ao OpenCode para rodar o terminal como administrador. |

> 💡 Se a **parte 1 (`npm install`) deu certo** mas a **2 ou 3 falhou**, o app já
> roda — só a função NotebookLM fica indisponível até consertar o Python.

---

## ✅ PASSO 5 — Ligar o aplicativo

Agora a parte boa: ver o app na tela.

**Peça ao OpenCode:**

> **Rode `npm run dev` mas sem travar com timeout. Abra um terminal separado no
> Windows com `start cmd /c npm run dev` e me diga qual endereço abrir no
> navegador.**

✔️ **Resultado esperado:** uma **nova janela de terminal** (CMD) abre sozinha e
aparece algo assim:

```
VITE v6.x  ready in 800 ms
➜  Local:   http://localhost:3000/
```

➡️ **Abra o navegador** (Chrome/Edge) e acesse:

```
http://localhost:3000
```

🎉 **Pronto!** O BEP.ai está rodando no seu computador.

> ⛔ **Para desligar o app:** feche a janela do terminal que abriu ou aperte
> **`Ctrl + C`** dentro dela. Para ligar de novo depois, repita o passo acima
> (não precisa repetir o setup).

---

## ✅ PASSO 6 — Conectar ao NotebookLM (para os recursos de IA funcionarem)

A IA do app roda no **NotebookLM**. **Não há chave de API** — você só faz login com a
sua conta Google. O `npm run setup` do Passo 4 já instalou o CLI do NotebookLM.

1. Com o app aberto, clique no botão **"NotebookLM"** no topo da tela.
2. Clique em **Conectar** — abre uma janela do Chromium para o login Google.
3. Conclua o login e **escolha o notebook** que tem as suas fontes (edital/EIR/normas).

> 💡 Se preferir o terminal: `npm run notebooklm:login` (login) e
> `npm run notebooklm:check` (conferir se está autenticado).

---

## 📝 Resumo rápido (cola de bolso)

Frases para digitar no OpenCode, em ordem:

```
1. Liste os arquivos e confirme se existe package.json aqui.
2. Verifique node -v, npm -v, python --version e pip --version.
3. (se faltar Node)  Instale o Node.js LTS com winget.
4. (se faltar Python) Instale o Python 3.12 com winget (com Add to PATH).
5. Reinicie o terminal e confirme as versões de novo.
6. Rode `npm run setup` e me avise se der erro.
7. Rode `npm run dev` em um terminal separado (start cmd /c) para não travar.
8. No app, clique em "NotebookLM" → Conectar → faça login e escolha o notebook.
```

Abra **http://localhost:3000** no navegador. Fim. ✅

---

## ❓ Perguntas frequentes

**"Preciso rodar o `npm run setup` toda vez?"**
Não. Só **uma vez por computador**. Depois, é só `npm run dev` para ligar.

**"Travou numa pergunta do tipo (y/n) no terminal."**
Digite **`y`** e aperte **Enter** (significa "sim"). O OpenCode normalmente já
responde isso por você.

**"Posso fazer tudo isso sozinho, sem o OpenCode?"**
Pode — os mesmos comandos rodam num terminal comum (PowerShell). O OpenCode só
facilita explicando os erros em português.

**"Apareceu texto amarelo (warning). É erro?"**
Não. **Amarelo = aviso** (pode ignorar). Só **vermelho com a palavra `Error`** é
problema de verdade.
