# Free deployment: Render + Neon + Cloudinary

Production architecture for **Sri Lakshmi Vastralayam (ShopConnect)** with minimal code changes and easy future VPS migration.

```mermaid
flowchart LR
  User[Mobile / Desktop Browser]
  Web[Render Static Site\nvastralayam-web]
  API[Render Web Service\nvastralayam-api]
  Neon[(Neon PostgreSQL)]
  CDN[Cloudinary CDN]

  User --> Web
  Web -->|HTTPS /api| API
  API --> Neon
  API -->|upload| CDN
  Web -->|image URLs| CDN
```

---

## 1. Files modified / created

### Modified

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | SQLite → PostgreSQL |
| `backend/prisma/migrations/migration_lock.toml` | `postgresql` |
| `backend/package.json` | cloudinary; remove sharp; start runs migrate |
| `backend/.env.example` | Neon + Cloudinary vars |
| `backend/src/config.js` | CORS, Cloudinary, FRONTEND_URL |
| `backend/src/app.js` | CORS only; no local static/uploads |
| `backend/src/index.js` | bind `0.0.0.0` |
| `backend/src/middleware/upload.js` | memory storage only |
| `backend/src/services/imageService.js` | Cloudinary upload |
| `backend/src/routes/products.js` | Cloudinary URLs in `path` |
| `backend/src/routes/payments.js` | Cloudinary + `screenshotUrl` |
| `backend/src/routes/settings.js` | Cloudinary UPI QR |
| `backend/src/routes/customers.js` | `config.frontendUrl` |
| `frontend/src/api/client.js` | `VITE_API_URL` |
| `frontend/src/pages/admin/Payments.jsx` | use `screenshotUrl` |

### Created

| File | Purpose |
|------|---------|
| `backend/prisma/migrations/20250530120000_init_postgres/migration.sql` | Postgres schema |
| `backend/src/services/cloudinaryService.js` | Upload/delete |
| `backend/src/utils/mediaUrl.js` | URL resolver (Cloudinary + legacy) |
| `frontend/.env.example` | `VITE_API_URL` |
| `frontend/public/_redirects` | SPA routing on static host |
| `render.yaml` | Render Blueprint |
| `DEPLOY_RENDER.md` | This guide |
| `ROLLBACK.md` | Rollback steps |

### Removed / obsolete

| Item | Note |
|------|------|
| `backend/uploads/` | No longer used in production |
| `sharp` dependency | Replaced by Cloudinary transforms |
| SQLite migration `20250530000000_init` | Replaced by Postgres migration |

---

## 2. Commands to run (local, before deploy)

```powershell
cd C:\Users\pavan\OneDrive\Desktop\shopconnect\backend
copy .env.example .env
# Fill DATABASE_URL (Neon), Cloudinary, JWT_SECRET in .env

npm install
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
npm run dev
```

```powershell
cd ..\frontend
copy .env.example .env
# VITE_API_URL=   (leave empty for Vite proxy)

npm install
npm run dev
```

---

## 3. Credentials & Configuration Checklist

### Accounts to create (all have free tiers)

1. **GitHub** — host code (Render deploys from repo)
2. **Neon** — PostgreSQL — https://neon.tech
3. **Cloudinary** — images — https://cloudinary.com
4. **Render** — hosting — https://render.com

---

### Neon PostgreSQL

**Where to create**

1. Go to https://console.neon.tech
2. Sign up → **New Project** → name e.g. `vastralayam`
3. Region: choose closest to India if available (e.g. Singapore)
4. Open project → **Connection details**

**What to copy**

Use the **connection string** (URI). Prefer **pooled** connection for Render:

```
postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Where to paste**

| Location | Variable |
|----------|----------|
| Render → `vastralayam-api` → Environment | `DATABASE_URL` |
| Local `backend/.env` | `DATABASE_URL` |

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

---

### Cloudinary

**Where to create**

1. https://cloudinary.com → Sign up (free)
2. Dashboard → **Product environment credentials**

**What to copy**

| Dashboard field | Environment variable |
|-----------------|-------------------|
| Cloud name | `CLOUDINARY_CLOUD_NAME` |
| API Key | `CLOUDINARY_API_KEY` |
| API Secret | `CLOUDINARY_API_SECRET` |

**Where to paste**

Render → `vastralayam-api` → Environment:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=vastralayam
```

