"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteInvoiceAction } from "@/app/_actions/invoices";

export function DeleteInvoiceButton({
  id,
  invoiceNumber,
}: {
  id: string;
  invoiceNumber: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    toast(`Hapus faktur ${invoiceNumber}?`, {
      description: "Tindakan ini tidak dapat dibatalkan.",
      duration: 8000,
      classNames: {
        actionButton:
          "!bg-destructive !text-white hover:!bg-destructive/90",
      },
      action: {
        label: "Hapus",
        onClick: () => {
          startTransition(async () => {
            const res = await deleteInvoiceAction(id);
            if (res.ok) {
              toast.success("Faktur dihapus");
              router.push("/invoices");
            } else {
              toast.error(res.error);
            }
          });
        },
      },
      cancel: { label: "Batal", onClick: () => {} },
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="size-4" />
      <span className="hidden sm:inline">Hapus</span>
    </Button>
  );
}
