"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  createServiceOrder,
  type CreateServiceOrderResult,
} from "@/lib/actions/service-order";
import { uploadBookingIssueImage } from "@/lib/actions/booking-issue-upload";
import {
  BOOKING_UPLOAD_ALLOWED_TYPES,
  MAX_ISSUE_ATTACHMENTS,
} from "@/lib/booking-issue-attachments";
import { TRACKING_IDS_STORAGE_KEY } from "@/lib/tracking-storage";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { toast } from "sonner";
import { whatsappHref } from "@/lib/whatsapp";
import Image from "next/image";
import { SvgCopy } from "../shared/SvgComponent";

type BookingServiceType = "REGULAR" | "DELIVERY" | "HOME_SERVICE";

const LAPTOP_BRAND_OPTIONS = [
  { value: "", label: "Belum Tentu" },
  { value: "Lenovo", label: "Lenovo" },
  { value: "HP", label: "HP" },
  { value: "ASUS", label: "ASUS" },
  { value: "Acer", label: "Acer" },
  { value: "Dell", label: "Dell" },
  { value: "Toshiba", label: "Toshiba" },
] as const;

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function splitDatetimeLocal(
  value: string,
): { date: string; time: string } | null {
  if (!value.includes("T")) {
    return null;
  }
  const [date, rest] = value.split("T");
  const time = (rest ?? "").slice(0, 5);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  return { date, time };
}

function mergeDatetimeLocal(date: string, time: string): string {
  return `${date}T${time}`;
}

function formatVisitDisplay(isoLocal: string): string {
  const d = new Date(isoLocal);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const WEEKDAY_LABELS_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Senin = 0 … Minggu = 6 */
function weekdayMondayFirst(year: number, month: number, day: number): number {
  const wd = new Date(year, month, day).getDay();
  return (wd + 6) % 7;
}

function buildCalendarCells(
  year: number,
  month: number,
): Array<{ kind: "empty" } | { kind: "day"; day: number; dateStr: string }> {
  const dim = daysInMonth(year, month);
  const lead = weekdayMondayFirst(year, month, 1);
  const cells: Array<
    { kind: "empty" } | { kind: "day"; day: number; dateStr: string }
  > = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ kind: "empty" });
  }
  for (let d = 1; d <= dim; d++) {
    cells.push({
      kind: "day",
      day: d,
      dateStr: `${year}-${pad2(month + 1)}-${pad2(d)}`,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ kind: "empty" });
  }
  return cells;
}

function parseYMD(dateStr: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) {
    return null;
  }
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11 || Number.isNaN(year)) {
    return null;
  }
  return { year, month };
}

function monthTitleId(year: number, month: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

function rememberTrackingId(trackingId: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(TRACKING_IDS_STORAGE_KEY) ?? "[]",
    ) as string[];
    const list = Array.isArray(parsed) ? parsed : [];
    const next = [trackingId, ...list.filter((id) => id !== trackingId)].slice(
      0,
      20,
    );
    window.localStorage.setItem(TRACKING_IDS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    window.localStorage.setItem(
      TRACKING_IDS_STORAGE_KEY,
      JSON.stringify([trackingId]),
    );
  }
}

