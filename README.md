# EduNexus

AI-powered learning platform for high schools — landing page, authentication, and teacher/student dashboards.

## Run locally

### Recommended: API server + static site (one command)

The Node server serves the frontend and proxies Claude requests so your API key stays on the server.

```bash
cd server
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY from https://console.anthropic.com/
npm install
npm start
```

Open **http://localhost:3001**, sign in, and use the **AI Tutor** (student) or **AI Assistant** (teacher) panels.

### Alternative: separate static server

If you prefer `python3 -m http.server 8080` for the HTML/CSS/JS, still run the API on port 3001 (steps above). The dashboards default to `http://localhost:3001` for chat requests. To use a different API URL, copy `js/api-config.example.js` to `js/api-config.js` and set `baseUrl`.

## Supabase authentication setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key (also called the publishable key in newer dashboards)
3. Copy the config template and add your credentials:

```bash
cp js/supabase-config.example.js js/supabase-config.js
```

4. Edit `js/supabase-config.js`:

```javascript
window.EDUNEXUS_SUPABASE = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_ANON_KEY",
};
```

`js/supabase-config.js` is gitignored so your keys are not committed.

### Supabase Auth settings

In the Supabase dashboard under **Authentication → Providers → Email**:

- Enable **Email** provider.
- For local testing, you may disable **Confirm email** so new sign-ups can log in immediately. If confirmation is required, users must verify email before signing in.

No database tables are required for basic sign-up/login; roles are stored in `user_metadata` (`role`: `student` or `teacher`, `full_name`).

### Sign-up and redirects

- **Sign up** (tab on `login.html`) — creates a Supabase user with role and full name in metadata.
- **Log in** — redirects by role:
  - `student` → `student-dashboard.html`
  - `teacher` → `teacher-dashboard.html`
- Dashboards require an active session; unauthenticated users are sent to `login.html`.

## Anthropic Claude API setup

1. Create an API key at [console.anthropic.com](https://console.anthropic.com/).
2. Add it to `server/.env` (never commit this file):

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

3. Optional: change model or port in `server/.env` (`ANTHROPIC_MODEL`, `PORT`). Default model is `claude-sonnet-4-6`.

**Endpoints**

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Check server and whether the API key is configured |
| `POST` | `/api/chat` | Chat with Claude (`mode`: `tutor` or `assistant`, `messages`: conversation history) |

- **`tutor`** — Socratic AI tutor for students (guides with questions, avoids giving away final answers).
- **`assistant`** — Teaching assistant for lesson plans, quizzes, assignments, and classroom strategies.

## Structure

```
EduNexus/
├── index.html
├── login.html
├── teacher-dashboard.html
├── student-dashboard.html
├── server/
│   ├── index.js              # Express API + static file server
│   ├── prompts.js            # System prompts for tutor vs assistant
│   ├── .env.example
│   └── package.json
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   └── student-dashboard.css
└── js/
    ├── supabase-config.example.js
    ├── supabase-config.js          # local only (gitignored)
    ├── api-config.example.js       # optional API base URL override
    ├── ai-client.js                # shared fetch client for /api/chat
    ├── ai-tutor.js                 # student dashboard chat UI
    ├── ai-assistant.js             # teacher dashboard chat UI
    ├── supabase.js
    ├── auth.js
    ├── auth-guard.js
    └── …
```
