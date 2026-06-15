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
import { TRACKING_IDS_STORAGE_KEY } from "@/lib/tracking-storage";
import { toast } from "sonner";
import { whatsappHref } from "@/lib/whatsapp";
import Image from "next/image";
import { reverseGeocodeAddress } from "@/lib/actions/geocode";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { SvgCopy } from "../shared/SvgComponent";

type BookingServiceType = "REGULAR" | "DELIVERY" | "HOME_SERVICE";

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
  customerPhone: 20,
  visitAddress: 500,
  customerCity: 100,
} as const;

const inputClass =
  "h-12 w-full rounded-sm border border-slate-300 px-3 text-sm outline-none ring-primary/50 focus:ring-1";
const textareaClass =
  "mt-2 min-h-[120px] w-full rounded-sm border border-slate-300 px-3 py-3 text-sm outline-none ring-primary/50 focus:ring-1";
const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-slate-600";

function openWhatsApp(href: string | null, invalidMessage: string): void {
  if (!href) {
    toast.error(invalidMessage);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}

function serviceTypeSuccessLabel(type: BookingServiceType): string {
  switch (type) {
    case "DELIVERY":
      return "Antar Jemput";
    case "REGULAR":
      return "Datang ke Toko";
    default:
      return "Home Service";
  }
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
  title,
  description,
  icon,
  onSelect,
  scrollToForm = true,
}: {
  active?: boolean;
  title: string;
  description: string;
  icon: string;
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
      className={`flex w-full flex-row items-center gap-4 rounded-md px-4 py-3 text-left outline-none transition-colors
        ${
          active
            ? "border-2 border-primary/50 bg-primary/5 shadow-sm"
            : "border border-mate-black/10 shadow-md"
        }
        active:bg-slate-50`}
    >
      <div className="relative size-12 shrink-0">
        <Image src={icon} alt="" aria-hidden fill />
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
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
}: {
  issueImageUrls: string[];
  uploadingIssueImage: boolean;
  issueFileInputRef: React.RefObject<HTMLInputElement | null>;
  issueFileAccept: string;
  onIssueAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveIssueImage: (url: string) => void;
  onPickIssueImage: () => void;
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
            Merek
          </label>
          <input
            id="laptopBrand"
            name="laptopBrand"
            required
            maxLength={FIELD_LIMITS.laptopBrand}
            list="laptop-brand-suggestions"
            className={`mt-2 ${inputClass}`}
            placeholder="Contoh: ASUS"
            autoComplete="off"
          />
          <datalist id="laptop-brand-suggestions">
            {BRAND_SUGGESTIONS.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="laptopModel" className={labelClass}>
            Tipe
          </label>
          <input
            id="laptopModel"
            name="laptopModel"
            required
            maxLength={FIELD_LIMITS.laptopModel}
            className={`mt-2 ${inputClass}`}
            placeholder="Contoh: VivoBook 14 TP401MA"
          />
        </div>

        <div>
          <label htmlFor="deviceSpecs" className={labelClass}>
            Prosesor &amp; VGA
          </label>
          <input
            id="deviceSpecs"
            name="deviceSpecs"
            required
            maxLength={FIELD_LIMITS.deviceSpecs}
            className={`mt-2 ${inputClass}`}
            placeholder="Contoh: Intel i5-8250U / Intel UHD 620"
          />
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="issue" className={labelClass}>
            Keluhan / Masalah
          </label>
          <textarea
            id="issue"
            name="issue"
            required
            rows={5}
            maxLength={FIELD_LIMITS.issue}
            className={textareaClass}
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

function ContactBaseFields() {
  return (
    <>
      <div>
        <label htmlFor="customerName" className={labelClass}>
          Nama
        </label>
        <input
          id="customerName"
          name="customerName"
          required
          maxLength={FIELD_LIMITS.customerName}
          className={`mt-2 ${inputClass}`}
          placeholder="Nama lengkap"
        />
      </div>
      <div>
        <label htmlFor="customerPhone" className={labelClass}>
          No. WhatsApp
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          required
          type="tel"
          maxLength={FIELD_LIMITS.customerPhone}
          className={`mt-2 ${inputClass}`}
          placeholder="08xxxxxxxxxx"
        />
      </div>
    </>
  );
}

function DeliveryContactFields({
  visitAddress,
  onVisitAddressChange,
}: {
  visitAddress: string;
  onVisitAddressChange: (value: string) => void;
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
        <ContactBaseFields />
        <div className="lg:col-span-2 space-y-3">
          <AddressAutocomplete
            labelClassName={labelClass}
            inputClassName={inputClass}
            maxLength={FIELD_LIMITS.visitAddress}
            onSelect={onVisitAddressChange}
            onPickCurrentLocation={pickCurrentLocation}
            locating={locating}
          />
          <div>
            <label htmlFor="visitAddress" className={labelClass}>
              Alamat Lengkap
            </label>
            <textarea
              id="visitAddress"
              name="visitAddress"
              required
              rows={3}
              maxLength={FIELD_LIMITS.visitAddress}
              value={visitAddress}
              onChange={(e) => onVisitAddressChange(e.target.value)}
              className={textareaClass}
              placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function RegularContactFields() {
  return (
    <fieldset className="space-y-3 py-4">
      <legend className="sr-only">Data Kontak</legend>
      <p className="text-md font-semibold text-mate-black">Data Kontak</p>
      <div className="grid gap-3">
        <ContactBaseFields />
        <div>
          <label htmlFor="customerCity" className={labelClass}>
            Asal Kota
          </label>
          <input
            id="customerCity"
            name="customerCity"
            required
            maxLength={FIELD_LIMITS.customerCity}
            className={`mt-2 ${inputClass}`}
            placeholder="Contoh: Jakarta Selatan"
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
}: Readonly<{
  homeServiceWaHref: string | null;
}>) {
  const searchParams = useSearchParams();
  const didScrollToForm = useRef(false);
  const issueFileInputRef = useRef<HTMLInputElement>(null);
  const [issueImageUrls, setIssueImageUrls] = useState<string[]>([]);
  const [uploadingIssueImage, setUploadingIssueImage] = useState(false);
  const issueFileAccept = BOOKING_UPLOAD_ALLOWED_TYPES.join(",");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<CreateServiceOrderSuccess | null>(null);
  const urlServiceType = bookableTypeFromJenis(searchParams.get("jenis"));
  const [manualServiceType, setManualServiceType] = useState<
    "REGULAR" | "DELIVERY" | null
  >(null);
  const serviceType = manualServiceType ?? urlServiceType;
  const [visitAddress, setVisitAddress] = useState("");

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
    const label = serviceTypeSuccessLabel(success.serviceType);
    const message = `Ri Computer • ${label}\nTracking ID:\n${success.trackingId}\nSimpan untuk cek status.`;
    const wa = success.shopWhatsApp
      ? whatsappHref(success.shopWhatsApp, message)
      : null;

    return (
      <div className="mt-8 space-y-4 rounded-sm border border-blue-100 bg-blue-50 px-5 py-6 text-sm shadow-inner">
        <p className="text-base font-semibold text-blue-950">
          Booking berhasil
        </p>
        <p className="text-xs text-blue-950/80">Tracking ID Anda:</p>
        <div className="flex h-10 items-center rounded-sm bg-white p-2">
          <span className="line-clamp-1 flex-1 text-xs font-semibold">
            {success.trackingId}
          </span>
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
          Order tersimpan di sistem kami. Nomor lacak ini juga dicatat di
          perangkat Anda (local storage) supaya mudah dibuka lagi di halaman
          Status.
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
            description="Bawa laptop ke bengkel kami."
            icon="/icons/svg-store-service-2.svg"
            onSelect={() => setManualServiceType("REGULAR")}
          />
          <ServiceCard
            active={serviceType === "DELIVERY"}
            title="Servis Antar Jemput"
            description="Kurir jemput dan antar perangkat Anda."
            icon="/icons/svg-delivery-service-2.svg"
            onSelect={() => setManualServiceType("DELIVERY")}
          />
          <ServiceCard
            active={false}
            title="Home Servis"
            description="Hubungi kami via WhatsApp untuk janji teknisi datang ke lokasi Anda."
            icon="/icons/svg-home-service-2.svg"
            scrollToForm={false}
            onSelect={() =>
              openWhatsApp(
                homeServiceWaHref,
                "Nomor WhatsApp Ri Computer tidak valid.",
              )
            }
          />
        </div>
      </div>

      {showForm ? (
        <form
          id="form-data-perangkat"
          className="scroll-mt-28 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setPending(true);
            try {
              const outcome = await createServiceOrder(formData);
              if (!outcome.ok) {
                toast.error(outcome.error);
                return;
              }
              rememberTrackingId(outcome.trackingId);
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
          />

          {serviceType === "DELIVERY" ? (
            <DeliveryContactFields
              visitAddress={visitAddress}
              onVisitAddressChange={setVisitAddress}
            />
          ) : (
            <RegularContactFields />
          )}

          <button
            disabled={pending}
            className="h-14 w-full rounded-sm bg-primary text-base font-medium text-white shadow-lg shadow-blue-200 disabled:opacity-70"
            type="submit"
          >
            {pending ? "Mengirim..." : "Kirim Booking"}
          </button>
        </form>
      ) : (
        <p
          id="form-data-perangkat"
          className="scroll-mt-28 text-sm text-slate-600"
        >
          Pilih &quot;Datang ke Toko&quot; atau &quot;Antar Jemput&quot; untuk
          mengisi formulir booking. Untuk Home Servis, ketuk kartu di atas untuk
          chat WhatsApp.
        </p>
      )}
    </section>
  );
}
