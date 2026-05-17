import { marcasArgentina } from "@/data/catalogs";

export default function MarcasPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
          Catálogo
        </p>
        <h2 className="text-3xl font-black text-white">Marcas</h2>
        <p className="mt-2 text-white/65">
          {marcasArgentina.length} marcas disponibles para cargar vehículos.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {marcasArgentina.map((marca) => (
          <div
            key={marca}
            className="rounded-xl bg-white px-4 py-3 text-sm font-bold shadow-sm ring-1 ring-gray-200"
          >
            {marca}
          </div>
        ))}
      </div>
    </section>
  );
}
