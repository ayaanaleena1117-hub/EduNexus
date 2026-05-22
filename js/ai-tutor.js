(function () {
  const chatForm = document.getElementById("tutor-chat-form");
  const chatInput = document.getElementById("tutor-chat-input");
  const chatMessages = document.getElementById("tutor-chat-messages");
  const promptChips = document.querySelectorAll("#ai-tutor .ai-prompt-chip");
  const sendBtn = chatForm && chatForm.querySelector(".ai-chat-send");

  const STUDENT_INITIALS = "EC";
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
      '<span class="ai-message-avatar" aria-hidden="true">' +
      STUDENT_INITIALS +
      "</span>" +
      '<div class="ai-message-bubble"><p>' +
      escapeHTML(text) +
      "</p></div>";
    chatMessages.appendChild(msg);
    scrollToBottom();
  }

  function appendTutorHTML(html) {
    const msg = document.createElement("div");
    msg.className = "ai-message ai-message--assistant ai-message--tutor";
    msg.innerHTML =
      '<span class="ai-message-avatar" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75v8.25m0 0l-3-3m3 3l3-3" />' +
      "</svg></span>" +
      '<div class="ai-message-bubble">' +
      html +
      "</div>";
    chatMessages.appendChild(msg);
    scrollToBottom();
  }

  function appendErrorMessage(message) {
    appendTutorHTML(
      "<p><strong>Couldn't reach the AI tutor.</strong> " +
        escapeHTML(message) +
        "</p><p>Make sure the EduNexus server is running (<code>cd server && npm start</code>) and that <code>ANTHROPIC_API_KEY</code> is set in <code>server/.env</code>.</p>"
    );
  }

  function showTypingIndicator() {
    const msg = document.createElement("div");
    msg.className = "ai-message ai-message--assistant ai-message--tutor ai-message--typing";
    msg.id = "tutor-typing-indicator";
    msg.innerHTML =
      '<span class="ai-message-avatar" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75v8.25m0 0l-3-3m3 3l3-3" />' +
      "</svg></span>" +
      '<div class="ai-message-bubble">' +
      '<span class="ai-typing-dot"></span>' +
      '<span class="ai-typing-dot"></span>' +
      '<span class="ai-typing-dot"></span>' +
      "</div>";
    chatMessages.appendChild(msg);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById("tutor-typing-indicator");
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
      const content = await window.EduNexusAI.chat("tutor", conversation);
      conversation.push({ role: "assistant", content: content });
      removeTypingIndicator();
      appendTutorHTML(content);
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
})();
