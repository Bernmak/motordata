"use client";

import Link from "next/link";
import VehicleImage from "@/components/VehicleImage";
import { useEffect, useState } from "react";
import { coloresAutomotor } from "@/data/catalogs";
import {
  getStoredListings,
  removeListing,
  updateListing,
  verifyPassword,
  type ManagedVehicle,
} from "@/utils/listings";
import { deleteRemoteListing, updateRemoteListing } from "@/utils/listingsRemote";
import { formatDateOnly } from "@/utils/dates";

type ManageListingClientProps = {
  listingId: string;
};

export default function ManageListingClient({ listingId }: ManageListingClientProps) {
  const [listing, setListing] = useState<ManagedVehicle | null>(null);
  const [tokenIsValid, setTokenIsValid] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const storedListing = getStoredListings().find(
        (item) => item.id === listingId
      );

      setListing(storedListing || null);
      setTokenIsValid(
        Boolean(storedListing && token === storedListing.editToken)
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [listingId]);

  async function unlockListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listing) return;

    const passwordIsValid = await verifyPassword(
      password,
      listing.ownerPasswordHash
    );

    if (!passwordIsValid) {
      setMessage("La contraseña no es correcta.");
      return;
    }

    setMessage("");
    setIsUnlocked(true);
  }

  function saveListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listing) return;

    const formData = new FormData(event.currentTarget);
    const updatedListings = updateListing(listing.id, (currentListing) => ({
      ...currentListing,
      brand: String(formData.get("brand") || ""),
      model: String(formData.get("model") || ""),
      version: String(formData.get("version") || ""),
      year: Number(formData.get("year") || 0),
      price: Number(formData.get("price") || 0),
      kilometers: Number(formData.get("kilometers") || 0),
      province: String(formData.get("province") || ""),
      city: String(formData.get("city") || ""),
      fuel: String(formData.get("fuel") || ""),
      transmission: String(formData.get("transmission") || ""),
      color: String(formData.get("color") || ""),
      contactName: String(formData.get("contactName") || ""),
      contactPhone: String(formData.get("contactPhone") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      contact: [
        String(formData.get("contactName") || ""),
        String(formData.get("contactPhone") || ""),
        String(formData.get("contactEmail") || ""),
      ].filter(Boolean).join(" · "),
      description: String(formData.get("description") || ""),
      updatedAt: new Date().toISOString(),
    }));

    const updatedListing =
      updatedListings.find((item) => item.id === listing.id) || null;

    setListing(updatedListing);
    if (updatedListing && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      void updateRemoteListing(updatedListing);
    }
    setMessage("Los cambios fueron guardados.");
  }

  function deleteListing() {
    if (!listing) return;

    removeListing(listing.id);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      void deleteRemoteListing(listing.id);
    }
    setListing(null);
    setMessage("El anuncio fue borrado y ya no aparece en el buscador.");
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#2f3742] px-6 py-10 text-[#0b1f33]">
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <h1 className="text-2xl font-black">Anuncio no encontrado</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            El enlace no coincide con una publicación guardada en este navegador.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-xl bg-[#063b75] px-4 py-3 text-sm font-bold text-white"
          >
            Volver al buscador
          </Link>
        </section>
      </main>
    );
  }

  if (!tokenIsValid) {
    return (
      <main className="min-h-screen bg-[#2f3742] px-6 py-10 text-[#0b1f33]">
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <h1 className="text-2xl font-black">Enlace inválido</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Para gestionar este anuncio necesitás abrir el enlace enviado en el
            email de aprobación.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#2f3742] px-6 py-10 text-[#0b1f33]">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
              Gestión del anuncio
            </p>
            <h1 className="text-3xl font-black text-white">
              {listing.brand} {listing.model}
            </h1>
          </div>
          <Link
            href="/"
            className="w-fit rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-bold text-[#063b75]"
          >
            Volver
          </Link>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl bg-white p-4 text-sm font-semibold text-[#063b75] ring-1 ring-gray-200">
            {message}
          </div>
        )}

        {!isUnlocked ? (
          <form
            onSubmit={unlockListing}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <h2 className="text-xl font-black">Confirmá tu contraseña</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Es la contraseña de seguridad que creaste al cargar el vehículo.
            </p>
            <label className="mt-5 block">
              <span className="mb-1 block text-sm font-bold text-gray-700">
                Contraseña de seguridad
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
              />
            </label>
            <button
              type="submit"
              className="mt-5 rounded-xl bg-[#f5c400] px-5 py-3 text-sm font-black text-[#0b1f33]"
            >
              Acceder
            </button>
          </form>
        ) : (
          <form
            onSubmit={saveListing}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Editar publicación</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Estado actual: {listing.publicationStatus}
                </p>
              </div>
              <button
                type="button"
                onClick={deleteListing}
                className="w-fit rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700"
              >
                Borrar anuncio
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
  ["Marca", "brand", listing.brand],
  ["Modelo", "model", listing.model],
  ["Versión", "version", listing.version],
  ["Año", "year", listing.year],
  ["Precio", "price", listing.price],
  ["Kilómetros", "kilometers", listing.kilometers],
  ["Provincia", "province", listing.province],
  ["Ciudad", "city", listing.city],
  ["Ubicación exacta", "location", listing.location],
  ["Combustible", "fuel", listing.fuel],
  ["Transmisión", "transmission", listing.transmission],
  ["Estado", "estado", listing.estado],
  ["Puertas", "doors", listing.doors],
  ["Dueños", "owners", listing.owners],
  ["Vendedor", "vendedor", listing.vendedor],
  ["Garantía", "garantia", listing.garantia],
  ["Inspección técnica", "inspeccionTecnica", formatDateOnly(listing.inspeccionTecnica)],
  ["Tracción", "traccion", listing.traccion],
  ["Aire acondicionado", "airConditioning", listing.airConditioning],
  ["Techo panorámico", "techoPanoramico", listing.techoPanoramico],
  ["Airbags", "airbags", listing.airbags],
  ["Frenos ABS", "frenosABS", listing.frenosABS],
  ["Asistente de estacionamiento", "asistenteEstacionamiento", listing.asistenteEstacionamiento],
  ["Sensores de estacionamiento", "sensoresEstacionamiento", listing.sensoresEstacionamiento],
  ["Cámara de reversa", "camaraReversa", listing.camaraReversa],
  ["Control crucero", "controlCrucero", listing.controlCrucero],
  ["Control de estabilidad", "controlEstabilidad", listing.controlEstabilidad],
  ["Navegador GPS", "navegadorGPS", listing.navegadorGPS],
  ["Tapizado", "tapizado", listing.tapizado],
  ["Climatizador", "climatizador", listing.climatizador],
  ["Llantas de aleación", "llantasAleacion", listing.llantasAleacion],
  ["Alarma", "alarma", listing.alarma],
  ["Cierre centralizado", "cierreCentralizado", listing.cierreCentralizado],
  ["Levantavidrios eléctricos", "levantavidriosElectricos", listing.levantavidriosElectricos],
  ["Dirección asistida", "direccionAsistida", listing.direccionAsistida],
].map(([label, name, value]) => (
                <label key={String(name)} className="block">
                  <span className="mb-1 block text-sm font-bold text-gray-700">
                    {label}
                  </span>
                  <input
                    name={String(name)}
                    defaultValue={String(value)}
                    type={
                      ["year", "price", "kilometers"].includes(String(name))
                        ? "number"
                        : "text"
                    }
                    required
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                  />
                </label>
              ))}

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  Color
                </span>
                <select
                  name="color"
                  defaultValue={listing.color}
                  required
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                >
                  <option value="">Seleccionar</option>
                  {coloresAutomotor.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-3">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  Nombre de contacto visible
                </span>
                <input
                  name="contactName"
                  defaultValue={listing.contactName || listing.contact || ""}
                  required
                  placeholder="Ej: Juan Pérez"
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  WhatsApp o teléfono visible
                </span>
                <input
                  name="contactPhone"
                  defaultValue={listing.contactPhone || ""}
                  required
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  Email visible
                </span>
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={listing.contactEmail || ""}
                  placeholder="Opcional"
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                />
              </label>

              <label className="block md:col-span-3">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  Descripción
                </span>
                <textarea
                  name="description"
                  defaultValue={listing.description || ""}
                  className="min-h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-5 rounded-xl bg-[#063b75] px-5 py-3 text-sm font-black text-white"
            >
              <div className="mt-6 rounded-2xl bg-gray-50 p-4">
  <h3 className="text-lg font-black text-[#0b1f33]">
    Fotos actuales
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    Estas son las imágenes cargadas para tu publicación.
  </p>

  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
    {(listing.images && listing.images.length > 0
      ? listing.images
      : ["/placeholder-car.svg"]
    ).map((image, index) => (
      <div
        key={`${image}-${index}`}
        className="relative h-28 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
      >
        <VehicleImage
          src={image}
          alt={`${listing.brand} ${listing.model} imagen ${index + 1}`}
          sizes="180px"
          className="h-full w-full object-cover"
        />
      </div>
    ))}
  </div>
</div>
              Guardar cambios
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
