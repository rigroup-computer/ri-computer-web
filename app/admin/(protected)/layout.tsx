import { redirect } from "next/navigation";
import {
  AdminBottomNav,
  AdminHeader,
} from "@/components/admin/admin-navbar";
import { getAdminSessionValid } from "@/lib/admin-session";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await getAdminSessionValid())) {
    redirect("/admin/login?next=/admin");
  }

  return (
    <div className="min-h-screen h-screen pb-0">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#244673] shadow-sm shadow-black/10">
        <AdminHeader />
      </header>
      <div className="mx-auto max-w-2xl bg-primary/5 h-full px-4 py-6">
        {children}
      </div>
      <AdminBottomNav />
    </div>
  );
}
