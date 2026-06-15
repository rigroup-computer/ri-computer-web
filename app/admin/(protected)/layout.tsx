import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSessionValid } from "@/lib/admin-session";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await getAdminSessionValid())) {
    redirect("/admin/login?next=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
