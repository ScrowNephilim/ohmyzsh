# Prisma setup for Chroma

This README explains how to use the generated Prisma schema for the Chroma project.

Prerequisites
- Node.js (16+)
- PostgreSQL (recommended) or a Postgres-compatible database
- `DATABASE_URL` environment variable set to a valid Postgres connection string

Quick start

1. Install dependencies (from project root):

```bash
npm install prisma --save-dev
npm install @prisma/client
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Create an initial migration (development):

```bash
npx prisma migrate dev --name init
```

Notes and recommendations
- The Prisma schema uses `Json` fields for flexible structures such as `messages`, `environment_state`, and other arrays/objects. Postgres `jsonb` is recommended.
- Table and column names are mapped to match the structure and identifiers described in `.devv/STRUCTURE.md` (for example, the `conversations` table maps `_id`/`_uid` column names).
- If you plan to run in production, create a proper migration using `npx prisma migrate deploy` and set `DATABASE_URL` accordingly.

Next steps
- If you prefer a normalized messages/attachments structure, I can generate additional models and migrations to split `messages` into its own `Message` and `Attachment` models.
- If you want a SQL dump or plain CREATE TABLE statements instead of Prisma migrations, I can add those files as well.
