"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  combustiblesArgentina,
  coloresAutomotor,
  marcasArgentina,
  modelosArgentina,
  opcionesAvanzadas,
  provinciasArgentina,
  transmisionesArgentina,
  versionesPorModelo,
} from "@/data/catalogs";
import VehicleImage from "@/components/VehicleImage";
import {
  getStoredListings,
  imageFileToStoredDataUrl,
  upsertListing,
  type ManagedVehicle,
} from "@/utils/listings";
import { sanitizeManagedVehicle } from "@/utils/listingSanitizer";
import { fetchRemoteListings, updateRemoteListing } from "@/utils/listingsRemote";

type PreviewImage = {
  id: string;
  name: string;
  url: string;
};

type AdminVehicleEditClientProps = {
  vehicleId: string;
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, index) => String(currentYear - index)
);
const kilometerOptions = Array.from(
  { length: 500000 / 500 + 1 },
  (_, index) => String(index * 500)
);
const priceOptions = [
  "1000000",
  ...Array.from({ length: 998 }, (_, index) => String(1500000 + index * 500000)),
];

const advancedLabels: Record<string, string> = {
  aireAcondicionado: "Aire acondicionado",
  traccion: "Tracción",
  techoPanoramico: "Techo panorámico",
  airbags: "Airbags",
  frenosABS: "Frenos ABS",
  asistenteEstacionamiento: "Asistente de estacionamiento",
  sensoresEstacionamiento: "Sensores de estacionamiento",
  camaraReversa: "Cámara de reversa",
  controlCrucero: "Control crucero",
  controlEstabilidad: "Control de estabilidad",
  navegadorGPS: "Navegador GPS",
  tapizado: "Tapizado",
  climatizador: "Climatizador",
  llantasAleacion: "Llantas de aleación",
  alarma: "Alarma",
  cierreCentralizado: "Cierre centralizado",
  levantavidriosElectricos: "Levantavidrios eléctricos",
  direccionAsistida: "Dirección asistida",
};

const optionLabels: Record<string, string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  deleted: "Borrado",
};

function SelectField({
  label,
  name,
  values,
  defaultValue,
  required = false,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  name: string;
  values: string[];
  defaultValue?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      <select
        name={name}
        required={required}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="">Seleccionar</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {name === "price"
              ? `$ ${Number(item).toLocaleString("es-AR")}`
              : optionLabels[item] || item}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
      />
    </label>
  );
}

