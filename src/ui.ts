// UI rendering with Shadow DOM

import { getStyles } from "./styles";
import type { StoredMessage } from "./storage";

export interface UIConfig {
  theme: "light" | "dark";
  streamingMode: boolean;
}

export interface UICallbacks {
  onSendMessage: (message: string) => void;
  onToggleStreaming: () => void;
  onClearConversation: () => void;
  onCloseChat: () => void;
  onThemeChange: (theme: "light" | "dark") => void;
}

export class ChatUI {
  private shadow: ShadowRoot;
  private container: HTMLElement;
  private panel: HTMLElement | null = null;
  private chatButton: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private chatInput: HTMLTextAreaElement | null = null;
  private sendButton: HTMLButtonElement | null = null;
  private menuDropdown: HTMLElement | null = null;
  private menuButton: HTMLButtonElement | null = null;
  private typingIndicator: HTMLElement | null = null;
  private isOpen = false;
  private isMenuOpen = false;
  private callbacks: UICallbacks;
  private config: UIConfig;

  constructor(
    container: HTMLElement,
    config: UIConfig,
    callbacks: UICallbacks,
  ) {
    this.container = container;
    this.config = config;
    this.callbacks = callbacks;

    this.shadow = container.attachShadow({ mode: "open" });
    this.render();
  }

  private render(): void {
    const styleEl = document.createElement("style");
    styleEl.textContent = getStyles(this.config.theme);
    this.shadow.appendChild(styleEl);

    this.renderStructure();
    this.bindEvents();
  }

