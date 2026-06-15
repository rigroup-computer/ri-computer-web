import Image from "next/image";

export default function SectionInfoStoreComponent() {
  return (
    <section className="mt-16 px-4">
      <h2 className="text-xl font-semibold tracking-tight text-mate-black">
        Informasi Service
      </h2>

      <div className="rounded-md p-5 shadow-md flex flex-col">
        <div className="flex gap-3">
          <Image
            src="/icons/svg-location.svg"
            alt="ic-location"
            width={18}
            height={18}
            className="mb-auto mt-1"
          />
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold">Tempat Service</h4>
            <div className="text-mate-black/60 font-medium text-sm">
              <p>Jaya Plaza Kosambi</p>
              <p>Arcamanis, Purwakarta</p>
            </div>
          </div>
        </div>

        <div className="h-0.5 bg-mate-black/10 my-5"></div>

        <div className="flex gap-3">
          <Image
            src="/icons/svg-clock.svg"
            alt="ic-location"
            width={20}
            height={20}
            className="mb-auto mt-1"
          />
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold">Operational</h4>
            <div className="text-mate-black/60 font-medium text-sm">
              <p>Senin, Selasa, Rabu, Kamis, Sabtu</p>
              <p className="font-semibold text-mate-black">09.00 - 15.00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
