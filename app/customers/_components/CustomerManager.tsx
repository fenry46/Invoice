"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  createCustomerAction,
  deleteCustomerAction,
  updateCustomerAction,
} from "@/app/_actions/customers";

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  invoiceCount: number;
};

export function CustomerManager({ customers }: { customers: CustomerRow[] }) {
  const [state, action, pending] = useActionState(createCustomerAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Pelanggan ditambahkan");
      formRef.current?.reset();
    } else if (state && state.ok === false) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form ref={formRef} action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              name="name"
              placeholder="Nama pelanggan"
              required
              maxLength={100}
              className="h-11"
            />
            <Input
              name="phone"
              placeholder="Telepon (opsional)"
              maxLength={30}
              className="h-11"
            />
            <Button type="submit" disabled={pending} className="h-11">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Tambah</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Users className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-medium">Belum ada pelanggan</p>
          <p className="text-xs text-muted-foreground">
            Tambahkan yang pertama di atas untuk menagih mereka di faktur.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {customers.map((c) => (
            <CustomerItem key={c.id} customer={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CustomerItem({ customer }: { customer: CustomerRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateCustomerAction(customer.id, {
        name,
        phone: phone.trim() === "" ? undefined : phone,
      });
      if (res.ok) {
        toast.success("Berhasil diperbarui");
        setEditing(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function cancel() {
    setName(customer.name);
    setPhone(customer.phone ?? "");
    setEditing(false);
  }

  function remove() {
    if (!confirm(`Hapus "${customer.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCustomerAction(customer.id);
      if (res.ok) toast.success("Berhasil dihapus");
      else toast.error(res.error);
    });
  }

  return (
    <li
      className={
        editing
          ? "flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center"
          : "flex items-center gap-2 px-3 py-3"
      }
    >
      {editing ? (
        <>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              autoFocus
              placeholder="Nama"
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10"
              placeholder="Telepon"
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
          </div>
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={save}
              disabled={pending}
              aria-label="Simpan"
            >
              <Check className="size-4 text-primary" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={cancel}
              aria-label="Batal"
            >
              <X className="size-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{customer.name}</div>
            <div className="text-xs text-muted-foreground">
              {customer.phone ? `${customer.phone} · ` : ""}
              {customer.invoiceCount === 0
                ? "Belum ada faktur"
                : `${customer.invoiceCount} faktur`}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label="Ubah"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={remove}
            disabled={pending}
            aria-label="Hapus"
          >
            <Trash2 className="size-4" />
          </Button>
        </>
      )}
    </li>
  );
}
