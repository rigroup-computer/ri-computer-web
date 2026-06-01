import Image from "next/image";
import Link from "next/link";
import SectionTrackingPreviewComponent from "./section-tracking-preview.component";

type BenefitRowProps = {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
};

function BenefitRow({ icon, iconBg, title, description }: BenefitRowProps) {
  return (
    <div className="custom-shadow-sm lg:min-h-24 flex items-start lg:items-center gap-4 rounded-2xl border border-[#DEDFE3] bg-[#F9FAFA] p-4">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Image src={icon} alt="" width={20} height={20} aria-hidden />
      </div>
      <div>
        <h3 className="mb-1 text-sm font-bold text-mate-black">{title}</h3>
        <p className="text-xs leading-relaxed text-[#5A5F68]">{description}</p>
      </div>
    </div>
  );
}

export default function SectionBenefitStoreComponent() {
  return (
    <section className="border-y border-[#DEDFE3] bg-white pt-7 pb-4 px-4 lg:border-none lg:pt-8 lg:pb-8">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 lg:max-w-7xl lg:mx-auto lg:px-0">
        <div>
          <div className="mb-8 text-center lg:text-left">
            <h2 className="mb-2 text-lg font-bold text-mate-black md:text-2xl">
              Kenapa Ri Group Computer?
            </h2>
            <p className="text-xs text-[#5A5F68] md:text-sm">
              Kami mengutamakan kualitas dan transparansi
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4 lg:mx-0">
            <BenefitRow
              icon="/icons/svg-garansi.svg"
              iconBg="bg-primary/10"
              title="Garansi Service 90 Hari"
              description="Semua perbaikan kami lindungi dengan garansi sparepart dan jasa selama 3 bulan penuh."
            />
            <BenefitRow
              icon="/icons/svg-estimasi-instant.svg"
              iconBg="bg-[#D32F2F1A]"
              title="Estimasi Instan & Transparan"
              description="Dapatkan perkiraan biaya langsung melalui aplikasi sebelum Anda melakukan booking layanan."
            />
            <BenefitRow
              icon="/icons/svg-suku-cadang.svg"
              iconBg="bg-[#FBC02D1A]"
              title="Suku Cadang Original"
              description="Hanya menggunakan komponen asli berkualitas tinggi untuk menjaga performa laptop Anda."
            />
          </div>

          <div className="mt-6 text-center lg:hidden">
            <Link
              href="/tracking"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
            >
              Lacak Status Servis →
            </Link>
          </div>
        </div>

        <div className="mt-10 hidden lg:block lg:mt-0">
          <SectionTrackingPreviewComponent />
        </div>
      </div>
    </section>
  );
}
