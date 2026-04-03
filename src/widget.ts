// Main widget class - manages state and lifecycle

import { ChatUI } from "./ui";
import { sendChatMessage, sendChatMessageStreaming } from "./api";
import {
  getSessionId,
  getConversation,
  saveConversation,
  clearConversation,
  getSettings,
  saveSettings,
  generateMessageId,
  type StoredMessage,
  type WidgetSettings,
} from "./storage";

export interface ThemeColors {
  bgPrimary?: string;
  bgSecondary?: string;
  bgTertiary?: string;
  bgInput?: string;
  bgMessages?: string;
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  userBubble?: string;
  aiBubble?: string;
  border?: string;
  shadow?: string;
  accent?: string;
  accentHover?: string;
  danger?: string;
  dangerHover?: string;
  typingDot?: string;
  menuBg?: string;
  menuHover?: string;
  scrollThumb?: string;
  scrollTrack?: string;
  panelBg?: string;
  headerBg?: string;
}

export interface WidgetConfig {
  // Required
  baseUrl: string;

  // Auth
  auth?: string;

  // Text
  widgetTitle?: string;
  widgetSubtitle?: string;
  inputPlaceholder?: string;
  welcomeMessage?: string;

  // Position & Dimensions
  position?: "bottom-right" | "bottom-left";
  panelWidth?: number;
  panelHeight?: number;

  // Colors (legacy single accent override)
  accentColor?: string;

  // Full theme customization
  lightTheme?: ThemeColors;
  darkTheme?: ThemeColors;

  // API
  apiTimeoutMs?: number;
  normalEndpointPath?: string;
  streamingEndpointPath?: string;
  messageFieldName?: string;
  sessionIdFieldName?: string;
  responseField?: string;

  // Behavior
  autoOpen?: boolean;
  sessionId?: string;

  // Feature Toggles
  showStreamingToggle?: boolean;
  showThemeToggle?: boolean;
  showClearButton?: boolean;
}

const DEFAULTS = {
  widgetTitle: "Chat Assistant",
  widgetSubtitle: "Always here to help",
  inputPlaceholder: "Type a message...",
  welcomeMessage: "Hello! How can I help you today?",
  position: "bottom-right" as const,
  panelWidth: 380,
  panelHeight: 560,
  apiTimeoutMs: 30000,
  normalEndpointPath: "/webhook/chat",
  streamingEndpointPath: "/webhook/chat-streaming",
  messageFieldName: "chatInput",
  sessionIdFieldName: "sessionId",
  responseField: "output",
  autoOpen: false,
  showStreamingToggle: true,
  showThemeToggle: true,
  showClearButton: true,
};

export class ChatWidget {
  private config: Required<WidgetConfig>;
  private sessionId: string;
  private settings: WidgetSettings;
  private conversation: StoredMessage[];
  private ui: ChatUI | null = null;
  private shadowHost: HTMLElement | null = null;
  private isProcessing = false;
  private abortController: AbortController | null = null;

  constructor(userConfig: WidgetConfig) {
    this.config = { ...DEFAULTS, ...userConfig } as Required<WidgetConfig>;
    this.sessionId =
      this.config.sessionId || getSessionId(this.config.sessionId);
    this.settings = getSettings();
    this.conversation = getConversation();
  }

  public init(): void {
    this.shadowHost = document.createElement("div");
    this.shadowHost.id = "chat-widget-host";
    document.body.appendChild(this.shadowHost);

    this.ui = new ChatUI(
      this.shadowHost,
      {
        theme: this.settings.theme,
        streamingMode: this.settings.streamingMode,
        config: this.config,
      },
      {
        onSendMessage: (message: string) => this.handleSendMessage(message),
        onToggleStreaming: () => this.handleToggleStreaming(),
        onClearConversation: () => this.handleClearConversation(),
        onCloseChat: () => this.handleCloseChat(),
        onThemeChange: (theme: "light" | "dark") =>
          this.handleThemeChange(theme),
      },
    );

    if (this.conversation.length > 0) {
      this.ui.restoreMessages(this.conversation);
    }

    if (this.config.autoOpen) {
      this.open();
    }
  }

