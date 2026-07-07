import { z, type ZodError } from "zod";
import {
  combineVisitDateTime,
  formatIsoDateToday,
  isStoreOpenOnIsoDate,
  isValidVisitTimeSlot,
} from "@/lib/store-hours";

export const BOOKING_SERVICE_TYPES = ["REGULAR", "DELIVERY"] as const;
export type BookableServiceType = (typeof BOOKING_SERVICE_TYPES)[number];

export const deviceFieldsSchema = z.object({
  laptopBrand: z.string().trim().min(1).max(80),
  laptopModel: z.string().trim().min(1).max(120),
  deviceSpecs: z.string().trim().min(1).max(160),
  issue: z.string().trim().min(5).max(2000),
});

export const contactBaseSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value.length === 0) {
        return;
      }
      if (!/^\d+$/.test(value)) {
        ctx.addIssue({ code: "custom", message: "not_numeric" });
        return;
      }
      if (!value.startsWith("08")) {
        ctx.addIssue({ code: "custom", message: "not_08" });
        return;
      }
      if (value.length < 10) {
        ctx.addIssue({ code: "custom", message: "too_short" });
        return;
      }
      if (value.length > 13) {
        ctx.addIssue({ code: "custom", message: "too_long" });
      }
    })
    .refine((value) => value.length > 0, { message: "empty" }),
});

export const scheduleFieldsSchema = z
  .object({
    preferredVisitDate: z.string().trim().min(1),
    preferredVisitTime: z.string().trim().min(1),
  })
  .superRefine((value, ctx) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.preferredVisitDate)) {
      ctx.addIssue({
        code: "custom",
        message: "invalid_date",
        path: ["preferredVisitDate"],
      });
      return;
    }
    if (value.preferredVisitDate < formatIsoDateToday()) {
      ctx.addIssue({
        code: "custom",
        message: "past_date",
        path: ["preferredVisitDate"],
      });
    }
    if (!isStoreOpenOnIsoDate(value.preferredVisitDate)) {
      ctx.addIssue({
        code: "custom",
        message: "closed_day",
        path: ["preferredVisitDate"],
      });
    }
    if (!/^\d{1,2}:\d{2}$/.test(value.preferredVisitTime)) {
      ctx.addIssue({
        code: "custom",
        message: "invalid_time",
        path: ["preferredVisitTime"],
      });
    }
    if (
      !isValidVisitTimeSlot(value.preferredVisitDate, value.preferredVisitTime)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "unavailable_slot",
        path: ["preferredVisitTime"],
      });
    }
    if (
      combineVisitDateTime(value.preferredVisitDate, value.preferredVisitTime) ===
      null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "invalid_schedule",
        path: ["preferredVisitDate"],
      });
    }
  });

export const deliverySchema = deviceFieldsSchema
  .merge(contactBaseSchema)
  .merge(scheduleFieldsSchema)
  .extend({
    visitAddress: z.string().trim().min(5).max(500),
  });

export const regularSchema = deviceFieldsSchema
  .merge(contactBaseSchema)
  .merge(scheduleFieldsSchema)
  .extend({
    customerCity: z.string().trim().min(2).max(100),
  });

export const BOOKING_FIELD_LABELS = {
  laptopBrand: "Merek",
  laptopModel: "Tipe",
  deviceSpecs: "Prosesor & VGA",
  preferredVisitDate: "Tanggal Kunjungan",
  preferredVisitTime: "Jam Kunjungan",
  issue: "Keluhan / Masalah",
  customerName: "Nama",
  customerPhone: "No. WhatsApp",
  visitAddress: "Alamat Lengkap",
  customerCity: "Asal Kota",
} as const;

export type BookingFieldKey = keyof typeof BOOKING_FIELD_LABELS;

export const BOOKING_FIELD_ORDER: readonly BookingFieldKey[] = [
  "laptopBrand",
  "laptopModel",
  "deviceSpecs",
  "preferredVisitDate",
  "preferredVisitTime",
  "issue",
  "customerName",
  "customerPhone",
  "visitAddress",
  "customerCity",
];

export function isBookableServiceType(raw: unknown): raw is BookableServiceType {
  return (
    typeof raw === "string" &&
    (BOOKING_SERVICE_TYPES as readonly string[]).includes(raw)
  );
}

