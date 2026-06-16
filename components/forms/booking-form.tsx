"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  createServiceOrder,
  type CreateServiceOrderSuccess,
} from "@/lib/actions/service-order";
import { uploadBookingIssueImage } from "@/lib/actions/booking-issue-upload";
import {
  BOOKING_UPLOAD_ALLOWED_TYPES,
  MAX_ISSUE_ATTACHMENTS,
} from "@/lib/booking-issue-attachments";
import { serviceTypeFromJenisQuery } from "@/lib/admin-order-status-display";
import { saveTrackingIdToStorage } from "@/lib/tracking-storage";
import { toast } from "sonner";
import { whatsappHref } from "@/lib/whatsapp";
import { formatOrderDateId } from "@/lib/format-relative-time";
import Image from "next/image";
import { reverseGeocodeAddress } from "@/lib/actions/geocode";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import {
  BOOKING_FIELD_ORDER,
  type BookingFieldKey,
  getBookingFieldToast,
  validateBookingForm,
} from "@/lib/booking-form-validation";
import { SvgCopy } from "../shared/SvgComponent";

const BRAND_SUGGESTIONS = [
  "Lenovo",
  "HP",
  "ASUS",
  "Acer",
  "Dell",
  "Toshiba",
  "Apple",
  "MSI",
  "Samsung",
  "Huawei",
] as const;

const FIELD_LIMITS = {
  laptopBrand: 80,
  laptopModel: 120,
  deviceSpecs: 160,
  issue: 2000,
  customerName: 100,
  customerPhone: 13,
  visitAddress: 500,
  customerCity: 100,
} as const;

const inputClass =
  "h-12 w-full rounded-sm border px-3 text-sm outline-none focus:ring-1";
const inputBorderClass = "border-slate-300 ring-primary/50";
const textareaClass =
  "mt-2 min-h-[120px] w-full rounded-sm border px-3 py-3 text-sm outline-none focus:ring-1";
const textareaBorderClass = "border-slate-300 ring-primary/50";
const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-slate-600";

function fieldBorderClass(
  hasError: boolean,
  base: string,
  borderClass: string,
): string {
  return hasError
    ? `${base} border-red-500 ring-red-500/50`
    : `${base} ${borderClass}`;
}

/** Clears fixed mobile header (`scroll-mt-28` on the form). */
const SCROLL_TOP_OFFSET_PX = 112;
/** Approx. bottom tab bar + safe area on mobile. */
const SCROLL_BOTTOM_OFFSET_PX = 88;

function scrollFieldIntoView(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const viewportHeight = window.innerHeight;
  const visibleHeight = Math.max(
    240,
    viewportHeight - SCROLL_TOP_OFFSET_PX - SCROLL_BOTTOM_OFFSET_PX,
  );
  const visibleCenter = SCROLL_TOP_OFFSET_PX + visibleHeight / 2;
  const targetScroll = absoluteTop + rect.height / 2 - visibleCenter;

  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: "smooth",
  });
}

function focusFirstInvalidField(fieldErrors: Record<string, string>): void {
  const firstKey = BOOKING_FIELD_ORDER.find((key) => key in fieldErrors);
  if (!firstKey) {
    return;
  }
  const element = document.getElementById(firstKey);
  if (!element) {
    return;
  }
  scrollFieldIntoView(element);
  element.focus();
}

function firstInvalidFieldError(
  fieldErrors: Record<string, string>,
): { key: BookingFieldKey; errors: Record<string, string> } | null {
  const firstKey = BOOKING_FIELD_ORDER.find(
    (key): key is BookingFieldKey => key in fieldErrors,
  );
  if (!firstKey) {
    return null;
  }
  return { key: firstKey, errors: { [firstKey]: fieldErrors[firstKey] } };
}

