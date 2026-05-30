# ShopConnect — Sri Lakshmi Vastralayam

Phase 1 MVP for **Sri Lakshmi Vastralayam** (*Where Trust Meets Tradition*): customers, products, inventory, ledger, sales, and UPI payment verification.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | SQLite + Prisma |
| Auth | JWT (admin password; customer phone + 4-digit PIN) |
| Uploads | Multer + Sharp (local `uploads/`) |

## Deploy to production (free)

See **[DEPLOY_RENDER.md](./DEPLOY_RENDER.md)** — Render + Neon PostgreSQL + Cloudinary (recommended, minimal cost).

See **[DEPLOY.md](./DEPLOY.md)** — optional VPS + PM2 + Nginx (paid server, same PostgreSQL + Cloudinary stack).

See **[ROLLBACK.md](./ROLLBACK.md)** if you need to revert a deployment.

## Quick start

```bash
# From project root
npm install
cd backend && cp .env.example .env   # if .env missing
npm run db:migrate --prefix backend
npm run db:seed --prefix backend
npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:3001/api/health  

### Default admin

| Username | Password |
|----------|----------|
| `owner` | `admin123` |
| `superadmin` | `admin123` |

Change passwords before production.

## PRD coverage (Phase 1)

| Module | Status |
|--------|--------|
| Public catalog (search, filters, new/best) | Done |
| Product detail + WhatsApp inquiry + share | Done |
| Customer onboarding (activation link/code, PIN) | Done |
| Customer login (phone + PIN, 365-day session) | Done |
| Customer dashboard, ledger, UPI payment submit | Done |
| Admin dashboard, customers, products list | Done |
| Ledger + outstanding report | Done |
| Sales (API; auto inventory + ledger) | Done |
| Payment approve/reject (auto ledger credit) | Done |
| Inventory summary + low/out alerts | Done |
| Admin JWT auth | Done |

### Next UI polish (optional)

- Full product create/edit forms with image upload in admin UI  
- Sale creation form in admin UI  
- Bulk customer CSV import UI  
- UPI QR upload in shop settings  
- Printed activation QR cards  

## API overview

```
POST   /api/auth/admin/login
POST   /api/auth/customer/login
GET    /api/auth/activate/:token
POST   /api/auth/activate/:token

GET    /api/products/public
GET    /api/products/public/:code
GET    /api/products              (admin)

POST   /api/customers             (admin)
POST   /api/customers/import      (admin)
GET    /api/customers/dashboard/me (customer)

POST   /api/sales                 (admin)
GET    /api/ledger/outstanding    (admin)
GET    /api/ledger/my             (customer)
POST   /api/payments/submit       (customer)
POST   /api/payments/:id/approve  (admin)

GET    /api/dashboard             (admin)
GET    /api/inventory/summary     (admin)
```

## Environment

Copy `backend/.env.example` to `backend/.env` and set:

- `JWT_SECRET` — long random string  
- `SHOP_WHATSAPP` — country code + number (no `+`)  
- `SHOP_UPI_ID` — shop UPI VPA  
- `FRONTEND_URL` — used in activation links (e.g. `http://localhost:5173`)

## License

Private — Sri Lakshmi Vastralayam / Bonu Anil Kumar.
