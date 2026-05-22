(function () {
  const chatForm = document.getElementById("ai-chat-form");
  const chatInput = document.getElementById("ai-chat-input");
  const chatMessages = document.getElementById("ai-chat-messages");
  const clearBtn = document.getElementById("ai-chat-clear");
  const promptChips = document.querySelectorAll(".ai-prompt-chip");
  const sendBtn = chatForm && chatForm.querySelector(".ai-chat-send");

  const welcomeHTML =
    '<div class="ai-message ai-message--assistant">' +
    '<span class="ai-message-avatar" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />' +
    "</svg></span>" +
    '<div class="ai-message-bubble"><p>' +
    "Hi Ms. Rodriguez! I'm your EduNexus teaching assistant. I can help you " +
    "<strong>create lesson plans</strong>, <strong>generate quiz questions</strong>, " +
    "<strong>write assignment prompts</strong>, and offer " +
    "<strong>teaching suggestions</strong>. Ask a question or pick a prompt above to get started." +
    "</p></div></div>";

  const conversation = [];

  if (!chatForm || !chatInput || !chatMessages) {
    return;
  }

  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setComposerDisabled(disabled) {
    chatInput.disabled = disabled;
    if (sendBtn) {
      sendBtn.disabled = disabled;
    }
    promptChips.forEach(function (chip) {
      chip.disabled = disabled;
    });
  }

  function appendUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "ai-message ai-message--user";
    msg.innerHTML =
      '<span class="ai-message-avatar" aria-hidden="true">MR</span>' +
      '<div class="ai-message-bubble"><p>' +
      escapeHTML(text) +
      "</p></div>";
    chatMessages.appendChild(msg);
    scrollToBottom();
  }

  function appendAssistantHTML(html) {
    const msg = document.createElement("div");
    msg.className = "ai-message ai-message--assistant";
    msg.innerHTML =
      '<span class="ai-message-avatar" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />' +
      "</svg></span>" +
      '<div class="ai-message-bubble">' +
      html +
      "</div>";
    chatMessages.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function appendErrorMessage(message) {
    appendAssistantHTML(
      "<p><strong>Couldn't reach the AI assistant.</strong> " +
        escapeHTML(message) +
        "</p><p>Make sure the EduNexus server is running (<code>cd server && npm start</code>) and that <code>ANTHROPIC_API_KEY</code> is set in <code>server/.env</code>.</p>"
    );
  }

  function showTypingIndicator() {
    const msg = document.createElement("div");
    msg.className = "ai-message ai-message--assistant ai-message--typing";
    msg.id = "ai-typing-indicator";
    msg.innerHTML =
      '<span class="ai-message-avatar" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />' +
      "</svg></span>" +
      '<div class="ai-message-bubble">' +
      '<span class="ai-typing-dot"></span>' +
      '<span class="ai-typing-dot"></span>' +
      '<span class="ai-typing-dot"></span>' +
      "</div>";
    chatMessages.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function removeTypingIndicator() {
    const el = document.getElementById("ai-typing-indicator");
    if (el) {
      el.remove();
    }
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    if (!window.EduNexusAI) {
      appendErrorMessage("AI client failed to load.");
      return;
    }

    appendUserMessage(trimmed);
    conversation.push({ role: "user", content: trimmed });
    chatInput.value = "";
    chatInput.style.height = "auto";
    setComposerDisabled(true);
    showTypingIndicator();

    try {
      const content = await window.EduNexusAI.chat("assistant", conversation);
      conversation.push({ role: "assistant", content: content });
      removeTypingIndicator();
      appendAssistantHTML(content);
    } catch (err) {
      conversation.pop();
      removeTypingIndicator();
      appendErrorMessage(err.message || "Unknown error");
    } finally {
      setComposerDisabled(false);
      chatInput.focus();
    }
  }

  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage(chatInput.value);
  });

  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });

  chatInput.addEventListener("input", function () {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 128) + "px";
  });

  promptChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const prompt = chip.getAttribute("data-prompt");
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      conversation.length = 0;
      chatMessages.innerHTML = welcomeHTML;
      chatInput.value = "";
      chatInput.style.height = "auto";
      chatInput.focus();
    });
  }
})();
