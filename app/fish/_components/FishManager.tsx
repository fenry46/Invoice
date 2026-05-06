"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X, Fish as FishIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  createFishAction,
  deleteFishAction,
  renameFishAction,
} from "@/app/_actions/fish";

type FishRow = { id: string; name: string; itemCount: number };

export function FishManager({ fish }: { fish: FishRow[] }) {
  const [state, action, pending] = useActionState(createFishAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Ikan ditambahkan");
      formRef.current?.reset();
    } else if (state && state.ok === false) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form ref={formRef} action={action} className="flex gap-2">
            <Input
              name="name"
              placeholder="mis. Salmon"
              required
              maxLength={60}
              className="h-11"
            />
            <Button type="submit" disabled={pending} className="h-11">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Tambah</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {fish.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <FishIcon className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-medium">Belum ada ikan</p>
          <p className="text-xs text-muted-foreground">
            Tambahkan yang pertama di atas untuk mulai membuat faktur.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {fish.map((f) => (
            <FishItem key={f.id} fish={f} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FishItem({ fish }: { fish: FishRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fish.name);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await renameFishAction(fish.id, name);
      if (res.ok) {
        toast.success("Nama berhasil diubah");
        setEditing(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function remove() {
    if (!confirm(`Hapus "${fish.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteFishAction(fish.id);
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
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setName(fish.name);
                setEditing(false);
              }
            }}
          />
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
              onClick={() => {
                setName(fish.name);
                setEditing(false);
              }}
              aria-label="Batal"
            >
              <X className="size-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{fish.name}</div>
            <div className="text-xs text-muted-foreground">
              {fish.itemCount === 0
                ? "Belum digunakan"
                : `Digunakan di ${fish.itemCount} barang faktur`}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label="Ubah nama"
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
