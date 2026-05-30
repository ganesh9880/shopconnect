# Deploy Sri Lakshmi Vastralayam (ShopConnect)

Step-by-step guide to put the shop online on a **VPS** (recommended). Same app works on **mobile browsers** and **desktop**, and can be **installed** from the browser (PWA).

---

## What you need before starting

| Item | Required? | Notes |
|------|-----------|--------|
| **VPS or cloud server** | Yes | Ubuntu 22.04 LTS, 1 GB RAM minimum, 20 GB disk |
| **Domain name** | Strongly recommended | e.g. `shop.yourshopname.in` — needed for HTTPS & customer links |
| **SSH access** | Yes | Password or SSH key from provider (DigitalOcean, Hostinger, AWS Lightsail, etc.) |
| **Node.js 20 LTS** | Yes | Installed on server |
| **WhatsApp number** | Yes | Real shop mobile, registered on WhatsApp |
| **UPI ID + QR image** | Yes | Set in Admin → Settings after deploy |

**Optional:** Gmail for server alerts; backup USB/cloud for database file.

**You do NOT need:** Payment gateway, email SMTP (for MVP), separate database server (SQLite is file-based).

---

## Architecture (production)

```
Internet → HTTPS (443) → Nginx → Node.js (port 3001)
                              ├── API /api/*
                              ├── Uploads /uploads/*
                              └── React app (frontend/dist)
```

One process serves **website + API + images**. Database file: `backend/dev.db` (rename in production if you like).

---

## Part 1 — Prepare on your Windows PC

### 1.1 Build the frontend

```powershell
cd C:\Users\pavan\OneDrive\Desktop\shopconnect\frontend
npm install
npm run build
```

Output folder: `frontend/dist`

### 1.2 Check backend runs locally in production mode

```powershell
cd C:\Users\pavan\OneDrive\Desktop\shopconnect\backend
npm install
$env:NODE_ENV="production"
$env:PORT="3001"
node src/index.js
```

Open http://localhost:3001 — you should see the shop site (not just JSON).

---

## Part 2 — Server setup (Ubuntu VPS)

SSH into the server:

```bash
ssh root@YOUR_SERVER_IP
```

### 2.1 Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
node -v   # should show v20.x
```

### 2.2 Create app user and folder

```bash
sudo adduser --disabled-password --gecos "" vastralayam
sudo mkdir -p /var/www/vastralayam
sudo chown vastralayam:vastralayam /var/www/vastralayam
```

### 2.3 Upload project

**Option A — Git (if repo is on GitHub):**

```bash
sudo apt install -y git
sudo -u vastralayam git clone YOUR_REPO_URL /var/www/vastralayam
```

**Option B — ZIP from PC:** Zip the `shopconnect` folder (exclude `node_modules`), upload via FileZilla/WinSCP to `/var/www/vastralayam`, then unzip on server.

### 2.4 Install dependencies & build on server

```bash
cd /var/www/vastralayam
sudo -u vastralayam npm install --prefix backend
sudo -u vastralayam npm install --prefix frontend
sudo -u vastralayam npm run build --prefix frontend
```

### 2.5 Production environment file

```bash
sudo -u vastralayam nano /var/www/vastralayam/backend/.env
```

Paste and edit:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./prod.db"
JWT_SECRET=PASTE_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS
JWT_ADMIN_EXPIRES=8h
CUSTOMER_SESSION_DAYS=365
UPLOAD_DIR=uploads
FRONTEND_URL=https://YOUR_DOMAIN
SHOP_WHATSAPP=91XXXXXXXXXX
SHOP_UPI_ID=yourname@bank
SHOP_NAME=Sri Lakshmi Vastralayam
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 2.6 Database migrate & seed

```bash
cd /var/www/vastralayam/backend
sudo -u vastralayam npx prisma migrate deploy
sudo -u vastralayam node prisma/seed.js
```

**Change default passwords immediately** after first login (`owner` / `admin123`).

### 2.7 Create uploads folder

```bash
sudo -u vastralayam mkdir -p /var/www/vastralayam/backend/uploads
```

---

## Part 3 — Run with PM2 (keeps app running)

On server, install PM2 globally:

```bash
sudo npm install -g pm2
```

From project root:

```bash
cd /var/www/vastralayam
sudo -u vastralayam pm2 start ecosystem.config.cjs
sudo -u vastralayam pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u vastralayam --hp /home/vastralayam
```

Check:

```bash
curl http://127.0.0.1:3001/api/health
```

---

## Part 4 — Nginx + HTTPS

### 4.1 Point domain DNS

At your domain registrar, add an **A record**:

| Type | Name | Value |
|------|------|--------|
| A | `@` or `shop` | YOUR_SERVER_IP |
| A | `www` | YOUR_SERVER_IP (optional) |

Wait 5–30 minutes for DNS to propagate.

### 4.2 Nginx config

```bash
sudo cp /var/www/vastralayam/deploy/nginx.conf.example /etc/nginx/sites-available/vastralayam
sudo nano /etc/nginx/sites-available/vastralayam
# Replace YOUR_DOMAIN with your real domain
sudo ln -s /etc/nginx/sites-available/vastralayam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 Free SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Choose redirect HTTP → HTTPS when asked.

---

## Part 5 — After go-live checklist

1. Open `https://YOUR_DOMAIN` on phone and desktop.
2. **Admin → Settings:** WhatsApp number, UPI ID, upload UPI QR.
3. Change admin password from `admin123`.
4. Add real products with photos.
5. Add customers; share activation links.
6. Test WhatsApp button from catalog (must open chat, not “isn’t on WhatsApp”).
7. Test customer payment submit → admin approve.

---

## Backups (important)

SQLite = one file. Back up daily:

```bash
cp /var/www/vastralayam/backend/prod.db /var/backups/vastralayam-$(date +%F).db
cp -r /var/www/vastralayam/backend/uploads /var/backups/uploads-$(date +%F)
```

Automate with `cron` on the server.

---

## Updating the app later

```bash
cd /var/www/vastralayam
sudo -u vastralayam git pull   # or upload new files
sudo -u vastralayam npm install --prefix backend
sudo -u vastralayam npm run build --prefix frontend
cd backend && sudo -u vastralayam npx prisma migrate deploy
sudo -u vastralayam pm2 restart vastralayam
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page | Check `frontend/dist` exists; rebuild frontend |
| API 502 | `pm2 logs vastralayam`; ensure port 3001 running |
| Images missing | Check `backend/uploads` permissions; `chown -R vastralayam` |
| Activation link wrong | Set `FRONTEND_URL=https://YOUR_DOMAIN` in `.env`, restart PM2 |
| WhatsApp error | Use real number in Admin → Settings |

---

## Cheaper alternative (testing only)

Run on a **home PC** with port forwarding — not recommended for 100+ customers (power, IP changes, no HTTPS). Use a VPS for the real shop.

---

## Summary commands (copy-paste order on fresh Ubuntu)

```bash
# Node + nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git

# App (after upload to /var/www/vastralayam)
cd /var/www/vastralayam
npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
cd backend && npx prisma migrate deploy && node prisma/seed.js

# PM2
sudo npm i -g pm2
pm2 start /var/www/vastralayam/ecosystem.config.cjs
pm2 save && pm2 startup

# Nginx + SSL (edit domain first)
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/vastralayam
# edit file, enable site, certbot --nginx
```

Your shop will be live at **https://YOUR_DOMAIN** with the same traditional maroon & gold theme on mobile and web.
