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

  function getAIResponse(message) {
    const lower = message.toLowerCase();

    if (/lesson plan|lesson|unit plan|45-minute|instructional/.test(lower)) {
      return (
        "<p><strong>45-Minute Lesson Plan: Photosynthesis (Biology II)</strong></p>" +
        "<p><strong>Objective:</strong> Students will explain how light-dependent and light-independent reactions convert energy into glucose.</p>" +
        "<ol>" +
        "<li><strong>Hook (5 min):</strong> Show a leaf under a microscope image. Ask: \"Where does the mass of a tree come from?\"</li>" +
        "<li><strong>Direct instruction (15 min):</strong> Mini-lecture with diagram of chloroplast; label thylakoid and stroma.</li>" +
        "<li><strong>Guided practice (12 min):</strong> Students complete a flowchart from sunlight → ATP/NADPH → Calvin cycle → glucose.</li>" +
        "<li><strong>Independent practice (10 min):</strong> Partner worksheet—predict outcomes when light or CO₂ is limited.</li>" +
        "<li><strong>Exit ticket (3 min):</strong> One sentence: \"What would happen to photosynthesis in a dark room?\"</li>" +
        "</ol>" +
        "<p><strong>Materials:</strong> Chloroplast diagram handout, colored pencils, exit slip.</p>" +
        "<p>Want me to add differentiation strategies or a homework extension?</p>"
      );
    }

    if (/quiz|question|test|assessment|multiple choice/.test(lower)) {
      return (
        "<p><strong>5 Quiz Questions: Cell Division (AP Biology)</strong></p>" +
        "<ol>" +
        "<li>During which phase of mitosis do sister chromatids separate? <em>(Answer: Anaphase)</em></li>" +
        "<li>What is the primary function of the spindle apparatus? <em>(Align and separate chromosomes)</em></li>" +
        "<li>How does cytokinesis differ between plant and animal cells? <em>(Cell plate vs. cleavage furrow)</em></li>" +
        "<li>A cell with 16 chromosomes undergoes mitosis. How many chromosomes does each daughter cell have? <em>(16)</em></li>" +
        "<li>Which checkpoint ensures DNA replication is complete before mitosis? <em>(G2/M checkpoint)</em></li>" +
        "</ol>" +
        "<p>I can convert these to multiple-choice format or add a rubric for short-answer grading.</p>"
      );
    }

    if (/assignment|prompt|homework|worksheet|lab report|rubric/.test(lower)) {
      return (
        "<p><strong>Assignment Prompt: Ecosystem Lab Report</strong></p>" +
        "<p><strong>Title:</strong> Analyzing Energy Flow in a Local Ecosystem</p>" +
        "<p><strong>Prompt:</strong> Design and conduct a field or simulated observation of a local ecosystem (school grounds, park, or virtual model). Measure or estimate energy transfer between at least three trophic levels. In a 3–4 page report, include:</p>" +
        "<ul>" +
        "<li>Introduction with a clear hypothesis about energy availability at each level</li>" +
        "<li>Methods describing data collection and variables controlled</li>" +
        "<li>Results with a labeled food web or energy pyramid diagram</li>" +
        "<li>Discussion connecting findings to the 10% energy transfer rule</li>" +
        "</ul>" +
        "<p><strong>Due:</strong> Draft in 1 week; final report in 2 weeks.</p>" +
        "<p><strong>Points:</strong> 75 (rubric: inquiry 25, analysis 25, communication 25).</p>" +
        "<p>Shall I generate a detailed rubric or peer-review checklist?</p>"
      );
    }

    if (/teach|suggest|strategy|tip|differentiat|engage|struggling|classroom/.test(lower)) {
      return (
        "<p><strong>Teaching Suggestions: Engaging Struggling Students</strong></p>" +
        "<ul>" +
        "<li><strong>Chunk instruction:</strong> Break concepts into 7–10 minute segments with a quick check-for-understanding between each.</li>" +
        "<li><strong>Multimodal cues:</strong> Pair vocabulary with visuals, gestures, and real-world examples (e.g., compare mitosis to copying a recipe step-by-step).</li>" +
        "<li><strong>Structured group roles:</strong> Assign recorder, presenter, and skeptic so every student has a clear job during labs.</li>" +
        "<li><strong>Low-stakes practice:</strong> Use anonymous mini-whiteboards or digital polls before graded work to build confidence.</li>" +
        "<li><strong>Office hours loop:</strong> Invite 2–3 students per week for a 10-minute \"science café\"—rotating slots reduce stigma.</li>" +
        "</ul>" +
        "<p>For your Biology I class, consider pairing students for the Chapter 8 review using leveled question sets (foundational → advanced).</p>" +
        "<p>Tell me which class you'd like strategies tailored for.</p>"
      );
    }

    return (
      "<p>I'm here to support your teaching on EduNexus. Try asking me to:</p>" +
      "<ul>" +
      "<li>Build a <strong>lesson plan</strong> (topic, grade, and duration help)</li>" +
      "<li><strong>Generate quiz questions</strong> for a unit you're covering</li>" +
      "<li><strong>Write an assignment prompt</strong> with rubric ideas</li>" +
      "<li>Share <strong>teaching suggestions</strong> for engagement or differentiation</li>" +
      "</ul>" +
      "<p>Example: \"Create a lesson plan on mitosis for AP Biology\" or \"Give me quiz questions on ecosystems.\"</p>"
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

    const delay = 900 + Math.random() * 600;

    setTimeout(function () {
      removeTypingIndicator();
      appendAssistantHTML(getAIResponse(trimmed));
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
        sendMessage(prompt);
      }
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      chatMessages.innerHTML = welcomeHTML;
      chatInput.value = "";
      chatInput.style.height = "auto";
      chatInput.focus();
    });
  }
})();
