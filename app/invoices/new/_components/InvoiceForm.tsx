"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceInputSchema, type InvoiceInput } from "@/lib/schemas";
import { formatIDR } from "@/lib/format";
import { createInvoiceAction } from "@/app/_actions/invoices";

type Fish = { id: string; name: string };
type Customer = { id: string; name: string };

const DRAFT_KEY = "invoice-draft:v1";

function makeDefaults(fish: Fish[]): InvoiceInput {
  return {
    customerId: "",
    items: [
      {
        fishId: fish[0]?.id ?? "",
        weightKg: "" as unknown as number,
        pricePerKg: "" as unknown as number,
      },
    ],
    deductions: [],
  };
}

// Reconcile a stored draft against the fish/customers that currently exist,
// so a draft never references a deleted fish or customer.
function reconcileDraft(
  draft: unknown,
  fish: Fish[],
  customers: Customer[],
): InvoiceInput | null {
  if (!draft || typeof draft !== "object") return null;
  const d = draft as Partial<InvoiceInput>;
  if (!Array.isArray(d.items)) return null;
  const fishIds = new Set(fish.map((f) => f.id));
  const customerIds = new Set(customers.map((c) => c.id));
  const fallbackFishId = fish[0]?.id ?? "";
  const items = d.items.map((it) => ({
    fishId: it && fishIds.has(it.fishId) ? it.fishId : fallbackFishId,
    weightKg: it?.weightKg as number,
    pricePerKg: it?.pricePerKg as number,
  }));
  if (items.length === 0) return null;
  return {
    customerId:
      d.customerId && customerIds.has(d.customerId) ? d.customerId : "",
    items,
    deductions: Array.isArray(d.deductions)
      ? d.deductions.map((de) => ({
          description: de?.description ?? "",
          amount: de?.amount as number,
        }))
      : [],
  };
}

