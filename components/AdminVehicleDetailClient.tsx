"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import VehicleImage from "@/components/VehicleImage";
import { getStoredListings, type ManagedVehicle } from "@/utils/listings";
import { fetchRemoteListings } from "@/utils/listingsRemote";
import { formatDateOnly } from "@/utils/dates";

type AdminVehicleDetailClientProps = {
  vehicleId: string;
  baseVehicles: Vehicle[];
};

type DetailRow = {
  label: string;
  value: string | number | undefined;
};

const formatPrice = (value: number) => `$ ${value.toLocaleString("es-AR")}`;

function optionalValue(value: string | number | undefined) {
  if (value === undefined || value === "") return "No informado";
  return String(value);
}

function getScoreLabel(score: number) {
  if (score >= 1.08) return "Muy buena oportunidad";
  if (score >= 0.95) return "Precio competitivo";
  return "Revisar precio";
}

function getScoreBadgeClass(score: number) {
  if (score >= 1.08) return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  if (score >= 0.95) return "bg-amber-100 text-amber-800 ring-amber-200";
  return "bg-red-100 text-red-800 ring-red-200";
}

export default function AdminVehicleDetailClient({
  vehicleId,
  baseVehicles,
}: AdminVehicleDetailClientProps) {
  const [storedListings, setStoredListings] = useState<ManagedVehicle[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isBaseVehicle = /^base-\d+$/.test(vehicleId);
useEffect(() => {
  let cancelled = false;

  async function loadListings() {
    const localListings = getStoredListings();

    try {
      const remoteListings = await fetchRemoteListings();

      if (cancelled) return;

      const mergedListings = Array.from(
        new Map(
          [...localListings, ...remoteListings].map((listing) => [
            listing.id,
            listing,
          ])
        ).values()
      );

      setStoredListings(mergedListings);
    } catch {
      if (cancelled) return;
      setStoredListings(localListings);
    }
  }

  loadListings();

  return () => {
    cancelled = true;
  };
}, []);
  

  const vehicle = useMemo(() => {
    if (isBaseVehicle) {
      const index = Number(vehicleId.replace("base-", ""));
      return baseVehicles[index];
    }

    return storedListings.find((listing) => listing.id === vehicleId);
  }, [baseVehicles, isBaseVehicle, storedListings, vehicleId]);

  if (!vehicle) {
    return (
      <section>
        <Link
          href="/admin/autos"
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Volver al inventario
        </Link>

        <p className="mt-4 text-sm font-semibold text-gray-500">
          Vehículo no encontrado
        </p>
      </section>
    );
  }

  const images =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : ["/placeholder-car.svg"];

  const mainImage = images[currentImageIndex] || "/placeholder-car.svg";

  const details: DetailRow[] = [
  { label: "Marca", value: vehicle.brand },
  { label: "Modelo", value: vehicle.model },
  { label: "Versión", value: vehicle.version },
  { label: "Año", value: vehicle.year },
  { label: "Precio", value: formatPrice(vehicle.price) },
  {
    label: "Kilómetros",
    value: `${vehicle.kilometers.toLocaleString("es-AR")} km`,
  },
  { label: "Provincia", value: vehicle.province },
  { label: "Ciudad", value: vehicle.city },
  { label: "Ubicación exacta", value: vehicle.location },
  { label: "Combustible", value: vehicle.fuel },
  { label: "Transmisión", value: vehicle.transmission },
  { label: "Color", value: vehicle.color },
  {
    label: "Score",
    value: `${vehicle.score.toFixed(2)} · ${getScoreLabel(vehicle.score)}`,
  },

  { label: "Estado", value: vehicle.estado },
  { label: "Puertas", value: vehicle.doors },
  { label: "Dueños", value: vehicle.owners },
  { label: "Vendedor", value: vehicle.vendedor },
  { label: "Garantía", value: vehicle.garantia },
  { label: "Inspección técnica", value: formatDateOnly(vehicle.inspeccionTecnica) },

  { label: "Aire acondicionado", value: vehicle.airConditioning },
  { label: "Tracción", value: vehicle.traccion },
  { label: "Techo panorámico", value: vehicle.techoPanoramico },
  { label: "Airbags", value: vehicle.airbags },
  { label: "Frenos ABS", value: vehicle.frenosABS },
  {
    label: "Asistente de estacionamiento",
    value: vehicle.asistenteEstacionamiento,
  },
  {
    label: "Sensores de estacionamiento",
    value: vehicle.sensoresEstacionamiento,
  },
  { label: "Cámara de reversa", value: vehicle.camaraReversa },
  { label: "Control crucero", value: vehicle.controlCrucero },
  { label: "Control de estabilidad", value: vehicle.controlEstabilidad },
  { label: "Navegador GPS", value: vehicle.navegadorGPS },
  { label: "Tapizado", value: vehicle.tapizado },
  { label: "Climatizador", value: vehicle.climatizador },
  { label: "Llantas de aleación", value: vehicle.llantasAleacion },
  { label: "Alarma", value: vehicle.alarma },
  { label: "Cierre centralizado", value: vehicle.cierreCentralizado },
  {
    label: "Levantavidrios eléctricos",
    value: vehicle.levantavidriosElectricos,
  },
  { label: "Dirección asistida", value: vehicle.direccionAsistida },

  { label: "Email titular", value: vehicle.ownerEmail },
  { label: "Nombre contacto visible", value: vehicle.contactName },
  { label: "Teléfono/WhatsApp visible", value: vehicle.contactPhone },
  { label: "Email visible", value: vehicle.contactEmail },
  { label: "Contacto visible", value: vehicle.contact },
 { label: "Estado publicación", value: vehicle.publicationStatus === "approved" ? "Aprobado" : vehicle.publicationStatus === "pending" ? "Pendiente" : vehicle.publicationStatus },
  { label: "Creado", value: formatDateOnly(vehicle.createdAt) || "No informado" },
{ label: "Aprobado", value: formatDateOnly(vehicle.approvedAt) || "No informado" },
{ label: "Actualizado", value: formatDateOnly(vehicle.updatedAt) || "No informado" },
];

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
            Ficha del vehículo
          </p>

          <h2 className="text-3xl font-black text-white">
            {vehicle.brand} {vehicle.model}
          </h2>

          <p className="mt-2 text-gray-500">
            {vehicle.version} · {vehicle.year} · {vehicle.province}
          </p>
        </div>

        <Link
          href="/admin/autos"
          className="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Volver al inventario
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="relative h-72 bg-gray-100">
            <VehicleImage
              src={mainImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              sizes="(min-width: 1280px) 420px, 100vw"
              className="h-full w-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIndex(
                      (currentImageIndex - 1 + images.length) % images.length
                    )
                  }
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-bold text-[#063b75] shadow-md transition hover:bg-white"
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIndex(
                      (currentImageIndex + 1) % images.length
                    )
                  }
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-bold text-[#063b75] shadow-md transition hover:bg-white"
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-2xl font-black text-[#063b75]">
                {formatPrice(vehicle.price)}
              </p>

              <span
                className={[
                  "w-fit rounded-full px-3 py-1 text-sm font-black ring-1",
                  getScoreBadgeClass(vehicle.score),
                ].join(" ")}
              >
                Score {vehicle.score.toFixed(2)}
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-gray-500">
              {vehicle.kilometers.toLocaleString("es-AR")} km · {vehicle.fuel} ·{" "}
              {vehicle.transmission}
            </p>

            <p className="mt-2 text-sm font-bold text-[#063b75]">
              {getScoreLabel(vehicle.score)}
            </p>

            {images.length > 1 && (
              <p className="mt-2 text-xs font-semibold text-gray-400">
                Imagen {currentImageIndex + 1} de {images.length}
              </p>
            )}

            <div className="mt-4 grid grid-cols-4 gap-2">
              {images.slice(0, 8).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={[
                    "relative h-16 overflow-hidden rounded-lg bg-gray-100 ring-1 transition",
                    index === currentImageIndex
                      ? "ring-2 ring-[#f5c400]"
                      : "ring-gray-200 hover:ring-[#f5c400]",
                  ].join(" ")}
                >
                  <VehicleImage
                    src={image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    sizes="96px"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
  <h3 className="text-lg font-black text-[#0b1f33]">
    Descripción
  </h3>
  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
    {vehicle.description || "No informado"}
  </p>
</section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-lg font-black text-[#0b1f33]">
            Datos completos
          </h3>

          <dl className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {details.map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-gray-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#0b1f33]">
                  {optionalValue(item.value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
}
