import AdminExportCount from "@/components/AdminExportCount";
import AdminExportCsvButton from "@/components/AdminExportCsvButton";
import { vehicles } from "@/data/vehicles";

export default function ExportarCSVPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
          Datos
        </p>
        <h2 className="text-3xl font-black text-white">Exportar CSV</h2>
        <p className="mt-2 text-white/65">
          Descargá o revisá la base de vehículos en formato CSV.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <p className="text-sm leading-6 text-gray-500">
          Hay <AdminExportCount vehicles={vehicles} />{" "}
          vehículos disponibles para exportar.
        </p>

        <AdminExportCsvButton vehicles={vehicles} />
      </div>
    </section>
  );
}
