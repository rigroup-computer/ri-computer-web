import { OrderListRow } from "./order-list-row";
import type { OrderListRowData } from "./order-row-data";

type OrdersListProps = Readonly<{
  orders: OrderListRowData[];
  emptyMessage: string;
  selectedId: string | null;
  onRowClick: (id: string) => void;
}>;

export function OrdersList({
  orders,
  emptyMessage,
  selectedId,
  onRowClick,
}: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <p className="-mx-4 border border-dashed border-[#dee1e6] bg-white px-4 py-8 text-center text-sm text-[#565d6d] lg:hidden lg:mx-0 lg:rounded-2xl">
        {emptyMessage}
      </p>
    );
  }

  return (
    <section
      className="-mx-4 overflow-hidden bg-white lg:mx-0 lg:hidden"
      aria-label="Daftar pesanan servis"
    >
      <ul>
        {orders.map((order, index) => (
          <OrderListRow
            key={order.id}
            order={order}
            variant="orders"
            isLast={index === orders.length - 1}
            isSelected={selectedId === order.id}
            onClick={() => onRowClick(order.id)}
          />
        ))}
      </ul>
    </section>
  );
}
