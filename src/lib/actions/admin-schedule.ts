"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import {
  formatIsoDateToday,
  isIsoDate,
  normalizeSlots,
  parseTimeToMinutes,
} from "@/lib/store-hours";
import { SCHEDULE_SERVICE_TYPES } from "@/lib/types/schedule";
import { authSdk } from "@/src/lib/sdk/auth";
import { SCHEDULE_CACHE_TAG, scheduleSdk } from "@/src/lib/sdk/schedule";

export type AdminScheduleActionResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; error: string }>;

const timeSchema = z
  .string()
  .trim()
  .refine((value) => parseTimeToMinutes(value) !== null, { message: "Format jam harus HH:mm." });

const slotsSchema = z
  .array(timeSchema)
  .max(48, { message: "Maksimal 48 slot per hari." })
  .transform((slots) => normalizeSlots(slots));

const dayScheduleSchema = z
  .object({
    isOpen: z.boolean(),
    openTime: timeSchema,
    closeTime: timeSchema,
    slots: slotsSchema,
  })
  .superRefine((day, ctx) => {
    const open = parseTimeToMinutes(day.openTime) ?? 0;
    const close = parseTimeToMinutes(day.closeTime) ?? 0;
    if (close <= open) {
      ctx.addIssue({ code: "custom", message: "Jam tutup harus setelah jam buka.", path: ["closeTime"] });
    }
    if (day.isOpen && day.slots.length === 0) {
      ctx.addIssue({ code: "custom", message: "Hari buka wajib memiliki minimal 1 slot.", path: ["slots"] });
    }
  });

const serviceTypeSchema = z.enum(SCHEDULE_SERVICE_TYPES);

const weeklyInputSchema = z.object({
  serviceType: serviceTypeSchema,
  days: z.array(dayScheduleSchema).length(7),
});

const overrideInputSchema = z
  .object({
    date: z
      .string()
      .trim()
      .refine(isIsoDate, { message: "Tanggal tidak valid." })
      .refine((value) => value >= formatIsoDateToday(), {
        message: "Tanggal tidak boleh di masa lalu.",
      }),
    serviceTypes: z.array(serviceTypeSchema).min(1, { message: "Pilih minimal 1 layanan." }),
    isOpen: z.boolean(),
    openTime: timeSchema.nullable(),
    closeTime: timeSchema.nullable(),
    slots: slotsSchema,
    note: z
      .string()
      .trim()
      .max(200, { message: "Catatan maksimal 200 karakter." })
      .transform((value) => (value.length > 0 ? value : null))
      .nullable(),
  })
  .superRefine((value, ctx) => {
    if (!value.isOpen) {
      return;
    }
    if (!value.openTime || !value.closeTime) {
      ctx.addIssue({ code: "custom", message: "Isi jam buka dan jam tutup.", path: ["openTime"] });
      return;
    }
    if ((parseTimeToMinutes(value.closeTime) ?? 0) <= (parseTimeToMinutes(value.openTime) ?? 0)) {
      ctx.addIssue({ code: "custom", message: "Jam tutup harus setelah jam buka.", path: ["closeTime"] });
    }
    if (value.slots.length === 0) {
      ctx.addIssue({ code: "custom", message: "Jam khusus wajib memiliki minimal 1 slot.", path: ["slots"] });
    }
  });

function parseJsonField(formData: FormData, key: string): unknown {
  const raw = formData.get(key);
  if (typeof raw !== "string") {
    return undefined;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function firstIssueMessage(error: z.ZodError, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

function revalidateSchedule(): void {
  updateTag(SCHEDULE_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/booking");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/orders");
}

/** FormData: `payload` = JSON `{ serviceType, days: DaySchedule[7] }`. */
export async function saveWeeklySchedule(formData: FormData): Promise<AdminScheduleActionResult> {
  const parsed = weeklyInputSchema.safeParse(parseJsonField(formData, "payload"));
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error, "Data jadwal mingguan tidak valid.") };
  }

  await authSdk.requireSession();

  try {
    await scheduleSdk.saveWeekly(parsed.data.serviceType, parsed.data.days);
  } catch {
    return { ok: false, error: "Gagal menyimpan jadwal mingguan." };
  }

  revalidateSchedule();
  return { ok: true };
}

/** FormData: `payload` = JSON matching the date-exception form. Replaces existing rows for that date. */
export async function saveScheduleOverride(formData: FormData): Promise<AdminScheduleActionResult> {
  const parsed = overrideInputSchema.safeParse(parseJsonField(formData, "payload"));
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error, "Data pengecualian tidak valid.") };
  }

  await authSdk.requireSession();

  const data = parsed.data;
  try {
    await scheduleSdk.upsertOverride({
      date: data.date,
      serviceTypes: data.serviceTypes,
      isOpen: data.isOpen,
      openTime: data.isOpen ? data.openTime : null,
      closeTime: data.isOpen ? data.closeTime : null,
      slots: data.isOpen ? data.slots : [],
      note: data.note,
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan pengecualian tanggal." };
  }

  revalidateSchedule();
  return { ok: true };
}

export async function deleteScheduleOverride(formData: FormData): Promise<AdminScheduleActionResult> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { ok: false, error: "Aksi tidak valid." };
  }

  await authSdk.requireSession();

  try {
    await scheduleSdk.deleteOverride(parsed.data.id);
  } catch {
    return { ok: false, error: "Gagal menghapus pengecualian." };
  }

  revalidateSchedule();
  return { ok: true };
}
