# SRMAP API

Srmapi is an alternative portal designed for SRMAP students to access track academics, resources, and manage student data easily.

A Next.js + Node backend project that acts as a proxy/utility layer for the SRM student portal (https://student.srmap.edu.in). This app logs in to SRM on behalf of users, scrapes/queries data (attendance, timetable, exams, profile, etc.), and exposes a modern UI + API for students.

---

## What this project does

This repo provides:

- A **Next.js frontend** for students (login, dashboard, attendance, timetable, exams, resources, forums, etc.)
- A **server-side API** (Next.js API routes) to:
  - Authenticate with SRM via scraping and captcha solving
  - Fetch & cache data (attendance, schedule, results, internal marks, etc.)
  - Provide additional features like feedback reporting, vacancy search, resources, forums, etc.
- A **MongoDB backend** for storing users, settings, limits, blocked users, and forum data.
- A **captcha-solving service integration** to automatically solve SRM login captchas.

> ⚠️ This project acts as a third-party proxy/scraper for SRM’s systems. Use at your own risk and follow SRM’s policies.

---

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create a `.env` file (not committed) from the `.env.example` file.

Example `.env.example`:

```dotenv
NODE_ENV=

MONGO_URI=""
LIMIT=20

ACCESS_SECRET=""
ENCRYPT_SECRET=""
ACCESS_EXPIRE=365

D_REPORT=""
```

#### 🔐 Required variables

- `NODE_ENV`: typically `development` or `production`.
- `MONGO_URI`: MongoDB connection string (used for user storage, rate limits, forum data, blocked users, etc.).
- `ACCESS_SECRET`: JWT signing secret used to sign auth tokens.
- `ACCESS_EXPIRE`: Token expiration in days (used when signing JWTs).
- `ENCRYPT_SECRET`: Used to encrypt/decrypt sensitive payloads (exists in backend utilities).
- `LIMIT`: A rate-limit / request-limit number (used to control how many times a user can refresh/fetch data).
- `D_REPORT`: A webhook URL for bug/issue reporting (Discord webhook or similar).

> ✅ **Do not commit** `.env`, `.env.local`, or any file that contains secrets.

---

## 📦 Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Next.js in development (with Turbopack). |
| `npm run build` | Build the Next.js production app. |
| `npm run start` | Run the production build on port 3000. |
| `npm run full` | Run a prefork/preload script plus start Next.js on port 3000. |
| `npm run lint` | Run Next.js/ESLint checks. |

---

## 🐍 Captcha solver (Python)

This repo includes a local captcha-solving service (used by the server to solve SRM login captchas).

### Requirements

- **Python 3.12** (mandatory; the model depends on Python 3.12+ features)
- Install Python dependencies:

```bash
python3 -m pip install -r python/requirements.txt
```

### Run the service

```bash
python3 python/api.py
```

This starts a local HTTP server (default `http://0.0.0.0:6000`) that the backend uses to solve captchas.

---

## Project structure overview

### Frontend (Next.js app)

- `src/app/` — Main Next.js App Router folder.
  - `layout.tsx` — Root layout used by all routes.
  - `globals.css` — Global styles.
  - `error.tsx` / `not-found.tsx` — Error boundaries.
  - `(public)/` — Public routes (login, forgot password) that do not require auth.
  - `(protected)/` — Authenticated routes (dashboard, attendance, timetable, etc.).

#### Public routes (`src/app/(public)`)

- `/login` — Login page for students.
- `/forgot` — Forgot password flow UI (if implemented).

#### Protected routes (`src/app/(protected)`)

These routes require an authenticated user and are typically reachable only after login.
Most of the app’s features live here.

Some important protected routes:

- `/dashboard` — The main landing page after login.
- `/attendance` — Attendance records.
- `/timetable` — Timetable / schedule.
- `/exams` — Exam schedules and results.
- `/cgpa` — CGPA / internal marks information.
- `/profile` — User profile and settings.
- `/resources` — Learning resources and downloads.
- `/forums` — Community forum functionality.
- `/settings` — App settings, theme, notifications, etc.
- `/vacant` — Vacant room finder (based on SRM data). 

> 🔐 Protected routes use client-side auth state (JWT token) and call the Next.js API routes for data.

---

## 🧠 API routes (backend logic)

`src/app/api/` contains server-side API routes (Next.js Route Handlers).

### Key API route groups

- `/api/auth/*` — Authentication endpoints.
  - `/api/auth/login` — Logs into SRM, solves captcha, stores session info, and issues a JWT.
  - `/api/auth/logout` (if present) — Clears session.

- `/api/srmapi/*` — Core SRM scraping & proxy endpoints.
  - `/api/srmapi/initiate/session` — Starts a session with SRM and stores session info.
  - `/api/srmapi/refresh` — Refreshes the session and optionally re-fetches data.
  - Other endpoints fetch attendance, timetable, internals, etc. (based on SRM portal data).

- `/api/tools/*` — Utility APIs.
  - `/api/tools/report` — Sends bug/issue reports to `D_REPORT` webhook URL.

- `/api/forums/*` — Forum-related routes (create posts, list threads, comments, etc.).

- `/api/resources/*` — Resources endpoints (download materials, list assets, etc.).

- `/api/vacant/*` — Vacant room finder endpoints.

> ⚡ Authentication for API routes is performed by verifying a JWT token in the `Authorization: Bearer <token>` header.

---

## 🔐 Auth & security

### JWT / token handling

- `ACCESS_SECRET` is used to sign JWTs.
- `ACCESS_EXPIRE` controls how long tokens are valid (in days).
- Tokens are validated via `src/backendUtils/auth/verifyUser.ts` and `src/backendUtils/utils/functions.ts`.

### Rate limiting / request limits

- `LIMIT` controls how many times a user can refresh/fetch data per session.
- Some routes in `src/app/api/auth/login`, `src/app/api/srmapi/refresh`, and `src/app/api/srmapi/initiate/session` use this `LIMIT` to throttle calls.

### MongoDB usage

- `MONGO_URI` is used by `src/lib/database/mongodb.ts` and `src/backendUtils/vacant/generate.ts`.
- Mongo stores:
  - User sessions / constraints
  - Blocked users
  - Forum posts and comments
  - Other app data (resources, vacant room data, etc.)

---

## 🧩 How the login flow works (high level)

1. User posts credentials to `/api/auth/login`.
2. The server starts a session with SRM:
   - GET to `https://student.srmap.edu.in/` to obtain a `JSESSIONID`.
   - GET captcha and solve it using the captcha service (`localhost:6000/captcha`).
   - POST login credentials + captcha to SRM login endpoint.
3. If login succeeds, the server issues a JWT and stores session info.
4. Client uses the JWT to access protected Next.js routes and call backend APIs.

---

## 🧪 Running the project

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run start
```

---

## 📝 Contributing (open source rules)

Thank you for contributing! A few ground rules:

- **Do not add or rely on inline code comments.**
  - The codebase prefers clear naming and self-documenting functions.
  - If you feel something is unclear, improve the code or add documentation (e.g., update README or add a new doc file).
- **Do not import backend-only modules in frontend code.**
  - `src/backendUtils/*` is intended for server/runtime-only logic (scraping, captcha, auth). Frontend code should only reference client-safe modules.
- **Do not commit secrets or sensitive config.**
  - Never commit `.env`, `.env.local`, or any files containing API keys, passwords, or secrets.
- Keep changes small and focused. Use meaningful PR titles and descriptions.
- Avoid committing large binary files (images, builds, etc.) unless absolutely necessary.
- Verify your changes by running `npm run lint` and testing the affected flows.

---

## ⚠️ Notes

- This repo contains sensitive logic related to user auth and scraping. Treat secrets carefully.
- The system depends on the SRM student portal’s HTML structure. If SRM changes their portal, scraping logic may break and require updates.

---

## Key folders (quick reference)

- `src/app/` — Next.js app routes & UI
- `src/app/api/` — Server API routes
- `src/backendUtils/` — Helper functions for scraping, auth, captcha, and utilities.
- `src/lib/database/` — MongoDB connection / helpers.
- `src/components/` — React UI components.
- `src/context/` — React context providers for auth, theme, etc.
- `scripts/` — Utility scripts (e.g., converting Excel faculty data to JSON). These are one‑off helpers and not part of the running app.

---

If you need more detail on a specific route, controller, or feature area, just mail us:- srmap.api@gmail.com