function openWhatsApp(href: string | null, invalidMessage: string): void {
  if (!href) {
    toast.error(invalidMessage);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}

function bookingPaymentConfirmationMessage(trackingId: string): string {
  const bookingDate = formatOrderDateId(new Date());
  return [
    "Halo, Ri! Saya sudah booking untuk service",
    "",
    `ID Tracking: ${trackingId}`,
    `Tanggal Booking: ${bookingDate}`,
    "",
    "Berikut bukti pembayaran bookingnya.",
    "Tolong dicek ya. Hatur nuhun, Ri.",
  ].join("\n");
}

function ServiceCard({
  active = false,
  title,
  description,
  icon,
  iconBg,
  onSelect,
  scrollToForm = true,
}: {
  active?: boolean;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  onSelect: () => void;
  scrollToForm?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect();
        if (scrollToForm) {
          document
            .getElementById("form-data-perangkat")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
      className={`custom-shadow-sm cursor-pointer group flex h-full rounded-2xl border border-[#DEDFE3] bg-white p-4 text-center transition-shadow hover:shadow-md gap-4 lg:rounded-3xl lg:p-8 lg:transition-transform lg:duration-300 lg:ease-in-out
        ${
          active
            ? "border-2 border-primary/50 bg-primary/5 shadow-sm"
            : "border border-mate-black/10 shadow-md"
        }
        `}
    >
      <div
        className={`flex relative size-12 shrink-0 items-center justify-center rounded-full bg-opacity-10 lg:mb-0 lg:size-14 lg:rounded-2xl ${iconBg}`}
      >
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          aria-hidden
          className="lg:h-7 lg:w-7"
        />
        {title.toLowerCase() === "home servis" && (
          <div className="absolute -right-1 -top-1 bg-[#25D366] rounded-full p-0.5 text-white">
            <Icon
              icon="ic:baseline-whatsapp"
              width={12}
              height={12}
              className="lg:w-4 lg:h-4"
              aria-hidden
            />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap text-left items-center gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${active ? "text-blue-900" : "text-mate-black"}`}
          >
            {title}
          </p>
          <p
            className={`text-xs ${active ? "font-medium text-blue-800" : "text-mate-black/80"}`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function IssueImageLightbox({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!url) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [url, onClose]);

  if (!url || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-200"
      role="dialog"
      aria-modal="true"
      aria-label="Preview lampiran fullscreen"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/90"
        aria-label="Tutup preview"
        onClick={onClose}
      />
      <button
        type="button"
        className="absolute right-3 top-3 z-1 flex size-11 touch-manipulation items-center justify-center rounded-full bg-white/15 text-2xl font-bold text-white active:bg-white/25"
        aria-label="Tutup preview"
        onClick={onClose}
      >
        ×
      </button>
      <div className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Lampiran keluhan"
          className="max-h-[90dvh] max-w-[min(100%,92vw)] object-contain"
        />
      </div>
    </div>,
    document.body,
  );
}

function DeviceFields({
  issueImageUrls,
  uploadingIssueImage,
  issueFileInputRef,
  issueFileAccept,
  onIssueAttachmentChange,
  onRemoveIssueImage,
  onPickIssueImage,
  fieldErrors,
  onClearFieldError,
}: {
  issueImageUrls: string[];
  uploadingIssueImage: boolean;
  issueFileInputRef: React.RefObject<HTMLInputElement | null>;
  issueFileAccept: string;
  onIssueAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveIssueImage: (url: string) => void;
  onPickIssueImage: () => void;
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const closePreview = useCallback(() => setPreviewUrl(null), []);

  return (
    <fieldset className="space-y-3 bg-white py-4">
      <legend className="sr-only">Data Perangkat</legend>
      <p className="text-md font-semibold text-mate-black">Data Perangkat</p>

      <div className="grid gap-3 lg:grid-cols-3">
        <div>
          <label htmlFor="laptopBrand" className={labelClass}>
            Merek*
          </label>
          <input
            id="laptopBrand"
            name="laptopBrand"
            required
            maxLength={FIELD_LIMITS.laptopBrand}
            list="laptop-brand-suggestions"
            className={`mt-2 ${fieldBorderClass(!!fieldErrors.laptopBrand, inputClass, inputBorderClass)}`}
            placeholder="Contoh: ASUS"
            autoComplete="off"
            aria-invalid={!!fieldErrors.laptopBrand}
            onInput={() => onClearFieldError("laptopBrand")}
          />
          <datalist id="laptop-brand-suggestions">
            {BRAND_SUGGESTIONS.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="laptopModel" className={labelClass}>
            Tipe*
          </label>
          <input
            id="laptopModel"
            name="laptopModel"
            required
            maxLength={FIELD_LIMITS.laptopModel}
            className={`mt-2 ${fieldBorderClass(!!fieldErrors.laptopModel, inputClass, inputBorderClass)}`}
            placeholder="Contoh: VivoBook 14 TP401MA"
            aria-invalid={!!fieldErrors.laptopModel}
            onInput={() => onClearFieldError("laptopModel")}
          />
        </div>

        <div>
          <label htmlFor="deviceSpecs" className={labelClass}>
            Prosesor &amp; VGA*
          </label>
          <input
            id="deviceSpecs"
            name="deviceSpecs"
            required
            maxLength={FIELD_LIMITS.deviceSpecs}
            className={`mt-2 ${fieldBorderClass(!!fieldErrors.deviceSpecs, inputClass, inputBorderClass)}`}
            placeholder="Contoh: Intel i5-8250U / Intel UHD 620"
            aria-invalid={!!fieldErrors.deviceSpecs}
            onInput={() => onClearFieldError("deviceSpecs")}
          />
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="issue" className={labelClass}>
            Keluhan / Masalah*
          </label>
          <textarea
            id="issue"
            name="issue"
            required
            rows={5}
            maxLength={FIELD_LIMITS.issue}
            className={fieldBorderClass(
              !!fieldErrors.issue,
              textareaClass,
              textareaBorderClass,
            )}
            placeholder="Jelaskan gejala, riwayat, lampu indikator, atau kebutuhan Anda."
            aria-invalid={!!fieldErrors.issue}
            onInput={() => onClearFieldError("issue")}
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
            onChange={(e) => void onIssueAttachmentChange(e)}
          />
          <div className="mt-4 space-y-2">
            {issueImageUrls.length > 0 ? (
              <ul
                className="grid grid-cols-3 gap-2"
                aria-label="Preview lampiran"
              >
                {issueImageUrls.map((url) => (
                  <li
                    key={url}
                    className="relative aspect-square overflow-hidden border border-slate-300 border-dashed rounded-lg bg-slate-100"
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
                      aria-label="Lihat foto fullscreen"
                      className="absolute left-1/2 top-1/2 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-black/45 text-white shadow-sm active:bg-black/60"
                      onClick={() => setPreviewUrl(url)}
                    >
                      <Icon
                        icon="mdi:arrow-expand"
                        width={20}
                        height={20}
                        aria-hidden
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus lampiran"
                      disabled={uploadingIssueImage}
                      className="absolute right-1 top-1 z-20 flex size-8 touch-manipulation items-center justify-center rounded-full bg-black/55 text-sm font-bold text-white shadow-sm disabled:opacity-40"
                      onClick={() => {
                        onRemoveIssueImage(url);
                        if (previewUrl === url) {
                          setPreviewUrl(null);
                        }
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <IssueImageLightbox url={previewUrl} onClose={closePreview} />
            <button
              type="button"
              disabled={
                uploadingIssueImage ||
                issueImageUrls.length >= MAX_ISSUE_ATTACHMENTS
              }
              onClick={onPickIssueImage}
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
  );
}

function ContactBaseFields({
  fieldErrors,
  onClearFieldError,
}: {
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}) {
  return (
    <>
      <div>
        <label htmlFor="customerName" className={labelClass}>
          Nama*
        </label>
        <input
          id="customerName"
          name="customerName"
          required
          maxLength={FIELD_LIMITS.customerName}
          className={`mt-2 ${fieldBorderClass(!!fieldErrors.customerName, inputClass, inputBorderClass)}`}
          placeholder="Nama lengkap"
          aria-invalid={!!fieldErrors.customerName}
          onInput={() => onClearFieldError("customerName")}
        />
      </div>
      <div>
        <label htmlFor="customerPhone" className={labelClass}>
          No. WhatsApp*
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          pattern="08[0-9]{8,11}"
          maxLength={FIELD_LIMITS.customerPhone}
          className={`mt-2 ${fieldBorderClass(!!fieldErrors.customerPhone, inputClass, inputBorderClass)}`}
          placeholder="08xxxxxxxxxx"
          aria-invalid={!!fieldErrors.customerPhone}
          onInput={() => onClearFieldError("customerPhone")}
        />
      </div>
    </>
  );
}

function DeliveryContactFields({
  visitAddress,
  onVisitAddressChange,
  fieldErrors,
  onClearFieldError,
}: {
  visitAddress: string;
  onVisitAddressChange: (value: string) => void;
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}) {
  const [locating, setLocating] = useState(false);

  function pickCurrentLocation(): void {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung lokasi.");
      return;
    }

    setLocating(true);
    const loadingToast = toast.loading("Mengambil lokasi…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          try {
            const { latitude, longitude } = pos.coords;
            const result = await reverseGeocodeAddress(latitude, longitude);
            if ("error" in result) {
              toast.error(result.error);
              return;
            }
            onVisitAddressChange(result.address);
            onClearFieldError("visitAddress");
            toast.success("Alamat diisi dari lokasi saat ini.");
          } catch {
            toast.error("Gagal mengonversi lokasi ke alamat.");
          } finally {
            toast.dismiss(loadingToast);
            setLocating(false);
          }
        })();
      },
      () => {
        toast.dismiss(loadingToast);
        setLocating(false);
        toast.error(
          "Gagal mengambil lokasi. Izinkan akses lokasi atau isi manual.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <fieldset className="space-y-3 py-4">
      <legend className="sr-only">Data Kontak</legend>
      <p className="text-md font-semibold text-mate-black">Data Kontak</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <ContactBaseFields
          fieldErrors={fieldErrors}
          onClearFieldError={onClearFieldError}
        />
        <div className="lg:col-span-2 space-y-3">
          <AddressAutocomplete
            labelClassName={labelClass}
            inputClassName={`${inputClass} ${inputBorderClass}`}
            maxLength={FIELD_LIMITS.visitAddress}
            onSelect={(address) => {
              onVisitAddressChange(address);
              onClearFieldError("visitAddress");
            }}
            onPickCurrentLocation={pickCurrentLocation}
            locating={locating}
          />
          <div>
            <label htmlFor="visitAddress" className={labelClass}>
              Alamat Lengkap*
            </label>
            <textarea
              id="visitAddress"
              name="visitAddress"
              required
              rows={3}
              maxLength={FIELD_LIMITS.visitAddress}
              value={visitAddress}
              onChange={(e) => {
                onVisitAddressChange(e.target.value);
                onClearFieldError("visitAddress");
              }}
              className={fieldBorderClass(
                !!fieldErrors.visitAddress,
                textareaClass,
                textareaBorderClass,
              )}
              placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
              aria-invalid={!!fieldErrors.visitAddress}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function RegularContactFields({
  fieldErrors,
  onClearFieldError,
}: {
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}) {
  return (
    <fieldset className="space-y-3 py-4">
      <legend className="sr-only">Data Kontak</legend>
      <p className="text-md font-semibold text-mate-black">Data Kontak</p>
      <div className="grid gap-3">
        <ContactBaseFields
          fieldErrors={fieldErrors}
          onClearFieldError={onClearFieldError}
        />
        <div>
          <label htmlFor="customerCity" className={labelClass}>
            Asal Kota*
          </label>
          <input
            id="customerCity"
            name="customerCity"
            required
            maxLength={FIELD_LIMITS.customerCity}
            className={`mt-2 ${fieldBorderClass(!!fieldErrors.customerCity, inputClass, inputBorderClass)}`}
            placeholder="Contoh: Jakarta Selatan"
            aria-invalid={!!fieldErrors.customerCity}
            onInput={() => onClearFieldError("customerCity")}
          />
        </div>
      </div>
    </fieldset>
  );
}

function bookableTypeFromJenis(
  jenis: string | null,
): "REGULAR" | "DELIVERY" | null {
  const mapped = serviceTypeFromJenisQuery(jenis ?? undefined);
  if (mapped === "REGULAR" || mapped === "DELIVERY") {
    return mapped;
  }
  return null;
}

export function BookingForm({
  homeServiceWaHref,
  onSuccessChange,
}: Readonly<{
  homeServiceWaHref: string | null;
  onSuccessChange?: (isSuccess: boolean) => void;
}>) {
  const searchParams = useSearchParams();
  const didScrollToForm = useRef(false);
  const issueFileInputRef = useRef<HTMLInputElement>(null);
  const [issueImageUrls, setIssueImageUrls] = useState<string[]>([]);
  const [uploadingIssueImage, setUploadingIssueImage] = useState(false);
  const issueFileAccept = BOOKING_UPLOAD_ALLOWED_TYPES.join(",");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<CreateServiceOrderSuccess | null>(
    null,
  );
  const urlServiceType = bookableTypeFromJenis(searchParams.get("jenis"));
  const [manualServiceType, setManualServiceType] = useState<
    "REGULAR" | "DELIVERY" | null
  >(null);
  const serviceType = manualServiceType ?? urlServiceType;
  const [visitAddress, setVisitAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors((prev) => {
      if (!(name in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!urlServiceType || didScrollToForm.current) {
      return;
    }
    didScrollToForm.current = true;
    requestAnimationFrame(() => {
      document
        .getElementById("form-data-perangkat")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [urlServiceType]);

  useEffect(() => {
    onSuccessChange?.(success !== null);
    if (!success) {
      return;
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [success, onSuccessChange]);

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
    const paymentWa = success.shopWhatsApp
      ? whatsappHref(
          success.shopWhatsApp,
          bookingPaymentConfirmationMessage(success.trackingId),
        )
      : null;

    return (
      <div className="space-y-4 rounded-2xl lg:max-w-md lg:mx-auto border border-[#DEE1E6FF] bg-[#FAFAFBFF] px-5 py-6 text-sm shadow-inner">
        <div className="bg-[#1A73E8FF] mt-2 rounded-full p-1.5 outline-8 mx-auto outline-[#1A73E81A] text-white size-fit">
          <Icon
            icon="material-symbols:check"
            width={32}
            height={32}
            aria-hidden
          />
        </div>
        <p className="text-xl text-center font-semibold text-blue-950">
          Booking berhasil
        </p>
        <div className="flex flex-col border border-dashed border-[#DEE1E6FF] rounded-md bg-white p-2">
          <p className="text-[10px] text-blue-950/80">Tracking ID Anda:</p>
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 flex-1 text-base font-semibold">
              {success.trackingId}
            </span>
            <button
              type="button"
              aria-label="Salin nomor lacak"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(success.trackingId);
                  toast.success("Tracking ID berhasil disalin");
                } catch {
                  toast.error("Gagal bisa menyalin.");
                }
              }}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-blue-950"
            >
              <Icon
                icon="solar:copy-line-duotone"
                className="text-[#1A73E8FF]"
                width={16}
                height={16}
                aria-hidden
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col border border-[#1A73E833] rounded-md bg-[#E8F1FFFF] p-3">
          <h3 className="text-sm mb-2 text-blue-950/80 font-semibold">
            Informasi Pembayaran
          </h3>
          <p className="text-xs">
            Wajib bayar booking <strong>Rp 10.000</strong> ke rekening berikut:
          </p>
          <div className="bg-[#FFFFFFFF] flex justify-between items-center my-4 rounded-md p-2">
            <div className="">
              <p className="text-[#171A1FFF] font-semibold">BCA 0084402466</p>
              <p className="text-[#565D6DFF] text-xs">
                an Ri Group Raya Sejahtera
              </p>
            </div>
            <button
              type="button"
              aria-label="Salin nomor lacak"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText("0084402466");
                  toast.success("Nomor rekening berhasil disalin");
                } catch {
                  toast.error("Gagal bisa menyalin.");
                }
              }}
              className="inline-flex size-10 shrink-0 items-center justify-end rounded-sm text-blue-950"
            >
              <Icon
                icon="solar:copy-line-duotone"
                className="text-[#1A73E8FF]"
                width={16}
                height={16}
                aria-hidden
              />
            </button>
          </div>
          <p className="text-xs mb-2">
            Kirim bukti pembayaran ke whatsapp admin dengan klik konfirmasi di
            bawah ini:
          </p>
          {paymentWa ? (
            <Link
              href={paymentWa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 gap-1 items-center justify-center rounded-sm bg-[#1fb957] px-2 text-sm font-medium text-white shadow-sm"
            >
              <Icon
                icon="ic:baseline-whatsapp"
                width={24}
                height={24}
                className="text-white"
                aria-hidden
              />
              Konfirmasi Pembayaran
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Nomor WhatsApp toko belum dikonfigurasi"
              className="inline-flex h-11 gap-1 items-center justify-center rounded-sm bg-[#1fb957] px-2 text-sm font-medium text-white opacity-70 shadow-sm"
            >
              <Icon
                icon="ic:baseline-whatsapp"
                width={24}
                height={24}
                className="text-white"
                aria-hidden
              />
              Konfirmasi Pembayaran
            </button>
          )}
        </div>
        <p className="text-xs text-blue-950/75">
          Simpan Tracking ID Anda untuk memantau status perbaikan secara
          berkala.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/tracking"
            className="inline-flex h-11 items-center justify-center rounded-sm border border-blue-600 bg-white text-sm font-medium text-blue-700"
          >
            Lihat Status
          </Link>
        </div>
      </div>
    );
  }

  const showForm = serviceType === "REGULAR" || serviceType === "DELIVERY";

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Pilih Jenis Layanan
        </h2>
        <div className="mt-4 grid lg:grid-cols-3 gap-3">
          <ServiceCard
            active={serviceType === "REGULAR"}
            title="Servis Datang Ke Toko"
            iconBg="bg-[#DBEAFEFF] lg:bg-[#DBEAFE6A]"
            description="Bawa laptop ke bengkel kami."
            icon="/icons/svg-store-service.svg"
            onSelect={() => setManualServiceType("REGULAR")}
          />
          <ServiceCard
            active={serviceType === "DELIVERY"}
            title="Servis Antar Jemput"
            iconBg="bg-[#FFEDD5FF] lg:bg-[#FFEDD56A]"
            description="Kurir jemput dan antar perangkat Anda."
            icon="/icons/svg-delivery-service.svg"
            onSelect={() => setManualServiceType("DELIVERY")}
          />
          <ServiceCard
            active={false}
            title="Home Servis"
            iconBg="bg-[#F3E8FFFF] lg:bg-[#F3E8FF6A]"
            description="Hubungi kami via WhatsApp untuk janji teknisi datang ke lokasi Anda."
            icon="/icons/svg-home-service.svg"
            scrollToForm={false}
            onSelect={() =>
              openWhatsApp(
                homeServiceWaHref,
                "Nomor WhatsApp Ri Group Computer tidak valid.",
              )
            }
          />
        </div>
      </div>

      {showForm ? (
        <form
          id="form-data-perangkat"
          noValidate
          className="scroll-mt-28 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!serviceType) {
              return;
            }

            const formData = new FormData(event.currentTarget);
            const validation = validateBookingForm(serviceType, {
              customerName: formData.get("customerName"),
              customerPhone: formData.get("customerPhone"),
              laptopBrand: formData.get("laptopBrand"),
              laptopModel: formData.get("laptopModel"),
              deviceSpecs: formData.get("deviceSpecs"),
              issue: formData.get("issue"),
              visitAddress:
                serviceType === "DELIVERY" ? visitAddress : undefined,
              customerCity:
                serviceType === "REGULAR"
                  ? formData.get("customerCity")
                  : undefined,
            });

            if (!validation.ok) {
              const firstInvalid = firstInvalidFieldError(
                validation.fieldErrors,
              );
              if (!firstInvalid) {
                return;
              }
              setFieldErrors(firstInvalid.errors);
              const errors = firstInvalid.errors;
              requestAnimationFrame(() => {
                requestAnimationFrame(() => focusFirstInvalidField(errors));
              });
              const errorMessage = firstInvalid.errors[firstInvalid.key];
              const toastContent = getBookingFieldToast(
                firstInvalid.key,
                errorMessage,
                formData.get(firstInvalid.key),
              );
              toast.error(toastContent.title, {
                description: toastContent.description,
              });
              return;
            }

            setFieldErrors({});
            setPending(true);
            try {
              const outcome = await createServiceOrder(formData);
              if (!outcome.ok) {
                toast.error(outcome.error);
                return;
              }
              saveTrackingIdToStorage(outcome.trackingId, outcome.serviceType);
              setSuccess(outcome);
            } catch {
              toast.error("Gagal mengirim formulir. Mohon coba lagi.");
            } finally {
              setPending(false);
            }
          }}
        >
          <input type="hidden" name="serviceType" value={serviceType ?? ""} />

          <DeviceFields
            issueImageUrls={issueImageUrls}
            uploadingIssueImage={uploadingIssueImage}
            issueFileInputRef={issueFileInputRef}
            issueFileAccept={issueFileAccept}
            onIssueAttachmentChange={handleIssueAttachmentChange}
            onRemoveIssueImage={(url) =>
              setIssueImageUrls((prev) => prev.filter((u) => u !== url))
            }
            onPickIssueImage={() => issueFileInputRef.current?.click()}
            fieldErrors={fieldErrors}
            onClearFieldError={clearFieldError}
          />

          {serviceType === "DELIVERY" ? (
            <DeliveryContactFields
              visitAddress={visitAddress}
              onVisitAddressChange={setVisitAddress}
              fieldErrors={fieldErrors}
              onClearFieldError={clearFieldError}
            />
          ) : (
            <RegularContactFields
              fieldErrors={fieldErrors}
              onClearFieldError={clearFieldError}
            />
          )}

          <button
            disabled={pending || uploadingIssueImage}
            className="h-14 w-full rounded-sm bg-primary text-base font-medium text-white shadow-lg shadow-blue-200 disabled:opacity-70"
            type="submit"
          >
            {pending
              ? "Mengirim..."
              : uploadingIssueImage
                ? "Menunggu unggah foto..."
                : "Kirim Booking"}
          </button>
        </form>
      ) : (
        <p
          id="form-data-perangkat"
          className="scroll-mt-28 text-sm text-slate-600"
        >
          Pilih &quot;Datang ke Toko&quot; atau &quot;Antar Jemput&quot; untuk
          mengisi formulir booking. Untuk Home Servis, klik pilihan di atas
          untuk chat WhatsApp.
        </p>
      )}
    </section>
  );
}
