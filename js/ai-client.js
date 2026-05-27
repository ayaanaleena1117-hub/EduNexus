(function () {
  const PRODUCTION_API_BASE = "https://edunexus-production-8623.up.railway.app";

  function getBaseUrl() {
    const configured = window.EDUNEXUS_API && window.EDUNEXUS_API.baseUrl;
    if (configured && typeof configured === "string" && configured.trim()) {
      return configured.trim().replace(/\/$/, "");
    }
    return PRODUCTION_API_BASE;
  }

  function buildUrl(path) {
    const base = getBaseUrl();
    return base ? base + path : path;
  }

  async function chat(mode, messages) {
    let response;
    try {
      response = await fetch(buildUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: mode, messages: messages }),
      });
    } catch (networkErr) {
      throw new Error(
        "Cannot reach the EduNexus API server at " +
          getBaseUrl() +
          ". The backend may be down or blocking this site (CORS)."
      );
    }

    const data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      throw new Error(data.error || "AI request failed");
    }

    if (!data.content) {
      throw new Error("Empty response from AI");
    }

    return data.content;
  }

  window.EduNexusAI = {
    getBaseUrl: getBaseUrl,
    chat: chat,
  };
})();