Local `backend/.env`: same values.

Images are stored under folder `vastralayam/products`, `vastralayam/payments`, `vastralayam/shop` in Cloudinary. Full HTTPS URLs are saved in the database.

---

### JWT

**Generate secret** (Git Bash, WSL, or macOS/Linux):

```bash
openssl rand -base64 32
```

**Where to paste**

```env
JWT_SECRET=paste_output_here
```

| Location | Required |
|----------|----------|
| Render backend env | Yes |
| Local `backend/.env` | Yes |

Never commit this value to Git.

---

### Render Backend (`vastralayam-api`)

**Service type:** Web Service → Node → Root directory: `backend`

| Variable | Example / notes |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | Render sets automatically (often `10000`) — do not hardcode unless needed |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | from openssl |
| `JWT_ADMIN_EXPIRES` | `8h` |
| `CUSTOMER_SESSION_DAYS` | `365` |
| `FRONTEND_URL` | `https://vastralayam-web.onrender.com` (your static site URL, no trailing slash) |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `CLOUDINARY_FOLDER` | `vastralayam` |
| `SHOP_NAME` | `Sri Lakshmi Vastralayam` |
| `SHOP_WHATSAPP` | `91XXXXXXXXXX` (real WhatsApp number) |
| `SHOP_UPI_ID` | `name@bank` |

**Build command:**

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start command:**

```bash
npm start
```

**Health check path:** `/api/health`

After first deploy, run seed once (Render Shell or locally against Neon):

```bash
cd backend && node prisma/seed.js
```

---

### Render Frontend (`vastralayam-web`)

**Service type:** Static Site → Root directory: `frontend`

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | Backend URL **without** trailing slash, e.g. `https://vastralayam-api.onrender.com` |

**How to get backend URL**

1. Deploy backend first
2. Render dashboard → `vastralayam-api` → copy URL at top (e.g. `https://vastralayam-api.onrender.com`)
3. Paste into static site env as `VITE_API_URL`
4. **Redeploy** static site (Vite bakes env at build time)

**Build command:** `npm install && npm run build`  
**Publish directory:** `dist`

**Then update backend** `FRONTEND_URL` to static site URL and redeploy API (for CORS + activation links).

---

### Old → New configuration mapping

| Old (VPS / SQLite) | New (Render free) |
|--------------------|-------------------|
| `DATABASE_URL="file:./prod.db"` | `DATABASE_URL="postgresql://...@neon.tech/neondb?sslmode=require"` |
| `UPLOAD_DIR=uploads` | **Removed** — use Cloudinary |
| Local `/uploads/products/...` | `https://res.cloudinary.com/.../vastralayam/products/...` |
| `ProductImage.path` = relative path | `ProductImage.path` = full Cloudinary URL |
| `PaymentRequest.screenshotPath` = relative | full Cloudinary URL |
| `ShopConfig.upiQrPath` = relative | full Cloudinary URL |
| Single server serves UI + API | Static site (UI) + Web service (API) |
| `FRONTEND_URL=http://localhost:5173` | `FRONTEND_URL=https://vastralayam-web.onrender.com` |
| Nginx + PM2 | Render managed |
| `VITE_API_URL` (unset) → `/api` proxy | `VITE_API_URL=https://vastralayam-api.onrender.com` |

**Unchanged credentials (same values, new location)**

- `JWT_SECRET`
- `SHOP_WHATSAPP`, `SHOP_UPI_ID`, `SHOP_NAME`
- Admin/customer auth flow (JWT + PIN)

---

## 4. Step-by-step deployment on Render

### Step 1 — Push code to GitHub

```bash
git init
git add .
git commit -m "Render + Neon + Cloudinary deployment"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### Step 2 — Neon database

1. Create Neon project
2. Copy `DATABASE_URL`
3. (Optional) Run migrate + seed from PC pointing at Neon:

```bash
cd backend
set DATABASE_URL=postgresql://...
npx prisma migrate deploy
node prisma/seed.js
```

### Step 3 — Cloudinary

Copy cloud name, API key, API secret.

### Step 4 — Create Render Web Service (API)

1. Render → **New +** → **Web Service**
2. Connect repo
3. Name: `vastralayam-api`
4. Root Directory: `backend`
5. Build / Start commands as above
6. Add all backend environment variables
7. Deploy → wait until **Live**
8. Open `https://YOUR-API.onrender.com/api/health` → should show `"ok": true`

