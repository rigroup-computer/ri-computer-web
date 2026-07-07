"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

type ServiceCardProps = Readonly<{
  active?: boolean;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  onSelect: () => void;
  scrollToForm?: boolean;
}>;

export function ServiceCard({
  active = false,
  title,
  description,
  icon,
  iconBg,
  onSelect,
  scrollToForm = true,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect();
        if (scrollToForm) {
          document
            .getElementById("form-data-perangkat")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
      className={`custom-shadow-sm group flex h-full cursor-pointer gap-4 rounded-2xl border border-[#DEDFE3] bg-white p-4 text-center transition-shadow hover:shadow-md lg:rounded-3xl lg:p-8 lg:transition-transform lg:duration-300 lg:ease-in-out ${
        active
          ? "border-2 border-primary/50 bg-primary/5 shadow-sm"
          : "border border-mate-black/10 shadow-md"
      }`}
    >
      <div
        className={`relative flex size-12 shrink-0 items-center justify-center rounded-full bg-opacity-10 lg:mb-0 lg:size-14 lg:rounded-2xl ${iconBg}`}
      >
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          aria-hidden
          className="lg:h-7 lg:w-7"
        />
        {title.toLowerCase() === "home servis" && (
          <div className="absolute -right-1 -top-1 rounded-full bg-[#25D366] p-0.5 text-white">
            <Icon
              icon="ic:baseline-whatsapp"
              width={12}
              height={12}
              className="lg:h-4 lg:w-4"
              aria-hidden
            />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${active ? "text-blue-900" : "text-mate-black"}`}
          >
            {title}
          </p>
          <p
            className={`text-xs ${active ? "font-medium text-blue-800" : "text-mate-black/80"}`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
