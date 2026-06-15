import Image from "next/image";

import {
  formatOrderDeviceLabel,
  type AdminSerializedOrder,
} from "./order-row-data";
import { OrderStatusUpdateSection } from "./order-status-update-section";
import { Icon } from "@iconify/react";
import Link from "next/link";

type OrderDetailBodyProps = Readonly<{
  order: AdminSerializedOrder;
  onAfterStatusChange: () => void;
  onRefreshAfterAction: (action: () => Promise<void>) => Promise<void>;
}>;

export function OrderDetailBody({
  order,
  onAfterStatusChange,
  onRefreshAfterAction,
}: OrderDetailBodyProps) {
  const deviceDetail = formatOrderDeviceLabel(order, "", " • ");

  return (
    <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 lg:px-5 lg:pb-5 lg:pt-4">
      <div className="flex items-center gap-2">
        <Icon
          icon="basil:processor-outline"
          width={26}
          height={26}
          aria-hidden
          className="text-[#1A73E8FF]"
        />
        <p className="font-semibold text-base text-[#171a1f] uppercase">
          Ringkasan Pesanan
        </p>
      </div>

      <div className="shadow-md rounded-xl p-4">
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
        <div className="flex items-center justify-between border-t border-[#dee1e6] pt-3 mt-3 gap-3">
          <div className="">
            <p className="text-xs font-semibold text-[#565d6d]">UNIT</p>
            <p className="font-bold">{deviceDetail}</p>
          </div>
          <div className="">
            <p className="text-xs font-semibold text-[#565d6d]">NO. WHATSAPP</p>
            <p className="font-bold text-[#1A73E8FF]">{order.customerPhone}</p>
          </div>
        </div>
        <div className="flex flex-col border-t border-[#dee1e6] pt-5 mt-5 gap-3">
          <div className="text-[#565d6d] flex items-center gap-1">
            <Icon icon="proicons:note" width={20} height={20} aria-hidden />
            <p className="text-xs font-semibold">KELUHAN UTAMA</p>
          </div>
          <div className="bg-[#F6F7F9FF] text-[#171A1FFF] text-md italic rounded-md p-2">
            &quot;{order.issue}&quot;
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

      <div className="flex items-center gap-2 mt-8">
        <Icon
          icon="tabler:clock"
          width={26}
          height={26}
          aria-hidden
          className="text-[#1A73E8FF]"
        />
        <p className="font-semibold text-base text-[#171a1f] uppercase">
          UPDATE STATUS
        </p>
      </div>

      {order.attachmentUrls.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#565d6d]">
            Lampiran keluhan
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {order.attachmentUrls.map((url) => (
              <a
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
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* {order.visitAddress ? (
        <p className="mt-1 text-xs text-[#565d6d]">
          Alamat: {order.visitAddress}
        </p>
      ) : null}
      {order.preferredVisitAt ? (
        <p className="text-xs text-[#565d6d]">
          Preferensi waktu:{" "}
          {new Date(order.preferredVisitAt).toLocaleString("id-ID")}
        </p>
      ) : null} */}

      <OrderStatusUpdateSection
        order={order}
        onAfterStatusChange={onAfterStatusChange}
        onRefreshAfterAction={onRefreshAfterAction}
      />
    </div>
  );
}
