"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ComboboxOption = { id: string; name: string }
type Item = { value: string; label: string }

/**
 * Type-to-filter combobox over an `{ id, name }` list, styled to match the
 * shadcn Select. Wraps Base UI's Combobox (which filters by the item label
 * internally). `value`/`onValueChange` speak plain id strings so it drops into
 * a react-hook-form `Controller` the same way Select did.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Cari…",
  emptyText = "Tidak ditemukan",
  ariaInvalid,
  className,
}: {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  ariaInvalid?: boolean
  className?: string
}) {
  const items = React.useMemo<Item[]>(
    () => options.map((o) => ({ value: o.id, label: o.name })),
    [options],
  )
  const selected = React.useMemo(
    () => items.find((i) => i.value === value) ?? null,
    [items, value],
  )

  return (
    <ComboboxPrimitive.Root
      items={items}
      value={selected}
      onValueChange={(v: Item | null) => onValueChange(v ? v.value : "")}
    >
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <ComboboxPrimitive.Input
          placeholder={placeholder}
          aria-invalid={ariaInvalid || undefined}
          className={cn(
            "flex h-11 w-full items-center rounded-lg border border-input bg-transparent py-2 pr-9 pl-8 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            className,
          )}
        />
        <ComboboxPrimitive.Trigger
          aria-label="Buka daftar"
          className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDownIcon className="size-4" />
        </ComboboxPrimitive.Trigger>
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="isolate z-50">
          <ComboboxPrimitive.Popup className="max-h-[min(var(--available-height),18rem)] w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <ComboboxPrimitive.Empty className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List>
              {(item: Item) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className="relative flex w-full cursor-default items-center gap-1.5 rounded-md py-2 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="flex-1 truncate">{item.label}</span>
                  <ComboboxPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}
