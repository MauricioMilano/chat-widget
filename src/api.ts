// API communication layer - handles normal and streaming modes

export interface ChatConfig {
  baseUrl: string;
  auth?: string;
  sessionId: string;
}

export interface ChatResponse {
  output: string;
}

export type StreamCallback = (chunk: string, done: boolean) => void;

const DEFAULT_TIMEOUT = 30000;

function buildHeaders(auth?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    // Avoid double "Bearer " prefix
    const token = auth.startsWith("Bearer ") ? auth : `Bearer ${auth}`;
    headers["Authorization"] = token;
  }
  return headers;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export async function sendChatMessage(
  config: ChatConfig,
  message: string,
  signal?: AbortSignal,
): Promise<string> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const url = `${baseUrl}/webhook/chat`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    DEFAULT_TIMEOUT,
  );

  // Merge external signal with our timeout
  const mergedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(config.auth),
      body: JSON.stringify({
        chatInput: message,
        sessionId: config.sessionId,
      }),
      signal: mergedSignal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ChatResponse;
    return data.output ?? "";
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendChatMessageStreaming(
  config: ChatConfig,
  message: string,
  onChunk: StreamCallback,
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const url = `${baseUrl}/webhook-test/chat-streaming`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    DEFAULT_TIMEOUT,
  );

  const mergedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(config.auth),
    body: JSON.stringify({
      chatInput: message,
      sessionId: config.sessionId,
    }),
    signal: mergedSignal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Streaming not supported: response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process SSE-like or plain text chunks
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Handle SSE format: data: {...}
        if (trimmed.startsWith("data:")) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === "[DONE]") {
            onChunk(fullText, true);
            return;
          }
          try {
            const parsed = JSON.parse(dataStr) as {
              output?: string;
              text?: string;
              content?: string;
            };
            const text = parsed.output ?? parsed.text ?? parsed.content ?? "";
            if (text) {
              fullText += text;
              onChunk(fullText, false);
            }
          } catch {
            // Not JSON, treat as plain text
            fullText += dataStr;
            onChunk(fullText, false);
          }
        } else {
          // Plain text chunk
          fullText += trimmed;
          onChunk(fullText, false);
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data:")) {
        const dataStr = trimmed.slice(5).trim();
        if (dataStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(dataStr) as {
              output?: string;
              text?: string;
              content?: string;
            };
            const text = parsed.output ?? parsed.text ?? parsed.content ?? "";
            if (text) fullText += text;
          } catch {
            fullText += dataStr;
          }
        }
      } else {
        fullText += trimmed;
      }
    }

    onChunk(fullText, true);
  } catch (error) {
    reader.cancel();
    throw error;
  }
}
