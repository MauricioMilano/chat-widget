// API communication layer - handles normal and streaming modes

export interface ChatConfig {
  baseUrl: string;
  auth?: string;
  sessionId: string;
  messageFieldName?: string;
  sessionIdFieldName?: string;
  responseField?: string;
  streamingEndpointPath?: string;
}

export type StreamCallback = (chunk: string, done: boolean) => void;

function buildHeaders(auth?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
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
  timeoutMs = 30000,
): Promise<string> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const messageField = config.messageFieldName ?? "chatInput";
  const sessionField = config.sessionIdFieldName ?? "sessionId";
  const responseField = config.responseField ?? "output";

  const url = `${baseUrl}/webhook/chat`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const mergedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(config.auth),
      body: JSON.stringify({
        [messageField]: message,
        [sessionField]: config.sessionId,
      }),
      signal: mergedSignal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return (data[responseField] as string) ?? "";
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendChatMessageStreaming(
  config: ChatConfig,
  message: string,
  onChunk: StreamCallback,
  signal?: AbortSignal,
  timeoutMs = 30000,
): Promise<void> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const messageField = config.messageFieldName ?? "chatInput";
  const sessionField = config.sessionIdFieldName ?? "sessionId";
  const responseField = config.responseField ?? "output";
  const streamingPath =
    config.streamingEndpointPath ?? "/webhook/chat-streaming";

  const url = `${baseUrl}${streamingPath}`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const mergedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(config.auth),
    body: JSON.stringify({
      [messageField]: message,
      [sessionField]: config.sessionId,
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

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("data:")) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === "[DONE]") {
            onChunk(fullText, true);
            return;
          }
          try {
            const parsed = JSON.parse(dataStr) as Record<string, unknown>;
            const text =
              (parsed[responseField] as string) ??
              (parsed.text as string) ??
              (parsed.content as string) ??
              "";
            if (text) {
              fullText += text;
              onChunk(fullText, false);
            }
          } catch {
            fullText += dataStr;
            onChunk(fullText, false);
          }
        } else {
          fullText += trimmed;
          onChunk(fullText, false);
        }
      }
    }

    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data:")) {
        const dataStr = trimmed.slice(5).trim();
        if (dataStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(dataStr) as Record<string, unknown>;
            const text =
              (parsed[responseField] as string) ??
              (parsed.text as string) ??
              (parsed.content as string) ??
              "";
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
