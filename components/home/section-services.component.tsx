import Image from "next/image";
import Link from "next/link";
import {
  bookingPageHref,
  homeServiceWhatsAppHref,
} from "@/lib/booking-service-links";

type ServiceCardProps = {
  icon: string;
  iconBg: string;
  titleMobile: string;
  titleDesktop: string;
  descriptionMobile: string;
  descriptionDesktop: string;
  href: string;
  external?: boolean;
};

function ServiceCard({
  icon,
  iconBg,
  titleMobile,
  titleDesktop,
  descriptionMobile,
  descriptionDesktop,
  href,
  external = false,
}: ServiceCardProps) {
  const ctaClassName =
    "min-h-11 items-center gap-1 text-xs font-semibold text-primary group-hover:underline md:text-sm";

  const linkProps = external
    ? { target: "_blank" as const, rel: "noreferrer" }
    : {};

  const CardLink = external ? "a" : Link;

  return (
    <div className="custom-shadow-sm group flex h-full flex-col rounded-2xl border border-[#DEDFE3] bg-white p-4 text-center transition-shadow hover:shadow-md lg:gap-4 lg:rounded-3xl lg:p-8 lg:transition-transform lg:duration-300 lg:ease-in-out lg:hover:scale-105">
      <CardLink
        href={href}
        {...linkProps}
        className="flex flex-1 lg:gap-3 flex-col items-center lg:min-h-0 lg:items-start lg:text-left"
      >
        <div
          className={`mb-3 flex size-12 shrink-0 items-center justify-center rounded-full bg-opacity-10 lg:mb-0 lg:size-14 lg:rounded-2xl ${iconBg}`}
        >
          <Image
            src={icon}
            alt=""
            width={24}
            height={24}
            aria-hidden
            className="lg:h-7 lg:w-7"
          />
        </div>
        <div className="flex flex-col lg:hidden lg:items-start lg:text-left">
          <h3 className="mb-1 text-sm font-bold text-mate-black lg:text-xl lg:font-semibold">
            {titleMobile}
          </h3>
          <p className="text-[10px] leading-tight text-[#5A5F68] md:text-xs lg:text-base">
            {descriptionMobile}
          </p>
        </div>
        <div className="hidden w-full flex-1 flex-col gap-2 lg:flex lg:text-left">
          <h3 className="text-xl font-semibold text-mate-black">{titleDesktop}</h3>
          <p className="text-sm leading-tight text-[#5A5F68AA]">{descriptionDesktop}</p>
        </div>
      </CardLink>
      <CardLink
        href={href}
        {...linkProps}
        className={`${ctaClassName} mt-auto hidden lg:inline-flex`}
      >
        Booking Sekarang →
      </CardLink>
    </div>
  );
}

export default function SectionServicesComponent() {
  const homeWaHref = homeServiceWhatsAppHref();

  return (
    <section
      id="layanan"
      className="px-4 lg:max-w-7xl lg:mx-auto lg:px-0 pb-8 pt-4 lg:pt-8 lg:pb-16"
    >
      <div className="mb-2 lg:mb-6 flex items-center justify-between">
        <div className="">
          <div className="hidden lg:inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5">
            <span className="text-xs font-bold text-primary">Services</span>
          </div>
          <h2 className="text-lg font-bold text-mate-black md:text-2xl">
            Layanan Unggulan Kami
          </h2>
          <p className="text-xs hidden lg:block lg:mt-2 text-[#5A5F68] md:text-sm">
            Pilih metode perbaikan yang paling sesuai dengan kebutuhan dan
            kenyamanan Anda.
          </p>
        </div>
        <Link
          href="/booking"
          className="inline-flex min-h-11 self-end items-center gap-1 text-xs font-semibold text-primary hover:underline md:text-sm"
        >
          Lihat Semua
          <Image
            src="/icons/svg-arrow-right.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden
          />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-1 mobile-s:gap-2 mobile-m:gap-3 md:gap-6">
        <ServiceCard
          icon="/icons/svg-store-service.svg"
          iconBg="bg-[#DBEAFEFF] lg:bg-[#DBEAFE6A]"
          titleMobile="Store"
          titleDesktop="Store Service"
          descriptionMobile="Perbaikan di gerai resmi"
          descriptionDesktop="Kunjungi gerai resmi kami untuk diagnosa instan dan perbaikan di tempat oleh tim teknisi profesional."
          href={bookingPageHref("store")}
        />
        <ServiceCard
          icon="/icons/svg-delivery-service.svg"
          iconBg="bg-[#FFEDD5FF] lg:bg-[#FFEDD56A]"
          titleMobile="Delivery"
          titleDesktop="Delivery Service"
          descriptionMobile="Antar jemput unit bermasalah"
          descriptionDesktop="Kesibukan bukan masalah. Kami jemput unit Anda yang bermasalah dan antar kembali setelah selesai."
          href={bookingPageHref("delivery")}
        />
        <ServiceCard
          icon="/icons/svg-home-service.svg"
          iconBg="bg-[#F3E8FFFF] lg:bg-[#F3E8FF6A]"
          titleMobile="Home"
          titleDesktop="Home Service"
          descriptionMobile="Teknisi datang ke rumah Anda"
          descriptionDesktop="Teknisi kami akan datang langsung ke rumah atau kantor Anda untuk perbaikan perangkat secara real-time."
          href={homeWaHref ?? "/booking"}
          external={Boolean(homeWaHref)}
        />
      </div>
    </section>
  );
}
