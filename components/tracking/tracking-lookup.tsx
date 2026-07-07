"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { VisitScheduleStatus } from "@prisma/client";
import {
  lookupOrderByTrackingId,
  lookupOrdersByPhone,
  type PublicOrderView,
} from "@/src/lib/actions/tracking";
import { serviceStatusLabel } from "@/lib/service-status-label";
import { serviceTypeAdminLabel } from "@/lib/admin-order-status-display";
import {
  formatVisitDateTimeId,
  visitScheduleStatusLabel,
} from "@/lib/store-hours";
import { useSavedTrackingIds } from "@/lib/use-saved-tracking-ids";
import { whatsappHref } from "@/lib/whatsapp";
import { ServiceProgress } from "@/components/tracking/service-progress";
import { Icon } from "@iconify/react";

function formatDt(value: string | Date | null) {
  if (!value) {
    return "-";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID");
}

function serviceTypeLabel(raw: string) {
  if (raw === "REGULAR" || raw === "DELIVERY" || raw === "HOME_SERVICE") {
    return serviceTypeAdminLabel(raw);
  }
  return raw;
}

function isTrackingIdQuery(raw: string): boolean {
  const trimmed = raw.trim().replace(/\s+/g, "");
  return /^RC-/i.test(trimmed);
}

function OrderCard({
  order,
  shopWhatsApp,
}: {
  order: PublicOrderView;
  shopWhatsApp?: string;
}) {
  const contactHref = whatsappHref(
    shopWhatsApp ?? "",
    "Halo Ri Computer saya ingin bertanya mengenai servis.",
  );

  return (
    <article className="">
      <div className="flex border bg-primary/5 border-primary/10 rounded-md shadow-sm p-3 flex-wrap w-full items-start justify-between gap-2">
        <div className="w-full">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Nomor Service
          </p>
          <div className="flex justify-between">
            <p className="font-mono text-md font-semibold tracking-tight text-slate-900">
              {order.trackingId}
            </p>
            <span className="rounded-sm bg-primary px-2 py-1 text-xs text-white">
              {serviceStatusLabel(order.status)}
            </span>
          </div>
        </div>
        <div className="flex mt-4 w-full justify-between">
          <div className="w-full">
            <p className="mt-1 text-xs text-slate-600">Tanggal Masuk</p>
            <span className="font-medium text-sm">
              {formatDt(order.createdAt)}
            </span>
          </div>
          <div className="w-full text-right">
            <p className="mt-1 text-xs text-slate-600">Layanan</p>
            <span className="font-medium text-sm">
              {serviceTypeLabel(order.serviceType)}
            </span>
          </div>
        </div>
      </div>

      {order.preferredVisitAt ||
      order.confirmedVisitAt ||
      order.visitScheduleStatus ? (
        <div
          className={`mt-4 rounded-md border px-3 py-3 text-sm ${
            order.visitScheduleStatus === VisitScheduleStatus.DECLINED
              ? "border-amber-200 bg-amber-50"
              : order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED
                ? "border-[#bfdbfe] bg-[#eff6ff]"
                : "border-slate-200 bg-slate-50"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              order.visitScheduleStatus === VisitScheduleStatus.DECLINED
                ? "text-amber-800"
                : order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED
                  ? "text-[#1d4ed8]"
                  : "text-slate-500"
            }`}
          >
            Jadwal Kunjungan
          </p>
          {order.preferredVisitAt ? (
            <p
              className={`mt-2 ${
                order.visitScheduleStatus === VisitScheduleStatus.DECLINED
                  ? "text-amber-950"
                  : "text-slate-800"
              }`}
            >
              <span className="font-medium">Preferensi:</span>{" "}
              {formatVisitDateTimeId(new Date(order.preferredVisitAt))} WIB
            </p>
          ) : null}
          {order.confirmedVisitAt ? (
            <p className="mt-1 text-slate-800">
              <span className="font-medium">
                {order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED
                  ? "Usulan admin:"
                  : "Dikonfirmasi:"}
              </span>{" "}
              {formatVisitDateTimeId(new Date(order.confirmedVisitAt))} WIB
            </p>
          ) : null}
          {order.visitScheduleStatus === VisitScheduleStatus.DECLINED ? (
            <div className="mt-2">
              <p className="text-xs font-medium text-amber-900">
                {visitScheduleStatusLabel(VisitScheduleStatus.DECLINED)}
              </p>
              <p className="mt-1 text-xs text-amber-900/90">
                Preferensi jadwal belum bisa dipakai. Tim Ri Computer akan
                menghubungi Anda.
              </p>
              {order.visitScheduleNote ? (
                <p className="mt-2 text-xs text-amber-950">
                  {order.visitScheduleNote}
                </p>
              ) : null}
            </div>
          ) : order.visitScheduleStatus === VisitScheduleStatus.RESCHEDULED ? (
            <div className="mt-2">
              <p className="text-xs font-medium text-[#1d4ed8]">
                {visitScheduleStatusLabel(VisitScheduleStatus.RESCHEDULED)}
              </p>
              <p className="mt-1 text-xs text-[#1d4ed8]/90">
                Mohon konfirmasi apakah usulan jadwal di atas cocok untuk Anda.
              </p>
              {order.visitScheduleNote ? (
                <p className="mt-2 text-xs text-[#1e40af]">
                  {order.visitScheduleNote}
                </p>
              ) : null}
            </div>
          ) : order.visitScheduleStatus ? (
            <p className="mt-2 text-xs text-slate-600">
              {visitScheduleStatusLabel(
                order.visitScheduleStatus as
                  | "REQUESTED"
                  | "CONFIRMED"
                  | "RESCHEDULED"
                  | "DECLINED",
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="py-4">
        <ServiceProgress status={order.status} />

        <div className="mt-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Keluhan
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-800">
            {order.issue}
          </p>
        </div>

        {order.issueAttachmentUrls.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lampiran
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {order.issueAttachmentUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square overflow-hidden rounded-sm bg-slate-100 outline-none ring-primary/40 focus-visible:ring-2"
                >
                  <Image
                    src={url}
                    alt="Lampiran keluhan"
                    fill
                    className="object-cover"
                    sizes="(max-width: 28rem) 33vw, 120px"
                  />
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-950">
          <p>
            Kami menghubungi melalui WhatsApp jika servis Anda memerlukan
            pergantian part atau ada biaya tambahan.
          </p>
        </div>

        {contactHref ? (
          <a
            href={contactHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-12 items-center justify-center rounded-sm border border-primary bg-white text-sm font-medium text-primary shadow-sm"
          >
            Hubungi Kami
          </a>
        ) : (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Atur SHOP_WHATSAPP_NUMBER pada server untuk menampilkan tombol
            WhatsApp.
          </p>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Riwayat
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {order.timelines.map((entry) => (
              <li
                key={entry.id}
                className="flex gap-3 rounded-xl bg-slate-50/80 px-3 py-2"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {entry.title}
                    </p>
                    <time className="text-xs text-slate-400">
                      {formatDt(entry.createdAt)}
                    </time>
                  </div>
                  {entry.note ? (
                    <p className="mt-1 text-xs text-slate-600">{entry.note}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function TrackingLookup({ shopWhatsApp }: { shopWhatsApp?: string }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PublicOrderView | null>(null);
  const [results, setResults] = useState<PublicOrderView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedTrackingIds = useSavedTrackingIds();

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length > 0 && !pending;

  async function handleSearch(searchQuery = query) {
    const q = searchQuery.trim();
    if (!q) {
      return;
    }

    setQuery(q);
    setPending(true);
    setError(null);
    setResult(null);
    setResults([]);

    try {
      if (isTrackingIdQuery(q)) {
        const order = await lookupOrderByTrackingId(q);
        setResult(order);
        setError(order ? null : "Data tidak ditemukan.");
      } else {
        const orders = await lookupOrdersByPhone(q);
        setResults(orders);
        setError(
          orders.length
            ? null
            : "Tidak ada data dengan nomor WhatsApp / ID Tracking tersebut.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <section className="space-y-2">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full flex flex-col gap-1.5">
            <div className="relative w-full">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onClick={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Tracking ID (RC-...) atau nomor WhatsApp"
                className={`w-full rounded-sm border border-mate-black/10 py-3 text-sm outline-none ring-primary/50 focus:ring-1 ${
                  query ? "pl-4 pr-11" : "px-4"
                }`}
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    setResult(null);
                    setResults([]);
                    setError(null);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-sm text-slate-400 hover:text-slate-600"
                >
                  <Icon
                    icon="material-symbols:close-rounded"
                    width={22}
                    height={22}
                    aria-hidden
                  />
                </button>
              ) : null}
            </div>
            {isInputFocused && savedTrackingIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">
                  Tracking ID tersimpan
                </p>
                <div className="flex flex-col gap-2">
                  {savedTrackingIds.map((entry) => (
                    <button
                      key={entry.trackingId}
                      type="button"
                      disabled={pending}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        void handleSearch(entry.trackingId);
                        inputRef.current?.blur();
                      }}
                      className="flex items-center justify-between gap-3 rounded-sm border border-mate-black/10 bg-slate-50 px-3 py-2 text-left text-sm transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-70"
                    >
                      <span className="font-mono font-semibold text-slate-900">
                        {entry.trackingId}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            disabled={!canSearch}
            className="h-12 w-full lg:w-auto mt-5 lg:mt-0 rounded-sm bg-primary px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
            onClick={() => void handleSearch()}
          >
            Cari
          </button>
        </div>
      </section>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <div className="space-y-8 pb-24">
        {result ? (
          <OrderCard order={result} shopWhatsApp={shopWhatsApp} />
        ) : (
          <div className="lg:mt-14">
            <div className="flex items-center gap-2">
              <Icon
                icon="mingcute:question-line"
                width={26}
                height={26}
                aria-hidden
                className="text-[#1A73E8FF]"
              />
              <p className="font-semibold text-base text-[#171a1f] uppercase">
                Butuh Bantuan?
              </p>
            </div>
            <div className="my-4 bg-[#F1F7FEFF] p-4 rounded-md flex flex-row gap-2">
              <div className="bg-[#E6F2FFFF] size-fit shrink-0 rounded-xl p-2">
                <Icon
                  icon="iconamoon:shield-yes-light"
                  width={26}
                  height={26}
                  aria-hidden
                  className="text-[#1A73E8FF]"
                />
              </div>
              <div className="">
                <h3 className="text-sm font-semibold text-[#171a1f]">
                  Nomor Service Tidak Ditemukan?
                </h3>
                <p className="text-sm text-slate-600">
                  Pastikan Anda memasukkan nomor yang benar. Nomor service
                  biasanya diawali dengan kode &quot;RC&quot;.
                </p>
              </div>
            </div>
          </div>
        )}

        {results.map((order) => (
          <OrderCard
            key={order.trackingId}
            order={order}
            shopWhatsApp={shopWhatsApp}
          />
        ))}
      </div>
    </div>
  );
}
