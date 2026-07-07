import type { Metadata } from "next";
import "./globals.css";
import { DevBfcacheGuard } from "@/components/dev/dev-bfcache-guard";
import { AppToaster } from "@/components/ui/app-toaster";
import { isPublicIndexingAllowed } from "@/lib/seo-indexing";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {process.env.NODE_ENV === "development" ? <DevBfcacheGuard /> : null}
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
