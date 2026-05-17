"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/types/vehicle";
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
import {
  createListingId,
  hashPassword,
  imageFileToStoredDataUrl,
  upsertListing,
  type ManagedVehicle,
} from "@/utils/listings";
import { upsertRemoteListing } from "@/utils/listingsRemote";

type AutoFormData = Vehicle & {
  doors: number;
  owners: number;
  location: string;
  description: string;
  airConditioning: string;
  estado: string;
  inspeccionTecnica: string;
  vendedor: string;
  garantia: string;
  traccion: string;
  techoPanoramico: string;
  airbags: string;
  frenosABS: string;
  asistenteEstacionamiento: string;
  sensoresEstacionamiento: string;
  camaraReversa: string;
  controlCrucero: string;
  controlEstabilidad: string;
  navegadorGPS: string;
  tapizado: string;
  climatizador: string;
  llantasAleacion: string;
  alarma: string;
  cierreCentralizado: string;
  levantavidriosElectricos: string;
  direccionAsistida: string;
};

type PreviewImage = {
  id: string;
  name: string;
  url: string;
};

const labelMap: Record<string, string> = {
  aireAcondicionado: "Aire acondicionado",
  estado: "Estado",
  vendedor: "Vendedor",
  garantia: "Garantía",
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
const supabaseIsConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

function SelectField({
  label,
  name,
  values,
  required = false,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  name: string;
  values: string[];
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
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="">Seleccionar</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {name === "price" ? `$ ${Number(item).toLocaleString("es-AR")}` : item}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
      />
    </label>
  );
}

export default function NuevoAutoPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState("");
  const [formError, setFormError] = useState("");
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const modelosFiltrados = useMemo(
    () => (selectedBrand ? modelosArgentina[selectedBrand] || [] : []),
    [selectedBrand]
  );
  const versionesFiltradas = useMemo(
    () => (selectedModel ? versionesPorModelo[selectedModel] || [] : []),
    [selectedModel]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intent = submitter?.value === "draft" ? "pending" : "approved";
    const ownerEmail = String(formData.get("ownerEmail") || "");
    const securityPassword = String(formData.get("securityPassword") || "");
    const securityPasswordConfirm = String(
      formData.get("securityPasswordConfirm") || ""
    );

    setFormError("");

    if (
      (securityPassword || securityPasswordConfirm) &&
      securityPassword !== securityPasswordConfirm
    ) {
      setFormError("Las contraseñas de gestión no coinciden.");
      return;
    }

    if (securityPassword && securityPassword.length < 8) {
      setFormError("La contraseña de gestión debe tener al menos 8 caracteres.");
      return;
    }

    const auto: AutoFormData & ManagedVehicle = {
      id: createListingId(),
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
      score: 0,
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
      images:
        previewImages.length > 0
          ? previewImages.map((image) => image.url)
          : ["/placeholder-car.svg"],
      ownerEmail,
      contactName: String(formData.get("contactName") || ""),
      contactPhone: String(formData.get("contactPhone") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      contact: [
        String(formData.get("contactName") || ""),
        String(formData.get("contactPhone") || ""),
        String(formData.get("contactEmail") || ""),
      ].filter(Boolean).join(" · "),
      ownerPasswordHash: await hashPassword(
        securityPassword || crypto.randomUUID()
      ),
      editToken: crypto.randomUUID(),
      publicationStatus: intent,
      createdAt: new Date().toISOString(),
      approvedAt: intent === "approved" ? new Date().toISOString() : undefined,
    };

    try {
      if (supabaseIsConfigured) {
        await upsertRemoteListing(auto);
      }

      upsertListing(auto);
      setResultado(JSON.stringify(auto, null, 2));
      router.push("/admin/autos");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el vehículo."
      );
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
            Inventario
          </p>
          <h2 className="text-3xl font-black text-white">Nuevo vehículo</h2>
          <p className="mt-2 text-white/65">
            Cargá los datos principales, imágenes y equipamiento del auto.
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#fff4bf] px-4 py-2 text-sm font-black text-[#7a6100]">
          Alta directa
        </span>
      </div>

      {formError && (
        <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-5 xl:col-span-8">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-black">Información básica</h3>
              <p className="text-sm text-gray-500">
                <span className="font-black text-red-600">*</span>{" "}
                obligatorio
              </p>
            </div>

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
                values={modelosFiltrados}
                required
                value={selectedModel}
                disabled={!selectedBrand}
                onChange={(value) => setSelectedModel(value)}
              />
              <SelectField
                label="Versión"
                name="version"
                values={versionesFiltradas}
                required
                disabled={!selectedModel}
              />

              <SelectField
                label="Año"
                name="year"
                values={yearOptions}
                required
              />
              <SelectField
                label="Precio"
                name="price"
                values={priceOptions}
                required
              />
              <SelectField
                label="Kilómetros"
                name="kilometers"
                values={kilometerOptions}
                required
              />

              <SelectField
                label="Combustible"
                name="fuel"
                values={combustiblesArgentina}
                required
              />
              <SelectField
                label="Transmisión"
                name="transmission"
                values={transmisionesArgentina}
                required
              />
              <SelectField
                label="Provincia"
                name="province"
                values={provinciasArgentina}
                required
              />

              <TextField
                label="Ciudad"
                name="city"
                placeholder="Ej: Buenos Aires"
                required
              />
              <TextField
                label="Ubicación exacta"
                name="location"
                placeholder="Ej: Palermo"
                required
              />
              <SelectField
                label="Color"
                name="color"
                values={coloresAutomotor}
                required
              />
              <TextField
                label="Puertas"
                name="doors"
                type="number"
                placeholder="Ej: 4"
                required
              />
              <TextField
                label="Dueños"
                name="owners"
                type="number"
                placeholder="Ej: 1"
                required
              />
              <input type="hidden" name="score" value="0" />

              <label className="block md:col-span-3">
                <span className="mb-1 block text-sm font-bold text-gray-700">
                  Descripción <span className="ml-1 text-red-600">*</span>
                </span>
                <textarea
                  name="description"
                  required
                  maxLength={500}
                  placeholder="Agregá detalles adicionales del vehículo..."
                  className="min-h-28 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                />
                <p className="mt-1 text-right text-xs text-gray-500">
                  Máx. 500 caracteres
                </p>
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-4 text-lg font-black">Contacto y seguridad</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TextField
                label="Email del titular"
                name="ownerEmail"
                type="email"
                placeholder="titular@email.com"
              />
              <TextField
                label="Nombre de contacto visible"
                name="contactName"
                placeholder="Ej: Juan Pérez"
                required
              />
              <TextField
                label="WhatsApp o teléfono visible"
                name="contactPhone"
                type="tel"
                placeholder="Ej: +54 9 11 1234-5678"
                required
              />
              <TextField
                label="Email visible"
                name="contactEmail"
                type="email"
                placeholder="Opcional"
              />
              <TextField
                label="Contraseña de gestión"
                name="securityPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
              />
              <TextField
                label="Repetir contraseña"
                name="securityPasswordConfirm"
                type="password"
                placeholder="Confirmación"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-4 text-lg font-black">Información adicional</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <SelectField
                label="Aire acondicionado"
                name="aireAcondicionado"
                values={opcionesAvanzadas.aireAcondicionado}
                required
              />
              <SelectField
                label="Estado"
                name="estado"
                values={opcionesAvanzadas.estado}
                required
              />
              <TextField
                label="Inspección técnica"
                name="inspeccionTecnica"
                type="date"
                required
              />
              <SelectField
                label="Vendedor"
                name="vendedor"
                values={opcionesAvanzadas.vendedor}
                required
              />
              <SelectField
                label="Garantía"
                name="garantia"
                values={opcionesAvanzadas.garantia}
                required
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
                    label={labelMap[key] || key}
                    name={key}
                    values={values}
                  />
                ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <button
              type="reset"
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Limpiar formulario
            </button>
            <div className="flex flex-col gap-3 md:flex-row">
              <button
                type="submit"
                name="intent"
                value="draft"
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Guardar borrador
              </button>
              <button
                type="submit"
                name="intent"
                value="publish"
                className="rounded-xl bg-[#063b75] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#052f5f]"
              >
                Publicar vehículo
              </button>
            </div>
          </div>
        </div>

        <aside className="col-span-12 space-y-4 xl:col-span-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="text-lg font-black">Imágenes del vehículo</h3>
            <p className="mt-2 text-sm text-gray-500">
              Subí entre 1 y 10 imágenes. La primera será la principal.
            </p>

            <label className="mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#063b75]/40 bg-[#eef4fb] px-4 text-center text-sm text-gray-600 transition hover:bg-[#e4edf8]">
              <span className="text-base font-black text-[#063b75]">
                Seleccionar imágenes
              </span>
              <span className="mt-2">Formatos: JPG, PNG, WebP</span>
              <span>Máx. 5MB por imagen</span>
              <input
                type="file"
                multiple
                accept=".jpg,.png,.webp"
                className="sr-only"
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const files = input.files;
                  if (!files) return;
                  const selectedImages = await Promise.all(
                    Array.from(files).map(async (file) => ({
                      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
                      name: file.name,
                      url: await imageFileToStoredDataUrl(file),
                    }))
                  );

                  setPreviewImages((currentImages) => [
                    ...currentImages,
                    ...selectedImages,
                  ].slice(0, 10));
                  input.value = "";
                }}
              />
            </label>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, index) => {
                const image = previewImages[index];

                return (
                <button
                  type="button"
                  key={index}
                  onClick={() => {
                    if (!image) return;
                    setPreviewImages((currentImages) =>
                      currentImages.filter((item) => item.id !== image.id)
                    );
                  }}
                  className="relative h-14 rounded-lg border border-gray-200 bg-gray-100 bg-cover bg-center"
                  style={{
                    backgroundImage: image
                      ? `url(${image.url})`
                      : undefined,
                  }}
                  title={image ? `Quitar ${image.name}` : "Espacio disponible"}
                >
                  {image && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs font-black text-white">
                      ×
                    </span>
                  )}
                </button>
                );
              })}
            </div>

            <p className="mt-3 text-sm text-gray-500">
              {previewImages.length} / 10 imágenes
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 className="text-lg font-black">Consejos</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Cargá imágenes claras y de buena calidad.</li>
              <li>Mostrá el auto desde varios ángulos.</li>
              <li>Incluí detalles del interior y tablero.</li>
              <li>Verificá que los datos obligatorios estén completos.</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Estado</h3>
              <span className="rounded-lg bg-[#fff4bf] px-3 py-1 text-xs font-black text-[#7a6100]">
                LISTO
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Publicar vehículo lo guarda como aprobado y lo muestra en el
              inventario y en el buscador público.
            </p>
          </section>
        </aside>
      </form>

      {resultado && (
        <pre className="mt-6 overflow-auto rounded-2xl bg-[#0b1f33] p-4 text-sm text-white">
          {resultado}
        </pre>
      )}
    </section>
  );
}
