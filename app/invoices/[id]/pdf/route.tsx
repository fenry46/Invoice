import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { InvoicePdf } from "../_components/InvoicePdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await requireUserId();
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      items: { include: { fish: true } },
      deductions: true,
      customer: true,
    },
  });

  if (!invoice) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await renderToBuffer(<InvoicePdf invoice={invoice} />);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
