import Image from "next/image";
import Link from "next/link";
import { whatsappHref } from "@/lib/whatsapp";

const JAYA_PLAZA_MAPS_URL = "https://maps.app.goo.gl/XYALKiAJd6ug2Xs6A";

const DROP_ONLY_CONSULTATION_MESSAGE = `Terkait konsultasi boleh diisi terlebih dahulu ya ka

Asal kota:
Merk & type laptop:
Keluhan:
Pertanyaan:`;

function StoreJayaPlazaComponent() {
  return (
    <>
      <span className="text-[#5A5F68FF]">Senin - Kamis</span>
      <span className="text-right font-medium whitespace-nowrap">
        09.30 - 16.00 WIB
      </span>

      <span className="text-[#5A5F68FF]">Sabtu</span>
      <span className="text-right font-medium whitespace-nowrap">
        09.30 - 16.30 WIB
      </span>

      <span className="text-[#5A5F68FF]">Jumat & Minggu</span>
      <span className="text-right text-red-700 font-medium whitespace-nowrap">
        TUTUP
      </span>
    </>
  );
}

function StoreArcamanikComponent() {
  return (
    <>
      <span className="text-[#5A5F68FF]">Senin - Kamis</span>
      <span className="text-right font-medium whitespace-nowrap">
        17.00 WIB
      </span>
    </>
  );
}

function StoreTegalwaruComponent() {
  return (
    <>
      <span className="text-[#5A5F68FF]">Jumat</span>
      <span className="text-right font-medium whitespace-nowrap">
        15.00 - 20.00 WIB{" "}
      </span>

      <span className="text-[#5A5F68FF]">Sabtu</span>
      <span className="text-right font-medium whitespace-nowrap">
        06.00 - 07.00 WIB
      </span>

      <span className="text-[#5A5F68FF]">Minggu</span>
      <span className="text-right font-medium whitespace-nowrap">
        09.00 - 15.00 WIB
      </span>
    </>
  );
}

function StoreInfoCard({
  title,
  address,
  detail,
  isDropOnly = false,
  ctaHref,
}: {
  title: string;
  address: string;
  detail: React.ReactNode;
  isDropOnly?: boolean;
  ctaHref: string | null;
}) {
  return (
    <div className="custom-shadow-sm flex h-full flex-col overflow-hidden rounded-2xl border border-[#DEDFE3] bg-white">
      <div className="flex gap-4 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Image
            src="/icons/svg-location-store.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold lg:text-lg text-mate-black">{title}</h3>
            {isDropOnly && (
              <span className="text-3xs flex h-fit items-center justify-center rounded-full px-1.5 py-0.5 bg-gray-600 text-white">
                Drop Only
              </span>
            )}
          </div>
          <p className="text-xxs lg:text-sm font-medium text-[#565d6d]">{address}</p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 px-1.5 py-2 text-xs lg:text-sm rounded-lg bg-[#F9FAFAFF] justify-between gap-x-4 gap-y-2 lg:gap-y-4">
          {detail}
        </div>
      </div>

      <div className="mt-auto w-full px-3 pb-3">
        {ctaHref ? (
          <Link
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isDropOnly ? "bg-[#25D366FF]" : "bg-[#1A73E8FF]"} flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium text-white`}
          >
            {isDropOnly ? "Hubungi Admin" : "Petunjuk Arah"}
          </Link>
        ) : (
          <span
            className={`${isDropOnly ? "bg-[#25D366FF]/60" : "bg-[#1A73E8FF]/60"} flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg text-sm font-medium text-white`}
            title="Atur SHOP_WHATSAPP_NUMBER di server"
          >
            {isDropOnly ? "Hubungi Admin" : "Petunjuk Arah"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SectionInfoStoreComponent() {
  const shopWa = process.env.SHOP_WHATSAPP_NUMBER?.trim() ?? "";
  const dropOnlyWaHref = whatsappHref(shopWa, DROP_ONLY_CONSULTATION_MESSAGE);

  return (
    <section id="lokasi" className="px-4 pb-8 lg:max-w-7xl lg:mx-auto lg:px-0 lg:pb-16">
      <div className="mb-6 lg:mb-8">
      <div className="hidden lg:inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5">
            <span className="text-xs font-bold text-primary">Store</span>
          </div>
        <h2 className="text-lg font-bold text-mate-black md:text-2xl">
          Lokasi Toko Kami
        </h2>
        <p className="mt-1 text-xs text-[#5A5F68] md:text-sm">
          Kunjungi gerai terdekat untuk layanan langsung
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
        <StoreInfoCard
          title="Jaya Plaza"
          address="Jl A Yani No. 238, Kota Bandung"
          detail={<StoreJayaPlazaComponent />}
          ctaHref={JAYA_PLAZA_MAPS_URL}
        />

        <StoreInfoCard
          title="Arcamanik"
          address="Kota Bandung"
          detail={<StoreArcamanikComponent />}
          isDropOnly
          ctaHref={dropOnlyWaHref}
        />

        <StoreInfoCard
          title="Tegalwaru"
          address="Kab. Purwakarta"
          detail={<StoreTegalwaruComponent />}
          isDropOnly
          ctaHref={dropOnlyWaHref}
        />
      </div>
    </section>
  );
}
