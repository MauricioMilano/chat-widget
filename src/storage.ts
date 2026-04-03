// localStorage management for the chat widget

const STORAGE_PREFIX = "chat_widget_";

export interface WidgetSettings {
  streamingMode: boolean;
  theme: "light" | "dark";
}

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[ChatWidget] Failed to save localStorage: ${key}`, err);
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[ChatWidget] Failed to read localStorage: ${key}`, err);
    return null;
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[ChatWidget] Failed to remove localStorage: ${key}`, err);
  }
}

export function getSessionId(): string {
  let sessionId = safeGetItem(getKey("sessionId"));
  if (!sessionId) {
    sessionId = generateId();
    safeSetItem(getKey("sessionId"), sessionId);
  }
  return sessionId;
}

export function saveSessionId(sessionId: string): void {
  safeSetItem(getKey("sessionId"), sessionId);
}

export function getConversation(): StoredMessage[] {
  const data = safeGetItem(getKey("conversation"));
  if (!data) return [];
  try {
    return JSON.parse(data) as StoredMessage[];
  } catch {
    return [];
  }
}

export function saveConversation(messages: StoredMessage[]): void {
  safeSetItem(getKey("conversation"), JSON.stringify(messages));
}

export function clearConversation(): void {
  safeRemoveItem(getKey("conversation"));
}

export function getSettings(): WidgetSettings {
  const data = safeGetItem(getKey("settings"));
  if (!data) return { streamingMode: false, theme: "light" };
  try {
    const parsed = JSON.parse(data) as Partial<WidgetSettings>;
    return {
      streamingMode: parsed.streamingMode ?? false,
      theme: parsed.theme ?? "light",
    };
  } catch {
    return { streamingMode: false, theme: "light" };
  }
}

export function saveSettings(settings: WidgetSettings): void {
  safeSetItem(getKey("settings"), JSON.stringify(settings));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
