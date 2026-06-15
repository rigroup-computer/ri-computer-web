import { Icon } from "@iconify/react";

export function EcommercePlaceholder() {
  return (
    <section
      className="hidden rounded-[10px] border border-dashed border-[#dee1e6] bg-[#f9fafb] p-4 lg:block"
      aria-labelledby="ecommerce-placeholder-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#1a73e8] ring-1 ring-[#dee1e6]">
          <Icon icon="mdi:monitor-dashboard" width={20} height={20} aria-hidden />
        </span>
        <div>
          <h2
            id="ecommerce-placeholder-heading"
            className="text-sm font-bold text-[#171a1f]"
          >
            E-Commerce Panel
          </h2>
          <p className="mt-0.5 text-xs text-[#565d6d]">Segera rilis di v2.4.0</p>
        </div>
      </div>
    </section>
  );
}
