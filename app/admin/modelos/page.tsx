import { modelosArgentina } from "@/data/catalogs";

export default function ModelosPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
          Catálogo
        </p>
        <h2 className="text-3xl font-black text-white">Modelos</h2>
        <p className="mt-2 text-white/65">
          Modelos disponibles agrupados por marca.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {Object.entries(modelosArgentina).map(([marca, modelos]) => (
          <div
            key={marca}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-black">{marca}</h3>
              <span className="rounded-full bg-[#eef4fb] px-3 py-1 text-xs font-black text-[#063b75]">
                {modelos.length} modelos
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {modelos.map((modelo) => (
                <span
                  key={modelo}
                  className="rounded-lg bg-[#f8fafc] px-3 py-1 text-sm font-bold text-gray-600 ring-1 ring-gray-200"
                >
                  {modelo}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
