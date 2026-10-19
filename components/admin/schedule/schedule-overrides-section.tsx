"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  ScheduleOverrideForm,
  type ScheduleOverrideFormValues,
} from "@/components/admin/schedule/schedule-override-form";
import { SCHEDULE_SERVICE_LABELS } from "@/components/admin/schedule/schedule-labels";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatVisitDateId, getWeekdayForIsoDate } from "@/lib/store-hours";
import type { ScheduleConfig } from "@/lib/types/schedule";
import { deleteScheduleOverride } from "@/src/lib/actions/admin-schedule";
import type { ScheduleOverrideRow } from "@/src/lib/sdk/schedule";

type ScheduleOverridesSectionProps = Readonly<{
  overrides: readonly ScheduleOverrideRow[];
  weekly: ScheduleConfig["weekly"];
  todayIso: string;
}>;

type SheetState = Readonly<{
  key: number;
  isEdit: boolean;
  initial: ScheduleOverrideFormValues;
}>;

function groupByDate(rows: readonly ScheduleOverrideRow[]): [string, ScheduleOverrideRow[]][] {
  const groups = new Map<string, ScheduleOverrideRow[]>();
  for (const row of rows) {
    groups.set(row.date, [...(groups.get(row.date) ?? []), row]);
  }
  return [...groups.entries()];
}

export function ScheduleOverridesSection({
  overrides,
  weekly,
  todayIso,
}: ScheduleOverridesSectionProps) {
  const router = useRouter();
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [sheetCounter, setSheetCounter] = useState(0);
  const [deleting, setDeleting] = useState<ScheduleOverrideRow | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  function openSheet(isEdit: boolean, initial: ScheduleOverrideFormValues) {
    const key = sheetCounter + 1;
    setSheetCounter(key);
    setSheet({ key, isEdit, initial });
  }

  function openCreate() {
    const weekday = getWeekdayForIsoDate(todayIso) ?? 1;
    const base = weekly.REGULAR[weekday];
    openSheet(false, {
      date: todayIso,
      serviceTypes: ["REGULAR", "DELIVERY"],
      isOpen: false,
      openTime: base?.openTime ?? "09:30",
      closeTime: base?.closeTime ?? "16:00",
      slots: base?.slots ?? [],
      note: "",
    });
  }

  function openEdit(row: ScheduleOverrideRow) {
    const weekday = getWeekdayForIsoDate(row.date) ?? 1;
    const base = weekly[row.serviceType][weekday];
    openSheet(true, {
      date: row.date,
      serviceTypes: [row.serviceType],
      isOpen: row.isOpen,
      openTime: row.openTime ?? base?.openTime ?? "09:30",
      closeTime: row.closeTime ?? base?.closeTime ?? "16:00",
      slots: row.isOpen ? row.slots : (base?.slots ?? []),
      note: row.note ?? "",
    });
  }

  async function handleDelete() {
    if (!deleting) {
      return;
    }
    setDeletePending(true);
    try {
      const fd = new FormData();
      fd.set("id", deleting.id);
      const result = await deleteScheduleOverride(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Pengecualian dihapus.");
      setDeleting(null);
      router.refresh();
    } finally {
      setDeletePending(false);
    }
  }

  const groups = groupByDate(overrides);

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171a1f]">Pengecualian Tanggal</h2>
          <p className="mt-1 text-xs text-[#565d6d]">
            Libur atau jam khusus di tanggal tertentu. Menggantikan jadwal mingguan.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg bg-[#1a73e8] px-3 text-sm font-semibold text-white"
        >
          <Icon icon="mdi:plus" width={18} height={18} aria-hidden />
          Tambah
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#dee1e6] bg-white p-4 text-center text-sm text-[#565d6d]">
          Belum ada pengecualian. Semua tanggal mengikuti jadwal mingguan.
        </p>
      ) : (
        <ul className="space-y-3">
          {groups.map(([date, rows]) => (
            <li key={date} className="rounded-xl border border-[#dee1e6] bg-white p-4 custom-shadow-sm">
              <p className="font-semibold text-[#171a1f]">{formatVisitDateId(date) ?? date}</p>
              {rows[0]?.note ? (
                <p className="mt-0.5 text-xs text-[#565d6d]">{rows[0].note}</p>
              ) : null}
              <ul className="mt-3 divide-y divide-[#f0f1f3]">
                {rows.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#565d6d]">
                        {SCHEDULE_SERVICE_LABELS[row.serviceType]}
                      </p>
                      <p
                        className={`text-sm font-medium ${row.isOpen ? "text-[#171a1f]" : "text-red-700"}`}
                      >
                        {row.isOpen
                          ? `${row.openTime ?? ""}–${row.closeTime ?? ""} · ${row.slots.join(", ")}`
                          : "TUTUP"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label={`Ubah ${SCHEDULE_SERVICE_LABELS[row.serviceType]} ${date}`}
                        onClick={() => openEdit(row)}
                        className="flex size-11 items-center justify-center rounded-lg text-[#1a73e8] hover:bg-[#eff6ff]"
                      >
                        <Icon icon="mdi:pencil-outline" width={20} height={20} aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus ${SCHEDULE_SERVICE_LABELS[row.serviceType]} ${date}`}
                        onClick={() => setDeleting(row)}
                        className="flex size-11 items-center justify-center rounded-lg text-[#b42318] hover:bg-[#fff5f5]"
                      >
                        <Icon icon="mdi:trash-can-outline" width={20} height={20} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSheet(null);
          }
        }}
        title={sheet?.isEdit ? "Ubah Pengecualian" : "Tambah Pengecualian"}
        sheetMaxHeightClass="max-h-[min(90dvh,100%)]"
        ariaLabel="Form pengecualian tanggal"
      >
        {sheet ? (
          <ScheduleOverrideForm
            key={sheet.key}
            initial={sheet.initial}
            isEdit={sheet.isEdit}
            todayIso={todayIso}
            weekly={weekly}
            onCancel={() => setSheet(null)}
            onSaved={() => {
              setSheet(null);
              router.refresh();
            }}
          />
        ) : null}
      </BottomSheet>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title="Hapus pengecualian ini?"
        description={
          deleting
            ? `${SCHEDULE_SERVICE_LABELS[deleting.serviceType]} pada ${formatVisitDateId(deleting.date) ?? deleting.date} akan kembali mengikuti jadwal mingguan.`
            : undefined
        }
        confirmLabel="Hapus"
        cancelLabel="Kembali"
        variant="danger"
        pending={deletePending}
        onConfirm={handleDelete}
      />
    </section>
  );
}