  public open(): void {
    this.ui?.open();
  }

  public close(): void {
    this.ui?.close();
  }

  public destroy(): void {
    this.abortController?.abort();
    if (this.shadowHost?.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
    }
    this.shadowHost = null;
    this.ui = null;
  }

  private async handleSendMessage(message: string): Promise<void> {
    if (this.isProcessing || !this.ui) return;

    this.isProcessing = true;
    this.abortController = new AbortController();
    const timestamp = Date.now();

    this.ui.addUserMessage(message, timestamp);
    this.conversation.push({
      id: generateMessageId(),
      role: "user",
      content: message,
      timestamp,
    });
    saveConversation(this.conversation);

    this.ui.setLoading(true);

    try {
      if (this.settings.streamingMode) {
        await this.handleStreamingMessage(message);
      } else {
        await this.handleNormalMessage(message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      this.ui.addErrorMessage(`Error: ${errorMessage}`);
    } finally {
      this.ui.hideTyping();
      this.ui.setLoading(false);
      this.isProcessing = false;
    }
  }

  private async handleNormalMessage(message: string): Promise<void> {
    if (!this.ui) return;

    this.ui.showTyping();

    const response = await sendChatMessage(
      {
        baseUrl: this.config.baseUrl,
        auth: this.config.auth,
        sessionId: this.sessionId,
        messageFieldName: this.config.messageFieldName,
        sessionIdFieldName: this.config.sessionIdFieldName,
        responseField: this.config.responseField,
      },
      message,
      this.abortController?.signal,
      this.config.apiTimeoutMs,
    );

    this.ui.hideTyping();

    const timestamp = Date.now();
    this.ui.addAssistantMessage(response, timestamp);
    this.conversation.push({
      id: generateMessageId(),
      role: "assistant",
      content: response,
      timestamp,
    });
    saveConversation(this.conversation);
  }

  private async handleStreamingMessage(message: string): Promise<void> {
    if (!this.ui) return;

    this.ui.showTyping();

    const streamingEl = this.ui.createStreamingMessage();
    if (!streamingEl) {
      throw new Error("Failed to create streaming message element");
    }
    let fullResponse = "";

    await sendChatMessageStreaming(
      {
        baseUrl: this.config.baseUrl,
        auth: this.config.auth,
        sessionId: this.sessionId,
        messageFieldName: this.config.messageFieldName,
        sessionIdFieldName: this.config.sessionIdFieldName,
        responseField: this.config.responseField,
        streamingEndpointPath: this.config.streamingEndpointPath,
      },
      message,
      (chunk: string, done: boolean) => {
        fullResponse = chunk;
        this.ui!.hideTyping();
        this.ui!.updateStreamingMessage(streamingEl, chunk);

        if (done) {
          const timestamp = Date.now();
          this.conversation.push({
            id: generateMessageId(),
            role: "assistant",
            content: fullResponse,
            timestamp,
          });
          saveConversation(this.conversation);
        }
      },
      this.abortController?.signal,
      this.config.apiTimeoutMs,
    );
  }

  private handleToggleStreaming(): void {
    this.settings.streamingMode = !this.settings.streamingMode;
    saveSettings(this.settings);
    this.ui?.updateStreamingToggle(this.settings.streamingMode);
  }

  private handleClearConversation(): void {
    this.conversation = [];
    clearConversation();
    this.ui?.clearMessages();
  }

  private handleCloseChat(): void {
    this.close();
  }

  private handleThemeChange(theme: "light" | "dark"): void {
    this.settings.theme = theme;
    saveSettings(this.settings);
    this.ui?.updateStyles(theme);
    this.ui?.updateThemeButtons(theme);
  }
}
