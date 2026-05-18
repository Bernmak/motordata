"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const whatsappNumber = "5491158985726";

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1 inline-flex items-center gap-1 text-sm font-bold text-gray-700">
      {required && <span className="text-red-600">*</span>}
      <span>{label}</span>
    </span>
  );
}

function Field({
  label,
  name,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        name={name}
        value={value}
        type={type}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
      />
    </label>
  );
}

export default function AgenciesPage() {
  const [agencyName, setAgencyName] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [vehicleCount, setVehicleCount] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const whatsappUrl = useMemo(() => {
    const text = [
      "Hola, tengo una agencia y quiero publicar vehículos en Motordata.",
      "",
      `Agencia: ${agencyName}`,
      `Ciudad: ${city}`,
      `WhatsApp: ${whatsapp}`,
      `Cantidad aproximada de vehículos: ${vehicleCount}`,
      message ? `Mensaje: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [agencyName, city, whatsapp, vehicleCount, message]);

  function submitAgency(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!agencyName.trim() || !city.trim() || !whatsapp.trim() || !vehicleCount.trim()) {
      setFormError("Completá los datos obligatorios para armar el mensaje.");
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-[#2f3742] text-[#0b1f33]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
              Motordata
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1f33]">
              Agencias y concesionarios
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Volver al buscador
            </Link>
            <Link
              href="/vender"
              className="rounded-xl bg-[#063b75] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#052f5f]"
            >
              Vender como particular
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="text-white">
          <p className="text-sm font-black uppercase tracking-wide text-[#f5c400]">
            Para agencias
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Vos vendés autos. Nosotros te ayudamos a mostrarlos mejor.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Si tenés una agencia o concesionaria, escribinos y vemos la forma
            más simple de publicar varios vehículos con fichas claras, fotos,
            precio, kilómetros y contacto.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {["Fichas ordenadas", "Contacto directo", "Carga asistida"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/10 p-4 text-center text-sm font-black text-white ring-1 ring-white/15"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <form
          onSubmit={submitAgency}
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:p-8"
        >
          <h2 className="text-2xl font-black">Contactanos por WhatsApp</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Completá estos datos y se abrirá WhatsApp con el mensaje armado.
          </p>

          {formError && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {formError}
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              label="Nombre de la agencia"
              name="agencyName"
              value={agencyName}
              required
              placeholder="Ej: Autos del Centro"
              onChange={setAgencyName}
            />
            <Field
              label="Ciudad"
              name="city"
              value={city}
              required
              placeholder="Ej: Córdoba"
              onChange={setCity}
            />
            <Field
              label="WhatsApp"
              name="whatsapp"
              value={whatsapp}
              required
              type="tel"
              placeholder="Ej: +54 9 351 123-4567"
              onChange={setWhatsapp}
            />
            <Field
              label="Cantidad aproximada de vehículos"
              name="vehicleCount"
              value={vehicleCount}
              required
              type="number"
              placeholder="Ej: 15"
              onChange={setVehicleCount}
            />

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-bold text-gray-700">
                Mensaje opcional
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Contanos si ya tenés fotos, Excel, redes o inventario cargado en otro lugar."
                className="min-h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#f5c400] px-6 py-3 text-sm font-black text-[#0b1f33] transition hover:bg-[#e5b800]"
          >
            Enviar por WhatsApp
          </button>

          <p className="mt-4 text-xs leading-5 text-gray-500">
            Antes de publicar vehículos, revisamos la información para mantener
            fichas claras y confiables.
          </p>
        </form>
      </section>
    </main>
  );
}
