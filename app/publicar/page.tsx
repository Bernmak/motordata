"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

type PreviewImage = {
  id: string;
  name: string;
  url: string;
};

const labelMap: Record<string, string> = {
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const supabaseIsConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

const requiredFieldLabels: Record<string, string> = {
  brand: "Marca",
  model: "Modelo",
  version: "Versión",
  year: "Año",
  price: "Precio pretendido",
  kilometers: "Kilómetros",
  fuel: "Combustible",
  transmission: "Transmisión",
  province: "Provincia",
  city: "Ciudad",
  location: "Ubicación exacta",
  color: "Color",
  description: "Descripción",
  ownerEmail: "Email para recibir aprobación",
  contactName: "Nombre de contacto visible",
  contactPhone: "WhatsApp o teléfono visible",
  securityPassword: "Contraseña de seguridad",
  securityPasswordConfirm: "Repetir contraseña",
  estado: "Estado",
  vendedor: "Vendedor",
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
      {required && <span className="text-red-600">*</span>}
      <span>{label}</span>
    </span>
  );
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getMissingRequiredField(form: HTMLFormElement) {
  const requiredFields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input[required], select[required], textarea[required]"
    )
  );

  return requiredFields.find((field) => !field.disabled && !field.value.trim());
}

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
      <FieldLabel label={label} required={required} />
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
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`.trim()}>
      <FieldLabel label={label} required={required} />
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

export default function PublicarVehiculoPage() {
 const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
const [selectedBrand, setSelectedBrand] = useState("");
const [selectedModel, setSelectedModel] = useState("");
const [sent, setSent] = useState(false);
const [formError, setFormError] = useState("");
const [shareMessage, setShareMessage] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormError("");

    const form = event.currentTarget;
    const missingField = getMissingRequiredField(form);

    if (missingField) {
      const label = requiredFieldLabels[missingField.name] || "un campo obligatorio";
      setFormError(`Completá el campo obligatorio: ${label}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      missingField.focus();
      return;
    }

    const formData = new FormData(form);
    const password = String(formData.get("securityPassword") || "");
    const passwordConfirm = String(formData.get("securityPasswordConfirm") || "");
    const ownerEmail = String(formData.get("ownerEmail") || "").trim();
    const contactName = String(formData.get("contactName") || "").trim();
    const contactPhone = String(formData.get("contactPhone") || "").trim();
    const contactEmail = String(formData.get("contactEmail") || "").trim();
    const contactPhoneDigits = normalizePhone(contactPhone);

    if (password.length < 8) {
      setFormError("La contraseña de seguridad debe tener al menos 8 caracteres.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (password !== passwordConfirm) {
      setFormError("Las contraseñas de seguridad no coinciden.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!contactName) {
      setFormError("Ingresá el nombre de contacto visible.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (contactPhoneDigits.length < 8) {
      setFormError("Ingresá un teléfono o WhatsApp válido para el contacto visible.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

   if (!emailPattern.test(ownerEmail)) {
  setFormError("Ingresá un email válido para recibir la aprobación.");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}

   if (contactEmail && !emailPattern.test(contactEmail)) {
  setFormError("Ingresá un email visible válido o dejalo vacío.");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}

if (previewImages.length === 0) {
  setFormError("Subí al menos una foto del vehículo. La imagen es obligatoria para publicar.");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}
      setIsSubmitting(true);
    const listing: ManagedVehicle = {
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
estado: String(formData.get("estado") || ""),
vendedor: String(formData.get("vendedor") || ""),
garantia: String(formData.get("garantia") || ""),
inspeccionTecnica: String(formData.get("inspeccionTecnica") || ""),
traccion: String(formData.get("traccion") || ""),
score: 1,
      images:
        previewImages.length > 0
          ? previewImages.map((image) => image.url)
          : ["/placeholder-car.svg"],
      airConditioning: String(formData.get("aireAcondicionado") || ""),
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
      contactName,
      contactPhone,
      contactEmail,
      contact: [contactName, contactPhone, contactEmail].filter(Boolean).join(" · "),
      ownerPasswordHash: await hashPassword(password),
      editToken: crypto.randomUUID(),
      publicationStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      if (supabaseIsConfigured) {
        await upsertRemoteListing(listing);
      }

     upsertListing(listing);
setSent(true);
setShareMessage("");
form.reset();
setPreviewImages([]);
setSelectedBrand("");
setSelectedModel("");
window.scrollTo({ top: 0, behavior: "smooth" });
} catch (error) {
  setFormError(
    error instanceof Error
      ? error.message
      : "No se pudo guardar la solicitud."
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
} finally {
  setIsSubmitting(false);
}
  }

  async function shareMotordata() {
    const shareUrl = `${window.location.origin}/vender`;
    const shareData = {
      title: "Motordata",
      text: "Publicá o encontrá vehículos en Motordata.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Gracias por compartir Motordata.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Copiamos el enlace para compartir.");
    } catch {
      setShareMessage("No se pudo compartir automáticamente. Probá copiar el enlace desde el navegador.");
    }
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
              Publicá tu vehículo
            </h1>
            <p className="mt-2 w-fit rounded-full bg-[#fff4bf] px-3 py-1 text-sm font-black text-[#7a6100]">
              Publicación gratis por lanzamiento
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Volver al buscador
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {sent && (
          <div className="mb-6 rounded-2xl bg-[#e8f7ef] p-5 text-[#0f5132] ring-1 ring-emerald-200">
            <h2 className="text-xl font-semibold">Solicitud recibida</h2>
            <p className="mt-2 text-sm leading-6">
              Tu vehículo quedó pendiente de revisión. La administración lo
              validará antes de incorporarlo a la plataforma. Si se aprueba,
              vas a recibir un email con el enlace para editar o borrar el
              anuncio.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={shareMotordata}
               className="w-fit rounded-xl bg-[#063b75] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#052f5f]"
              >
                Compartir publicación
              </button>
              {shareMessage && (
                <p className="text-sm font-semibold text-[#0f5132]">
                  {shareMessage}
                </p>
              )}
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl bg-[#063b75] text-white shadow-lg ring-1 ring-emerald-200">
              <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f5c400]">
                    Lanzamiento Motordata
                  </p>
                  <h3 className="mt-2 text-2xl font-black leading-tight">
                    Publicación gratis por tiempo limitado
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                    Tu anuncio entra a revisión sin costo. Cuando esté aprobado,
                    va a poder aparecer en el buscador público y vas a recibir el
                    enlace para editarlo o borrarlo.
                  </p>
                </div>
                <div className="flex items-center justify-center bg-[#f5c400] px-6 py-5 text-center text-[#0b1f33]">
                  <div>
                    <p className="text-4xl font-black">$0</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-wide">
                      Ahora
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {formError && (
          <div className="mb-6 rounded-2xl bg-red-50 p-5 text-red-700 ring-1 ring-red-200">
            {formError}
          </div>
        )}

        <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-stretch">
          <div>
           <p className="text-sm font-medium uppercase tracking-wide text-[#f5c400]">
              Venta particular
            </p>
            <h2 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-white">
              Cargá los datos y fotos del auto.
            </h2>
            <p className="mt-3 w-fit rounded-full bg-[#f5c400] px-4 py-2 text-sm font-medium text-[#0b1f33]">
              Publicación gratis por lanzamiento
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/75">
              Tu anuncio pasa por revisión antes de aparecer en el buscador.
            </p>
          </div>

          <section
            id="gratis-lanzamiento"
            className="overflow-hidden rounded-2xl bg-[#063b75] text-white shadow-lg"
          >
            <div className="grid h-full sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col justify-center p-5 pt-3">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f5c400]">
                  Lanzamiento Motordata
                </p>
                <h3 className="mt-2 text-[1.7rem] font-black leading-[1.05]">
                  Publicá gratis por tiempo limitado
                </h3>
                <p className="mt-2 text-base leading-6 text-blue-100">
                  La carga, revisión y publicación inicial no tienen costo.
                  Más adelante sumaremos opciones destacadas.
                </p>
              </div>
              <div className="flex flex-col justify-center bg-[#f5c400] px-6 py-4 text-[#0b1f33]">
                <span className="text-sm font-black uppercase tracking-wide">
                  Costo actual
                </span>
                <span className="text-[2.7rem] font-black leading-none">$0</span>
              </div>
            </div>
          </section>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-12 gap-5">
          <div className="col-span-12 space-y-5 xl:col-span-8">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold">Información básica</h3>
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
                  label="Precio pretendido"
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
                <TextField label="Ciudad" name="city" required />
              <TextField label="Ubicación exacta" name="location" required />
                <SelectField
                  label="Color"
                  name="color"
                  values={coloresAutomotor}
                  required
                />
                <TextField label="Puertas" name="doors" type="number" />
                <TextField label="Dueños" name="owners" type="number" />

                <label className="block md:col-span-3">
                  <FieldLabel label="Descripción" required />
                  <textarea
                    name="description"
                    required
                    maxLength={700}
                    placeholder="Estado general, mantenimiento, detalles a destacar..."
                    className="min-h-36 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">
                    Máx. 700 caracteres
                  </p>
                </label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-4 text-lg font-semibold">Contacto y seguridad</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  label="Email para recibir aprobación"
                  name="ownerEmail"
                  type="email"
                  required
                  className="md:col-span-1"
                />
                <TextField
                  label="Nombre de contacto visible"
                  name="contactName"
                  placeholder="Ej: Juan Pérez"
                  required
                  className="md:col-span-1"
                />
                <TextField
                  label="WhatsApp o teléfono visible"
                  name="contactPhone"
                  type="tel"
                  placeholder="Ej: +54 9 11 1234-5678"
                  required
                  className="md:col-span-1"
                />
                <TextField
                  label="Email visible para interesados"
                  name="contactEmail"
                  type="email"
                  placeholder="Opcional"
                  className="md:col-span-1"
                />
                <TextField
                  label="Contraseña de seguridad"
                  name="securityPassword"
                  type="password"
                  required
                  className="md:col-span-1"
                />
                <TextField
                  label="Repetir contraseña"
                  name="securityPasswordConfirm"
                  type="password"
                  required
                  className="md:col-span-1"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                El nombre, teléfono/WhatsApp y email visible se mostrarán en la
                ficha pública para que los interesados puedan contactar al propietario.
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-red-600">
                Guardá esta contraseña. Se pedirá para modificar o borrar el
                anuncio desde el enlace enviado por email.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-4 text-lg font-semibold">
                Información adicional
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-4 text-lg font-semibold">
                Equipamiento avanzado
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {Object.entries(opcionesAvanzadas)
                  .filter(([key]) => !["estado", "vendedor", "garantia"].includes(key))
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

          </div>

          <aside className="col-span-12 space-y-4 xl:col-span-4">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold">Fotos del vehículo</h3>
              <p className="mt-2 text-sm text-gray-500">
                Subí entre 1 y 10 fotos. La primera será la imagen principal.
              </p>

              <label className="mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#063b75]/40 bg-[#eef4fb] px-4 text-center text-sm text-gray-600 transition hover:bg-[#e4edf8]">
                <span className="text-base font-semibold text-[#063b75]">
                  Seleccionar imágenes
                </span>
                <span className="mt-2">JPG, JPEG, PNG o WebP</span>
                <input
                  type="file"
                  multiple
                 accept=".jpg,.jpeg,.png,.webp"
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

                    setPreviewImages((currentImages) =>
                      [...currentImages, ...selectedImages].slice(0, 10)
                    );
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
                      title={
                        image ? `Quitar ${image.name}` : "Espacio disponible"
                      }
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
              <h3 className="text-lg font-semibold">Revisión</h3>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                La administración revisará la solicitud antes de publicarla en
                el buscador público.
              </p>
            </section>

          </aside>

          <div className="col-span-12 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="reset"
              onClick={() => {
                setFormError("");
                setPreviewImages([]);
                setSelectedBrand("");
                setSelectedModel("");
              }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                "rounded-xl px-6 py-3 text-sm font-medium text-[#0b1f33] transition",
                isSubmitting
                  ? "cursor-not-allowed bg-gray-300 opacity-70"
                  : "bg-[#f5c400] hover:bg-[#ffd633]",
              ].join(" ")}
            >
              {isSubmitting ? "Enviando..." : "Enviar a revisión"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
