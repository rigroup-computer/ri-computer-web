"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { reverseGeocodeAddress } from "@/src/lib/actions/geocode";
import {
  FIELD_LIMITS,
  fieldBorderClass,
  inputBorderClass,
  inputClass,
  labelClass,
  textareaBorderClass,
  textareaClass,
} from "@/components/forms/booking-form-shared";

type ContactBaseFieldsProps = Readonly<{
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}>;

function ContactBaseFields({
  fieldErrors,
  onClearFieldError,
}: ContactBaseFieldsProps) {
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

export type DeliveryContactFieldsProps = Readonly<{
  visitAddress: string;
  onVisitAddressChange: (value: string) => void;
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}>;

export function DeliveryContactFields({
  visitAddress,
  onVisitAddressChange,
  fieldErrors,
  onClearFieldError,
}: DeliveryContactFieldsProps) {
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
        <div className="space-y-3 lg:col-span-2">
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

export type RegularContactFieldsProps = Readonly<{
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
}>;

export function RegularContactFields({
  fieldErrors,
  onClearFieldError,
}: RegularContactFieldsProps) {
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
