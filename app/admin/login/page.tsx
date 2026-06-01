import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getAdminSessionValid } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getAdminSessionValid()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : undefined;

  return (
    <main className="mx-auto flex min-h-screen overflow-hidden max-w-md flex-col justify-center px-4 py-12 lg:min-h-screen lg:items-stretch lg:justify-center lg:px-6 lg:py-20">
      <AdminLoginForm nextPath={next} />
    </main>
  );
}