export default function AdminVehicleEditClient({
  vehicleId,
}: AdminVehicleEditClientProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ManagedVehicle | null>(null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      const localListings = getStoredListings();

      try {
        const remoteListings = process.env.NEXT_PUBLIC_SUPABASE_URL
          ? await fetchRemoteListings()
          : [];
        const mergedListings = Array.from(
          new Map(
            [...localListings, ...remoteListings].map((item) => [item.id, item])
          ).values()
        );
        const storedListing = mergedListings.find((item) => item.id === vehicleId);
        const sanitizedListing = storedListing
          ? sanitizeManagedVehicle(storedListing)
          : null;

        if (cancelled) return;

        setListing(sanitizedListing);
        setSelectedBrand(sanitizedListing?.brand || "");
        setSelectedModel(sanitizedListing?.model || "");
        setPreviewImages(
          (sanitizedListing?.images || []).map((image, index) => ({
            id: `${sanitizedListing?.id || "image"}-${index}`,
            name: `Imagen ${index + 1}`,
            url: image,
          }))
        );
      } catch {
        const storedListing = localListings.find((item) => item.id === vehicleId);
        const sanitizedListing = storedListing
          ? sanitizeManagedVehicle(storedListing)
          : null;

        if (cancelled) return;

        setListing(sanitizedListing);
        setSelectedBrand(sanitizedListing?.brand || "");
        setSelectedModel(sanitizedListing?.model || "");
        setPreviewImages(
          (sanitizedListing?.images || []).map((image, index) => ({
            id: `${sanitizedListing?.id || "image"}-${index}`,
            name: `Imagen ${index + 1}`,
            url: image,
          }))
        );
      } finally {
        if (!cancelled) setIsLoadingListing(false);
      }
    }

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  function setEditableListing(nextListing: ManagedVehicle | null) {
    setListing(nextListing);
    setSelectedBrand(nextListing?.brand || "");
    setSelectedModel(nextListing?.model || "");
      setPreviewImages(
        (nextListing?.images || []).map((image, index) => ({
          id: `${nextListing?.id || "image"}-${index}`,
          name: `Imagen ${index + 1}`,
          url: image,
        }))
      );
  }

  const modelosFiltrados = useMemo(
    () => (selectedBrand ? modelosArgentina[selectedBrand] || [] : []),
    [selectedBrand]
  );
  const versionesFiltradas = useMemo(
    () => (selectedModel ? versionesPorModelo[selectedModel] || [] : []),
    [selectedModel]
  );

  function ensureOption(options: string[], currentValue: string) {
    if (!currentValue || options.includes(currentValue)) return options;
    return [currentValue, ...options];
  }

  async function saveVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listing) return;
    if (isUploadingImages) {
      setFormError("Esperá a que terminen de cargarse las fotos antes de guardar.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const publicationStatus = String(
      formData.get("publicationStatus") || listing.publicationStatus
    ) as ManagedVehicle["publicationStatus"];

    try {
      const updatedListing: ManagedVehicle = {
        ...listing,
        brand: String(formData.get("brand") || ""),
        model: String(formData.get("model") || ""),
        version: String(formData.get("version") || ""),
        year: Number(formData.get("year") || 0),
        price: Number(formData.get("price") || 0),
        kilometers: Number(formData.get("kilometers") || 0),
        color: String(formData.get("color") || ""),
        doors: Number(formData.get("doors") || 0),
        owners: Number(formData.get("owners") || 0),
        fuel: String(formData.get("fuel") || ""),
        transmission: String(formData.get("transmission") || ""),
        province: String(formData.get("province") || ""),
        city: String(formData.get("city") || ""),
        location: String(formData.get("location") || ""),
        description: String(formData.get("description") || ""),
        airConditioning: String(formData.get("aireAcondicionado") || ""),
        estado: String(formData.get("estado") || ""),
        inspeccionTecnica: String(formData.get("inspeccionTecnica") || ""),
        vendedor: String(formData.get("vendedor") || ""),
        garantia: String(formData.get("garantia") || ""),
        traccion: String(formData.get("traccion") || ""),
        techoPanoramico: String(formData.get("techoPanoramico") || ""),
        airbags: String(formData.get("airbags") || ""),
        frenosABS: String(formData.get("frenosABS") || ""),
        asistenteEstacionamiento: String(
          formData.get("asistenteEstacionamiento") || ""
        ),
        sensoresEstacionamiento: String(
          formData.get("sensoresEstacionamiento") || ""
        ),
        camaraReversa: String(formData.get("camaraReversa") || ""),
        controlCrucero: String(formData.get("controlCrucero") || ""),
        controlEstabilidad: String(formData.get("controlEstabilidad") || ""),
        navegadorGPS: String(formData.get("navegadorGPS") || ""),
        tapizado: String(formData.get("tapizado") || ""),
        climatizador: String(formData.get("climatizador") || ""),
        llantasAleacion: String(formData.get("llantasAleacion") || ""),
        alarma: String(formData.get("alarma") || ""),
        cierreCentralizado: String(formData.get("cierreCentralizado") || ""),
        levantavidriosElectricos: String(
          formData.get("levantavidriosElectricos") || ""
        ),
        direccionAsistida: String(formData.get("direccionAsistida") || ""),
        ownerEmail: String(formData.get("ownerEmail") || ""),
        contactName: String(formData.get("contactName") || ""),
        contactPhone: String(formData.get("contactPhone") || ""),
        contactEmail: String(formData.get("contactEmail") || ""),
        contact: [
          String(formData.get("contactName") || ""),
          String(formData.get("contactPhone") || ""),
          String(formData.get("contactEmail") || ""),
        ].filter(Boolean).join(" · "),
        publicationStatus,
        approvedAt:
          publicationStatus === "approved"
            ? listing.approvedAt || new Date().toISOString()
            : listing.approvedAt,
        images:
          previewImages.length > 0
            ? previewImages.map((image) => image.url)
            : ["/placeholder-car.svg"],
        updatedAt: new Date().toISOString(),
      };

      upsertListing(updatedListing);
      setEditableListing(updatedListing);

      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await updateRemoteListing(updatedListing);
      }

      router.refresh();
      router.push(`/admin/autos/${encodeURIComponent(listing.id)}`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el vehículo."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (/^base-\d+$/.test(vehicleId)) {
    return (
      <section>
        <Link
          href={`/admin/autos/${encodeURIComponent(vehicleId)}`}
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700"
        >
          Volver a la ficha
        </Link>
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-black">Este vehículo no es editable</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Los vehículos de la base importada se editan modificando la base de
            datos local o el CSV de origen.
          </p>
        </div>
      </section>
    );
  }

  if (isLoadingListing) {
    return (
      <section>
        <Link
          href="/admin/autos"
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700"
        >
          Volver al inventario
        </Link>
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-black">Cargando ficha de edición...</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Estamos leyendo los datos completos desde la base.
          </p>
        </div>
      </section>
    );
  }

  if (!listing) {
    return (
      <section>
        <Link
          href="/admin/autos"
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700"
        >
          Volver al inventario
        </Link>
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <h2 className="text-2xl font-black">Anuncio no encontrado</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            No se encontró una publicación editable con ese identificador.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
            Inventario
          </p>
          <h2 className="text-3xl font-black text-white">Editar vehículo</h2>
          <p className="mt-2 text-white/65">
            {listing.brand} {listing.model} · {listing.version}
          </p>
        </div>
        <Link
          href={`/admin/autos/${encodeURIComponent(listing.id)}`}
          className="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Volver a la ficha
        </Link>
      </div>

      {formError && (
        <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {formError}
        </div>
      )}

      <form onSubmit={saveVehicle} className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-5 xl:col-span-8">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-4 text-lg font-black">Información básica</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SelectField
                label="Marca"
                name="brand"
                values={marcasArgentina}
                required
                value={selectedBrand}
                onChange={(value) => {
                  setSelectedBrand(value);
                  setSelectedModel("");
                }}
              />
              <SelectField
                label="Modelo"
                name="model"
                values={ensureOption(modelosFiltrados, listing.model)}
                required
                value={selectedModel}
                disabled={!selectedBrand}
                onChange={(value) => setSelectedModel(value)}
              />
              <SelectField
                label="Versión"
                name="version"
                values={ensureOption(versionesFiltradas, listing.version)}
                defaultValue={listing.version}
                required
                disabled={!selectedModel}
              />
              <SelectField
                label="Año"
                name="year"
                values={ensureOption(yearOptions, String(listing.year))}
                defaultValue={String(listing.year)}
                required
              />
              <SelectField
                label="Precio"
                name="price"
                values={ensureOption(priceOptions, String(listing.price))}
                defaultValue={String(listing.price)}
                required
              />
              <SelectField
                label="Kilómetros"
                name="kilometers"
                values={ensureOption(kilometerOptions, String(listing.kilometers))}
                defaultValue={String(listing.kilometers)}
                required
              />
              <SelectField
                label="Combustible"
                name="fuel"
                values={ensureOption(combustiblesArgentina, listing.fuel)}
                defaultValue={listing.fuel}
                required
              />
              <SelectField
                label="Transmisión"
                name="transmission"
                values={ensureOption(transmisionesArgentina, listing.transmission)}
                defaultValue={listing.transmission}
                required
              />
              <SelectField
                label="Provincia"
                name="province"
                values={ensureOption(provinciasArgentina, listing.province)}
                defaultValue={listing.province}
                required
              />
              <TextField label="Ciudad" name="city" defaultValue={listing.city} required />
              <TextField
                label="Ubicación exacta"
                name="location"
                defaultValue={listing.location}
              />
              <SelectField
                label="Color"
                name="color"
                values={ensureOption(coloresAutomotor, listing.color)}
                defaultValue={listing.color}
                required
              />
              <TextField label="Puertas" name="doors" type="number" defaultValue={listing.doors} />
              <TextField label="Dueños" name="owners" type="number" defaultValue={listing.owners} />
              <label className="block md:col-span-3">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  Descripción
                </span>
                <textarea
                  name="description"
                  defaultValue={listing.description || ""}
                  maxLength={700}
                  className="min-h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-4 text-lg font-black">Contacto y estado</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TextField
                label="Email titular"
                name="ownerEmail"
                type="email"
                defaultValue={listing.ownerEmail}
              />
              <TextField
                label="Nombre de contacto visible"
                name="contactName"
                defaultValue={listing.contactName || listing.contact}
                required
              />
              <TextField
                label="WhatsApp o teléfono visible"
                name="contactPhone"
                defaultValue={listing.contactPhone}
                required
              />
              <TextField
                label="Email visible"
                name="contactEmail"
                type="email"
                defaultValue={listing.contactEmail}
              />
              <SelectField
                label="Estado publicación"
                name="publicationStatus"
                values={["approved", "pending"]}
                defaultValue={listing.publicationStatus}
                required
              />
              <SelectField
                label="Vendedor"
                name="vendedor"
                values={ensureOption(opcionesAvanzadas.vendedor, listing.vendedor || "")}
                defaultValue={listing.vendedor}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-4 text-lg font-black">Información adicional</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <SelectField
                label="Estado"
                name="estado"
                values={ensureOption(opcionesAvanzadas.estado, listing.estado || "")}
                defaultValue={listing.estado}
              />
              <TextField
                label="Inspección técnica"
                name="inspeccionTecnica"
                type="date"
                defaultValue={listing.inspeccionTecnica}
              />
              <SelectField
                label="Garantía"
                name="garantia"
                values={ensureOption(opcionesAvanzadas.garantia, listing.garantia || "")}
                defaultValue={listing.garantia}
              />
              <SelectField
                label="Aire acondicionado"
                name="aireAcondicionado"
                values={ensureOption(
                  opcionesAvanzadas.aireAcondicionado,
                  listing.airConditioning || ""
                )}
                defaultValue={listing.airConditioning}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-4 text-lg font-black">Opciones avanzadas</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Object.entries(opcionesAvanzadas)
                .filter(
                  ([key]) =>
                    ![
                      "aireAcondicionado",
                      "estado",
                      "vendedor",
                      "garantia",
                    ].includes(key)
                )
                .map(([key, values]) => (
                  <SelectField
                    key={key}
                    label={advancedLabels[key] || key}
                    name={key}
                    values={ensureOption(
                      values,
                      String(listing[key as keyof ManagedVehicle] || "")
                    )}
                    defaultValue={String(listing[key as keyof ManagedVehicle] || "")}
                  />
                ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploadingImages || isSaving}
              className="rounded-xl bg-[#063b75] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#052f5f] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isUploadingImages
                ? "Cargando fotos..."
                : isSaving
                  ? "Guardando..."
                  : "Guardar cambios"}
            </button>
          </div>
        </div>

        <aside className="col-span-12 space-y-4 xl:col-span-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="text-lg font-black">Fotos del vehículo</h3>
            <p className="mt-2 text-sm text-gray-500">
              Podés conservar, quitar o agregar fotos. La primera será la
              principal.
            </p>
            <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#063b75]/40 bg-[#eef4fb] px-4 text-center text-sm text-gray-600 transition hover:bg-[#e4edf8]">
              <span className="text-base font-black text-[#063b75]">
                Agregar imágenes
              </span>
              <span className="mt-2">JPG, PNG, WebP</span>
              {isUploadingImages && (
                <span className="mt-2 font-semibold text-[#063b75]">
                  Cargando fotos...
                </span>
              )}
              <input
                type="file"
                multiple
                accept=".jpg,.png,.webp"
                className="sr-only"
                disabled={isUploadingImages}
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const files = input.files;
                  if (!files) return;
                  setIsUploadingImages(true);

                  try {
                    const selectedImages = await Promise.all(
                      Array.from(files).map(async (file) => ({
                        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
                        name: file.name,
                        url: await imageFileToStoredDataUrl(file),
                      }))
                    );

                    setPreviewImages((currentImages) =>
                      [...currentImages, ...selectedImages].slice(0, 10)
                    );
                  } catch (error) {
                    setFormError(
                      error instanceof Error
                        ? error.message
                        : "No se pudieron cargar las fotos."
                    );
                  } finally {
                    input.value = "";
                    setIsUploadingImages(false);
                  }
                }}
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {previewImages.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() =>
                    setPreviewImages((currentImages) =>
                      currentImages.filter((item) => item.id !== image.id)
                    )
                  }
                  className="group relative h-28 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
                  title={`Quitar ${image.name}`}
                >
                  <VehicleImage
                    src={image.url}
                    alt={image.name}
                    sizes="180px"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-black text-white opacity-0 transition group-hover:opacity-100">
                    Quitar
                  </span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </form>
    </section>
  );
}