  private renderStructure(): void {
    // Main wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "chat-widget-wrapper";

    // Floating button
    this.chatButton = this.createElement("button", {
      className: "chat-button",
      innerHTML: `
        <svg class="icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      `,
    });
    wrapper.appendChild(this.chatButton);

    // Chat panel
    this.panel = this.createElement("div", { className: "chat-panel" });
    this.panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="chat-header-icon">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
          </div>
          <div>
            <div class="chat-header-title">Chat Assistant</div>
            <div class="chat-header-subtitle">Always here to help</div>
          </div>
        </div>
        <button class="menu-button" aria-label="Menu">
          <svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
      </div>
      <div class="menu-dropdown">
        <button class="menu-item streaming-toggle">
          <svg viewBox="0 0 24 24"><path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 1.62-.49 3.13-1.32 4.39l1.46 1.46C21.32 15.97 22 14.07 22 12c0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V3.03c-4.06.5-7.18 3.91-7.18 8.03 0 4.57 3.72 8.28 8.28 8.28 2.4 0 4.56-1.02 6.08-2.65l-1.46-1.46C15.55 16.53 13.86 19 12 19z"/></svg>
          <span class="menu-item-label">Streaming Mode</span>
          <div class="toggle-indicator${this.config.streamingMode ? " active" : ""}"></div>
        </button>
        <div class="menu-divider"></div>
        <div class="theme-toggle-group">
          <svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>
          <button class="theme-btn ${this.config.theme === "light" ? "active" : ""}" data-theme="light">
            <svg viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>
            Light
          </button>
          <button class="theme-btn ${this.config.theme === "dark" ? "active" : ""}" data-theme="dark">
            <svg viewBox="0 0 24 24"><path d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-12.09-8.43-8.32-14.96z"/></svg>
            Dark
          </button>
        </div>
        <div class="menu-divider"></div>
        <button class="menu-item clear-chat">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          <span class="menu-item-label">Clear Conversation</span>
        </button>
        <div class="menu-divider"></div>
        <button class="menu-item danger close-chat">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          <span class="menu-item-label">Close Chat</span>
        </button>
      </div>
      <div class="messages-container">
        <div class="welcome-message">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
          <p>👋 Hello! How can I help you today?</p>
        </div>
      </div>
      <div class="typing-indicator" style="display: none;">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div class="input-area">
        <div class="input-wrapper">
          <textarea class="chat-input" placeholder="Type a message..." rows="1"></textarea>
        </div>
        <button class="send-button" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    `;
    wrapper.appendChild(this.panel);

    this.shadow.appendChild(wrapper);

    // Cache element references
    this.messagesContainer = this.panel.querySelector(".messages-container");
    this.chatInput = this.panel.querySelector(".chat-input");
    this.sendButton = this.panel.querySelector(".send-button");
    this.menuDropdown = this.panel.querySelector(".menu-dropdown");
    this.menuButton = this.panel.querySelector(".menu-button");
    this.typingIndicator = this.panel.querySelector(".typing-indicator");
  }

  private createElement(
    tag: string,
    attrs: Record<string, string>,
  ): HTMLElement {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        el.className = value;
      } else if (key === "innerHTML") {
        el.innerHTML = value;
      } else {
        el.setAttribute(key, value);
      }
    }
    return el;
  }

  private bindEvents(): void {
    // Toggle chat panel
    this.chatButton?.addEventListener("click", () => this.togglePanel());

    // Send message
    this.sendButton?.addEventListener("click", () => this.handleSend());

    // Input handling
    this.chatInput?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    this.chatInput?.addEventListener("input", () => this.autoResizeInput());

    // Menu toggle
    this.menuButton?.addEventListener("click", (e: Event) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Menu items
    this.panel
      ?.querySelector(".streaming-toggle")
      ?.addEventListener("click", () => {
        this.callbacks.onToggleStreaming();
        this.closeMenu();
      });

    // Theme buttons
    this.panel?.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = (btn as HTMLElement).getAttribute("data-theme") as
          | "light"
          | "dark";
        this.callbacks.onThemeChange(theme);
        this.closeMenu();
      });
    });

    this.panel?.querySelector(".clear-chat")?.addEventListener("click", () => {
      this.callbacks.onClearConversation();
      this.closeMenu();
    });

    this.panel?.querySelector(".close-chat")?.addEventListener("click", () => {
      this.closeMenu();
      this.callbacks.onCloseChat();
    });

    // Close menu on outside click
    this.shadow.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        this.isMenuOpen &&
        !this.menuDropdown?.contains(target) &&
        target !== this.menuButton &&
        !this.menuButton?.contains(target)
      ) {
        this.closeMenu();
      }
    });
  }

  private togglePanel(): void {
    this.isOpen = !this.isOpen;
    this.panel?.classList.toggle("open", this.isOpen);
    this.chatButton?.classList.toggle("open", this.isOpen);

    if (this.isOpen) {
      requestAnimationFrame(() => {
        this.chatInput?.focus();
        this.scrollToBottom();
      });
    }
  }

  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuDropdown?.classList.toggle("open", this.isMenuOpen);
  }

  private closeMenu(): void {
    this.isMenuOpen = false;
    this.menuDropdown?.classList.remove("open");
  }

  private handleSend(): void {
    const input = this.chatInput;
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    this.callbacks.onSendMessage(message);
    input.value = "";
    this.autoResizeInput();
    this.sendButton?.setAttribute("disabled", "");
  }

  private autoResizeInput(): void {
    const input = this.chatInput;
    if (!input) return;

    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  // Public API
  public open(): void {
    if (!this.isOpen) this.togglePanel();
  }

  public close(): void {
    if (this.isOpen) this.togglePanel();
  }

  public addUserMessage(content: string, timestamp: number): void {
    this.removeWelcomeMessage();
    this.appendMessage("user", content, timestamp);
  }

  public addAssistantMessage(content: string, timestamp: number): void {
    this.removeWelcomeMessage();
    this.appendMessage("assistant", content, timestamp);
  }

  public addErrorMessage(content: string): void {
    this.removeWelcomeMessage();
    this.appendMessage("error", content, Date.now());
  }

  private appendMessage(
    role: "user" | "assistant" | "error",
    content: string,
    timestamp: number,
  ): void {
    if (!this.messagesContainer) return;

    const messageEl = document.createElement("div");
    messageEl.className = `message ${role}`;

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "message-bubble";
    bubbleEl.innerHTML = this.formatMessage(content);

    const timeEl = document.createElement("div");
    timeEl.className = "message-time";
    timeEl.textContent = this.formatTime(timestamp);

    messageEl.appendChild(bubbleEl);
    messageEl.appendChild(timeEl);
    this.messagesContainer.appendChild(messageEl);

    this.scrollToBottom();
  }

  public createStreamingMessage(): HTMLElement | null {
    this.removeWelcomeMessage();
    if (!this.messagesContainer) return null;

    const messageEl = document.createElement("div");
    messageEl.className = "message assistant streaming-message";

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "message-bubble";
    bubbleEl.textContent = "";

    const timeEl = document.createElement("div");
    timeEl.className = "message-time";
    timeEl.textContent = this.formatTime(Date.now());

    messageEl.appendChild(bubbleEl);
    messageEl.appendChild(timeEl);
    this.messagesContainer.appendChild(messageEl);

    this.scrollToBottom();
    return messageEl;
  }

  public updateStreamingMessage(el: HTMLElement, content: string): void {
    const bubble = el.querySelector(".message-bubble");
    if (bubble) {
      bubble.innerHTML = this.formatMessage(content);
      this.scrollToBottom();
    }
  }

  public showTyping(): void {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = "flex";
      this.scrollToBottom();
    }
  }

  public hideTyping(): void {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = "none";
    }
  }

  public setLoading(loading: boolean): void {
    const input = this.chatInput;
    const sendBtn = this.sendButton;
    if (input) {
      if (loading) {
        input.setAttribute("disabled", "");
      } else {
        input.removeAttribute("disabled");
      }
    }
    if (sendBtn) {
      if (loading) {
        sendBtn.setAttribute("disabled", "");
      } else {
        sendBtn.removeAttribute("disabled");
      }
    }
  }

  public clearMessages(): void {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = `
      <div class="welcome-message">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        <p>👋 Hello! How can I help you today?</p>
      </div>
    `;
  }

  public updateStreamingToggle(enabled: boolean): void {
    const indicator = this.panel?.querySelector(".toggle-indicator");
    indicator?.classList.toggle("active", enabled);
  }

  public updateThemeButtons(theme: "light" | "dark"): void {
    this.panel?.querySelectorAll(".theme-btn").forEach((btn) => {
      const btnTheme = (btn as HTMLElement).getAttribute("data-theme");
      btn.classList.toggle("active", btnTheme === theme);
    });
  }

  public updateStyles(theme: "light" | "dark"): void {
    const styleEl = this.shadow.querySelector("style");
    if (styleEl) {
      styleEl.textContent = getStyles(theme);
    }
  }

  private removeWelcomeMessage(): void {
    const welcome = this.messagesContainer?.querySelector(".welcome-message");
    welcome?.remove();
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;
    requestAnimationFrame(() => {
      this.messagesContainer!.scrollTop = this.messagesContainer!.scrollHeight;
    });
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  private formatMessage(text: string): string {
    // Escape HTML first
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // URLs - convert to clickable links (before other formatting)
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    // Code blocks
    html = html.replace(
      /```(\w*)\n?([\s\S]*?)```/g,
      '<pre><code class="language-$1">$2</code></pre>',
    );

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Italic (only * based, removed _ to avoid breaking URLs/identifiers)
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Line breaks into paragraphs
    const paragraphs = html.split(/\n\n+/);
    if (paragraphs.length > 1) {
      html = paragraphs
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => {
          if (
            p.startsWith("<pre>") ||
            p.startsWith("<ul>") ||
            p.startsWith("<ol>") ||
            p.startsWith("<a ")
          ) {
            return p;
          }
          return `<p>${p.replace(/\n/g, "<br>")}</p>`;
        })
        .join("");
    } else {
      html = html.replace(/\n/g, "<br>");
    }

    return html;
  }

  public restoreMessages(messages: StoredMessage[]): void {
    if (!this.messagesContainer || messages.length === 0) return;
    this.removeWelcomeMessage();

    for (const msg of messages) {
      this.appendMessage(msg.role, msg.content, msg.timestamp);
    }
  }
}
