import Link from "next/link";

const linkClass =
  "inline-flex w-fit rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-[#063b75] transition hover:bg-gray-50";

export default function ConfiguracionPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
          Sistema
        </p>
        <h2 className="text-3xl font-black text-white">Configuración</h2>
        <p className="mt-2 text-white/65">
          Ajustes generales del panel interno.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs font-black uppercase tracking-wide text-[#f5c400]">
            Datos
          </p>
          <h3 className="mt-1 text-xl font-black text-[#0b1f33]">
            Datos del sitio
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            MotorData muestra al público el inventario visible, los filtros de
            búsqueda, el score de referencia y las fichas completas de cada
            vehículo. Los datos principales se administran desde inventario,
            marcas, modelos e importación/exportación.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className={linkClass}>
              Ver sitio público
            </Link>
            <Link href="/admin" className={linkClass}>
              Dashboard
            </Link>
            <Link href="/admin/exportar" className={linkClass}>
              Exportar datos
            </Link>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs font-black uppercase tracking-wide text-[#f5c400]">
            Reglas
          </p>
          <h3 className="mt-1 text-xl font-black text-[#0b1f33]">
            Reglas de publicación
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Los anuncios cargados por particulares quedan pendientes hasta que
            administración revise datos, imágenes y calidad de la ficha. Los
            vehículos cargados desde administración pueden publicarse directo,
            editarse o borrarse desde inventario.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/publicar" className={linkClass}>
              Publicar como usuario
            </Link>
            <Link href="/admin/autos/nuevo" className={linkClass}>
              Alta desde admin
            </Link>
            <Link href="/admin/autos" className={linkClass}>
              Gestionar inventario
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
