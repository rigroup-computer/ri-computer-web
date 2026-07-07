"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";

import {
  ADMIN_ORDERS_SORT_OPTIONS,
  adminOrdersSortLabel,
  type AdminOrdersSortKey,
} from "@/lib/admin-orders-sort";

type OrdersTableSortProps = Readonly<{
  sortKey: AdminOrdersSortKey;
  onSortChange: (sortKey: AdminOrdersSortKey) => void;
}>;

export function OrdersTableSort({
  sortKey,
  onSortChange,
}: OrdersTableSortProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex items-center gap-2 text-sm text-[#565d6d]">
      <span>Urutkan:</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 py-1.5 font-medium text-[#171a1f] hover:bg-slate-50 lg:min-h-0"
      >
        {adminOrdersSortLabel(sortKey)}
        <Icon
          icon="mdi:unfold-more-horizontal"
          width={14}
          height={14}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Urutan daftar pesanan"
          className="absolute right-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-md border border-[#dee1e6] bg-white py-1 shadow-[0_4px_12px_rgba(23,26,31,0.12)]"
        >
          {ADMIN_ORDERS_SORT_OPTIONS.map((option) => {
            const selected = sortKey === option.value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                    selected
                      ? "font-medium text-[#1a73e8]"
                      : "text-[#171a1f]"
                  }`}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <Icon icon="mdi:check" width={16} height={16} aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
