import { PublicShell } from "@/components/layout/public-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { whatsappHref, getShopWhatsAppNumber } from "@/lib/whatsapp";

const consultationMessage = `Terkait konsultasi boleh diisi terlebih dahulu ya ka

Asal kota:
Merk & type laptop:
Keluhan:
Pertanyaan:`;

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shopWa = getShopWhatsAppNumber();
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "";
  const waHref = whatsappHref(shopWa, consultationMessage);
  const consultationWaHref = whatsappHref(shopWa, consultationMessage);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-(--background) lg:max-w-full">
      <PublicShell
        consultationWaHref={consultationWaHref}
        footer={<SiteFooter waHref={waHref} instagramUrl={instagramUrl} />}
      >
        {children}
      </PublicShell>
    </div>
  );
}
