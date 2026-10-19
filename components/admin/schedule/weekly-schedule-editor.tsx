"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { ScheduleSlotPicker } from "@/components/admin/schedule/schedule-slot-picker";
import { WEEKDAY_DISPLAY_ORDER, WEEKDAY_LABELS_ID } from "@/lib/store-hours";
import type { DaySchedule, ScheduleServiceType, WeeklySchedule } from "@/lib/types/schedule";
import { saveWeeklySchedule } from "@/src/lib/actions/admin-schedule";

type WeeklyScheduleEditorProps = Readonly<{
  serviceType: ScheduleServiceType;
  initialDays: WeeklySchedule;
}>;

function sameDays(a: WeeklySchedule, b: WeeklySchedule): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function WeeklyScheduleEditor({ serviceType, initialDays }: WeeklyScheduleEditorProps) {
  const router = useRouter();
  const [days, setDays] = useState<WeeklySchedule>(initialDays);
  const [savedDays, setSavedDays] = useState<WeeklySchedule>(initialDays);
  const [copySource, setCopySource] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);
  const [pending, setPending] = useState(false);
  const dirty = !sameDays(days, savedDays);

  function updateDay(weekday: number, patch: Partial<DaySchedule>) {
    setDays((prev) => prev.map((day, index) => (index === weekday ? { ...day, ...patch } : day)));
  }

  function openCopy(weekday: number) {
    setCopySource(weekday);
    setCopyTargets([]);
  }

  function applyCopy() {
    if (copySource === null) {
      return;
    }
    const source = days[copySource];
    if (source) {
      setDays((prev) =>
        prev.map((day, index) =>
          copyTargets.includes(index) ? { ...source, slots: [...source.slots] } : day,
        ),
      );
    }
    setCopySource(null);
  }

  async function handleSave() {
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("payload", JSON.stringify({ serviceType, days }));
      const result = await saveWeeklySchedule(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSavedDays(days);
      toast.success("Jadwal mingguan disimpan.");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan jadwal mingguan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-[#171a1f]">Jadwal Mingguan</h2>
        <p className="mt-1 text-xs text-[#565d6d]">
          Berlaku setiap minggu. Untuk libur atau jam berbeda di tanggal tertentu, pakai
          Pengecualian Tanggal.
        </p>
      </div>

      <ul className="space-y-3">
        {WEEKDAY_DISPLAY_ORDER.map((weekday) => {
          const day = days[weekday];
          if (!day) {
            return null;
          }
          const label = WEEKDAY_LABELS_ID[weekday];
          const copying = copySource === weekday;
          return (
            <li
              key={weekday}
              className="rounded-xl border border-[#dee1e6] bg-white p-4 custom-shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#171a1f]">{label}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => (copying ? setCopySource(null) : openCopy(weekday))}
                    aria-expanded={copying}
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#1a73e8] disabled:opacity-50"
                  >
                    <Icon icon="mdi:content-copy" width={16} height={16} aria-hidden />
                    Salin ke…
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.isOpen}
                    aria-label={`${label} buka`}
                    disabled={pending}
                    onClick={() => updateDay(weekday, { isOpen: !day.isOpen })}
                    className="flex min-h-11 items-center gap-2 text-xs font-semibold"
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        day.isOpen ? "bg-[#1a73e8]" : "bg-[#dee1e6]"
                      }`}
                    >
                      <span
                        className={`inline-block size-5 rounded-full bg-white shadow transition ${
                          day.isOpen ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                    <span className={day.isOpen ? "text-[#1a73e8]" : "text-red-700"}>
                      {day.isOpen ? "Buka" : "Tutup"}
                    </span>
                  </button>
                </div>
              </div>

              {copying ? (
                <div className="mt-3 rounded-lg bg-[#f9fafa] p-3">
                  <p className="text-xs font-semibold text-[#565d6d]">
                    Salin pengaturan {label} ke:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {WEEKDAY_DISPLAY_ORDER.filter((target) => target !== weekday).map((target) => {
                      const checked = copyTargets.includes(target);
                      return (
                        <label
                          key={target}
                          className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
                            checked
                              ? "border-[#1a73e8] bg-[#eff6ff] text-[#1a73e8]"
                              : "border-[#dee1e6] bg-white text-[#565d6d]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="size-4 accent-[#1a73e8]"
                            checked={checked}
                            onChange={() =>
                              setCopyTargets((prev) =>
                                checked ? prev.filter((value) => value !== target) : [...prev, target],
                              )
                            }
                          />
                          {WEEKDAY_LABELS_ID[target]}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={copyTargets.length === 0}
                      onClick={applyCopy}
                      className="min-h-11 flex-1 rounded-lg bg-[#1a73e8] px-3 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Terapkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setCopySource(null)}
                      className="min-h-11 flex-1 rounded-lg border border-[#dee1e6] px-3 text-xs font-semibold text-[#565d6d]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : null}

              {day.isOpen ? (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-[#565d6d]">
                      Jam buka
                      <input
                        type="time"
                        value={day.openTime}
                        disabled={pending}
                        onChange={(event) => updateDay(weekday, { openTime: event.target.value })}
                        className="mt-1 block min-h-11 w-full rounded-lg border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f]"
                      />
                    </label>
                    <label className="text-xs font-semibold text-[#565d6d]">
                      Jam tutup
                      <input
                        type="time"
                        value={day.closeTime}
                        disabled={pending}
                        onChange={(event) => updateDay(weekday, { closeTime: event.target.value })}
                        className="mt-1 block min-h-11 w-full rounded-lg border border-[#dee1e6] bg-white px-3 text-sm text-[#171a1f]"
                      />
                    </label>
                  </div>
                  <ScheduleSlotPicker
                    openTime={day.openTime}
                    closeTime={day.closeTime}
                    slots={day.slots}
                    disabled={pending}
                    onChange={(slots) => updateDay(weekday, { slots })}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-20 z-10 flex gap-2 rounded-xl border border-[#dee1e6] bg-white p-3 shadow-lg lg:bottom-4">
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() => setDays(savedDays)}
          className="min-h-11 flex-1 rounded-lg border border-[#dee1e6] px-4 text-sm font-semibold text-[#565d6d] disabled:opacity-50"
        >
          Batalkan perubahan
        </button>
        <button
          type="button"
          disabled={!dirty || pending}
          aria-busy={pending}
          onClick={() => void handleSave()}
          className="min-h-11 flex-1 rounded-lg bg-[#1a73e8] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan jadwal"}
        </button>
      </div>
    </section>
  );
}
