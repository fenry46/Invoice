# Fish Invoice Generator

Mobile-first Next.js app for fish merchants to manage a master list of fish and
customers and generate sales invoices in IDR with optional deductions. UI is in
Indonesian; dates are formatted in the `Asia/Jakarta` timezone.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + Shadcn UI (`lucide-react` icons, `sonner` toasts, `next-themes`)
- Prisma 6 + PostgreSQL
- Auth.js (`next-auth` v5) — email + password (`bcryptjs`), JWT sessions
- react-hook-form + zod
- `@react-pdf/renderer` for server-rendered invoice PDFs

## Setup

> **Node version:** requires Node ≥ 20.9 (Next.js 16). Use Node 22 LTS. With
> nvm-windows, `nvm use 22` must be run from an **elevated** PowerShell (it flips
> the `nodejs` symlink); otherwise `node`/`npm` won't be on `PATH`.

1. Install dependencies (already done if cloned with `node_modules`):

   ```bash
   npm install
   ```

   `postinstall` runs `prisma generate` automatically.

2. Environment files (both git-ignored):

   - **`.env`** — the **production / live** database. Used by bare `prisma`
     commands and by `npm run build` (`prisma migrate deploy`).
   - **`.env.development.local`** — **local development**. Auto-loaded by
     `npm run dev` (takes precedence over `.env`) and by all `npm run db:*`
     scripts. Holds the local `DATABASE_URL` / `DIRECT_URL` /
     `SHADOW_DATABASE_URL` and `AUTH_SECRET`.

   > ⚠️ The Prisma CLI only auto-reads `.env`. So **local DB work must go
   > through the `npm run db:*` scripts** (they inject
   > `.env.development.local`). A bare `npx prisma …` targets the **live**
   > database. Generate `AUTH_SECRET` with
   > `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

3. Start a local Postgres (Prisma-managed, keep it running in its own terminal):

   ```bash
   npm run db:up
   ```

   It prints the `DATABASE_URL` / `SHADOW_DATABASE_URL`; put them (plus
   `&pgbouncer=true` on `DATABASE_URL`) in `.env.development.local`. **Note:**
   `prisma dev` picks **new ports on each run** — if connections fail after a
   restart, copy the freshly printed ports back into `.env.development.local`.

4. Apply the schema to the local DB:

   ```bash
   npm run db:migrate
   ```

   On a fresh local DB that already has committed migrations, prefer applying
   them directly (no shadow DB, no prompts):

   ```bash
   npx dotenv -e .env.development.local -- prisma migrate deploy
   ```

   > If `npm run db:migrate` fails with **`P1017 Server has closed the
   > connection`** (the shadow-DB step against Prisma Postgres), use the
   > `migrate deploy` command above instead.

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>. You'll be redirected to `/login` — create an
   account at `/register`.

### Database scripts

| Script | What it does (always against the local dev DB) |
| --- | --- |
| `npm run db:up` | Start the local Prisma Postgres server (`fish-dev`) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:reset` | `prisma migrate reset` (destroys local data) |
| `npm run db:studio` | Prisma Studio DB browser |
| `npm run db:generate` | Regenerate Prisma Client |

`npm run build` runs `prisma migrate deploy` (against `.env`) before
`next build`.

## Deployment

