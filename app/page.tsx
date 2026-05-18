import Image from "next/image";
import Link from "next/link";
import PublicInventoryStats from "@/components/PublicInventoryStats";
import PublishedVehicleSearch from "@/components/PublishedVehicleSearch";
import { vehicles } from "@/data/vehicles";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#2f3742] text-[#0b1f33]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
              Motordata
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1f33]">
              Buscá tu próximo vehículo
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#buscar"
              className="rounded-full bg-[#f5c400] px-5 py-2 text-sm font-medium text-[#0b1f33] transition hover:bg-[#e5b800]"
            >
              Buscar vehículos
            </a>
            <Link
              href="/vender"
              className="rounded-full bg-[#063b75] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#052f5f]"
            >
              Vendé tu vehículo
            </Link>
            <Link
              href="/agencias"
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-[#063b75] transition hover:bg-gray-50"
            >
              Soy agencia
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 lg:p-10">
              <span className="mx-auto inline-flex rounded-full bg-[#f5c400] px-4 py-2 text-sm font-medium text-[#0b1f33] sm:mx-0">
                Compra inteligente de vehículos
              </span>

              <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-[#0b1f33] md:text-5xl">
                Encontrá autos, compará datos y elegí mejor.
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
                Filtrá por marca, modelo, precio, año, kilometraje, ubicación y
                score para tomar una decisión con más contexto.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-start">
                <Link
                  href="/vender"
                  className="rounded-xl bg-[#063b75] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#052f5f]"
                >
                  Vendé tu vehículo
                </Link>
                <Link
                  href="/publicar"
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-[#063b75] transition hover:bg-gray-50"
                >
                  Publicar gratis
                </Link>
                <Link
                  href="/agencias"
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-[#063b75] transition hover:bg-gray-50"
                >
                  Soy agencia
                </Link>
              </div>

              <PublicInventoryStats vehicles={vehicles} />
            </div>

            <div className="relative min-h-80 overflow-hidden bg-[#063b75] lg:rounded-bl-[28px]">
              <Image
                src="/images/hero-car-search-improved.png"
                alt="Fila de autos en venta para comparar en Motordata"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#0b1f33]/20" />
              <div className="absolute bottom-6 left-6 right-6 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(11,31,51,0.22)] backdrop-blur-sm">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-[#f5c400]" />
                <p className="text-[15px] font-black uppercase tracking-wide text-[#f5c400]">
                  Inventario destacado
                </p>
                <p className="mt-2 text-2xl font-black text-[#0b1f33]">
                  Pickups, sedanes y hatchbacks listos para comparar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <PublishedVehicleSearch vehicles={vehicles} />

        <section className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-72 bg-[#063b75]">
              <Image
                src="/images/hero-car-search.jpg"
                alt="Vehículos publicados en Motordata"
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#0b1f33]/35" />
              <div className="absolute bottom-5 left-5 rounded-full bg-[#f5c400] px-4 py-2 text-sm font-medium text-[#0b1f33]">
                Gratis por lanzamiento
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-sm font-medium uppercase tracking-wide text-[#f5c400]">
                Publicá en Motordata
              </p>
              <h2 className="mt-2 text-3xl font-medium tracking-tight text-[#0b1f33]">
                Subí tu auto y recibí interesados con datos claros.
              </h2>
              <p className="mt-3 text-base leading-7 text-gray-600">
                Cargá fotos, precio, ubicación y contacto visible. Revisamos la
                publicación antes de mostrarla para mantener fichas confiables y
                fáciles de comparar.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Cargá la ficha", "Revisión interna", "Contacto visible"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl bg-[#f8fafc] p-4 text-center ring-1 ring-gray-200"
                    >
                      <p className="text-sm font-black text-[#063b75]">{item}</p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/vender"
                  className="rounded-xl bg-[#063b75] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#052f5f]"
                >
                  Ver cómo funciona
                </Link>
                <Link
                  href="/publicar"
                  className="rounded-xl bg-[#f5c400] px-5 py-3 text-center text-sm font-medium text-[#0b1f33] transition hover:bg-[#e5b800]"
                >
                  Publicar mi vehículo
                </Link>
                <Link
                  href="/agencias"
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-[#063b75] transition hover:bg-gray-50"
                >
                  Soy agencia
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-6xl rounded-3xl bg-[#063b75] p-6 text-white shadow-sm ring-1 ring-[#063b75] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#f5c400]">
                Agencias y concesionarios
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Vos vendés autos. Nosotros te ayudamos a mostrarlos mejor.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Si tenés varios vehículos, dejanos tus datos y coordinamos una
                carga simple por WhatsApp.
              </p>
            </div>
            <Link
              href="/agencias"
              className="rounded-xl bg-[#f5c400] px-6 py-3 text-center text-sm font-medium text-[#0b1f33] transition hover:bg-[#e5b800]"
            >
              Contactar como agencia
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4bf] text-sm font-medium text-[#7a6100]">
              FI
            </div>
            <h3 className="text-lg font-bold">Búsqueda precisa</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Filtros visibles, ordenados y conectados al inventario real.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fb] text-sm font-black text-[#063b75]">
              SC
            </div>
            <h3 className="text-lg font-bold">Datos comparables</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Precio, año, kilometraje, score y ubicación preparados para
              comparar mejor.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4fb] text-sm font-black text-[#063b75]">
              AD
            </div>
            <h3 className="text-lg font-bold">Admin separado</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              El sitio público queda orientado al usuario final y el panel se
              mantiene en rutas internas.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
