export default function ImportarCSVPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
          Datos
        </p>
        <h2 className="text-3xl font-black text-white">Importar CSV</h2>
        <p className="mt-2 text-white/65">
          Carga masiva de vehículos desde un archivo CSV.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-[#063b75]/40 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-black">Seleccioná un archivo CSV</p>
        <p className="mt-2 text-sm text-gray-500">
          El importador actual usa <span className="font-bold">data/vehicles.csv</span>{" "}
          y genera <span className="font-bold">data/vehicles.ts</span>.
        </p>

        <input
          type="file"
          accept=".csv"
          className="mt-5 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
        />
      </div>

      <div className="mt-5 rounded-2xl bg-[#eef4fb] p-5 text-sm leading-6 text-[#063b75]">
        Para actualizar desde consola, usá{" "}
        <code className="rounded bg-white px-2 py-1 font-bold">
          npm run update:vehicles
        </code>
        .
      </div>
    </section>
  );
}
