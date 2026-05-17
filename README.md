# Fish Invoice Generator

Mobile-first Next.js app for fish merchants to manage a master list of fish and
customers and generate sales invoices in IDR with optional deductions. UI is in
Indonesian; dates are formatted in the `Asia/Jakarta` timezone.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + Shadcn UI (`lucide-react` icons, `sonner` toasts, `next-themes`)
- Prisma 6 + PostgreSQL
- react-hook-form + zod
- `@react-pdf/renderer` for server-rendered invoice PDFs

## Setup

1. Install dependencies (already done if cloned with `node_modules`):

   ```bash
   npm install
   ```

   `postinstall` runs `prisma generate` automatically.

2. Provide a PostgreSQL connection string in `.env`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fish?schema=public"
   # optional, for poolers like Supabase/PgBouncer:
   DIRECT_URL="postgresql://user:password@localhost:5432/fish?schema=public"
   ```

   You can use any Postgres instance — local Docker, Supabase, Neon, etc.
   Alternatively run a Prisma-managed local Postgres in another terminal:

   ```bash
   npx prisma dev
   ```

   then copy the `prisma+postgres://...` URL it prints into `DATABASE_URL`.

3. Apply schema:

   ```bash
   npx prisma migrate dev
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

`npm run build` runs `prisma migrate deploy` before `next build`.

## Routes

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

- Invoice numbers are auto-generated: `INV-YYYYMMDD-####` (per-day sequence),
  allocated inside the same transaction that creates the invoice.
- `Invoice` stores precomputed `grossTotal`, `totalDeductions`, `grandTotal`.
- Deleting a fish or customer referenced by any invoice is blocked at the DB
  level (`onDelete: Restrict`) and surfaced in the UI.
- The detail page's `@media print` stylesheet hides chrome for browser Print-to-PDF.
- The invoice form persists a draft in `sessionStorage`, restored on mount and cleared on successful submit; a "Draf dipulihkan" banner offers a discard button. New invoices use key `invoice-draft:v1`; each edit uses its own key (`invoice-edit-draft:v1:<invoiceId>`).
- Editing an invoice replaces its items and deductions in a single transaction and recomputes the stored totals; the invoice number stays the same.
