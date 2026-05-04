# Fish Invoice Generator

Mobile-first Next.js app for fish merchants to manage a master list of fish and generate sales invoices in IDR with optional deductions.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + Shadcn UI
- Prisma 6 + PostgreSQL
- react-hook-form + zod

## Setup

1. Install dependencies (already done if cloned with `node_modules`):

   ```bash
   npm install
   ```

2. Provide a PostgreSQL connection string in `.env`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fish?schema=public"
   ```

   You can use any Postgres instance — local Docker, Supabase, Neon, etc.
   Alternatively run a Prisma-managed local Postgres in another terminal:

   ```bash
   npx prisma dev
   ```

   then copy the `prisma+postgres://...` URL it prints into `DATABASE_URL`.

3. Apply schema:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Routes

- `/` — dashboard with recent invoices and quick actions
- `/fish` — add, rename, delete fish
- `/invoices` — list all invoices (most recent first)
- `/invoices/new` — create a new invoice
- `/invoices/[id]` — invoice detail with print view (uses browser Print to PDF)

## Notes

- Invoice numbers are auto-generated: `INV-YYYYMMDD-####` (per-day sequence).
- Deleting a fish that's referenced by any invoice item is blocked at the DB level (`onDelete: Restrict`).
- The detail page has a Print button; the `@media print` stylesheet hides chrome.
