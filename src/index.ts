// Entry point - reads script tag attributes, initializes widget

import { ChatWidget } from "./widget";

declare global {
  interface Window {
    ChatWidgetConfig?: {
      baseUrl: string;
      auth?: string;
    };
  }
}

function getConfig(): { baseUrl: string; auth?: string } | null {
  // Priority 1: window.ChatWidgetConfig
  if (window.ChatWidgetConfig) {
    return {
      baseUrl: window.ChatWidgetConfig.baseUrl,
      auth: window.ChatWidgetConfig.auth,
    };
  }

  // Priority 2: Script tag data attributes
  const scripts = document.querySelectorAll("script[src]");
  for (const script of scripts) {
    const src = script.getAttribute("src") || "";
    if (src.includes("chat-widget")) {
      const baseUrl = script.getAttribute("data-base-url");
      const auth = script.getAttribute("data-auth");
      if (baseUrl) {
        return { baseUrl, auth: auth || undefined };
      }
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
