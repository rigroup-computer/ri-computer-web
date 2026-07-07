"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  createServiceOrder,
  type CreateServiceOrderSuccess,
} from "@/src/lib/actions/service-order";
import { uploadBookingIssueImage } from "@/src/lib/actions/booking-issue-upload";
import {
  BOOKING_UPLOAD_ALLOWED_TYPES,
  MAX_ISSUE_ATTACHMENTS,
} from "@/lib/booking-issue-attachments";
import { serviceTypeFromJenisQuery } from "@/lib/admin-order-status-display";
import { saveTrackingIdToStorage } from "@/lib/tracking-storage";
import { toast } from "sonner";
import {
  firstInvalidFieldError,
  focusFirstInvalidField,
  openWhatsApp,
} from "@/components/forms/booking-form-shared";
import { BookingDeviceFields } from "@/components/forms/booking-device-fields";
import {
  DeliveryContactFields,
  RegularContactFields,
} from "@/components/forms/booking-contact-fields";
import { ServiceCard } from "@/components/forms/booking-service-card";
import {
  getBookingFieldToast,
  validateBookingForm,
} from "@/lib/booking-form-validation";

const BookingSuccessPanel = dynamic(
  () =>
    import("@/components/forms/booking-success-panel").then(
      (mod) => mod.BookingSuccessPanel,
    ),
  { ssr: false },
);

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
  const [preferredVisitDate, setPreferredVisitDate] = useState("");
  const [preferredVisitTime, setPreferredVisitTime] = useState("");
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
    return <BookingSuccessPanel success={success} />;
  }

  const showForm = serviceType === "REGULAR" || serviceType === "DELIVERY";

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Pilih Jenis Layanan
        </h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
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
              preferredVisitDate: formData.get("preferredVisitDate"),
              preferredVisitTime: formData.get("preferredVisitTime"),
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

          <BookingDeviceFields
            preferredVisitDate={preferredVisitDate}
            preferredVisitTime={preferredVisitTime}
            onPreferredVisitDateChange={setPreferredVisitDate}
            onPreferredVisitTimeChange={setPreferredVisitTime}
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
