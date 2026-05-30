# Rollback instructions

## Rollback Render deployment only (keep code on Render stack)

1. Render dashboard → service → **Rollback** to previous deploy (if available).
2. Or redeploy last known-good Git commit.

## Rollback code to SQLite + local uploads (development)

1. Checkout previous Git commit before Postgres/Cloudinary migration.
2. Restore `backend/prisma/schema.prisma` provider `sqlite`.
3. Restore `migration_lock.toml` to `sqlite`.
4. `cd backend && npm install && npx prisma migrate dev`
5. Restore `uploads/` usage in routes (from Git history).

## Rollback database (Neon)

Neon console → **Branches** → restore from backup or create new branch and point `DATABASE_URL` to it.

## Rollback images

Cloudinary images remain in your account. Old SQLite DB paths will not work if you revert code without migrating URLs.

## Emergency: disable uploads

If Cloudinary fails, check env vars on Render and Cloudinary dashboard status. API returns clear error: `Cloudinary is not configured`.
