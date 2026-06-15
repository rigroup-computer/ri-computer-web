"use client";

import { Icon } from "@iconify/react";

import type { ServiceOrderCostLineItem } from "@/lib/service-order-cost-items";

type OrderCostItemsFormProps = Readonly<{
  lineItems: ServiceOrderCostLineItem[];
  technicalNote: string;
  pending: boolean;
  onLineItemsChange: (items: ServiceOrderCostLineItem[]) => void;
  onTechnicalNoteChange: (note: string) => void;
}>;

function createEmptyLineItem(): ServiceOrderCostLineItem {
  return { name: "", price: 0 };
}

export function createInitialCostLineItems(
  existing: readonly ServiceOrderCostLineItem[],
): ServiceOrderCostLineItem[] {
  if (existing.length > 0) {
    return existing.map((item) => ({ ...item }));
  }
  return [createEmptyLineItem()];
}

export function OrderCostItemsForm({
  lineItems,
  technicalNote,
  pending,
  onLineItemsChange,
  onTechnicalNoteChange,
}: OrderCostItemsFormProps) {
  function updateItem(
    index: number,
    patch: Partial<ServiceOrderCostLineItem>,
  ): void {
    onLineItemsChange(
      lineItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(index: number): void {
    if (lineItems.length <= 1) {
      onLineItemsChange([createEmptyLineItem()]);
      return;
    }
    onLineItemsChange(lineItems.filter((_, i) => i !== index));
  }

  function addItem(): void {
    onLineItemsChange([...lineItems, createEmptyLineItem()]);
  }

  return (
    <div className="mt-4 rounded-xl border border-[#dee1e6] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[#565d6d]">
          <Icon icon="mdi:toolbox-outline" width={18} height={18} aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wide">
            Item Pengganti &amp; Biaya
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={pending}
          className="text-xs font-semibold text-[#1a73e8] disabled:opacity-50"
        >
          + Tambah Item
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {lineItems.map((item, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-[#565d6d]">
                Nama Part
              </label>
              <input
                value={item.name}
                onChange={(event) =>
                  updateItem(index, { name: event.target.value })
                }
                disabled={pending}
                placeholder="Contoh: Keyboard Backlit L540"
                className="mt-1 h-10 w-full rounded-lg border border-[#dee1e6] px-3 text-sm"
              />
            </div>
            <div className="w-28 shrink-0">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-[#565d6d]">
                Harga (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={item.price || ""}
                onChange={(event) =>
                  updateItem(index, {
                    price: Number.parseInt(event.target.value, 10) || 0,
                  })
                }
                disabled={pending}
                placeholder="0"
                className="mt-1 h-10 w-full rounded-lg border border-[#dee1e6] px-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={pending}
              aria-label="Hapus item"
              className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-[#d32f2f] active:bg-[#fef2f2] disabled:opacity-50"
            >
              <Icon icon="mdi:trash-can-outline" width={20} height={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-[#565d6d]">
          Catatan Teknis Tambahan
        </label>
        <textarea
          value={technicalNote}
          onChange={(event) => onTechnicalNoteChange(event.target.value)}
          disabled={pending}
          placeholder="Contoh: Keyboard banyak yang mati, butuh ganti unit."
          className="mt-1 min-h-20 w-full rounded-lg border border-[#dee1e6] px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