function ServiceCard({
  active = false,
  disabled = false,
  comingSoon = false,
  title,
  description,
  icon,
  onSelect,
}: {
  active?: boolean;
  disabled?: boolean;
  /** Nonaktifkan pilihan + tampilkan label "Segera hadir" */
  comingSoon?: boolean;
  title: string;
  description: string;
  icon: string;
  onSelect?: () => void;
}) {
  const blocked = disabled || comingSoon;
  const looksActive = active && !comingSoon;

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => {
        if (comingSoon) {
          return;
        }
        onSelect?.();
        document
          .getElementById("form-data-perangkat")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className={`flex w-full flex-row items-center gap-4 rounded-md px-4 py-3 text-left outline-none transition-colors
        ${
          looksActive
            ? "border-2 border-primary/50 bg-primary/5 shadow-sm"
            : "border border-mate-black/10 shadow-md"
        }
        ${blocked ? "cursor-not-allowed opacity-65" : "active:bg-slate-50"}`}
    >
      <div className="relative size-12 shrink-0">
        <Image src={icon} alt="" aria-hidden fill />
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${looksActive ? "text-blue-900" : "text-mate-black"}`}
          >
            {title}
          </p>
          <p
            className={`text-xs ${looksActive ? "font-medium text-blue-800" : "text-mate-black/80"}`}
          >
            {comingSoon ? (
              <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Segera hadir
              </span>
            ) : (
              description
            )}
          </p>
        </div>
      </div>
    </button>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => pad2(i));

function SchedulePickerBody({
  todayStr,
  pickerYear,
  pickerMonth,
  draftVisitDate,
  draftVisitTime,
  preferredVisitAt,
  onPickDate,
  onTimeChange,
  onPrevMonth,
  onNextMonth,
  onClear,
}: {
  todayStr: string;
  pickerYear: number;
  pickerMonth: number;
  draftVisitDate: string;
  draftVisitTime: string;
  preferredVisitAt: string;
  onPickDate: (dateStr: string) => void;
  onTimeChange: (hhmm: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onClear: () => void;
}) {
  const todayYm = parseYMD(todayStr);
  const ty = todayYm?.year ?? new Date().getFullYear();
  const tm = todayYm?.month ?? new Date().getMonth();
  const disablePrevMonth =
    pickerYear < ty || (pickerYear === ty && pickerMonth <= tm);

  const cells = buildCalendarCells(pickerYear, pickerMonth);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(draftVisitTime);
  const hourVal = timeMatch?.[1] ?? "09";
  const minuteVal = timeMatch?.[2] ?? "00";

  return (
    <div className="flex flex-col gap-4 px-2 pb-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Bulan sebelumnya"
          disabled={disablePrevMonth}
          onClick={onPrevMonth}
          className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon />
        </button>
        <p className="min-w-0 flex-1 text-center text-sm font-semibold text-mate-black capitalize">
          {monthTitleId(pickerYear, pickerMonth)}
        </p>
        <button
          type="button"
          aria-label="Bulan berikutnya"
          onClick={onNextMonth}
          className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-slate-200 text-slate-700"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS_SHORT.map((label) => (
          <div
            key={label}
            className="py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            {label}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (cell.kind === "empty") {
            return <span key={`e-${pickerYear}-${pickerMonth}-${idx}`} />;
          }
          const past = cell.dateStr < todayStr;
          const selected = draftVisitDate === cell.dateStr;
          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={past}
              onClick={() => onPickDate(cell.dateStr)}
              className={`flex aspect-square max-h-11 items-center justify-center rounded-sm text-sm font-medium transition-colors
                ${selected ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/40" : "text-mate-black"}
                ${past ? "cursor-not-allowed opacity-30" : "active:bg-slate-100"}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Jam
        </p>
        <div className="mt-2 flex gap-2">
          <select
            aria-label="Jam"
            value={hourVal}
            onChange={(e) => onTimeChange(`${e.target.value}:${minuteVal}`)}
            className="h-12 min-w-0 flex-1 rounded-sm border border-slate-300 bg-white px-3 text-sm text-mate-black outline-none ring-primary/50 focus:ring-1"
          >
            {HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <select
            aria-label="Menit"
            value={minuteVal}
            onChange={(e) => onTimeChange(`${hourVal}:${e.target.value}`)}
            className="h-12 min-w-0 flex-1 rounded-sm border border-slate-300 bg-white px-3 text-sm text-mate-black outline-none ring-primary/50 focus:ring-1"
          >
            {MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {preferredVisitAt ? (
        <button
          type="button"
          className="rounded-sm py-2 text-center text-sm font-semibold text-red-600"
          onClick={onClear}
        >
          Hapus jadwal
        </button>
      ) : null}
    </div>
  );
}

export function BookingForm() {
  const issueFileInputRef = useRef<HTMLInputElement>(null);
  const [issueImageUrls, setIssueImageUrls] = useState<string[]>([]);
  const [uploadingIssueImage, setUploadingIssueImage] = useState(false);
  const issueFileAccept = BOOKING_UPLOAD_ALLOWED_TYPES.join(",");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<CreateServiceOrderResult | null>(null);
  const [serviceType, setServiceType] =
    useState<BookingServiceType>("HOME_SERVICE");
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [laptopBrand, setLaptopBrand] = useState("");
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false);
  const [preferredVisitAt, setPreferredVisitAt] = useState("");
  const [draftVisitDate, setDraftVisitDate] = useState(todayDateString);
  const [draftVisitTime, setDraftVisitTime] = useState("09:00");
  const nowInit = () => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  };
  const [pickerYear, setPickerYear] = useState(nowInit().y);
  const [pickerMonth, setPickerMonth] = useState(nowInit().m);

  async function handleIssueAttachmentChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) {
      return;
    }
    const existingCount = issueImageUrls.length;
    if (existingCount >= MAX_ISSUE_ATTACHMENTS) {
      toast.error(`Maksimal ${MAX_ISSUE_ATTACHMENTS} foto per booking.`);
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    fd.set("existingCount", String(existingCount));
    setUploadingIssueImage(true);
    try {
      const { url } = await uploadBookingIssueImage(fd);
      setIssueImageUrls((prev) => {
        if (prev.length >= MAX_ISSUE_ATTACHMENTS) {
          return prev;
        }
        return [...prev, url];
      });
      toast.success("Foto ditambahkan.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah foto.",
      );
    } finally {
      setUploadingIssueImage(false);
    }
  }

  if (success) {
    const message = `Ri Computer • Home Service\nTracking ID:\n${success.trackingId}\nSimpan untuk cek status.`;
    const wa = success.shopWhatsApp
      ? whatsappHref(success.shopWhatsApp, message)
      : null;

    return (
      <div className="mt-8 space-y-4 rounded-sm border border-blue-100 bg-blue-50 px-5 py-6 text-sm shadow-inner">
        <p className="text-base font-semibold text-blue-950">
          Booking berhasil
        </p>
        <p className="text-xs text-blue-950/80">
          Tracking ID Anda:
        </p>
        <div className="h-10 bg-white rounded-sm p-2 flex items-center">
          <span className="flex-1 text-xs line-clamp-1 font-semibold">{success.trackingId}</span>
          <button
            type="button"
            aria-label="Salin nomor lacak"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(success.trackingId);
                toast.success("Nomor lacak disalin");
              } catch {
                toast.error("Tidak bisa menyalin. Salin manual saja.");
              }
            }}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-blue-950"
          >
            <SvgCopy className="size-5" />
          </button>
        </div>
        <p className="text-xs text-blue-950/75">
          Order tersimpan di sistem kami. Nomor lacak ini juga dicatat di perangkat
          Anda (local storage) supaya mudah dibuka lagi di halaman Status.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/tracking"
            className="inline-flex h-11 items-center justify-center rounded-sm border border-blue-600 bg-white text-sm font-medium text-blue-700"
          >
            Lihat Status
          </Link>
          {wa ? (
            <Link
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-blue-600 px-5 text-sm font-medium text-white shadow-sm"
            >
              Konfirmasi via WhatsApp
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Pilih Jenis Layanan
        </h2>
        <div className="mt-4 grid gap-3">
          <ServiceCard
            comingSoon
            active={serviceType === "REGULAR"}
            title="Servis Datang Ke Toko"
            description="Bawa laptop ke bengkel kami."
            icon="/icons/svg-store-service-2.svg"
          />
          <ServiceCard
            comingSoon
            active={serviceType === "DELIVERY"}
            title="Servis Antar Jemput"
            description="Kurir jemput dan antar perangkat Anda."
            icon="/icons/svg-delivery-service-2.svg"
          />
          <ServiceCard
            active={serviceType === "HOME_SERVICE"}
            title="Home Servis"
            description="Teknisi datang langsung pada lokasi yang Anda tuliskan."
            icon="/icons/svg-home-service-2.svg"
            onSelect={() => setServiceType("HOME_SERVICE")}
          />
        </div>
      </div>

      <form
        id="form-data-perangkat"
        className="scroll-mt-28 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setPending(true);
          try {
            const outcome = await createServiceOrder(formData);
            rememberTrackingId(outcome.trackingId);
            setSuccess(outcome);
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Gagal mengirim formulir.";
            toast.error(message);
          } finally {
            setPending(false);
          }
        }}
      >
        <input type="hidden" name="serviceType" value={serviceType} />

        <fieldset className="space-y-3 bg-white py-4">
          <legend className="sr-only">Data Perangkat</legend>
          <p className="text-md font-semibold text-mate-black">
            Data Perangkat
          </p>

          <div className="grid gap-3">
            <div>
              <label
                id="label-laptop-brand"
                className="text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Merk Laptop
              </label>
              <input type="hidden" name="laptopBrand" value={laptopBrand} />
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={brandSheetOpen}
                aria-labelledby="label-laptop-brand"
                onClick={() => setBrandSheetOpen(true)}
                className="mt-2 flex h-12 w-full items-center justify-between gap-2 rounded-sm border border-slate-300 bg-white px-3 text-left text-sm outline-none ring-blue-600 focus-visible:ring-2"
              >
                <span className="truncate text-mate-black">
                  {LAPTOP_BRAND_OPTIONS.find((o) => o.value === laptopBrand)
                    ?.label ?? "Pilih Merk Laptop"}
                </span>
                <ChevronDownIcon className="shrink-0 text-slate-400" />
              </button>
              <BottomSheet
                open={brandSheetOpen}
                onOpenChange={setBrandSheetOpen}
                title="Merk laptop"
                footer={
                  <button
                    type="button"
                    className="h-12 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                    onClick={() => setBrandSheetOpen(false)}
                  >
                    Batal
                  </button>
                }
              >
                <ul className="flex flex-col gap-1 pb-2" role="listbox">
                  {LAPTOP_BRAND_OPTIONS.map((opt) => {
                    const selected = laptopBrand === opt.value;
                    return (
                      <li key={opt.value || "unset"} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={`flex min-h-11 w-full items-center rounded-sm px-3 py-3 text-left text-sm font-medium ${
                            selected
                              ? "bg-primary/5 text-primary"
                              : "text-mate-black active:bg-slate-100"
                          }`}
                          onClick={() => {
                            setLaptopBrand(opt.value);
                            setBrandSheetOpen(false);
                          }}
                        >
                          {opt.label}
                          {selected ? (
                            <span
                              className="relative ml-auto text-mate-black/40 rounded-full border border-primary aspect-square size-6 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-primary after:size-7/12"
                              aria-hidden
                            ></span>
                          ) : (
                            <span
                              className="ml-auto text-mate-black/40 rounded-full border border-mate-black/40 aspect-square size-6"
                              aria-hidden
                            ></span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </BottomSheet>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Model Laptop
              </label>
              <input
                name="laptopModel"
                className="mt-2 h-12 w-full rounded-sm border border-slate-300 px-3 text-sm outline-none ring-primary/50 focus:ring-1"
                placeholder="Contoh: VivoBook 14 TP401MA"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Keluhan / Masalah
              </label>
              <textarea
                name="issue"
                required
                rows={5}
                className="mt-2 min-h-[120px] w-full rounded-sm border border-slate-300 px-3 py-3 text-sm outline-none ring-primary/50 focus:ring-1"
                placeholder="Jelaskan gejala, riwayat, lampu indikator, atau kebutuhan Anda."
              />
              <input
                type="hidden"
                name="issueAttachmentUrls"
                value={JSON.stringify(issueImageUrls)}
              />
              <input
                ref={issueFileInputRef}
                type="file"
                accept={issueFileAccept}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                disabled={
                  uploadingIssueImage ||
                  issueImageUrls.length >= MAX_ISSUE_ATTACHMENTS
                }
                onChange={(e) => void handleIssueAttachmentChange(e)}
              />
              <div className="mt-4 space-y-2">
                {issueImageUrls.length > 0 ? (
                  <ul className="grid grid-cols-3 gap-2" aria-label="Preview lampiran">
                    {issueImageUrls.map((url) => (
                      <li
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-sm bg-slate-100"
                      >
                        <Image
                          src={url}
                          alt="Lampiran keluhan"
                          fill
                          className="object-cover"
                          sizes="(max-width: 28rem) 33vw, 120px"
                        />
                        <button
                          type="button"
                          aria-label="Hapus lampiran"
                          disabled={uploadingIssueImage}
                          className="absolute right-1 top-1 flex size-8 touch-manipulation items-center justify-center rounded-full bg-black/55 text-sm font-bold text-white shadow-sm disabled:opacity-40"
                          onClick={() =>
                            setIssueImageUrls((prev) =>
                              prev.filter((u) => u !== url),
                            )
                          }
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="button"
                  disabled={
                    uploadingIssueImage ||
                    issueImageUrls.length >= MAX_ISSUE_ATTACHMENTS
                  }
                  onClick={() => issueFileInputRef.current?.click()}
                  className={`flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl border border-dashed text-xs font-semibold ${
                    uploadingIssueImage ||
                    issueImageUrls.length >= MAX_ISSUE_ATTACHMENTS
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      : "border-primary/40 bg-white text-primary active:bg-primary/5"
                  }`}
                >
                  {uploadingIssueImage
                    ? "Mengunggah…"
                    : issueImageUrls.length >= MAX_ISSUE_ATTACHMENTS
                      ? `Maks. ${MAX_ISSUE_ATTACHMENTS} foto`
                      : "Tambah foto keluhan (opsional)"}
                </button>
                <p className="text-[11px] text-slate-500">
                  JPG, PNG, WebP, atau GIF — maks. 5 MB per foto (dikirim dengan
                  kompresi otomatis).
                </p>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3 py-4">
          <legend className="sr-only">Data Kontak & Lokasi Kunjungan</legend>
          <p className="text-md font-semibold text-mate-black">Data Kontak</p>
          <input
            name="customerName"
            required
            className="h-12 w-full rounded-sm border border-slate-300 px-4 text-sm outline-none ring-primary/50 focus:ring-1"
            placeholder="Nama Lengkap"
          />
          <input
            name="customerPhone"
            required
            type="tel"
            className="h-12 w-full rounded-sm border border-slate-300 px-4 text-sm outline-none ring-primary/50 focus:ring-1"
            placeholder="No. WhatsApp"
          />
          <input
            name="visitAddress"
            required
            className="h-12 w-full rounded-sm border border-slate-300 px-4 text-sm outline-none ring-primary/50 focus:ring-1"
            placeholder="Alamat lengkap kunjungan"
          />
          <input
            type="hidden"
            name="preferredVisitAt"
            value={preferredVisitAt}
          />
          <div>
            <label
              id="label-preferred-visit"
              className="text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              Waktu kunjungan (opsional)
            </label>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={scheduleSheetOpen}
              aria-labelledby="label-preferred-visit"
              onClick={() => {
                let dateStr = todayDateString();
                let timeStr = "09:00";
                if (preferredVisitAt) {
                  const s = splitDatetimeLocal(preferredVisitAt);
                  if (s) {
                    dateStr = s.date;
                    timeStr = s.time;
                  }
                }
                setDraftVisitDate(dateStr);
                setDraftVisitTime(timeStr);
                const ym = parseYMD(dateStr);
                if (ym) {
                  setPickerYear(ym.year);
                  setPickerMonth(ym.month);
                }
                setScheduleSheetOpen(true);
              }}
              className="mt-2 flex h-12 w-full items-center justify-between gap-2 rounded-sm border border-slate-300 bg-white px-3 text-left text-sm outline-none ring-blue-600 focus-visible:ring-2"
            >
              <span
                className={
                  preferredVisitAt
                    ? "truncate text-mate-black"
                    : "truncate text-slate-500"
                }
              >
                {preferredVisitAt
                  ? formatVisitDisplay(preferredVisitAt)
                  : "Pilih tanggal dan jam"}
              </span>
              <ChevronDownIcon className="shrink-0 text-slate-400" />
            </button>
            <BottomSheet
              open={scheduleSheetOpen}
              onOpenChange={setScheduleSheetOpen}
              title="Jadwal kunjungan"
              sheetMaxHeightClass="max-h-[min(94dvh,100%)]"
              footer={
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="h-12 w-full rounded-sm bg-blue-600 text-sm font-semibold text-white shadow-sm"
                    onClick={() => {
                      const d = draftVisitDate.trim();
                      const t = draftVisitTime.trim();
                      if (!d || !t) {
                        return;
                      }
                      setPreferredVisitAt(mergeDatetimeLocal(d, t));
                      setScheduleSheetOpen(false);
                    }}
                  >
                    Terapkan
                  </button>
                  <button
                    type="button"
                    className="h-12 w-full rounded-sm border border-slate-200 text-sm font-semibold text-slate-700"
                    onClick={() => setScheduleSheetOpen(false)}
                  >
                    Batal
                  </button>
                </div>
              }
            >
              <SchedulePickerBody
                todayStr={todayDateString()}
                pickerYear={pickerYear}
                pickerMonth={pickerMonth}
                draftVisitDate={draftVisitDate}
                draftVisitTime={draftVisitTime}
                preferredVisitAt={preferredVisitAt}
                onPickDate={setDraftVisitDate}
                onTimeChange={setDraftVisitTime}
                onPrevMonth={() => {
                  if (pickerMonth === 0) {
                    setPickerYear((y) => y - 1);
                    setPickerMonth(11);
                  } else {
                    setPickerMonth((m) => m - 1);
                  }
                }}
                onNextMonth={() => {
                  if (pickerMonth === 11) {
                    setPickerYear((y) => y + 1);
                    setPickerMonth(0);
                  } else {
                    setPickerMonth((m) => m + 1);
                  }
                }}
                onClear={() => {
                  setPreferredVisitAt("");
                  setScheduleSheetOpen(false);
                }}
              />
            </BottomSheet>
          </div>
        </fieldset>

        <button
          disabled={pending}
          className="h-14 w-full rounded-sm bg-primary text-base font-medium text-white shadow-lg shadow-blue-200 disabled:opacity-70"
          type="submit"
        >
          {pending ? "Mengirim..." : "Kirim Booking"}
        </button>
      </form>
    </section>
  );
}
