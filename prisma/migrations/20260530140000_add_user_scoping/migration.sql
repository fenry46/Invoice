/*
  Warning: per-user data isolation (Phase 2).

  Adds a required `userId` to Fish, Customer and Invoice and replaces the global
  unique constraints (`Fish.name`, `Customer.name`, `Invoice.invoiceNumber`) with
  per-user composites. Because `userId` is NOT NULL with no default, this migration
  can only run against empty tables — for local dev it is applied via a full
  `prisma migrate reset`. A live-data cutover (Phase 4) requires a separate
  backfill migration that assigns existing rows to their owning user first.
*/

-- DropIndex
DROP INDEX "Fish_name_key";
DROP INDEX "Customer_name_key";
DROP INDEX "Invoice_invoiceNumber_key";

-- AlterTable
ALTER TABLE "Fish" ADD COLUMN     "userId" TEXT NOT NULL;
ALTER TABLE "Customer" ADD COLUMN     "userId" TEXT NOT NULL;
ALTER TABLE "Invoice" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Fish_userId_name_key" ON "Fish"("userId", "name");
CREATE UNIQUE INDEX "Customer_userId_name_key" ON "Customer"("userId", "name");
CREATE UNIQUE INDEX "Invoice_userId_invoiceNumber_key" ON "Invoice"("userId", "invoiceNumber");

-- AddForeignKey
ALTER TABLE "Fish" ADD CONSTRAINT "Fish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
