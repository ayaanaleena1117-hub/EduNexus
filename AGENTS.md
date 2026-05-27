# AGENTS.md

## Cursor Cloud specific instructions

### Overview

EduNexus is an AI-powered learning platform for high schools. It consists of:

- **Express API server** (`server/`) — serves static frontend files + proxies AI chat requests to the Anthropic Claude API. Runs on port 3001.
- **Vanilla HTML/CSS/JS frontend** — landing page, login, student and teacher dashboards. No build step required.

### Running the dev server

```bash
cd server && npm run dev
```

This starts the Express server with `--watch` mode (auto-restarts on file changes) at `http://localhost:3001`. It serves both the API endpoints and the static frontend.

### Key endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check — reports whether API key is configured |
| POST | `/api/chat` | Chat with Claude (requires valid `ANTHROPIC_API_KEY`) |

### Environment configuration

- `server/.env` — created from `server/.env.example`. Contains `ANTHROPIC_API_KEY`, optional `PORT` (default 3001), and optional `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`).
- `js/supabase-config.js` — created from `js/supabase-config.example.js`. Contains Supabase project URL and anon key for client-side auth.
- Both files are gitignored.

### Important notes

- **No build step**: The frontend is vanilla HTML/CSS/JS served directly by Express. No bundler, no transpiler.
- **No linter or test framework**: The codebase does not include ESLint, Prettier, or any automated testing infrastructure.
- **No database**: All dashboard data is hardcoded/static HTML. Auth state is stored in Supabase `user_metadata`.
- **Graceful degradation**: The server starts and serves pages even without a valid `ANTHROPIC_API_KEY` — AI chat endpoints return 503. Without valid Supabase config, dashboards show a "Configuration required" message but still load.
- **External services needed for full functionality**: Anthropic API key (for AI chat) and Supabase project (for authentication). Without these, the app still starts and serves pages but auth and AI features won't work.