Deployed on **Vercel** (live at <https://fish-invoice.vercel.app>), building from
the `master` branch. The production database is **Supabase** Postgres.

Set these environment variables in the Vercel project (Production + Preview):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase **pooler** connection (port 6543) — app queries |
| `DIRECT_URL` | Supabase **direct** connection (port 5432) — migrations/DDL |
| `AUTH_SECRET` | **Required.** Auth.js session secret (see below) |

> ⚠️ **`AUTH_SECRET` is mandatory in production.** Without it, the optimistic
> auth gate (`proxy.ts`) and the per-request session check (`requireUserId()`)
> disagree about whether you're signed in, which sends the app into an infinite
> `/` ⇄ `/login` redirect loop. Generate one with
> `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
> After adding or changing any Vercel env var, **redeploy** for it to apply.

The build step runs `prisma migrate deploy` against the production DB. Each push
to `master` triggers a new Vercel deployment.

**Region.** Functions are pinned to **Singapore (`sin1`)** via `vercel.json`
(`regions: ["sin1"]`) to sit close to the users (Indonesia) and the database.
The Supabase DB currently lives in Sydney (`ap-southeast-2`); co-locating it in
Singapore would remove the remaining cross-region query latency (a larger,
later task).

## Routes

All routes except `/login` and `/register` require an authenticated session
(enforced in `proxy.ts`); unauthenticated requests are redirected to `/login`.

- `/login`, `/register` — email + password auth (Auth.js Credentials)
- `/` — dashboard with recent invoices and quick actions
- `/fish` — add, rename, delete fish
- `/customers` — add, edit, delete customers (name + optional phone)
- `/invoices` — list all invoices (most recent first)
- `/invoices/new` — create an invoice (line items + optional deductions, optional customer); the form auto-saves to `sessionStorage` and restores on return, so navigating away (e.g. to add a fish) doesn't lose entered data
- `/invoices/[id]` — invoice detail; on mobile a Share button hands the PDF to
  the OS share sheet, on desktop a Print button (browser Print to PDF); an Edit
  button opens the edit form
- `/invoices/[id]/edit` — edit an existing invoice (line items, deductions,
  customer); reuses the create form pre-filled with the invoice's current
  values, and like the new-invoice form auto-saves a per-invoice draft to
  `sessionStorage`. The invoice number is preserved
- `/invoices/[id]/pdf` — server-rendered PDF of the invoice (`@react-pdf/renderer`)

Every route has a skeleton `loading.tsx`.

## Notes

- Invoice numbers are auto-generated: `INV-YYYYMMDD-####` (per-day sequence,
  **scoped per user** — each account's daily counter restarts at `0001`),
  allocated inside the same transaction that creates the invoice.
- `Invoice` stores precomputed `grossTotal`, `totalDeductions`, `grandTotal`.
- Deleting a fish or customer referenced by any invoice is blocked at the DB
  level (`onDelete: Restrict`) and surfaced in the UI.
- The detail page's `@media print` stylesheet hides chrome for browser Print-to-PDF.
- The invoice form persists a draft in `sessionStorage`, restored on mount and cleared on successful submit; a "Draf dipulihkan" banner offers a discard button. New invoices use key `invoice-draft:v1`; each edit uses its own key (`invoice-edit-draft:v1:<invoiceId>`).
- Editing an invoice replaces its items and deductions in a single transaction and recomputes the stored totals; the invoice number stays the same.
- Auth is Auth.js v5 (Credentials + JWT). Config in `auth.ts`, route handler in
  `app/api/auth/[...nextauth]/route.ts`, route gating in `proxy.ts` (Next 16
  renamed `middleware` → `proxy`). Open registration is allowed.
- **Data is isolated per user.** Each `Fish`, `Customer`, and `Invoice` belongs
  to a `User` (required `userId` FK, `onDelete: Cascade`); names are unique
  per-user (`@@unique([userId, name])`) and so are invoice numbers. `proxy.ts`
  is only an optimistic gate — actual scoping lives in the data layer: every
  Server Action and data-reading page calls `requireUserId()` (`lib/session.ts`)
  and filters by `userId`, by-id reads use `findFirst({ where: { id, userId } })`
  so one user can't load another's records by id, and invoice writes verify the
  referenced fish/customer are owned by the caller.

## Testing

No unit test runner. End-to-end testing is driven by Claude Code via the
**Playwright MCP** server (browser automation against the local dev server),
configured in `.mcp.json` at the workspace root. MCP servers load when Claude
Code starts, so restart it after changing `.mcp.json`.
