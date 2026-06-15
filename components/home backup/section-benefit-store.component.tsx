import Image from "next/image";
import type { ReactNode } from "react";

function BenefitCard({
  icon,
  description,
}: {
  icon: string;
  description: ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="bg-primary/10 mx-auto mb-3 aspect-square size-11 rounded-lg p-1.5">
        <div className="relative h-full w-full">
          <Image src={icon} alt="" fill className="object-contain" />
        </div>
      </div>
      <p className="text-xs leading-snug text-gray-500">{description}</p>
    </div>
  );
}

export default function SectionBenefitStoreComponent() {
  return (
    <section className="mt-16 px-4">
      <h2 className="text-xl font-semibold tracking-tight text-mate-black">
        Kenapa Ri Computer?
      </h2>
      <div className="mt-7 grid grid-cols-4 gap-1">
        <BenefitCard
          icon="/icons/svg-teknisi-berpengalaman.svg"
          description={
            <>
              Teknisi
              <br />
              Berpengalaman
            </>
          }
        />
        <BenefitCard
          icon="/icons/svg-layanan-cepat.svg"
          description={
            <>
              Layanan
              <br />
              Cepat & Aman
            </>
          }
        />
        <BenefitCard
          icon="/icons/svg-garansi-service.svg"
          description={
            <>
              Garansi
              <br />
              Service
            </>
          }
        />
        <BenefitCard
          icon="/icons/svg-harga-terjangkau.svg"
          description={
            <>
              Harga
              <br />
              Terjangkau
            </>
          }
        />
      </div>
    </section>
  );
}
