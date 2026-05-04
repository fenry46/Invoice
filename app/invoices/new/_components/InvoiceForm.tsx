"use client";

import { useTransition } from "react";
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

export function InvoiceForm({ fish }: { fish: Fish[] }) {
  const [pending, startTransition] = useTransition();

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: {
      items: [{ fishId: fish[0]?.id ?? "", weightKg: 0, pricePerKg: 0 }],
      deductions: [],
    },
    mode: "onSubmit",
  });

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
    startTransition(async () => {
      const res = await createInvoiceAction(data);
      if (res && res.ok === false) {
        toast.error(res.error);
      }
    });
  }

  const itemErrors = form.formState.errors.items;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              items.append({
                fishId: fish[0]?.id ?? "",
                weightKg: 0,
                pricePerKg: 0,
              })
            }
          >
            <Plus className="size-4" />
            Add item
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
                  <Label className="text-xs">Fish</Label>
                  <Controller
                    control={form.control}
                    name={`items.${idx}.fishId`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select fish" />
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
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="h-11"
                    {...form.register(`items.${idx}.weightKg`, {
                      valueAsNumber: true,
                    })}
                  />
                  {err?.weightKg && (
                    <p className="mt-1 text-xs text-destructive">
                      {err.weightKg.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <Label className="text-xs">Price / kg (IDR)</Label>
                  <Input
                    type="number"
                    step="1"
                    inputMode="decimal"
                    className="h-11"
                    {...form.register(`items.${idx}.pricePerKg`, {
                      valueAsNumber: true,
                    })}
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
                    aria-label="Remove item"
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
          <CardTitle>Deductions</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              deductions.append({ description: "", amount: 0 })
            }
          >
            <Plus className="size-4" />
            Add deduction
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {deductions.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No deductions. Add shipping, ice box, etc. above.
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
                    <Label className="text-xs">Description</Label>
                    <Input
                      className="h-11"
                      placeholder="e.g. Shipping"
                      {...form.register(`deductions.${idx}.description`)}
                    />
                    {err?.description && (
                      <p className="mt-1 text-xs text-destructive">
                        {err.description.message}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-4">
                    <Label className="text-xs">Amount (IDR)</Label>
                    <Input
                      type="number"
                      step="1"
                      inputMode="decimal"
                      className="h-11"
                      {...form.register(`deductions.${idx}.amount`, {
                        valueAsNumber: true,
                      })}
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
                      aria-label="Remove deduction"
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

      <Card>
        <CardContent className="space-y-2 pt-6 text-sm">
          <Row label="Gross total" value={formatIDR(grossTotal)} />
          <Row
            label="Deductions"
            value={`- ${formatIDR(totalDeductions)}`}
          />
          <div className="border-t pt-2">
            <Row
              label="Grand total"
              value={formatIDR(grandTotal)}
              bold
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 min-w-32"
        >
          {pending ? "Saving..." : "Create invoice"}
        </Button>
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
