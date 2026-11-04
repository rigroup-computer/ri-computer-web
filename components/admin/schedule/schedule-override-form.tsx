"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ScheduleSlotPicker } from "@/components/admin/schedule/schedule-slot-picker";
import { SCHEDULE_SERVICE_LABELS } from "@/components/admin/schedule/schedule-labels";
import { getWeekdayForIsoDate } from "@/lib/store-hours";
import {
  SCHEDULE_SERVICE_TYPES,
  type ScheduleConfig,
  type ScheduleServiceType,
} from "@/lib/types/schedule";
import { saveScheduleOverride } from "@/src/lib/actions/admin-schedule";

export type ScheduleOverrideFormValues = Readonly<{
  date: string;
  serviceTypes: readonly ScheduleServiceType[];
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slots: readonly string[];
  note: string;
}>;

type ScheduleOverrideFormProps = Readonly<{
  initial: ScheduleOverrideFormValues;
  /** Editing an existing row locks date + service so it updates that row. */
  isEdit: boolean;
  todayIso: string;
  weekly: ScheduleConfig["weekly"];
  onSaved: () => void;
  onCancel: () => void;
}>;

export function ScheduleOverrideForm({
  initial,
  isEdit,
  todayIso,
  weekly,
  onSaved,
  onCancel,
}: ScheduleOverrideFormProps) {
  const [values, setValues] = useState<ScheduleOverrideFormValues>(initial);
  const [pending, setPending] = useState(false);

  function patch(next: Partial<ScheduleOverrideFormValues>) {
    setValues((prev) => ({ ...prev, ...next }));
  }

  function handleDateChange(date: string) {
    const weekday = getWeekdayForIsoDate(date);
    const base = weekday === null ? null : weekly[values.serviceTypes[0] ?? "REGULAR"][weekday];
    patch(
      base
        ? { date, openTime: base.openTime, closeTime: base.closeTime, slots: base.slots }
        : { date },
    );
  }

  function toggleService(type: ScheduleServiceType) {
    const has = values.serviceTypes.includes(type);
    patch({
      serviceTypes: has
        ? values.serviceTypes.filter((value) => value !== type)
        : [...values.serviceTypes, type],
    });
  }

  async function handleSubmit() {
    setPending(true);
    try {
      const fd = new FormData();
      fd.set(
        "payload",
        JSON.stringify({
          date: values.date,
          serviceTypes: values.serviceTypes,
          isOpen: values.isOpen,
          openTime: values.isOpen ? values.openTime : null,
          closeTime: values.isOpen ? values.closeTime : null,
          slots: values.isOpen ? values.slots : [],
          note: values.note,
        }),
      );
      const result = await saveScheduleOverride(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Pengecualian tanggal disimpan.");
      onSaved();
    } catch {
      toast.error("Gagal menyimpan pengecualian tanggal.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5 px-4 pb-4">
      <label className="block text-xs font-semibold text-[#565d6d]">
        Tanggal
        <input
          type="date"
          min={todayIso}
          value={values.date}
          disabled={pending || isEdit}
          onChange={(event) => handleDateChange(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-lg border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f] disabled:bg-[#f9fafa]"
        />
      </label>

      <fieldset>
        <legend className="text-xs font-semibold text-[#565d6d]">Berlaku untuk</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SCHEDULE_SERVICE_TYPES.map((type) => {
            const checked = values.serviceTypes.includes(type);
            return (
              <label
                key={type}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                  checked
                    ? "border-[#1a73e8] bg-[#eff6ff] text-[#1a73e8]"
                    : "border-[#dee1e6] bg-white text-[#565d6d]"
                } ${isEdit ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-[#1a73e8]"
                  checked={checked}
                  disabled={pending || isEdit}
                  onChange={() => toggleService(type)}
                />
                {SCHEDULE_SERVICE_LABELS[type]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-[#565d6d]">Status hari ini</legend>
        <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup">
          {[
            { open: false, label: "Tutup / Libur" },
            { open: true, label: "Jam khusus" },
          ].map((option) => {
            const active = values.isOpen === option.open;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={pending}
                onClick={() => patch({ isOpen: option.open })}
                className={`min-h-11 rounded-lg border text-sm font-semibold ${
                  active
                    ? option.open
                      ? "border-[#1a73e8] bg-[#1a73e8] text-white"
                      : "border-red-600 bg-red-600 text-white"
                    : "border-[#dee1e6] bg-white text-[#565d6d]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {values.isOpen ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[#565d6d]">
              Jam buka
              <input
                type="time"
                value={values.openTime}
                disabled={pending}
                onChange={(event) => patch({ openTime: event.target.value })}
                className="mt-1 block min-h-11 w-full rounded-lg border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f]"
              />
            </label>
            <label className="text-xs font-semibold text-[#565d6d]">
              Jam tutup
              <input
                type="time"
                value={values.closeTime}
                disabled={pending}
                onChange={(event) => patch({ closeTime: event.target.value })}
                className="mt-1 block min-h-11 w-full rounded-lg border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f]"
              />
            </label>
          </div>
          <ScheduleSlotPicker
            openTime={values.openTime}
            closeTime={values.closeTime}
            slots={values.slots}
            disabled={pending}
            onChange={(slots) => patch({ slots })}
          />
        </div>
      ) : null}

      <label className="block text-xs font-semibold text-[#565d6d]">
        Catatan untuk pelanggan (opsional)
        <input
          type="text"
          maxLength={200}
          value={values.note}
          disabled={pending}
          placeholder="Mis. Libur Maulid Nabi"
          onChange={(event) => patch({ note: event.target.value })}
          className="mt-1 block min-h-11 w-full rounded-lg border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f]"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="min-h-11 flex-1 rounded-lg border border-[#dee1e6] px-4 text-sm font-semibold text-[#565d6d]"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={pending || !values.date || values.serviceTypes.length === 0}
          aria-busy={pending}
          onClick={() => void handleSubmit()}
          className="min-h-11 flex-1 rounded-lg bg-[#1a73e8] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
