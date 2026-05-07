"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareInvoiceButton({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      const res = await fetch(`/invoices/${invoiceId}/pdf`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const filename = `${invoiceNumber}.pdf`;
      const file = new File([blob], filename, { type: "application/pdf" });

      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: invoiceNumber,
            text: `Faktur ${invoiceNumber}`,
          });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal membuat PDF");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button size="sm" onClick={onClick} disabled={pending}>
      <Share2 className="size-4" />
      Bagikan
    </Button>
  );
}
