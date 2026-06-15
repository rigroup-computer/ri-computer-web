import { DashboardContent } from "@/components/admin/dashboard/dashboard-content";
import { fetchAdminDashboardStats } from "@/lib/admin-dashboard-stats";
import { whatsappHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await fetchAdminDashboardStats();

  const shopWa = process.env.SHOP_WHATSAPP_NUMBER?.trim() ?? "";
  const waHref = shopWa ? whatsappHref(shopWa, "Halo Ri Computer Admin") : null;
  return <DashboardContent stats={stats} waHref={waHref} />;
}
