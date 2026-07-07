import Image from "next/image";

import type { AdminSerializedOrder } from "./order-row-data";
import { OrderStatusUpdateSection } from "./order-status-update-section";
import { OrderVisitScheduleSection } from "./order-visit-schedule-section";
import { Icon } from "@iconify/react";
import Link from "next/link";

import { isScheduleGateActive } from "@/lib/admin-visit-schedule-gate";
import { parseStoredOrderIssue } from "@/lib/order-issue-content";
import { serviceTypeAdminLabel } from "@/lib/admin-order-status-display";

type OrderDetailBodyProps = Readonly<{
  order: AdminSerializedOrder;
  onAfterStatusChange: () => void;
  onRefreshAfterAction: (action: () => Promise<void>) => Promise<void>;
}>;

const EMPTY_FIELD = "—";

export function OrderDetailBody({
  order,
  onAfterStatusChange,
  onRefreshAfterAction,
}: OrderDetailBodyProps) {
  const { complaint, deviceSpecs } = parseStoredOrderIssue(order.issue);
  const scheduleGateActive = isScheduleGateActive(order);

  return (
    <div className="pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-0 flex-col bg-gray-100">
      <div className="bg-white px-4 lg:px-5 py-4 mb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon="lets-icons:order"
            width={26}
            height={26}
            aria-hidden
            className="text-[#1A73E8FF]"
          />
          <p className="font-semibold text-base text-[#171a1f] uppercase">
            Ringkasan Pesanan
          </p>
          <span className="text-xs ml-auto text-[#202124] rounded-full bg-[#F3E8FFFF] px-2 py-1">
            {serviceTypeAdminLabel(order.serviceType)}
          </span>
        </div>

        <div className="pt-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#f7f7f8] size-fit p-2">
              <Icon
                icon="solar:user-bold"
                className="text-[#1A73E8FF]"
                width={26}
                height={26}
                aria-hidden
              />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-base text-[#171a1f] uppercase">
                {order.customerName}
              </p>
              <p className="text-sm text-[#565d6d]">
                ID: #{order.id?.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex justify-between border-t border-[#dee1e6] pt-3 mt-3 gap-3">
            <div className="">
              <p className="text-xs font-semibold text-[#565d6d]">UNIT</p>
              <p className="font-bold">
                {order.laptopBrand?.trim() || EMPTY_FIELD}{" "}
                {order.laptopModel?.trim() || EMPTY_FIELD}{" "}
                {deviceSpecs?.trim() || EMPTY_FIELD}
              </p>
            </div>
            <div className="">
              <p className="text-xs font-semibold text-[#565d6d]">
                NO. WHATSAPP
              </p>
              <div className="flex gap-1 items-center text-[#1A73E8FF]">
                <Icon
                  icon="ic:baseline-phone"
                  width={20}
                  height={20}
                  aria-hidden
                />
                <p className="font-bold">{order.customerPhone}</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-[#565d6d]">LOKASI</p>
            <p className="font-bold">
              {order.visitAddress?.trim() || EMPTY_FIELD}
            </p>
          </div>
          <div className="flex flex-col border-t border-[#dee1e6] pt-5 mt-5 gap-3">
            <div className="text-[#565d6d] flex items-center gap-1">
              <Icon icon="proicons:note" width={20} height={20} aria-hidden />
              <p className="text-xs font-semibold">KELUHAN UTAMA</p>
            </div>
            <div className="bg-[#F6F7F9FF] text-[#171A1FFF] text-md italic rounded-md p-2">
              &quot;{complaint || EMPTY_FIELD}&quot;
            </div>
          </div>
          <div className="flex flex-col border-t border-[#dee1e6] pt-5 mt-5 gap-3">
            <div className="text-[#565d6d] flex items-center gap-1">
              <Icon icon="tdesign:attach" width={16} height={16} aria-hidden />
              <p className="text-xs font-semibold">
                LAMPIRAN UNIT ({order.attachmentUrls.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {order.attachmentUrls.map((url) => (
                <Link
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block size-20 overflow-hidden rounded-lg border border-[#dee1e6]"
                >
                  <Image
                    src={url}
                    alt="Lampiran"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <OrderVisitScheduleSection
        key={`${order.id}-${order.visitScheduleStatus}-${order.confirmedVisitAt ?? ""}`}
        order={order}
        onAfterAction={onAfterStatusChange}
      />

      {!scheduleGateActive ? (
        <OrderStatusUpdateSection
          order={order}
          onAfterStatusChange={onAfterStatusChange}
          onRefreshAfterAction={onRefreshAfterAction}
        />
      ) : null}
    </div>
  );
}