function bookingValidationMessageForField(key: unknown): string {
  if (key === "issue") {
    return "Mohon jelaskan keluhan Anda (minimal 5 karakter).";
  }
  if (key === "customerName") {
    return "Mohon isi nama lengkap (minimal 2 karakter).";
  }
  if (key === "customerPhone") {
    return "Mohon isi nomor WhatsApp.";
  }
  if (key === "visitAddress") {
    return "Mohon isi alamat lengkap (minimal 5 karakter).";
  }
  if (key === "customerCity") {
    return "Mohon isi asal kota (minimal 2 karakter).";
  }
  if (key === "laptopBrand") {
    return "Mohon isi merek laptop.";
  }
  if (key === "laptopModel") {
    return "Mohon isi tipe laptop.";
  }
  if (key === "deviceSpecs") {
    return "Mohon isi prosesor dan VGA laptop.";
  }
  if (key === "preferredVisitDate") {
    return "Mohon pilih tanggal kunjungan saat toko buka.";
  }
  if (key === "preferredVisitTime") {
    return "Mohon pilih jam kunjungan yang tersedia.";
  }
  return "Mohon lengkapi semua data yang wajib diisi.";
}

export function bookingValidationMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "Mohon lengkapi semua data yang wajib diisi.";
  }
  return bookingValidationMessageForField(issue.path[0]);
}

function customerPhoneErrorMessage(value: string): string {
  const label = BOOKING_FIELD_LABELS.customerPhone;
  if (value.length === 0) {
    return bookingValidationMessageForField("customerPhone");
  }
  if (!/^\d+$/.test(value)) {
    return `${label} harus berupa angka`;
  }
  if (!value.startsWith("08")) {
    return `${label} harus diawali 08`;
  }
  if (value.length < 10) {
    return `${label} minimal 10 digit`;
  }
  if (value.length > 13) {
    return `${label} maksimal 13 digit`;
  }
  return bookingValidationMessageForField("customerPhone");
}

function contextualFieldErrorMessage(
  key: string,
  issue: z.ZodIssue,
  values: BookingFormValues,
): string {
  const raw = values[key as keyof BookingFormValues];
  const text = typeof raw === "string" ? raw.trim() : "";
  const label = BOOKING_FIELD_LABELS[key as BookingFieldKey] ?? key;

  if (key === "customerPhone") {
    return customerPhoneErrorMessage(text);
  }

  if (key === "preferredVisitDate" && text.length > 0) {
    const issueMessage = issue.message;
    if (issueMessage === "closed_day") {
      return "Toko tutup pada hari tersebut. Pilih Senin–Kamis atau Sabtu.";
    }
    if (issueMessage === "past_date") {
      return "Tanggal kunjungan tidak boleh di masa lalu.";
    }
  }

  if (key === "preferredVisitTime" && text.length > 0) {
    if (issue.message === "unavailable_slot") {
      return "Jam kunjungan tidak tersedia. Pilih slot lain.";
    }
  }

  if (text.length > 0 && issue.code === "too_small" && "minimum" in issue) {
    const minimum = issue.minimum;
    if (typeof minimum === "number") {
      return `${label} minimal ${minimum} karakter`;
    }
  }

  return bookingValidationMessageForField(key);
}

function fieldErrorsFromZodError(
  error: ZodError,
  values: BookingFormValues,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key] = contextualFieldErrorMessage(key, issue, values);
    }
  }
  return fieldErrors;
}

export function getBookingFieldToast(
  key: BookingFieldKey,
  errorMessage: string,
  rawValue: unknown,
): { title: string; description?: string } {
  const text = typeof rawValue === "string" ? rawValue.trim() : "";
  if (
    text.length > 0 &&
    errorMessage !== bookingValidationMessageForField(key)
  ) {
    return { title: errorMessage };
  }

  return {
    title: `${BOOKING_FIELD_LABELS[key]} belum diisi. Mohon lengkapi data tersebut`,
  };
}

export type BookingFormValues = {
  customerName: unknown;
  customerPhone: unknown;
  laptopBrand: unknown;
  laptopModel: unknown;
  deviceSpecs: unknown;
  preferredVisitDate: unknown;
  preferredVisitTime: unknown;
  issue: unknown;
  visitAddress?: unknown;
  customerCity?: unknown;
};

export type BookingFormValidatedData =
  | z.infer<typeof deliverySchema>
  | z.infer<typeof regularSchema>;

export function validateBookingForm(
  serviceType: BookableServiceType,
  values: BookingFormValues,
):
  | { ok: true; data: BookingFormValidatedData }
  | { ok: false; fieldErrors: Record<string, string> } {
  const basePayload = {
    customerName: values.customerName,
    customerPhone: values.customerPhone,
    laptopBrand: values.laptopBrand,
    laptopModel: values.laptopModel,
    deviceSpecs: values.deviceSpecs,
    preferredVisitDate: values.preferredVisitDate,
    preferredVisitTime: values.preferredVisitTime,
    issue: values.issue,
  };

  const parsed =
    serviceType === "DELIVERY"
      ? deliverySchema.safeParse({
          ...basePayload,
          visitAddress: values.visitAddress,
        })
      : regularSchema.safeParse({
          ...basePayload,
          customerCity: values.customerCity,
        });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZodError(parsed.error, values) };
  }

  return { ok: true, data: parsed.data };
}
