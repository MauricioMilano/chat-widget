// Entry point - reads script tag attributes, initializes widget

import { ChatWidget, type WidgetConfig, type ThemeColors } from "./widget";

declare global {
  interface Window {
    ChatWidgetConfig?: WidgetConfig;
  }
}

function getConfig(): WidgetConfig | null {
  // Priority 1: window.ChatWidgetConfig
  if (window.ChatWidgetConfig) {
    return window.ChatWidgetConfig;
  }

  // Priority 2: Script tag data attributes
  const scripts = document.querySelectorAll("script[src]");
  for (const script of scripts) {
    const src = script.getAttribute("src") || "";
    if (src.includes("chat-widget")) {
      const baseUrl = script.getAttribute("data-base-url");
      if (!baseUrl) continue;

      const config: WidgetConfig = { baseUrl };

      const auth = script.getAttribute("data-auth");
      if (auth) config.auth = auth;

      const title = script.getAttribute("data-title");
      if (title) config.widgetTitle = title;

      const subtitle = script.getAttribute("data-subtitle");
      if (subtitle) config.widgetSubtitle = subtitle;

      const placeholder = script.getAttribute("data-placeholder");
      if (placeholder) config.inputPlaceholder = placeholder;

      const welcome = script.getAttribute("data-welcome");
      if (welcome) config.welcomeMessage = welcome;

      const position = script.getAttribute(
        "data-position",
      ) as WidgetConfig["position"];
      if (position) config.position = position;

      const panelWidth = script.getAttribute("data-panel-width");
      if (panelWidth) config.panelWidth = parseInt(panelWidth, 10);

      const panelHeight = script.getAttribute("data-panel-height");
      if (panelHeight) config.panelHeight = parseInt(panelHeight, 10);

      const accent = script.getAttribute("data-accent-color");
      if (accent) config.accentColor = accent;

      const timeout = script.getAttribute("data-timeout");
      if (timeout) config.apiTimeoutMs = parseInt(timeout, 10);

      const normalPath = script.getAttribute("data-normal-endpoint");
      if (normalPath) config.normalEndpointPath = normalPath;

      const streamingPath = script.getAttribute("data-streaming-endpoint");
      if (streamingPath) config.streamingEndpointPath = streamingPath;

      const msgField = script.getAttribute("data-message-field");
      if (msgField) config.messageFieldName = msgField;

      const sessionField = script.getAttribute("data-session-field");
      if (sessionField) config.sessionIdFieldName = sessionField;

      const respField = script.getAttribute("data-response-field");
      if (respField) config.responseField = respField;

      const autoOpen = script.getAttribute("data-auto-open");
      if (autoOpen !== null) config.autoOpen = autoOpen === "true";

      const sessionId = script.getAttribute("data-session-id");
      if (sessionId) config.sessionId = sessionId;

      const showStreaming = script.getAttribute("data-show-streaming");
      if (showStreaming !== null)
        config.showStreamingToggle = showStreaming === "true";

      const showTheme = script.getAttribute("data-show-theme");
      if (showTheme !== null) config.showThemeToggle = showTheme === "true";

      const showClear = script.getAttribute("data-show-clear");
      if (showClear !== null) config.showClearButton = showClear === "true";

      // Full theme objects via JSON data attributes
      const lightThemeStr = script.getAttribute("data-light-theme");
      if (lightThemeStr) {
        try {
          config.lightTheme = JSON.parse(lightThemeStr) as ThemeColors;
        } catch {
          /* ignore */
        }
      }
      const darkThemeStr = script.getAttribute("data-dark-theme");
      if (darkThemeStr) {
        try {
          config.darkTheme = JSON.parse(darkThemeStr) as ThemeColors;
        } catch {
          /* ignore */
        }
      }

      return config;
    }
  }

  return null;
}

function init(): void {
  const config = getConfig();

  if (!config) {
    console.warn(
      "[ChatWidget] No configuration found. Use data-base-url attribute or window.ChatWidgetConfig.",
    );
    return;
  }

  const widget = new ChatWidget(config);
  widget.init();

  // Expose widget globally for programmatic control
  (window as unknown as Record<string, unknown>).ChatWidget = widget;
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
