/*
  Security hardening: enable Row Level Security (RLS) on every table in the
  exposed `public` schema.

  This app uses Auth.js (next-auth) + direct Prisma over the Postgres connection
  string; it never uses supabase-js or the anon/publishable key. Prisma connects
  as a privileged role that BYPASSES RLS, so the application is unaffected.

  Without RLS, every table is reachable through the Supabase Data API by anyone
  holding the anon key (User password hashes, customer PII, invoices). Enabling
  RLS with no policies denies that path entirely. No `auth.uid()` policies are
  added because there is no Supabase Auth issuing JWTs here.

  `ENABLE ROW LEVEL SECURITY` is idempotent, so re-running on a fresh deploy is a
  safe no-op.
*/

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Fish" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deduction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
