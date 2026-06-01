export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:bg-gradient-to-br lg:from-slate-100 lg:via-white lg:to-blue-50/40">
      {children}
    </div>
  );
}
