"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  ADMIN_SERVICE_TYPE_OPTIONS,
  buildAdminOrdersPageHref,
  type JenisQueryValue,
  type OrdersStatusTab,
} from "@/lib/admin-order-status-display";

type OrdersServiceTypeFilterProps = Readonly<{
  activeTab: OrdersStatusTab;
  selectedJenis: JenisQueryValue[];
  className?: string;
}>;

function filterButtonLabel(selectedJenis: JenisQueryValue[]): string {
  if (selectedJenis.length === 0) {
    return "Semua";
  }
  if (selectedJenis.length === 1) {
    const option = ADMIN_SERVICE_TYPE_OPTIONS.find(
      (item) => item.value === selectedJenis[0],
    );
    return option?.label ?? "1 dipilih";
  }
  return `${selectedJenis.length} dipilih`;
}

export function OrdersServiceTypeFilter({
  activeTab,
  selectedJenis,
  className,
}: OrdersServiceTypeFilterProps) {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const applySelection = useCallback(
    (next: JenisQueryValue[]) => {
      router.push(buildAdminOrdersPageHref(activeTab, next), { scroll: false });
    },
    [activeTab, router],
  );

  const toggleValue = useCallback(
    (value: JenisQueryValue) => {
      const next = selectedJenis.includes(value)
        ? selectedJenis.filter((item) => item !== value)
        : [...selectedJenis, value];
      applySelection(next);
    },
    [applySelection, selectedJenis],
  );

  const clearSelection = useCallback(() => {
    applySelection([]);
    setOpen(false);
  }, [applySelection]);

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
    <div ref={rootRef} className={className}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 min-h-11 w-full min-w-[160px] items-center justify-between gap-2 rounded-md border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f] lg:min-h-8 lg:w-[180px]"
      >
        <span className="truncate">{filterButtonLabel(selectedJenis)}</span>
        <Icon
          icon="mdi:chevron-down"
          width={16}
          height={16}
          className={`shrink-0 text-[#565d6d] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 w-full min-w-[220px] overflow-hidden rounded-md border border-[#dee1e6] bg-white shadow-[0_4px_12px_rgba(23,26,31,0.12)] lg:w-[220px]">
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable
            aria-label="Filter tipe layanan"
            className="max-h-56 overflow-y-auto py-1"
          >
            {ADMIN_SERVICE_TYPE_OPTIONS.map((option) => {
              const checked = selectedJenis.includes(option.value);
              return (
                <li key={option.value} role="option" aria-selected={checked}>
                  <button
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[#171a1f] hover:bg-slate-50"
                  >
                    <span
                      aria-hidden
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? "border-[#1a73e8] bg-[#1a73e8] text-white"
                          : "border-[#dee1e6] bg-white"
                      }`}
                    >
                      {checked ? (
                        <Icon icon="mdi:check" width={12} height={12} />
                      ) : null}
                    </span>
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {selectedJenis.length > 0 ? (
            <div className="border-t border-[#dee1e6] px-3 py-2">
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-medium text-[#1a73e8] hover:underline"
              >
                Reset filter
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
