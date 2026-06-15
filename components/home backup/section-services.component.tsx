import Image from "next/image";

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  //   return (
  //     <div className="text-center">
  //       <div className="bg-primary mb-3 aspect-square rounded-lg size-10 p-1.5 mx-auto">
  //         <div className="relative h-full w-full">
  //           <Image src={icon} alt="Laptop" fill />
  //         </div>
  //       </div>
  //       <h3 className="text-sm font-bold">{title}</h3>
  //       <p className="text-xs text-gray-500">{description}</p>
  //     </div>
  //   );

  return (
    <div className="text-center">
      <div className="relative size-12 mx-auto">
        <Image src={icon} alt="Laptop" fill />
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function SectionServicesComponent() {
  return (
    <section className="rounded-lg grid grid-cols-3 gap-2 mx-4 shadow-md bg-white px-3 py-4 my-10">
      <ServiceCard
        icon="/icons/svg-store-service-2.svg"
        title="Store Service"
        description="Datang ke tempat service kami"
      />
      <ServiceCard
        icon="/icons/svg-delivery-service-2.svg"
        title="Delivery Service"
        description="Jemput & antar laptop Anda"
      />
      <ServiceCard
        icon="/icons/svg-home-service-2.svg"
        title="Home Service"
        description="Teknisi data ke rumah Anda"
      />
    </section>
  );
}
