import Link from "next/link";
import AdminDashboardStats from "@/components/AdminDashboardStats";
import { marcasArgentina } from "@/data/catalogs";
import { vehicles } from "@/data/vehicles";

export default function AdminDashboardPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
          Resumen
        </p>
        <h2 className="text-3xl font-black text-white">Dashboard</h2>
        <p className="mt-2 text-white/65">
          Vista general del inventario y accesos rápidos del panel interno.
        </p>
      </div>

      <AdminDashboardStats
        vehicles={vehicles}
        brandCount={marcasArgentina.length}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/autos"
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
        >
          <h3 className="text-xl font-black">Gestionar vehículos</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Revisá el inventario cargado, sus imágenes, precios y estado de
            publicación.
          </p>
        </Link>

        <Link
          href="/admin/importar"
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
        >
          <h3 className="text-xl font-black">Importar CSV</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Actualizá la base local desde un archivo CSV con el formato de
            MotorData.
          </p>
        </Link>
      </div>
    </section>
  );
}
