# Chat Widget

Um chat widget embeddável, pronto para produção, com suporte a streaming, temas e persistência local.

## Features

- **Fácil integração**: Importe com uma única tag `<script>`
- **Streaming SSE**: Alterne entre modo normal e streaming em tempo real
- **Temas**: Light e Dark, salvos no localStorage
- **Shadow DOM**: CSS isolado, sem conflitos com a página host
- **Persistência**: Conversas salvas localmente e no servidor via `sessionId`
- **Responsivo**: Funciona em desktop e mobile
- **Zero dependências**: Vanilla TypeScript, bundle único de ~27KB

## Quick Start

### 1. Build

```bash
# Copie o .env e configure
cp .env.example .env

# Instale e build
npm install
npm run build
```

### 2. Importe no seu frontend

**Opção A — Atributos na tag:**

```html
<script
  src="chat-widget.js"
  data-base-url="https://seu-servidor.com"
  data-auth="seu-token"
></script>
```

**Opção B — Objeto de configuração:**

```html
<script>
  window.ChatWidgetConfig = {
    baseUrl: "https://seu-servidor.com",
    auth: "seu-token", // opcional
    widgetTitle: "Meu Assistente",
    widgetSubtitle: "Powered by AI",
    inputPlaceholder: "Pergunte algo...",
    welcomeMessage: "Olá! Como posso ajudar?",
    position: "bottom-left",
    panelWidth: 400,
    panelHeight: 600,
    accentColor: "#10b981",
    apiTimeoutMs: 60000,
    autoOpen: true,
    showStreamingToggle: false,
  };
</script>
<script src="chat-widget.js"></script>
```

**Opção C — Todos os atributos na tag:**

```html
<script
  src="chat-widget.js"
  data-base-url="https://seu-servidor.com"
  data-auth="seu-token"
  data-title="Meu Assistente"
  data-subtitle="Powered by AI"
  data-placeholder="Pergunte algo..."
  data-welcome="Olá! Como posso ajudar?"
  data-position="bottom-left"
  data-panel-width="400"
  data-panel-height="600"
  data-accent-color="#10b981"
  data-timeout="60000"
  data-auto-open="true"
  data-show-streaming="false"
  data-show-theme="true"
  data-show-clear="true"
></script>
```

> O widget auto-inicializa quando o DOM está pronto. Sem configuração, exibe um warning no console.

## Configuração

### Parâmetros obrigatórios

| Parâmetro | Tipo     | Obrigatório | Descrição                                                |
| --------- | -------- | :---------: | -------------------------------------------------------- |
| `baseUrl` | `string` |     ✅      | URL base do seu servidor (ex: `https://n8n.example.com`) |

### Parâmetros opcionais

#### Texto

| Parâmetro          | data-attribute     | Tipo     | Default                              | Descrição               |
| ------------------ | ------------------ | -------- | ------------------------------------ | ----------------------- |
| `widgetTitle`      | `data-title`       | `string` | `"Chat Assistant"`                   | Título no header        |
| `widgetSubtitle`   | `data-subtitle`    | `string` | `"Always here to help"`              | Subtítulo no header     |
| `inputPlaceholder` | `data-placeholder` | `string` | `"Type a message..."`                | Placeholder do input    |
| `welcomeMessage`   | `data-welcome`     | `string` | `"Hello! How can I help you today?"` | Mensagem de boas-vindas |

#### Posição e Dimensões

| Parâmetro     | data-attribute      | Tipo                                | Default          | Descrição              |
| ------------- | ------------------- | ----------------------------------- | ---------------- | ---------------------- |
| `position`    | `data-position`     | `"bottom-right"` \| `"bottom-left"` | `"bottom-right"` | Posição do widget      |
| `panelWidth`  | `data-panel-width`  | `number`                            | `380`            | Largura do painel (px) |
| `panelHeight` | `data-panel-height` | `number`                            | `560`            | Altura do painel (px)  |

#### Cores

| Parâmetro     | data-attribute      | Tipo     | Default                                  | Descrição                 |
| ------------- | ------------------- | -------- | ---------------------------------------- | ------------------------- |
| `accentColor` | `data-accent-color` | `string` | `"#4361ee"` (light) / `"#7c3aed"` (dark) | Cor de destaque do widget |

#### Temas Completos

