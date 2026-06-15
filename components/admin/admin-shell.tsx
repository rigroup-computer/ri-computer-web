import { AdminBottomNav, AdminHeader } from "@/components/admin/admin-navbar/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/80 bg-white/95 shadow-soft backdrop-blur lg:hidden">
          <AdminHeader />
        </header>

        <div className="mx-auto w-full min-w-0 flex-1 px-4 py-5 pb-28 lg:max-w-none lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </div>

        <AdminBottomNav />
      </div>
    </div>
  );
}
