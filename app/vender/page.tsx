import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendé tu vehículo | Motordata",
  description:
    "Publicá tu vehículo en Motordata con fotos, datos claros y contacto visible para interesados.",
};

const steps = [
  {
    title: "Cargá los datos",
    text: "Completá marca, modelo, versión, precio, kilometraje, ubicación y descripción.",
  },
  {
    title: "Sumá buenas fotos",
    text: "La primera imagen será la principal. Podés subir hasta 10 fotos del vehículo.",
  },
  {
    title: "Dejá tu contacto",
    text: "Nombre, WhatsApp o teléfono y, si querés, un email visible para interesados.",
  },
  {
    title: "Esperá la revisión",
    text: "La administración valida la ficha antes de publicarla en el buscador.",
  },
];

export default function VenderPage() {
  return (
    <main className="min-h-screen bg-[#2f3742] text-[#0b1f33]">
      <section className="relative min-h-[72vh] overflow-hidden">
        <Image
          src="/images/hero-car-search-improved.png"
          alt="Vehículos listos para publicar en Motordata"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0b1f33]/55" />

        <header className="relative z-10 border-b border-white/15">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="w-fit">
              <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
                Motordata
              </p>
              <p className="text-2xl font-black text-white">Vendé tu vehículo</p>
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Buscar vehículos
              </Link>
              <Link
                href="/publicar"
                className="rounded-full bg-[#f5c400] px-5 py-2 text-sm font-black text-[#0b1f33] transition hover:bg-[#e5b800]"
              >
                Publicar gratis
              </Link>
              <Link
                href="/agencias"
                className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Soy agencia
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-6 py-16 md:py-24">
          <p className="w-fit rounded-full bg-[#f5c400] px-4 py-2 text-sm font-black uppercase tracking-wide text-[#0b1f33]">
            Publicación gratis por lanzamiento
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-medium tracking-tight text-white md:text-6xl">
            Publicá tu auto con datos claros y contacto directo.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
            Motordata ordena la ficha para que los interesados vean fotos,
            precio, kilometraje, ubicación y cómo comunicarse con vos sin vueltas.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/publicar"
              className="rounded-xl bg-[#f5c400] px-6 py-3 text-center text-sm font-black text-[#0b1f33] transition hover:bg-[#e5b800]"
            >
              Cargar mi vehículo
            </Link>
            <a
              href="#como-funciona"
              className="rounded-xl border border-white bg-white px-6 py-3 text-center text-sm font-bold text-[#063b75] transition hover:bg-white/90"
            >
              Cómo funciona
            </a>
            <Link
              href="/agencias"
              className="rounded-xl border border-white bg-white px-6 py-3 text-center text-sm font-bold text-[#063b75] transition hover:bg-white/90"
            >
              Soy agencia
            </Link>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#f5c400]">
              Proceso simple
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Cuatro pasos para aparecer en el buscador.
            </h2>
            <p className="mt-3 text-base leading-7 text-white/70">
              La ficha queda pendiente hasta que sea revisada. Si se aprueba,
              recibís el enlace de gestión para editar o borrar el anuncio.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4fb] text-sm font-black text-[#063b75]">
                  {index + 1}
                </div>
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#f5c400]">
                Listo para publicar
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#0b1f33]">
                Tené a mano fotos, precio pretendido y datos de contacto.
              </h2>
            </div>
            <Link
              href="/publicar"
              className="rounded-xl bg-[#063b75] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[#052f5f]"
            >
              Publicar mi vehículo
            </Link>
            <Link
              href="/agencias"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center text-sm font-bold text-[#063b75] transition hover:bg-gray-50"
            >
              Publicar varios vehículos
            </Link>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl bg-[#063b75] text-white shadow-lg">
          <div className="grid md:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-center p-6 md:p-8 md:pt-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f5c400]">
                Lanzamiento Motordata
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-4xl">
                Publicá gratis por tiempo limitado.
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-blue-100">
                La carga, revisión y publicación inicial no tienen costo. Más
                adelante sumaremos opciones destacadas cuando haya más inventario
                activo.
              </p>
            </div>
            <div className="flex flex-col justify-center bg-[#f5c400] px-8 py-6 text-[#0b1f33] md:min-w-56">
              <span className="text-sm font-black uppercase tracking-wide">
                Costo actual
              </span>
              <span className="text-5xl font-black leading-none">$0</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
