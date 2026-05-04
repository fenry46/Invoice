"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
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
      toast.success("Fish added");
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
              placeholder="e.g. Salmon"
              required
              maxLength={60}
              className="h-11"
            />
            <Button type="submit" disabled={pending} className="h-11">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {fish.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No fish yet. Add your first one above.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
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
        toast.success("Renamed");
        setEditing(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function remove() {
    if (!confirm(`Delete "${fish.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteFishAction(fish.id);
      if (res.ok) toast.success("Deleted");
      else toast.error(res.error);
    });
  }

  return (
    <li className="flex items-center gap-2 p-3">
      {editing ? (
        <>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setName(fish.name);
                setEditing(false);
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={save}
            disabled={pending}
            aria-label="Save"
          >
            <Check className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setName(fish.name);
              setEditing(false);
            }}
            aria-label="Cancel"
          >
            <X className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{fish.name}</div>
            <div className="text-xs text-muted-foreground">
              {fish.itemCount === 0
                ? "Not used yet"
                : `Used in ${fish.itemCount} invoice item${fish.itemCount === 1 ? "" : "s"}`}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label="Rename"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={remove}
            disabled={pending}
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </>
      )}
    </li>
  );
}
