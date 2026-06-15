/* eslint-disable @typescript-eslint/no-explicit-any */
import SectionBannerComponent from "@/components/home/section-banner.component";
import SectionBenefitStoreComponent from "@/components/home/section-benefit-store.component";
import SectionInfoStoreComponent from "@/components/home/section-info-store.component";
import SectionServicesComponent from "@/components/home/section-services.component";
import SectionSellComponent from "@/components/home/SectionSell/section-sell.component";
import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Beranda Ri Computer — Solusi Terbaik Laptop Anda",
  description:
    "Home Servis, lacak perkembangan servis, dan kumpulan laptop titip jual / toko resmi Ri Computer.",
  openGraph: {
    title: "Ri Computer — Laptop Service Modern",
    description:
      "Aplikasi mobile Ri Computer menyatukan Booking, Tracking, dan Laptop Dijual.",
    images: ["/images/brand/icon-brand.png"],
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="bg-[#f8fafc] pb-24">
      <SectionBannerComponent />

      <SectionServicesComponent />

      <SectionSellComponent />

      <SectionBenefitStoreComponent />

      <SectionInfoStoreComponent />
    </main>
  );
}
