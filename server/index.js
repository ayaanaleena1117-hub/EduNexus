import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MODES } from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, ".env");

const envResult = dotenv.config({ path: ENV_PATH });
if (envResult.error && existsSync(ENV_PATH)) {
  console.error("Failed to read server/.env:", envResult.error.message);
} else if (!existsSync(ENV_PATH)) {
  console.warn("server/.env not found — copy server/.env.example to server/.env");
}

const ROOT_DIR = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY?.trim();
const ANTHROPIC_MODEL = (
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6"
);
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 8000;
const MAX_BODY_BYTES = 200_000;

const DEFAULT_ORIGINS = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: MAX_BODY_BYTES }));
app.use(express.static(ROOT_DIR));

function sanitizeHtml(html) {
  if (typeof html !== "string") {
    return "";
  }
  let out = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  out = out.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name) => {
    const allowed = /^(p|strong|em|ul|ol|li|br)$/i;
    if (!allowed.test(name)) {
      return "";
    }
    if (/^<\//.test(tag)) {
      return `</${name.toLowerCase()}>`;
    }
    if (name.toLowerCase() === "br") {
      return "<br>";
    }
    return `<${name.toLowerCase()}>`;
  });

  return out.trim();
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "messages must be a non-empty array" };
  }
  if (messages.length > MAX_MESSAGES) {
    return { error: `messages cannot exceed ${MAX_MESSAGES} items` };
  }

  const normalized = [];
  for (const item of messages) {
    if (!item || typeof item !== "object") {
      return { error: "each message must be an object" };
    }
    const role = item.role;
    const content = item.content;
    if (role !== "user" && role !== "assistant") {
      return { error: "message role must be user or assistant" };
    }
    if (typeof content !== "string" || !content.trim()) {
      return { error: "message content must be a non-empty string" };
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      return { error: `message content cannot exceed ${MAX_MESSAGE_CHARS} characters` };
    }
    normalized.push({ role, content: content.trim() });
  }

  if (normalized[normalized.length - 1].role !== "user") {
    return { error: "last message must be from the user" };
  }

  return { messages: normalized };
}

function parseAnthropicError(data, status) {
  const err = data?.error;
  const message = err?.message || data?.message;

  if (err?.type === "authentication_error") {
    return "Invalid Anthropic API key. Check ANTHROPIC_API_KEY in server/.env.";
  }

  if (err?.type === "not_found_error" && message?.startsWith("model:")) {
    return (
      `Model "${ANTHROPIC_MODEL}" is not available on your API account. ` +
      'Set ANTHROPIC_MODEL=claude-sonnet-4-6 in server/.env and restart the server.'
    );
  }

  if (err?.type === "rate_limit_error") {
    return "Anthropic rate limit reached. Please try again shortly.";
  }

  if (message) {
    return message;
  }

  return `Anthropic API error (${status})`;
}

async function callAnthropic({ system, messages, maxTokens }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(parseAnthropicError(data, response.status));
    err.status = response.status;
    throw err;
  }

  const textBlock = Array.isArray(data.content)
    ? data.content.find((block) => block.type === "text")
    : null;

  if (!textBlock?.text) {
    throw new Error("No text content in Anthropic response");
  }

  return textBlock.text;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    anthropicConfigured: Boolean(ANTHROPIC_API_KEY),
    model: ANTHROPIC_MODEL,
  });
});

app.post("/api/chat", async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    res.status(503).json({
      error: "AI service is not configured. Set ANTHROPIC_API_KEY in server/.env",
    });
    return;
  }

  const mode = req.body?.mode;
  const modeConfig = MODES[mode];

  if (!modeConfig) {
    res.status(400).json({ error: 'mode must be "tutor" or "assistant"' });
    return;
  }

  const validation = validateMessages(req.body?.messages);
  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const raw = await callAnthropic({
      system: modeConfig.system,
      messages: validation.messages,
      maxTokens: modeConfig.maxTokens,
    });

    const content = sanitizeHtml(raw);
    if (!content) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    res.json({ content });
  } catch (err) {
    const status =
      err.status === 429 ? 429 : err.status >= 400 && err.status < 600 ? err.status : 502;
    console.error("[api/chat]", err.message);
    res.status(status).json({
      error: err.message || "AI request failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`EduNexus server running at http://localhost:${PORT}`);
  console.log(`  Static files + API (POST /api/chat)`);
  console.log(`  Env file: ${ENV_PATH}`);
  console.log(`  Model: ${ANTHROPIC_MODEL}`);
  if (!ANTHROPIC_API_KEY) {
    console.warn("  Warning: ANTHROPIC_API_KEY is not set — AI chat will return 503");
  } else {
    console.log("  Anthropic API key: loaded");
  }
});
