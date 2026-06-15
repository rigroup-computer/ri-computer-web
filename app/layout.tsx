import type { Metadata } from "next";
import "./globals.css";
import { PublicShell } from "@/components/layout/public-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppToaster } from "@/components/ui/app-toaster";
import { isPublicIndexingAllowed } from "@/lib/seo-indexing";
import { whatsappHref, getShopWhatsAppNumber } from "@/lib/whatsapp";

const footerHelpMessage =
  "Halo Ri Computer, saya butuh bantuan terkait servis laptop. Bisa dibantu?";

const consultationFloatMessage = `Terkait konsultasi boleh diisi terlebih dahulu ya ka

Asal kota:
Merk & type laptop:
Keluhan:
Pertanyaan:`;

export function generateMetadata(): Metadata {
  const indexable = isPublicIndexingAllowed();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: "Ri Computer — Laptop Service & Laptop Dijual",
      template: "%s | Ri Computer",
    },
    description:
      "Ajukan kunjungan teknisi (Home Servis), lacak perkembangan servis dan lihat koleksi Laptop Dijual (titip atau toko) tanpa login pelanggan.",
    applicationName: "Ri Computer",
    icons: {
      icon: "/images/brand/icon-brand.png",
      apple: "/images/brand/icon-brand.png",
    },
    ...(indexable
      ? {
          robots: {
            index: true,
            follow: true,
          },
        }
      : {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }),
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "Ri Computer",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const shopWa = getShopWhatsAppNumber();
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "";
  const waHref = whatsappHref(shopWa, footerHelpMessage);
  const consultationWaHref = whatsappHref(shopWa, consultationFloatMessage);

  return (
    <html lang="id">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-md lg:max-w-full bg-(--background)">
          <PublicShell
            consultationWaHref={consultationWaHref}
            footer={
              <SiteFooter waHref={waHref} instagramUrl={instagramUrl} />
            }
          >
            {children}
          </PublicShell>
          <AppToaster />
        </div>
      </body>
    </html>
  );
}