Para controle total das cores, use os objetos `lightTheme` e `darkTheme` via `window.ChatWidgetConfig`, ou passe JSON nos atributos `data-light-theme` e `data-dark-theme`.

**Cada objeto de tema suporta 23 tokens:**

| Token           | Descrição                                       |
| --------------- | ----------------------------------------------- |
| `bgPrimary`     | Fundo principal do painel                       |
| `bgSecondary`   | Fundo do header e input area                    |
| `bgTertiary`    | Fundo de elementos terciários (hover, toggles)  |
| `bgInput`       | Fundo do campo de input                         |
| `bgMessages`    | Fundo da área de mensagens                      |
| `textPrimary`   | Cor do texto principal                          |
| `textSecondary` | Cor do texto secundário                         |
| `textMuted`     | Cor do texto desativado/subtítulo               |
| `userBubble`    | Fundo da bolha do usuário                       |
| `aiBubble`      | Fundo da bolha da IA                            |
| `border`        | Cor das bordas e divisores                      |
| `shadow`        | Cor das sombras                                 |
| `accent`        | Cor de destaque (botões, links, toggles ativos) |
| `accentHover`   | Cor de destaque no hover                        |
| `danger`        | Cor de elementos de perigo (botão close)        |
| `dangerHover`   | Cor de perigo no hover                          |
| `typingDot`     | Cor dos pontos do typing indicator              |
| `menuBg`        | Fundo do dropdown menu                          |
| `menuHover`     | Fundo do menu item no hover                     |
| `scrollThumb`   | Cor do thumb da scrollbar                       |
| `scrollTrack`   | Cor do track da scrollbar                       |
| `panelBg`       | Background do painel (suporta gradientes CSS)   |
| `headerBg`      | Background do header (suporta gradientes CSS)   |

**Exemplo com tema completo via JS:**

```html
<script>
  window.ChatWidgetConfig = {
    baseUrl: "https://seu-servidor.com",
    lightTheme: {
      bgPrimary: "#fefefe",
      bgSecondary: "#f0f0f0",
      accent: "#ff6b35",
      accentHover: "#e55a2b",
      userBubble: "#ff6b35",
      headerBg: "linear-gradient(135deg, #ff6b35 0%, #f7c948 100%)",
      panelBg: "linear-gradient(180deg, #fefefe 0%, #f0f0f0 100%)",
    },
    darkTheme: {
      bgPrimary: "#0d1117",
      bgSecondary: "#161b22",
      accent: "#58a6ff",
      accentHover: "#79b8ff",
      userBubble: "#58a6ff",
      headerBg: "linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%)",
      panelBg: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",
    },
  };
</script>
<script src="chat-widget.js"></script>
```

**Exemplo via data attributes (JSON):**

```html
<script
  src="chat-widget.js"
  data-base-url="https://seu-servidor.com"
  data-light-theme='{"accent":"#ff6b35","userBubble":"#ff6b35","headerBg":"linear-gradient(135deg, #ff6b35, #f7c948)"}'
  data-dark-theme='{"bgPrimary":"#0d1117","accent":"#58a6ff","userBubble":"#58a6ff"}'
></script>
```

> Apenas os tokens que você especificar são sobrescritos. Os demais usam os valores padrão do tema.

#### API

| Parâmetro               | data-attribute            | Tipo     | Default                     | Descrição                            |
| ----------------------- | ------------------------- | -------- | --------------------------- | ------------------------------------ |
| `auth`                  | `data-auth`               | `string` | —                           | Token de autenticação (Bearer)       |
| `apiTimeoutMs`          | `data-timeout`            | `number` | `30000`                     | Timeout das requests (ms)            |
| `normalEndpointPath`    | `data-normal-endpoint`    | `string` | `"/webhook/chat"`           | Path do endpoint normal              |
| `streamingEndpointPath` | `data-streaming-endpoint` | `string` | `"/webhook/chat-streaming"` | Path do endpoint streaming           |
| `messageFieldName`      | `data-message-field`      | `string` | `"chatInput"`               | Nome do campo da mensagem no request |
| `sessionIdFieldName`    | `data-session-field`      | `string` | `"sessionId"`               | Nome do campo da sessão no request   |
| `responseField`         | `data-response-field`     | `string` | `"output"`                  | Campo da resposta no JSON            |

#### Comportamento

