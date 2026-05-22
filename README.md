# EduNexus

AI-powered learning platform for high schools — landing page, authentication, and teacher/student dashboards.

## Run locally

Serve the project folder with any static server:

```bash
python3 -m http.server 8080
# or: npx serve .
```

Then visit `http://localhost:8080`.

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

## Structure

```
EduNexus/
├── index.html
├── login.html
├── teacher-dashboard.html
├── student-dashboard.html
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   └── student-dashboard.css
└── js/
    ├── supabase-config.example.js
    ├── supabase-config.js          # local only (gitignored)
    ├── supabase.js
    ├── auth.js
    ├── auth-guard.js
    └── …
```
