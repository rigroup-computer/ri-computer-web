import { DashboardContent } from "@/components/admin/dashboard/dashboard-content";
import { orderSdk } from "@/src/lib/sdk/orders";
import { whatsappHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await orderSdk.fetchDashboardStats();

  const shopWa = process.env.SHOP_WHATSAPP_NUMBER?.trim() ?? "";
  const waHref = shopWa ? whatsappHref(shopWa, "Halo Ri Computer Admin") : null;
  return <DashboardContent stats={stats} waHref={waHref} />;
}
