// CSS styles as template literal - scoped to shadow DOM

export function getStyles(theme: "light" | "dark"): string {
  const colors =
    theme === "dark"
      ? {
          bgPrimary: "#1a1a2e",
          bgSecondary: "#16213e",
          bgTertiary: "#0f3460",
          bgInput: "#1a1a2e",
          bgMessages: "#12122a",
          textPrimary: "#eaeaea",
          textSecondary: "#a0a0b0",
          textMuted: "#6c6c7e",
          userBubble: "#533483",
          aiBubble: "#2a2a3e",
          border: "#2a2a3e",
          shadow: "rgba(0,0,0,0.5)",
          accent: "#7c3aed",
          accentHover: "#6d28d9",
          danger: "#e94560",
          dangerHover: "#ff6b81",
          typingDot: "#a0a0b0",
          menuBg: "#16213e",
          menuHover: "#1a1a2e",
          scrollThumb: "#3a3a4e",
          scrollTrack: "#1a1a2e",
          panelBg:
            "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          headerBg: "linear-gradient(135deg, #533483 0%, #0f3460 100%)",
        }
      : {
          bgPrimary: "#ffffff",
          bgSecondary: "#f8f9fa",
          bgTertiary: "#e9ecef",
          bgInput: "#ffffff",
          bgMessages: "#f0f2f5",
          textPrimary: "#1a1a2e",
          textSecondary: "#495057",
          textMuted: "#868e96",
          userBubble: "#4361ee",
          aiBubble: "#ffffff",
          border: "#e5e7eb",
          shadow: "rgba(0,0,0,0.18)",
          accent: "#4361ee",
          accentHover: "#3a56d4",
          danger: "#e03131",
          dangerHover: "#f03e3e",
          typingDot: "#868e96",
          menuBg: "#ffffff",
          menuHover: "#f1f3f5",
          scrollThumb: "#ced4da",
          scrollTrack: "#f1f3f5",
          panelBg: "linear-gradient(180deg, #ffffff 0%, #f0f2f5 100%)",
          headerBg: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
        };

  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: ${colors.textPrimary};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ===== Floating Button ===== */
    .chat-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${colors.accent}, ${colors.accentHover});
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px ${colors.shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
      z-index: 2147483646;
    }

    .chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px ${colors.shadow};
    }

    .chat-button:active {
      transform: scale(0.95);
    }

    .chat-button svg {
      width: 28px;
      height: 28px;
      fill: white;
      transition: opacity 0.2s ease;
    }

    .chat-button.open svg.icon-chat {
      opacity: 0;
    }

    .chat-button.open svg.icon-close {
      opacity: 1;
    }

    .chat-button svg.icon-close {
      position: absolute;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    /* ===== Chat Panel ===== */
    .chat-panel {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: ${colors.panelBg};
      border-radius: 20px;
      box-shadow: 0 12px 48px ${colors.shadow}, 0 2px 8px ${colors.shadow};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483647;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transform-origin: bottom right;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                  transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .chat-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* ===== Header ===== */
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: ${colors.headerBg};
      border-bottom: none;
      flex-shrink: 0;
      position: relative;
    }

    .chat-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${colors.accent}, transparent);
      opacity: 0.3;
    }

    .chat-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chat-header-icon {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .chat-header-icon svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .chat-header-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
    }

    .chat-header-subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 1px;
    }

    .menu-button {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }

    .menu-button:hover {
      background: ${colors.bgTertiary};
    }

    .menu-button svg {
      width: 20px;
      height: 20px;
      fill: rgba(255, 255, 255, 0.9);
    }

    /* ===== Dropdown Menu ===== */
    .menu-dropdown {
      position: absolute;
      top: 60px;
      right: 12px;
      background: ${colors.menuBg};
      border: 1px solid ${colors.border};
      border-radius: 12px;
      box-shadow: 0 4px 20px ${colors.shadow};
      padding: 8px;
      min-width: 200px;
      z-index: 10;
      opacity: 0;
      transform: translateY(-8px);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .menu-dropdown.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: ${colors.textPrimary};
      transition: background 0.15s ease;
      text-align: left;
    }

    .menu-item:hover {
      background: ${colors.menuHover};
    }

    .menu-item svg {
      width: 16px;
      height: 16px;
      fill: ${colors.textSecondary};
      flex-shrink: 0;
    }

    .menu-item.danger {
      color: ${colors.danger};
    }

    .menu-item.danger svg {
      fill: ${colors.danger};
    }

    .menu-divider {
      height: 1px;
      background: ${colors.border};
      margin: 4px 8px;
    }

    .menu-item-label {
      flex: 1;
    }

    .theme-toggle-group {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
    }

    .theme-toggle-group svg {
      width: 16px;
      height: 16px;
      fill: ${colors.textSecondary};
      flex-shrink: 0;
    }

    .theme-btn {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid ${colors.border};
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      color: ${colors.textSecondary};
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .theme-btn:hover {
      background: ${colors.menuHover};
    }

    .theme-btn.active {
      background: ${colors.accent};
      color: white;
      border-color: ${colors.accent};
    }

    .theme-btn svg {
      width: 12px;
      height: 12px;
      fill: currentColor;
    }

    .toggle-indicator {
      width: 36px;
      height: 20px;
      background: ${colors.bgTertiary};
      border-radius: 10px;
      position: relative;
      transition: background 0.2s ease;
    }

    .toggle-indicator.active {
      background: ${colors.accent};
    }

    .toggle-indicator::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
    }

    .toggle-indicator.active::after {
      transform: translateX(16px);
    }

    /* ===== Messages Area ===== */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }

    .messages-container::-webkit-scrollbar {
      width: 6px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: ${colors.scrollTrack};
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: ${colors.scrollThumb};
      border-radius: 3px;
    }

    /* ===== Message Bubbles ===== */
    .message {
      display: flex;
      flex-direction: column;
      max-width: 85%;
      animation: messageSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      align-self: flex-end;
      align-items: flex-end;
    }

    .message.assistant {
      align-self: flex-start;
      align-items: flex-start;
    }

    .message-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .message.user .message-bubble {
      background: ${colors.userBubble};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.assistant .message-bubble {
      background: ${colors.aiBubble};
      color: ${colors.textPrimary};
      border-bottom-left-radius: 4px;
    }

    .message-time {
      font-size: 10px;
      color: ${colors.textMuted};
      margin-top: 4px;
      padding: 0 4px;
    }

    /* ===== Message Content Formatting ===== */
    .message-bubble p {
      margin: 0 0 8px 0;
    }

    .message-bubble p:last-child {
      margin-bottom: 0;
    }

    .message-bubble code {
      background: ${theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)"};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 12px;
    }

    .message-bubble pre {
      background: ${theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)"};
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .message-bubble pre code {
      background: none;
      padding: 0;
    }

    .message-bubble strong {
      font-weight: 600;
    }

    .message-bubble em {
      font-style: italic;
    }

    .message-bubble ul, .message-bubble ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .message-bubble li {
      margin: 4px 0;
    }

    /* ===== Typing Indicator ===== */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      align-self: flex-start;
    }

    .typing-indicator .dot {
      width: 8px;
      height: 8px;
      background: ${colors.typingDot};
      border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out;
    }

    .typing-indicator .dot:nth-child(1) {
      animation-delay: 0s;
    }

    .typing-indicator .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typingBounce {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-8px);
        opacity: 1;
      }
    }

    /* ===== Input Area ===== */
    .input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 16px;
      background: ${colors.bgSecondary};
      border-top: 1px solid ${colors.border};
      flex-shrink: 0;
    }

    .input-wrapper {
      flex: 1;
      position: relative;
    }

    .chat-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid ${colors.border};
      border-radius: 24px;
      background: ${colors.bgInput};
      color: ${colors.textPrimary};
      font-size: 14px;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 120px;
      min-height: 40px;
      line-height: 1.4;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .chat-input:focus {
      border-color: ${colors.accent};
      box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(83, 52, 131, 0.3)" : "rgba(67, 97, 238, 0.15)"};
    }

    .chat-input::placeholder {
      color: ${colors.textMuted};
    }

    .send-button {
      width: 40px;
      height: 40px;
      border: none;
      background: linear-gradient(135deg, ${colors.accent}, ${colors.accentHover});
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, opacity 0.2s ease;
      flex-shrink: 0;
    }

    .send-button:hover:not(:disabled) {
      transform: scale(1.1);
    }

    .send-button:active:not(:disabled) {
      transform: scale(0.95);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-button svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    /* ===== Welcome Message ===== */
    .welcome-message {
      text-align: center;
      padding: 32px 16px;
      color: ${colors.textMuted};
    }

    .welcome-message svg {
      width: 48px;
      height: 48px;
      fill: ${colors.textMuted};
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .welcome-message p {
      font-size: 14px;
      line-height: 1.6;
    }

    /* ===== Error Message ===== */
    .message.error .message-bubble {
      background: ${theme === "dark" ? "rgba(233, 69, 96, 0.15)" : "rgba(224, 49, 49, 0.1)"};
      color: ${colors.danger};
    }

    /* ===== Responsive ===== */
    @media (max-width: 480px) {
      .chat-panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 80px);
        max-height: calc(100vh - 80px);
        bottom: 80px;
        right: 8px;
        border-radius: 12px;
      }

      .chat-button {
        bottom: 16px;
        right: 16px;
        width: 56px;
        height: 56px;
      }
    }
  `;
}
