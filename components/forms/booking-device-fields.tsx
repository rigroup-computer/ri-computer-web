"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { MAX_ISSUE_ATTACHMENTS } from "@/lib/booking-issue-attachments";
import {
  BRAND_SUGGESTIONS,
  FIELD_LIMITS,
  fieldBorderClass,
  inputBorderClass,
  inputClass,
  labelClass,
  textareaBorderClass,
  textareaClass,
} from "@/components/forms/booking-form-shared";
import { BookingScheduleFields } from "@/components/forms/booking-schedule-fields";

function IssueImageLightbox({
  url,
  onClose,
}: Readonly<{ url: string | null; onClose: () => void }>) {
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

export type BookingDeviceFieldsProps = Readonly<{
  preferredVisitDate: string;
  preferredVisitTime: string;
  onPreferredVisitDateChange: (isoDate: string) => void;
  onPreferredVisitTimeChange: (time: string) => void;
  issueImageUrls: string[];
  uploadingIssueImage: boolean;
  issueFileInputRef: RefObject<HTMLInputElement | null>;
  issueFileAccept: string;
  onIssueAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveIssueImage: (url: string) => void;
  onPickIssueImage: () => void;
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}>;

export function BookingDeviceFields({
  preferredVisitDate,
  preferredVisitTime,
  onPreferredVisitDateChange,
  onPreferredVisitTimeChange,
  issueImageUrls,
  uploadingIssueImage,
  issueFileInputRef,
  issueFileAccept,
  onIssueAttachmentChange,
  onRemoveIssueImage,
  onPickIssueImage,
  fieldErrors,
  onClearFieldError,
}: BookingDeviceFieldsProps) {
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

        <div className="lg:col-span-3 space-y-5">
          <BookingScheduleFields
            preferredVisitDate={preferredVisitDate}
            preferredVisitTime={preferredVisitTime}
            onPreferredVisitDateChange={onPreferredVisitDateChange}
            onPreferredVisitTimeChange={onPreferredVisitTimeChange}
            fieldErrors={fieldErrors}
            onClearFieldError={onClearFieldError}
          />

          <div>
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
                    className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-100"
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
      </div>
    </fieldset>
  );
}
