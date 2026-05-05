"use client";

import { useState } from "react";
import Image from "next/image";
import {
  lookupOrderByTrackingId,
  lookupOrdersByPhone,
  type PublicOrderView,
} from "@/lib/actions/tracking";
import { serviceStatusLabel } from "@/lib/service-status-label";
import { whatsappHref } from "@/lib/whatsapp";
import { ServiceProgress } from "@/components/tracking/service-progress";

function formatDt(value: string | Date | null) {
  if (!value) {
    return "-";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID");
}

function serviceTypeLabel(raw: string) {
  switch (raw) {
    case "HOME_SERVICE":
      return "Home Service";
    default:
      return raw;
  }
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
  const [trackingQuery, setTrackingQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [result, setResult] = useState<PublicOrderView | null>(null);
  const [results, setResults] = useState<PublicOrderView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-6 space-y-5">
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tracking ID
        </h2>
        <div className="flex gap-2">
          <input
            value={trackingQuery}
            onChange={(event) => setTrackingQuery(event.target.value)}
            placeholder="Tempel Tracking ID Anda"
            className="min-w-0 flex-1 rounded-sm border border-mate-black/10 px-4 py-3 text-sm outline-none ring-primary/50 focus:ring-1"
          />
          <button
            type="button"
            disabled={pending}
            className="h-12 shrink-0 rounded-sm bg-primary px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
            onClick={async () => {
              setPending(true);
              setError(null);
              setResults([]);
              try {
                const order = await lookupOrderByTrackingId(trackingQuery);
                setResult(order);
                setError(order ? null : "Data tidak ditemukan.");
              } finally {
                setPending(false);
              }
            }}
          >
            Cari
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Nomor WhatsApp
        </h2>
        <div className="flex gap-2">
          <input
            value={phoneQuery}
            onChange={(event) => setPhoneQuery(event.target.value)}
            placeholder="Nomor yang dipakai saat booking"
            className="min-w-0 flex-1 rounded-sm border border-mate-black/10 px-4 py-3 text-sm outline-none ring-primary/50 focus:ring-1"
          />
          <button
            type="button"
            disabled={pending}
            className="h-12 shrink-0 rounded-sm bg-primary px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
            onClick={async () => {
              setPending(true);
              setError(null);
              setResult(null);
              try {
                const orders = await lookupOrdersByPhone(phoneQuery);
                setResults(orders);
                setError(
                  orders.length ? null : "Tidak ada data dengan pola nomor tersebut.",
                );
              } finally {
                setPending(false);
              }
            }}
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
        ) : null}
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