| Parâmetro   | data-attribute    | Tipo      | Default     | Descrição                   |
| ----------- | ----------------- | --------- | ----------- | --------------------------- |
| `autoOpen`  | `data-auto-open`  | `boolean` | `false`     | Abre o chat automaticamente |
| `sessionId` | `data-session-id` | `string`  | auto-gerado | ID de sessão customizado    |

#### Toggles de Features

| Parâmetro             | data-attribute        | Tipo      | Default | Descrição                          |
| --------------------- | --------------------- | --------- | ------- | ---------------------------------- |
| `showStreamingToggle` | `data-show-streaming` | `boolean` | `true`  | Mostra toggle de streaming no menu |
| `showThemeToggle`     | `data-show-theme`     | `boolean` | `true`  | Mostra toggle de tema no menu      |
| `showClearButton`     | `data-show-clear`     | `boolean` | `true`  | Mostra botão de limpar conversa    |

### Endpoints esperados

Por padrão, o widget faz requests para:

| Modo      | Endpoint                           | Método |
| --------- | ---------------------------------- | ------ |
| Normal    | `{baseUrl}/webhook/chat`           | `POST` |
| Streaming | `{baseUrl}/webhook/chat-streaming` | `POST` |

> Os paths são configuráveis via `normalEndpointPath` e `streamingEndpointPath`.

### Formato da request/response

**Request body:**

```json
{
  "chatInput": "Mensagem do usuário",
  "sessionId": "id-único-gerado-automaticamente"
}
```

> Os nomes dos campos são configuráveis via `messageFieldName` e `sessionIdFieldName`.

**Response:**

```json
{
  "output": "Resposta da IA"
}
```

> O campo da resposta é configurável via `responseField`.

### Streaming

No modo streaming, o widget espera chunks em formato SSE (`data: {...}`) ou texto puro. Suporta o campo `[DONE]` para finalizar.

## Menu do Widget

Clique no ícone `⋮` no header para acessar:

- **Streaming Mode** — Liga/desliga streaming em tempo real
- **Tema** — Alterna entre Light e Dark
- **Clear Conversation** — Limpa o histórico local
- **Close Chat** — Fecha o painel

## Controle Programático

O widget é exposto globalmente como `window.ChatWidget`:

```js
// Abrir o chat
window.ChatWidget.open();

// Fechar o chat
window.ChatWidget.close();

// Destruir o widget (aborta requests pendentes)
window.ChatWidget.destroy();
```

## LocalStorage

O widget salva automaticamente:

| Key                        | Conteúdo                                       |
| -------------------------- | ---------------------------------------------- |
| `chat_widget_sessionId`    | ID único da sessão (gerado na primeira visita) |
| `chat_widget_conversation` | Histórico de mensagens (array JSON)            |
| `chat_widget_settings`     | Preferências: `{ streamingMode, theme }`       |

> Apenas a última mensagem é enviada ao servidor. O histórico completo fica no servidor vinculado ao `sessionId`.

## Desenvolvimento

```bash
npm install          # instala dependências
npm run build        # gera dist/chat-widget.js
npm run dev          # watch mode
npm run typecheck    # verifica tipos (tsc --noEmit)
```

### Docker (teste local)

```bash
# Configure o .env primeiro
cp .env.example .env

# Build do widget + container
npm run build
docker build -t chat-widget-test .
docker run -d --name chat-widget -p 80:80 chat-widget-test

# Acesse http://localhost
```

## Estrutura do Projeto

```
chat-widget/
├── src/
│   ├── index.ts      # Entry point — lê config e auto-inicializa
│   ├── widget.ts     # Classe principal — estado e orquestração
│   ├── ui.ts         # Renderização com Shadow DOM
│   ├── api.ts        # Comunicação API (normal + SSE streaming)
│   ├── storage.ts    # localStorage com tratamento de erros
│   └── styles.ts     # CSS com temas light/dark
├── test/
│   └── index.html    # Página de teste (placeholders substituídos no build)
├── dist/
│   └── chat-widget.js  # Bundle minificado (~27KB)
├── build.js          # Script de build com esbuild + env injection
├── Dockerfile        # Nginx para teste local
├── .env              # Variáveis locais (não versionado)
└── .env.example      # Template de variáveis
```

## Build System

O `build.js`:

1. Lê o `.env` local
2. Substitui os placeholders no `test/index.html`
3. Gera o bundle minificado com esbuild

Isso permite testar localmente com suas credenciais reais sem expô-las no git.

## Licença

MIT
