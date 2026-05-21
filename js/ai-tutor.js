(function () {
  const chatForm = document.getElementById("tutor-chat-form");
  const chatInput = document.getElementById("tutor-chat-input");
  const chatMessages = document.getElementById("tutor-chat-messages");
  const promptChips = document.querySelectorAll("#ai-tutor .ai-prompt-chip");
  const sendBtn = chatForm && chatForm.querySelector(".ai-chat-send");

  const STUDENT_INITIALS = "EC";
  let conversationStep = 0;
  let lastTopic = "";

  const welcomeHTML =
    '<div class="ai-message ai-message--assistant ai-message--tutor">' +
    '<span class="ai-message-avatar" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75v8.25m0 0l-3-3m3 3l3-3" />' +
    "</svg></span>" +
    '<div class="ai-message-bubble"><p>' +
    "Hi Emma! I'm your AI tutor. I use a <strong>Socratic approach</strong> — I'll ask " +
    "questions and help you reason through ideas instead of handing you the final answer. " +
    "What are you working on today?" +
    "</p></div></div>";

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

  function wantsDirectAnswer(message) {
    const lower = message.toLowerCase();
    return (
      /what('s| is) the answer|give me the answer|just tell me|answer to question|solve this for me|what is \d+\s*\+|cheat|copy the answer/.test(
        lower
      ) || /^(what is|what's)\s+.+\?$/.test(lower) && lower.length < 60
    );
  }

  function detectTopic(message) {
    const lower = message.toLowerCase();
    if (/photosynthesis|chloroplast|calvin|light reaction/.test(lower)) {
      return "photosynthesis";
    }
    if (/mitosis|meiosis|cell division|chromosome|phase/.test(lower)) {
      return "mitosis";
    }
    if (/ecosystem|food web|energy pyramid/.test(lower)) {
      return "ecosystem";
    }
    if (/study|quiz|test|prepare|exam/.test(lower)) {
      return "study";
    }
    if (/stuck|don't understand|confused|help/.test(lower)) {
      return "general-help";
    }
    return "general";
  }

  function getSocraticResponse(message) {
    const lower = message.toLowerCase();
    const topic = detectTopic(message);

    if (wantsDirectAnswer(message)) {
      lastTopic = topic;
      conversationStep = 1;
      return (
        "<p>I hear you wanting a quick answer — but that's not how deep learning happens! " +
        "I'm here to <strong>guide your thinking</strong>, not skip it.</p>" +
        "<p>Let's start here: <strong>What is the question asking you to find or explain?</strong> " +
        "What do you already know that's related? Share your first thought, even if you're unsure.</p>"
      );
    }

    if (topic === "photosynthesis") {
      if (conversationStep === 0 || lastTopic !== "photosynthesis") {
        lastTopic = "photosynthesis";
        conversationStep = 1;
        return (
          "<p>Photosynthesis is a great topic to explore. Before we go further — " +
          "<strong>what do plants need to stay alive that animals get from eating food?</strong></p>" +
          "<p>Think about sunlight, water, and air. Which of those might plants use to make their own energy?</p>"
        );
      }
      if (conversationStep === 1) {
        conversationStep = 2;
        return (
          "<p>Good thinking! Now consider this: photosynthesis happens in two main stages — " +
          "one needs light, one doesn't.</p>" +
          "<p><strong>Why do you think plants are green?</strong> What molecule might capture light, " +
          "and where in the cell would that process happen?</p>"
        );
      }
      conversationStep = 3;
      return (
        "<p>You're building a solid picture. Last puzzle piece: " +
        "<strong>What goes IN to photosynthesis, and what comes OUT?</strong> " +
        "If you can name the inputs and outputs, you can explain the whole process in your own words — " +
        "try writing one sentence without looking at your notes!</p>"
      );
    }

    if (topic === "mitosis") {
      if (/step by step|steps|phases|explain/.test(lower) && conversationStep < 2) {
        lastTopic = "mitosis";
        conversationStep = 1;
        return (
          "<p>Instead of listing steps for you, let's discover them together. " +
          "<strong>Why does a cell need to divide?</strong> What must each new cell receive from the parent?</p>" +
          "<p>Once you answer that, we can work through what has to happen to the chromosomes — in what order?</p>"
        );
      }
      if (lastTopic === "mitosis" && conversationStep >= 1) {
        conversationStep += 1;
        return (
          "<p>Think about the phases as a story: first the cell prepares, then chromosomes line up, " +
          "then they separate, then the cell splits.</p>" +
          "<p><strong>Can you name one phase and describe what the chromosomes look like during it?</strong> " +
          "Start with metaphase or anaphase — what do you remember?</p>"
        );
      }
      lastTopic = "mitosis";
      conversationStep = 1;
      return (
        "<p>Mitosis is all about copying genetic material fairly. " +
        "<strong>How many chromosomes should each daughter cell have compared to the parent?</strong></p>" +
        "<p>That rule will help you figure out every step — what has to happen before the cell pinches in two?</p>"
      );
    }

    if (topic === "ecosystem") {
      return (
        "<p>Let's think about energy flow. <strong>Where does energy enter most ecosystems?</strong> " +
        "(Hint: it's not from other organisms.)</p>" +
        "<p>Then ask yourself: when one organism eats another, what happens to most of that energy — " +
        "does it all move up the food chain?</p>"
      );
    }

    if (topic === "study") {
      return (
        "<p>Studying works best when you test yourself, not just re-read. " +
        "<strong>What three topics will be on your quiz?</strong> For each one, try explaining it out loud in 30 seconds.</p>" +
        "<p>Where do you feel least confident? That's where we should focus — tell me one concept that feels fuzzy.</p>"
      );
    }

    if (topic === "general-help" || /stuck|start/.test(lower)) {
      return (
        "<p>Being stuck is normal — it means you're at the edge of learning something new. " +
        "<strong>What part of the problem have you tried so far?</strong> Even a wrong attempt gives us a clue.</p>" +
        "<p>What would happen if your first guess were true? What would break if it weren't?</p>"
      );
    }

    if (conversationStep > 0 && lastTopic) {
      conversationStep += 1;
      return (
        "<p>You're on the right track. <strong>What would your next step be if you had to teach this to a friend?</strong></p>" +
        "<p>Try putting your idea in one sentence. If something still feels unclear, tell me which word or concept trips you up.</p>"
      );
    }

    return (
      "<p>Interesting question! Let me turn it back to you so it sticks:</p>" +
      "<p><strong>What do you already know about this topic?</strong> What's one thing you're confident about, " +
      "and one thing you're unsure about?</p>" +
      "<p>Start there — your brain learns more when it connects new ideas to what you already understand.</p>"
    );
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    appendUserMessage(trimmed);
    chatInput.value = "";
    chatInput.style.height = "auto";
    setComposerDisabled(true);
    showTypingIndicator();

    const delay = 900 + Math.random() * 500;

    setTimeout(function () {
      removeTypingIndicator();
      appendTutorHTML(getSocraticResponse(trimmed));
      setComposerDisabled(false);
      chatInput.focus();
    }, delay);
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
        conversationStep = 0;
        lastTopic = "";
        sendMessage(prompt);
      }
    });
  });
})();
