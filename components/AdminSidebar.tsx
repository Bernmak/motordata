"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: "IN" },
  { label: "Vehículos", href: "/admin/autos", icon: "AU" },
  { label: "Nuevo auto", href: "/admin/autos/nuevo", icon: "NA" },
  { label: "Marcas", href: "/admin/marcas", icon: "MA" },
  { label: "Modelos", href: "/admin/modelos", icon: "MO" },
  { label: "Importar CSV", href: "/admin/importar", icon: "IM" },
  { label: "Exportar CSV", href: "/admin/exportar", icon: "EX" },
  { label: "Configuración", href: "/admin/configuracion", icon: "CO" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const activeHref =
    menuItems
      .filter(
        (item) =>
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href || "/admin";

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-gray-200 bg-white px-4 py-5 text-[#0b1f33] lg:block">
      <div className="mb-8 rounded-2xl bg-[#063b75] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-[#f5c400]">
          Motordata
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          Panel interno
        </h1>
        <p className="mt-2 text-sm leading-5 text-blue-100">
          Gestión de inventario, catálogo e importaciones.
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                active
                  ? "bg-[#eef4fb] text-[#063b75] ring-1 ring-[#063b75]/10"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0b1f33]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black",
                  active
                    ? "bg-[#063b75] text-white"
                    : "bg-gray-100 text-gray-500",
                ].join(" ")}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