function readDraft(fish: Fish[], customers: Customer[]): InvoiceInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return reconcileDraft(JSON.parse(raw), fish, customers);
  } catch {
    return null;
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function InvoiceForm({
  fish,
  customers,
}: {
  fish: Fish[];
  customers: Customer[];
}) {
  const [pending, startTransition] = useTransition();

  const [restoredDraft] = useState(() => readDraft(fish, customers));
  const [restored, setRestored] = useState(restoredDraft !== null);

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: restoredDraft ?? makeDefaults(fish),
    mode: "onSubmit",
  });

  const watchedAll = useWatch({ control: form.control });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(watchedAll));
    } catch {
      /* ignore quota / disabled storage */
    }
  }, [watchedAll]);

  function discardDraft() {
    clearDraft();
    form.reset(makeDefaults(fish));
    setRestored(false);
  }

  const fishItems = Object.fromEntries(fish.map((f) => [f.id, f.name]));
  const customerItems = Object.fromEntries(
    customers.map((c) => [c.id, c.name]),
  );

  const items = useFieldArray({ control: form.control, name: "items" });
  const deductions = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedDeductions = useWatch({
    control: form.control,
    name: "deductions",
  });

  const grossTotal = (watchedItems ?? []).reduce((s, it) => {
    const w = Number(it?.weightKg) || 0;
    const p = Number(it?.pricePerKg) || 0;
    return s + w * p;
  }, 0);
  const totalDeductions = (watchedDeductions ?? []).reduce(
    (s, d) => s + (Number(d?.amount) || 0),
    0,
  );
  const grandTotal = grossTotal - totalDeductions;

  function onSubmit(data: InvoiceInput) {
    // Drop the draft before awaiting: on success the action redirects and code
    // here never runs, so clearing first guarantees no stale draft remains.
    clearDraft();
    startTransition(async () => {
      const res = await createInvoiceAction(data);
      if (res && res.ok === false) {
        toast.error(res.error);
      }
    });
  }

  const itemErrors = form.formState.errors.items;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-28 sm:pb-0">
      {restored && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Draf sebelumnya dipulihkan.</span>
          <Button type="button" variant="ghost" size="sm" onClick={discardDraft}>
            Hapus draf
          </Button>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="customerId"
            render={({ field: f }) => (
              <Select
                value={f.value}
                onValueChange={f.onChange}
                items={customerItems}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Pilih pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.customerId && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.customerId.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Barang</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              items.append({
                fishId: fish[0]?.id ?? "",
                weightKg: "" as unknown as number,
                pricePerKg: "" as unknown as number,
              })
            }
          >
            <Plus className="size-4" />
            Tambah barang
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.fields.map((field, idx) => {
            const w = Number(watchedItems?.[idx]?.weightKg) || 0;
            const p = Number(watchedItems?.[idx]?.pricePerKg) || 0;
            const subtotal = w * p;
            const err = itemErrors?.[idx];
            return (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-3 rounded-md border p-3 sm:grid-cols-12"
              >
                <div className="col-span-2 sm:col-span-5">
                  <Label className="text-xs">Ikan</Label>
                  <Controller
                    control={form.control}
                    name={`items.${idx}.fishId`}
                    render={({ field: f }) => (
                      <Select
                        value={f.value}
                        onValueChange={f.onChange}
                        items={fishItems}
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Pilih ikan" />
                        </SelectTrigger>
                        <SelectContent>
                          {fish.map((fi) => (
                            <SelectItem key={fi.id} value={fi.id}>
                              {fi.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {err?.fishId && (
                    <p className="mt-1 text-xs text-destructive">
                      {err.fishId.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <Label className="text-xs">Berat (kg)</Label>
                  <Controller
                    control={form.control}
                    name={`items.${idx}.weightKg`}
                    render={({ field: f }) => (
                      <FormattedNumberInput
                        value={f.value as number | undefined}
                        onChange={f.onChange}
                        onBlur={f.onBlur}
                        decimal
                        placeholder="0,00"
                      />
                    )}
                  />
                  {err?.weightKg && (
                    <p className="mt-1 text-xs text-destructive">
                      {err.weightKg.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <Label className="text-xs">Harga / kg (IDR)</Label>
                  <Controller
                    control={form.control}
                    name={`items.${idx}.pricePerKg`}
                    render={({ field: f }) => (
                      <FormattedNumberInput
                        value={f.value as number | undefined}
                        onChange={f.onChange}
                        onBlur={f.onBlur}
                        placeholder="0"
                      />
                    )}
                  />
                  {err?.pricePerKg && (
                    <p className="mt-1 text-xs text-destructive">
                      {err.pricePerKg.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2 flex items-center justify-between gap-2 border-t pt-3 sm:col-span-12">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Subtotal: </span>
                    <span className="font-medium">{formatIDR(subtotal)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => items.remove(idx)}
                    disabled={items.fields.length <= 1}
                    aria-label="Hapus barang"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {typeof itemErrors?.message === "string" && (
            <p className="text-xs text-destructive">{itemErrors.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Potongan</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              deductions.append({
                description: "",
                amount: "" as unknown as number,
              })
            }
          >
            <Plus className="size-4" />
            Tambah potongan
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {deductions.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada potongan. Tambahkan ongkir, es, dll. di atas.
            </p>
          ) : (
            deductions.fields.map((field, idx) => {
              const err = form.formState.errors.deductions?.[idx];
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-3 rounded-md border p-3 sm:grid-cols-12"
                >
                  <div className="col-span-2 sm:col-span-7">
                    <Label className="text-xs">Keterangan</Label>
                    <Input
                      className="h-11"
                      placeholder="mis. Ongkir"
                      {...form.register(`deductions.${idx}.description`)}
                    />
                    {err?.description && (
                      <p className="mt-1 text-xs text-destructive">
                        {err.description.message}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-4">
                    <Label className="text-xs">Jumlah (IDR)</Label>
                    <Controller
                      control={form.control}
                      name={`deductions.${idx}.amount`}
                      render={({ field: f }) => (
                        <FormattedNumberInput
                          value={f.value as number | undefined}
                          onChange={f.onChange}
                          onBlur={f.onBlur}
                          placeholder="0"
                        />
                      )}
                    />
                    {err?.amount && (
                      <p className="mt-1 text-xs text-destructive">
                        {err.amount.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deductions.remove(idx)}
                      aria-label="Hapus potongan"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="hidden sm:block">
        <CardContent className="space-y-2 pt-6 text-sm">
          <Row label="Total kotor" value={formatIDR(grossTotal)} />
          <Row
            label="Potongan"
            value={`- ${formatIDR(totalDeductions)}`}
          />
          <div className="border-t pt-2">
            <Row
              label="Total akhir"
              value={formatIDR(grandTotal)}
              bold
            />
          </div>
        </CardContent>
      </Card>

      <div className="hidden justify-end gap-2 sm:flex">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 min-w-32 shadow-sm"
        >
          {pending ? "Menyimpan..." : "Buat faktur"}
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:hidden">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Total akhir
            </div>
            <div className="truncate text-lg font-semibold tabular-nums">
              {formatIDR(grandTotal)}
            </div>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-11 min-w-28 shadow-sm"
          >
            {pending ? "Menyimpan..." : "Buat"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${bold ? "text-base font-semibold" : ""}`}
    >
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

const idIntFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});
const idDecimalFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 3,
});

function formatForDisplay(
  n: number | undefined,
  decimal: boolean,
  trailing: string,
): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "";
  const fmt = decimal ? idDecimalFormatter : idIntFormatter;
  return fmt.format(n) + trailing;
}

function FormattedNumberInput({
  value,
  onChange,
  onBlur,
  decimal = false,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onBlur?: () => void;
  decimal?: boolean;
  placeholder?: string;
}) {
  // Track a trailing decimal separator (or trailing zeros after it)
  // so the user can type "12," and see it before adding fractional digits.
  const [trailing, setTrailing] = useState("");

  function handleChange(raw: string) {
    if (decimal) {
      // Keep digits, dots, and commas. Treat dot as thousand separator (drop)
      // and comma as decimal separator.
      const cleaned = raw.replace(/[^\d.,]/g, "");
      const noDots = cleaned.replace(/\./g, "");
      const firstComma = noDots.indexOf(",");
      let intPart = noDots;
      let fracPart = "";
      if (firstComma !== -1) {
        intPart = noDots.slice(0, firstComma);
        fracPart = noDots.slice(firstComma + 1).replace(/,/g, "");
      }
      if (intPart === "" && fracPart === "" && firstComma === -1) {
        setTrailing("");
        onChange(undefined);
        return;
      }
      const normalized = fracPart
        ? `${intPart || "0"}.${fracPart}`
        : intPart || "0";
      const n = Number(normalized);
      if (!Number.isFinite(n)) return;
      // Preserve trailing comma / trailing zeros so display matches typing.
      let suffix = "";
      if (firstComma !== -1) {
        const trailingZeros = fracPart.match(/0+$/)?.[0] ?? "";
        if (fracPart === "") suffix = ",";
        else if (trailingZeros && /[1-9]/.test(fracPart) === false)
          suffix = `,${fracPart}`;
        else if (trailingZeros) suffix = trailingZeros;
      }
      setTrailing(suffix);
      onChange(n);
    } else {
      const digits = raw.replace(/\D/g, "");
      if (digits === "") {
        onChange(undefined);
        return;
      }
      onChange(Number(digits));
    }
  }

  function handleBlur() {
    setTrailing("");
    onBlur?.();
  }

  const display = decimal
    ? formatForDisplay(value, true, trailing)
    : formatForDisplay(value, false, "");

  return (
    <Input
      type="text"
      inputMode="decimal"
      className="h-11 tabular-nums"
      placeholder={placeholder}
      value={display}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      autoComplete="off"
    />
  );
}
