"use client";

import { useId, useState } from "react";
import { Icon } from "@iconify/react";
import {
  generateHourlySlots,
  normalizeSlots,
  parseTimeToMinutes,
} from "@/lib/store-hours";

type ScheduleSlotPickerProps = Readonly<{
  openTime: string;
  closeTime: string;
  slots: readonly string[];
  disabled?: boolean;
  onChange: (slots: string[]) => void;
}>;

/** Hourly chips between open/close plus any custom slot; tap to toggle. */
export function ScheduleSlotPicker({
  openTime,
  closeTime,
  slots,
  disabled = false,
  onChange,
}: ScheduleSlotPickerProps) {
  const customInputId = useId();
  const [customTime, setCustomTime] = useState("");
  const hourly = generateHourlySlots(openTime, closeTime);
  const candidates = normalizeSlots([...hourly, ...slots]);
  const selected = new Set(slots);

  function toggle(slot: string) {
    onChange(
      selected.has(slot)
        ? slots.filter((value) => value !== slot)
        : normalizeSlots([...slots, slot]),
    );
  }

  function addCustom() {
    if (parseTimeToMinutes(customTime) === null) {
      return;
    }
    onChange(normalizeSlots([...slots, customTime]));
    setCustomTime("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#565d6d]">Slot booking</span>
        <button
          type="button"
          disabled={disabled || hourly.length === 0}
          onClick={() => onChange(hourly)}
          className="min-h-11 rounded-lg border border-[#1a73e8] px-3 text-xs font-semibold text-[#1a73e8] disabled:opacity-50"
        >
          Buat slot tiap 1 jam
        </button>
        <button
          type="button"
          disabled={disabled || slots.length === 0}
          onClick={() => onChange([])}
          className="min-h-11 rounded-lg border border-[#dee1e6] px-3 text-xs font-semibold text-[#565d6d] disabled:opacity-50"
        >
          Kosongkan
        </button>
      </div>

      {candidates.length === 0 ? (
        <p className="text-xs text-[#565d6d]">
          Atur jam buka &amp; tutup, lalu tekan &quot;Buat slot tiap 1 jam&quot;.
        </p>
      ) : (
        <div role="group" aria-label="Slot booking" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {candidates.map((slot) => {
            const active = selected.has(slot);
            return (
              <button
                key={slot}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => toggle(slot)}
                className={`min-h-11 rounded-lg border text-sm font-semibold touch-manipulation disabled:opacity-60 ${
                  active
                    ? "border-[#1a73e8] bg-[#1a73e8] text-white"
                    : "border-[#dee1e6] bg-white text-[#9095a1] line-through"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={customInputId}>
          Tambah jam khusus
        </label>
        <input
          id={customInputId}
          type="time"
          step={300}
          value={customTime}
          disabled={disabled}
          onChange={(event) => setCustomTime(event.target.value)}
          className="min-h-11 rounded-lg border border-[#dee1e6] bg-white px-3 text-sm"
        />
        <button
          type="button"
          disabled={disabled || parseTimeToMinutes(customTime) === null}
          onClick={addCustom}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-[#dee1e6] px-3 text-xs font-semibold text-[#171a1f] disabled:opacity-50"
        >
          <Icon icon="mdi:plus" width={16} height={16} aria-hidden />
          Tambah jam
        </button>
      </div>
    </div>
  );
}