### Step 5 — Seed production DB (if not done in Step 2)

Render → Service → **Shell**:

```bash
node prisma/seed.js
```

Change default password after login.

### Step 6 — Create Render Static Site (frontend)

1. **New +** → **Static Site**
2. Root: `frontend`
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. `VITE_API_URL` = your API URL from Step 4
6. Deploy

### Step 7 — Link frontend URL to backend

1. Copy static site URL (e.g. `https://vastralayam-web.onrender.com`)
2. Set `FRONTEND_URL` on API service to that URL
3. Redeploy API

### Step 8 — Admin setup

1. Open static site URL
2. `/admin/login` → `owner` / `admin123` → **change password**
3. **Settings** → WhatsApp, UPI ID, upload UPI QR
4. Add products with images

---

## 5. Migration validation checklist

After deployment verify:

- [ ] `GET https://API_URL/api/health` returns `ok: true`
- [ ] Database connected (no 500 on login)
- [ ] Admin login works
- [ ] Product creation works
- [ ] Image upload works (appears in Cloudinary Media Library)
- [ ] Image URL in API is `https://res.cloudinary.com/...`
- [ ] Product listing on public catalog shows images
- [ ] Customer activation link uses `FRONTEND_URL` domain
- [ ] Customer login works
- [ ] WhatsApp button opens chat (real number in Settings)
- [ ] Payment submit with screenshot works
- [ ] Admin payment approve works
- [ ] Admin dashboard loads stats
- [ ] Mobile: site usable + Add to Home Screen (PWA)

---

## 6. Future VPS migration (no code changes)

Move from **Render + Neon + Cloudinary** to **Ubuntu VPS + PostgreSQL + Cloudinary**:

| Component | On VPS | Changes |
|-----------|--------|---------|
| PostgreSQL | Install on VPS OR keep Neon | Only `DATABASE_URL` host changes if self-hosting |
| Cloudinary | **No change** | Same env vars; existing image URLs keep working |
| Frontend | Build `frontend/dist`, serve via Nginx OR keep Render static | Update `VITE_API_URL` / DNS |
| Backend | PM2 + `backend` on VPS | Same env vars as Render |
| `FRONTEND_URL` | Your domain | Update to `https://yourdomain.com` |
| CORS | Add domain to `FRONTEND_URL` | Redeploy |

**Steps**

1. Provision Ubuntu 22.04 VPS
2. Install Node 20, Nginx, (optional) local PostgreSQL
3. Clone repo, `npm install`, `npm run build` in frontend
4. Copy Render env vars to `backend/.env` (update `DATABASE_URL` if DB moved)
5. `npx prisma migrate deploy` (same Neon URL = zero DB migration)
6. PM2 start API; Nginx proxy `yourdomain.com` → port 3001
7. Nginx serve `frontend/dist` at `/` OR subdomain
8. Point DNS A record to VPS
9. Certbot SSL

**Credentials unchanged:** `CLOUDINARY_*`, `JWT_SECRET`, shop settings in DB  
**Credentials updated:** `DATABASE_URL` (if self-hosted), `FRONTEND_URL`, `VITE_API_URL`, DNS

---

## 7. Backup strategy

| Asset | How to backup |
|-------|----------------|
| **Neon DB** | Neon console → backups (free tier: history); or `pg_dump` on schedule |
| **Cloudinary** | Images safe in cloud; optional export via Cloudinary API |
| **Env secrets** | Store in password manager (not Git) |

---

## 8. Rollback

See [ROLLBACK.md](./ROLLBACK.md).

---

## 9. Final deliverable summary

| Item | Detail |
|------|--------|
| **Accounts** | GitHub, Neon, Cloudinary, Render |
| **Secrets to generate** | `JWT_SECRET` (openssl) |
| **Deployment URLs** | `https://vastralayam-web.onrender.com` (web), `https://vastralayam-api.onrender.com` (api) |
| **Post-deploy** | Seed DB, change admin password, Settings, test checklist §5 |

Free tier limits (approximate): Render web sleeps after inactivity; Neon storage cap; Cloudinary bandwidth/storage cap — sufficient for MVP shop.
