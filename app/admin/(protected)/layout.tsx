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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 shrink-0 border-b border-white/10 bg-[#244673] shadow-sm shadow-black/10">
        <AdminHeader />
      </header>
      <div className="mx-auto w-full min-w-0 max-w-2xl flex-1 overflow-x-hidden bg-primary/5 px-4 py-6 pb-28">
        {children}
      </div>
      <AdminBottomNav />
    </div>
  );
}
