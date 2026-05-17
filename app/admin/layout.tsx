import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#2f3742] text-[#0b1f33]">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
                  Administración
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1f33]">
                  MotorData Web
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/autos/nuevo"
                  className="rounded-xl bg-[#f5c400] px-4 py-2 text-sm font-extrabold text-[#0b1f33] transition hover:bg-[#e5b800]"
                >
                  Nuevo vehículo
                </Link>
                <Link
                  href="/"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Ver sitio público
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-7">{children}</div>
        </div>
      </div>
    </main>
  );
}
