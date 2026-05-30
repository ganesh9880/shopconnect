# Render setup (read this if deploy keeps failing)

## Exit code 127 / `vite: not found`

Render is building an **old Git commit** if you still see `504b45d` in the deploy log. That commit’s `build` script **never runs `npm install` in `frontend/`**.

**You must push the latest code from your PC:**

```powershell
cd "c:\Users\pavan\OneDrive\Desktop\shopconnect"
git add -A
git commit -m "Fix Render: postinstall frontend deps, npm start, vite in dependencies"
git push origin main
```

Then in Render: **Manual Deploy** → **Clear build cache & deploy**. The new commit hash should **not** be `504b45d`.

**Build command (repo root):** `npm install && npm run build`  
**Start command:** `npm start`

---

## You probably created the wrong service type

| If you see this in Render settings | Service type | What it is |
|-----------------------------------|--------------|------------|
| **Start Command** | **Web Service** | Runs Node 24/7 (use for **API only**, or **one combined** deploy below) |
| **Publish Directory** (no Start Command) | **Static Site** | Hosts `frontend/dist` files only (use for **React UI**) |

The React app is **not** a Node server. It must be either:

1. **Static Site** (`frontend` folder), **or**
2. Built into `frontend/dist` and served by the **backend** (one Web Service — see Option B).

---

## Option A — Two services (recommended)

### 1) API — Web Service

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npx prisma generate` |
| **Start Command** | `npm start` |
| Health Check | `/api/health` |

**Environment (required):** `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `FRONTEND_URL` (static site URL after step 2), `NODE_ENV=production`

### 2) UI — Static Site (not Web Service)

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| Env | `VITE_API_URL` = `https://YOUR-API.onrender.com` (no trailing slash) |

There is **no Start Command** on a Static Site.

---

## Option B — One Web Service (simplest if you only made one service)

Use this if your Render service shows **Start Command** and you want a single URL.

| Setting | Value |
|---------|--------|
| Root Directory | *(leave empty — repo root)* |
| Build Command | `npm install && npm run build` |
| **Start Command** | `npm start` |
| Health Check | `/api/health` |

**Environment:**

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | long random string |
| `CLOUDINARY_*` | your Cloudinary keys |
| `NODE_ENV` | `production` |
| `SERVE_FRONTEND` | `true` |
| `FRONTEND_URL` | your Render URL, e.g. `https://shopconnect-xxxx.onrender.com` |

Do **not** set `VITE_API_URL` (same origin: browser calls `/api` on the same host).

After deploy, open your service URL — you should see the shop UI and `/api/health` should work.

---

## Still `vite: not found`?

1. **Push latest code** from GitHub (must include Vite in `frontend/package.json` `dependencies`).
2. **Clear build cache** → Manual Deploy.
3. Confirm **Root Directory**: empty for Option B, or `frontend` for Static Site — not mixed up.

---

## After first successful API deploy

```bash
# In Render Shell for the API service (or locally with DATABASE_URL set):
cd backend && node prisma/seed.js
```

Admin login: `owner` / `admin123` — change password in production.
