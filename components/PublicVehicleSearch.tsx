"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import VehicleImage from "@/components/VehicleImage";
import {
  coloresAutomotor,
  marcasArgentina,
  modelosArgentina,
  opcionesAvanzadas,
  provinciasArgentina,
  versionesPorModelo,
} from "@/data/catalogs";
import { getScoreLabel } from "@/utils/score";
import { formatDateOnly } from "@/utils/dates";

type Filters = {
  brand: string;
  model: string;
  version: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  kilometersMax: string;
  province: string;
  city: string;
  fuel: string;
  transmission: string;
  color: string;
  estado: string;
  sortBy: string;
};

type PublicVehicleSearchProps = {
  vehicles: Vehicle[];
};

const emptyFilters: Filters = {
  brand: "",
  model: "",
  version: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  kilometersMax: "",
  province: "",
  city: "",
  fuel: "",
  transmission: "",
  color: "",
  estado: "",
  sortBy: "score",
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

const formatPrice = (value: number) => `$ ${value.toLocaleString("es-AR")}`;

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const optionLabels: Record<string, string> = {
  score: "Mejor score",
  priceAsc: "Menor precio",
  priceDesc: "Mayor precio",
  kmAsc: "Menor kilometraje",
  yearDesc: "Año más reciente",
  "Ciudad Autónoma de Buenos Aires": "CABA",
};

const publicFuelOptions = [
  "Nafta",
  "Diesel",
  "Eléctrico",
  "GNC",
  "GNC-Nafta",
  "Híbrido",
];

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const matchesOption = (value: string, filter: string) =>
  !filter || normalize(value) === normalize(filter);

const hasDisplayValue = (value: string | number | undefined | null) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "" &&
  normalize(String(value)) !== "no informado";

const displayValue = (value: string | number | undefined | null) =>
  hasDisplayValue(value) ? String(value) : "";

const displayProvince = (value: string) =>
  normalize(value) === "ciudad autonoma de buenos aires" ? "CABA" : value;

const capitalFederalAliases = new Set([
  "capital",
  "capital federal",
  "caba",
  "ciudad autonoma de buenos aires",
]);

function matchesCity(vehicle: Vehicle, filter: string) {
  const cityFilter = normalize(filter);
  if (!cityFilter) return true;

  if (capitalFederalAliases.has(cityFilter)) {
    return (
      normalize(vehicle.province) === "ciudad autonoma de buenos aires" ||
      normalize(vehicle.city) === "ciudad autonoma de buenos aires" ||
      normalize(vehicle.city) === "capital federal" ||
      normalize(vehicle.city) === "caba"
    );
  }

  return normalize(vehicle.city).includes(cityFilter);
}

const matchesNumber = (
  value: number,
  minFilter: string,
  maxFilter: string
) => {
  const min = minFilter ? Number(minFilter) : undefined;
  const max = maxFilter ? Number(maxFilter) : undefined;

  return (
    (min === undefined || value >= min) && (max === undefined || value <= max)
  );
};

const filterMinOptions = (options: string[], maxValue: string) =>
  maxValue
    ? options.filter((option) => Number(option) <= Number(maxValue))
    : options;

const filterMaxOptions = (options: string[], minValue: string) =>
  minValue
    ? options.filter((option) => Number(option) >= Number(minValue))
    : options;

function SelectField({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  showPlaceholder = true,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  showPlaceholder?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-gray-700">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {showPlaceholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeSelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-gray-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label.toLowerCase().includes("precio")
              ? `$ ${Number(option).toLocaleString("es-AR")}`
              : Number(option).toLocaleString("es-AR")}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-20 flex-col justify-center rounded-xl bg-[#f8fafc] px-4 py-3 ring-1 ring-gray-200">
      <p className="line-clamp-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={[
          "mt-1 text-base font-bold",
          "text-[#0b1f33]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

const tabClass = (active: boolean) =>
  [
    "flex min-h-14 items-center justify-center rounded-2xl px-4 py-3 text-center text-sm font-black leading-tight transition",
    active
      ? "bg-[#ffcc00] text-[#003b70] shadow-sm ring-1 ring-[#e6b800]"
      : "bg-white text-[#003b70] ring-2 ring-[#ffcc00] hover:bg-[#fff7cc]",
  ].join(" ");

function getContactSummary(car: Vehicle) {
  return car.sellerName || car.contactName || car.contact || "";
}

function getContactHref(car: Vehicle) {
  const phoneDigits = (car.whatsapp || car.contactPhone || car.contact || "").replace(
    /\D/g,
    ""
  );

  if (phoneDigits.length > 8) {
    const message = encodeURIComponent(
      "Hola, vi una publicación en la web y quisiera recibir más información."
    );

    return `https://wa.me/${phoneDigits}?text=${message}`;
  }

  const email = car.contactEmail?.trim() || "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return `mailto:${email}`;
  }

  const legacyEmail = car.contact?.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0];
  if (legacyEmail) {
    return `mailto:${legacyEmail}`;
  }

  return undefined;
}

const getScoreBadgeClass = (score: number) => {
  if (score >= 1.08) {
    return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }

  if (score >= 0.95) {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  return "bg-red-100 text-red-800 ring-red-200";
};

const detailPanelClass =
  "mt-4 grid grid-cols-1 content-start gap-3 sm:grid-cols-2 lg:grid-cols-3";

function isSameVehicleIdentity(currentVehicle: Vehicle, nextVehicle: Vehicle) {
  if (currentVehicle.id && nextVehicle.id) {
    return currentVehicle.id === nextVehicle.id;
  }

  return (
    currentVehicle.brand === nextVehicle.brand &&
    currentVehicle.model === nextVehicle.model &&
    currentVehicle.version === nextVehicle.version &&
    currentVehicle.year === nextVehicle.year &&
    currentVehicle.kilometers === nextVehicle.kilometers
  );
}

function getVehicleResultKey(car: Vehicle, index: number) {
  return (
    car.id ||
    [
      car.brand,
      car.model,
      car.version,
      car.year,
      car.price,
      car.kilometers,
      car.province,
      car.city,
      index,
    ].join("|")
  );
}

function VehicleDetailModal({
  car,
  selectedImageIndex,
  onSelectImage,
  onClose,
  openMode,
}: {
  car: Vehicle;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  onClose: () => void;
  openMode: "image" | "detail";
}) {
  const images = Array.from(
  new Set(
    car.images.length > 0
      ? car.images.slice(0, 10)
      : ["/placeholder-car.svg"]
  )
);
  const selectedImage = images[selectedImageIndex] || images[0];
  const contactHref = getContactHref(car);
  const contactSummary = getContactSummary(car);
  const [activeTab, setActiveTab] = useState<
    "basic" | "additional" | "advanced"
  >("basic");
  const detailSectionRef = useRef<HTMLDivElement | null>(null);
  const detailFieldsRef = useRef<HTMLDivElement | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const tabContentRef = useRef<HTMLDivElement | null>(null);
  const advancedCenterLineRef = useRef<HTMLDivElement | null>(null);

  const changeTab = (tab: "basic" | "additional" | "advanced") => {
    setActiveTab(tab);
  };
  useEffect(() => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const scrollContainer = modalScrollRef.current;
      const target =
        openMode === "image" ? detailSectionRef.current : detailFieldsRef.current;

      if (!scrollContainer || !target) return;

      const targetRect = target.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      const targetTop =
        scrollContainer.scrollTop + targetRect.top - containerRect.top - 16;

      scrollContainer.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
    });
  });
}, [openMode, car]);

  useEffect(() => {
  if (activeTab === "basic") return;

  window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const content =
          activeTab === "advanced"
            ? advancedCenterLineRef.current
            : tabContentRef.current;
        const scrollContainer = modalScrollRef.current;

        if (!content || !scrollContainer) return;

        const contentRect = content.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const contentCenter = contentRect.top + contentRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        const liftFromBottom = 122;
        const targetTop =
          scrollContainer.scrollTop +
          contentCenter -
          containerCenter +
          liftFromBottom;

        scrollContainer.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: "smooth",
        });
      });
    });
  }, [activeTab]);

  const showPreviousImage = () => {
    onSelectImage(
      selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
    );
  };

  const showNextImage = () => {
    onSelectImage(
      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2f3742] px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle ${car.brand} ${car.model}`}
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100vh-3rem)] max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#f5c400]">
              Detalle del vehículo
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#0b1f33]">
              {car.brand} {car.model} {car.version}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xl font-medium text-[#0b1f33] transition hover:bg-gray-50"
            aria-label="Cerrar detalle"
          >
            ×
          </button>
        </div>

        <div ref={modalScrollRef} className="overflow-y-auto p-5">
          <div
  ref={detailSectionRef}
  className="relative aspect-[16/9] max-h-[560px] overflow-hidden rounded-2xl bg-white"
>
            <VehicleImage
              src={selectedImage}
              alt={`${car.brand} ${car.model}`}
              sizes="(min-width: 1280px) 1100px, 100vw"
              className="h-full w-full object-cover"
              priority
            />
           {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="group absolute inset-y-0 left-5 z-20 flex w-12 items-center justify-center md:left-8 md:w-14"
                  aria-label="Imagen anterior"
                >
                  <span className="text-8xl font-medium text-[#f5c400] drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]">
  ‹
</span>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="group absolute inset-y-0 right-5 z-20 flex w-12 items-center justify-center md:right-8 md:w-14"
                  aria-label="Imagen siguiente"
                >
                  <span className="text-8xl font-medium text-[#f5c400] drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]">
  ›
</span>
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto rounded-2xl bg-gray-50 p-3">
  {images.map((image, index) => (
    <button
      type="button"
      key={`${image}-${index}`}
      onClick={() => onSelectImage(index)}
      className={[
        "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition",
        selectedImageIndex === index
          ? "ring-[#f5c400]"
          : "ring-transparent hover:ring-gray-300",
      ].join(" ")}
      aria-label={`Ver imagen ${index + 1}`}
    >
      <VehicleImage
        src={image}
        alt={`${car.brand} ${car.model} imagen ${index + 1}`}
        sizes="112px"
        className="h-full w-full object-cover"
      />
    </button>
  ))}
</div>

          <div
            ref={detailFieldsRef}
            className="mt-5 grid items-stretch gap-4 lg:grid-cols-[0.8fr_1.2fr]"
          >
            <div className="flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-gray-200">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#f5c400]">
                Precio publicado
              </p>
              <p className="mt-2 text-4xl font-semibold text-[#0b1f33]">
                {formatPrice(car.price)}
              </p>
              {(hasDisplayValue(car.city) || hasDisplayValue(car.province)) && (
                <p className="mt-3 text-sm font-medium text-gray-600">
                  {[displayValue(car.city), displayProvince(displayValue(car.province))]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-gray-600">
                {car.year} · {car.kilometers.toLocaleString("es-AR")} km ·{" "}
                {car.fuel}
              </p>
              <div
                className={[
                  "mt-4 inline-flex rounded-full px-4 py-2 text-base font-semibold ring-1",
                  getScoreBadgeClass(car.score),
                ].join(" ")}
              >
                {car.score.toFixed(2)} · {getScoreLabel(car.score)}
              </div>
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-[#0b1f33]">
  <p className="font-black">¿Cómo leer el score?</p>
  <p className="mt-1 leading-6">
    El score compara el precio publicado con una referencia estimada. Cuanto más alto,
    mejor oportunidad.
  </p>
  <p className="mt-2 text-xs font-semibold text-slate-600">
    Más de 1.08: oportunidad · 0.95 a 1.08: precio normal · Menos de 0.95:
    posible sobreprecio
  </p>
</div>

              {hasDisplayValue(car.description) && (
                <div className="mt-4 max-h-[130px] overflow-y-auto rounded-2xl border border-gray-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Descripción
                  </p>
                  <p className="mt-2">{displayValue(car.description)}</p>
                </div>
              )}

              {(contactHref || hasDisplayValue(contactSummary)) && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
    Contacto
  </p>

  {contactHref ? (
    <a
      href={contactHref}
      target={contactHref.startsWith("http") ? "_blank" : undefined}
      rel={contactHref.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex items-center justify-center rounded-xl bg-[#ffc400] px-8 py-3 text-sm font-medium leading-none text-[#0b1f33] transition hover:bg-[#f5c400]"
    >
      Contactar al propietario
    </a>
  ) : (
    <p className="text-sm font-bold text-[#0b1f33]">
      {displayValue(contactSummary)}
    </p>
  )}

  {contactHref && (
    <div className="mt-4 space-y-2 rounded-xl bg-white px-3 py-2 ring-1 ring-blue-100">
      {hasDisplayValue(contactSummary) && <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Vendedor
        </p>
        <p className="mt-1 text-sm font-black text-slate-900">
          {displayValue(contactSummary)}
        </p>
      </div>}

      {hasDisplayValue(car.whatsapp || car.contactPhone) && <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          WhatsApp / Teléfono
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800">
          {displayValue(car.whatsapp || car.contactPhone)}
        </p>
      </div>}

      {hasDisplayValue(car.contactEmail) && <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Email
        </p>
        <p className="mt-1 break-all text-sm font-bold text-slate-800">
          {displayValue(car.contactEmail)}
        </p>
      </div>}
    </div>
  )}
</div>
)}
            </div>

            <div ref={tabContentRef}>
              <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  className={tabClass(activeTab === "basic")}
                  onClick={() => changeTab("basic")}
                >
                  Información básica
                </button>
                <button
                  type="button"
                  className={tabClass(activeTab === "additional")}
                  onClick={() => changeTab("additional")}
                >
                  Información adicional
                </button>
                <button
                  type="button"
                  className={tabClass(activeTab === "advanced")}
                  onClick={() => changeTab("advanced")}
                >
                  Equipamiento 
                </button>
              </div>

              {activeTab === "basic" && (
                <div className={detailPanelClass}>
                  {[
                    { label: "Marca", value: car.brand },
                    { label: "Modelo", value: car.model },
                    { label: "Versión", value: car.version },
                    { label: "Año", value: car.year },
                    {
                      label: "Kilómetros",
                      value: car.kilometers
                        ? `${car.kilometers.toLocaleString("es-AR")} km`
                        : "",
                    },
                    { label: "Combustible", value: car.fuel },
                    { label: "Provincia", value: displayProvince(car.province) },
                    { label: "Ciudad", value: car.city },
                    {
                      label: "Ubicación exacta",
                      value: car.exactLocation || car.location,
                    },
                  ]
                    .filter((item) => hasDisplayValue(item.value))
                    .map((item) => (
                      <DetailItem
                        key={item.label}
                        label={item.label}
                        value={displayValue(item.value)}
                      />
                    ))}
                </div>
              )}

              {activeTab === "additional" && (
                <div className={detailPanelClass}>
                  {(() => {
                    const additionalItems = [
                      { label: "Transmisión", value: car.transmission },
                      { label: "Color", value: car.color },
                      { label: "Puertas", value: car.doors },
                      { label: "Dueños", value: car.owners },
                      { label: "Estado", value: car.estado },
                      { label: "Vendedor", value: car.vendedor },
                      { label: "Garantía", value: car.garantia },
                      {
                        label: "Inspección técnica",
                        value: formatDateOnly(car.inspeccionTecnica),
                      },
                    ].filter((item) => hasDisplayValue(item.value));

                    if (additionalItems.length === 0) {
                      return null;
                    }

                    return additionalItems.map((item) => (
                      <DetailItem
                        key={item.label}
                        label={item.label}
                        value={displayValue(item.value)}
                      />
                    ));
                  })()}
                </div>
              )}

              {activeTab === "advanced" && (
                <div ref={advancedCenterLineRef} className={`${detailPanelClass} relative`}>
                  {(() => {
                    const advancedItems = [
                      { label: "Tracción", value: car.traccion },
                      { label: "Aire acondicionado", value: car.airConditioning },
                      { label: "Techo panorámico", value: car.techoPanoramico },
                      { label: "Airbags", value: car.airbags },
                      { label: "Frenos ABS", value: car.frenosABS },
                      {
                        label: "Asistente estacionamiento",
                        value: car.asistenteEstacionamiento,
                      },
                      {
                        label: "Sensores estacionamiento",
                        value: car.sensoresEstacionamiento,
                      },
                      { label: "Cámara reversa", value: car.camaraReversa },
                      { label: "Control crucero", value: car.controlCrucero },
                      {
                        label: "Control estabilidad",
                        value: car.controlEstabilidad,
                      },
                      { label: "Navegador GPS", value: car.navegadorGPS },
                      { label: "Tapizado", value: car.tapizado },
                      { label: "Climatizador", value: car.climatizador },
                      { label: "Llantas aleación", value: car.llantasAleacion },
                      { label: "Alarma", value: car.alarma },
                      {
                        label: "Cierre centralizado",
                        value: car.cierreCentralizado,
                      },
                      {
                        label: "Levantavidrios",
                        value: car.levantavidriosElectricos,
                      },
                      {
                        label: "Dirección asistida",
                        value: car.direccionAsistida,
                      },
                    ].filter((item) => hasDisplayValue(item.value));

                    if (advancedItems.length === 0) {
                      return null;
                    }

                    return advancedItems.map((item) => (
                      <DetailItem
                        key={item.label}
                        label={item.label}
                        value={displayValue(item.value)}
                      />
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
function VehicleResultCard({
  car,
  onOpenDetail,
  onOpenImages,
}: {
  car: Vehicle;
  onOpenDetail: (car: Vehicle) => void;
  onOpenImages: (car: Vehicle) => void;
}) {
  const imageSrc = car.images[0] || "/placeholder-car.svg";
  const contactHref = getContactHref(car);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
       <div className="relative h-56 overflow-hidden border-b border-slate-200 bg-slate-100 lg:h-[260px] lg:min-h-[260px] lg:border-b-0 lg:border-r">
          <button
  type="button"
  onClick={() => onOpenImages(car)}
  className="h-full w-full cursor-pointer overflow-hidden text-left"
  aria-label={`Ver detalle de ${car.brand} ${car.model}`}
>
  <VehicleImage
    src={imageSrc}
    alt={`${car.brand} ${car.model}`}
    sizes="(min-width: 1024px) 300px, 100vw"
    className="h-full w-full object-cover transition duration-300 hover:scale-105"
  />
</button>
        </div>

        <div className="flex h-full flex-col justify-between p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                {car.brand} {car.model}
              </h3>
              <p className="mt-2 max-w-xl text-base font-medium leading-relaxed text-slate-600">
                {car.version} · {car.year}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="rounded-2xl bg-slate-50 px-4 py-2 text-2xl font-black text-[#063b75] ring-1 ring-slate-200">
                {formatPrice(car.price)}
              </p>
              <span
                className={[
                  "mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1",
                  getScoreBadgeClass(car.score),
                ].join(" ")}
              >
                Score {car.score.toFixed(2)} · {getScoreLabel(car.score)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <p className="font-bold text-gray-500">Km</p>
              <p className="mt-1 font-extrabold">
                {car.kilometers.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <p className="font-bold text-gray-500">Ubicación</p>
              <p className="mt-1 font-extrabold">{displayProvince(car.province)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <p className="font-bold text-gray-500">Combustible</p>
              <p className="mt-1 font-extrabold">{car.fuel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <p className="font-bold text-gray-500">Transmisión</p>
              <p className="mt-1 font-extrabold">{car.transmission}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            {(hasDisplayValue(car.city) || hasDisplayValue(car.color)) && (
              <p className="min-w-0 text-sm text-gray-500">
                {[
                  displayValue(car.city),
                  hasDisplayValue(car.color)
                    ? `Color ${displayValue(car.color).toLowerCase()}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <div className="flex shrink-0 flex-col gap-2 sm:ml-auto sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => onOpenDetail(car)}
                className="rounded-xl bg-[#063b75] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#052f5f]"
              >
                Ver detalle
              </button>
              {contactHref ? (
  <a
    href={contactHref}
    target={contactHref.startsWith("http") ? "_blank" : undefined}
    rel={contactHref.startsWith("http") ? "noreferrer" : undefined}
    className="inline-flex items-center justify-center rounded-xl bg-[#ffc400] px-8 py-3 text-sm font-medium leading-none text-[#0b1f33] transition hover:bg-[#ffd633]"
  >
    Contactar
  </a>
) : (
  <button
    type="button"
    onClick={() => onOpenDetail(car)}
    className="inline-flex items-center justify-center rounded-xl bg-[#ffc400] px-8 py-3 text-sm font-medium leading-none text-[#0b1f33] transition hover:bg-[#ffd633]"
  >
    Contactar
  </button>
)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PublicVehicleSearch({
  vehicles,
}: PublicVehicleSearchProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [activeFilters, setActiveFilters] = useState<Filters>(emptyFilters);
  const [searchCount, setSearchCount] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [detailOpenMode, setDetailOpenMode] = useState<"image" | "detail">("detail");
  const firstResultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (searchCount === 0 || !firstResultRef.current) return;

    firstResultRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [searchCount]);

  useEffect(() => {
    if (!selectedVehicle) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedVehicle(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedVehicle]);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "brand") {
        next.model = "";
        next.version = "";
      }

      if (key === "model") {
        next.version = "";
      }

      if (key === "priceMin" && next.priceMax && Number(value) > Number(next.priceMax)) {
        next.priceMax = value;
      }

      if (key === "priceMax" && next.priceMin && Number(value) < Number(next.priceMin)) {
        next.priceMin = value;
      }

      if (key === "yearMin" && next.yearMax && Number(value) > Number(next.yearMax)) {
        next.yearMax = value;
      }

      if (key === "yearMax" && next.yearMin && Number(value) < Number(next.yearMin)) {
        next.yearMin = value;
      }

      return next;
    });
  };

  const brands = marcasArgentina;

  const models = useMemo(
    () =>
      filters.brand
        ? modelosArgentina[filters.brand] || []
        : unique(Object.values(modelosArgentina).flat()),
    [filters.brand]
  );

  const versions = useMemo(
    () =>
      filters.model
        ? versionesPorModelo[filters.model] || []
        : unique(Object.values(versionesPorModelo).flat()),
    [filters.model]
  );

  const provinces = provinciasArgentina;

  const fuels = useMemo(
    () =>
      unique([...publicFuelOptions, ...vehicles.map((vehicle) => vehicle.fuel)]),
    [vehicles]
  );

  const transmissions = useMemo(
    () => unique(vehicles.map((vehicle) => vehicle.transmission)),
    [vehicles]
  );

  const colors = useMemo(
    () =>
      unique([...coloresAutomotor, ...vehicles.map((vehicle) => vehicle.color)]),
    [vehicles]
  );

  const results = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
      return (
        matchesOption(vehicle.brand, activeFilters.brand) &&
        matchesOption(vehicle.model, activeFilters.model) &&
        matchesOption(vehicle.version, activeFilters.version) &&
        matchesNumber(vehicle.price, activeFilters.priceMin, activeFilters.priceMax) &&
        matchesNumber(vehicle.year, activeFilters.yearMin, activeFilters.yearMax) &&
        (!activeFilters.kilometersMax ||
          vehicle.kilometers <= Number(activeFilters.kilometersMax)) &&
        matchesOption(vehicle.province, activeFilters.province) &&
        matchesCity(vehicle, activeFilters.city) &&
        matchesOption(vehicle.fuel, activeFilters.fuel) &&
        matchesOption(vehicle.transmission, activeFilters.transmission) &&
        matchesOption(vehicle.color, activeFilters.color) &&
        matchesOption(vehicle.estado || "", activeFilters.estado)
      );
    });

    return filtered.sort((a, b) => {
      if (activeFilters.sortBy === "priceAsc") return a.price - b.price;
      if (activeFilters.sortBy === "priceDesc") return b.price - a.price;
      if (activeFilters.sortBy === "kmAsc") return a.kilometers - b.kilometers;
      if (activeFilters.sortBy === "yearDesc") return b.year - a.year;
      return b.score - a.score;
    });
  }, [activeFilters, vehicles]);

  const resultsListKey = useMemo(
    () => `${searchCount}-${JSON.stringify(activeFilters)}`,
    [activeFilters, searchCount]
  );

  const clearFilters = () => {
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setSearchCount(0);
    setSelectedVehicle(null);
    setSelectedImageIndex(0);
  };

  const searchVehicles = () => {
    setSelectedVehicle(null);
    setSelectedImageIndex(0);
    setActiveFilters(filters);
    setSearchCount((current) => current + 1);
  };

 const openDetail = (car: Vehicle) => {
  setDetailOpenMode("detail");
  setSelectedVehicle(car);
  setSelectedImageIndex(0);
};

const openDetailAtImage = (car: Vehicle) => {
  setDetailOpenMode("image");
  setSelectedVehicle(car);
  setSelectedImageIndex(0);
};

  const selectedVehicleDetail = selectedVehicle
    ? vehicles.find((vehicle) => isSameVehicleIdentity(selectedVehicle, vehicle)) ||
      selectedVehicle
    : null;

  return (
    <>
      <section id="buscar" className="-mt-6 px-4">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_22px_55px_rgba(3,27,52,0.28)] ring-1 ring-slate-400/35">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl font-black text-[#0b1f33]">
                Buscar vehículos
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Completá los campos principales o abrí filtros avanzados.
              </p>
            </div>

           <div className="mt-1 rounded-full bg-[#ffc400] px-4 py-2 text-sm font-black text-[#002b55] shadow-sm">
              {results.length} resultados
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="Marca"
              value={filters.brand}
              options={brands}
              placeholder="Todas las marcas"
              onChange={(value) => setFilter("brand", value)}
            />
            <SelectField
              label="Modelo"
              value={filters.model}
              options={models}
              placeholder="Todos los modelos"
              disabled={!filters.brand}
              onChange={(value) => setFilter("model", value)}
            />
            <SelectField
              label="Versión"
              value={filters.version}
              options={versions}
              placeholder="Todas las versiones"
              disabled={!filters.model}
              onChange={(value) => setFilter("version", value)}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <RangeSelectField
              label="Precio desde"
              value={filters.priceMin}
              placeholder="Sin mínimo"
              options={filterMinOptions(priceOptions, filters.priceMax)}
              onChange={(value) => setFilter("priceMin", value)}
            />
            <RangeSelectField
              label="Precio hasta"
              value={filters.priceMax}
              placeholder="Sin máximo"
              options={filterMaxOptions(priceOptions, filters.priceMin)}
              onChange={(value) => setFilter("priceMax", value)}
            />
            <RangeSelectField
              label="Año desde"
              value={filters.yearMin}
              placeholder="Sin mínimo"
              options={filterMinOptions(yearOptions, filters.yearMax)}
              onChange={(value) => setFilter("yearMin", value)}
            />
            <RangeSelectField
              label="Año hasta"
              value={filters.yearMax}
              placeholder="Sin máximo"
              options={filterMaxOptions(yearOptions, filters.yearMin)}
              onChange={(value) => setFilter("yearMax", value)}
            />
          </div>

          <details className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-black text-[#063b75] transition hover:bg-slate-100">
              <span>Filtros avanzados</span>
<span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
  Ver más
</span>
            </summary>

            <div className="border-t border-gray-200 p-5">
              <div className="grid gap-4 md:grid-cols-4">
                <RangeSelectField
                  label="Kilómetros hasta"
                  value={filters.kilometersMax}
                  placeholder="Sin máximo"
                  options={kilometerOptions}
                  onChange={(value) => setFilter("kilometersMax", value)}
                />
                <SelectField
                  label="Provincia"
                  value={filters.province}
                  options={provinces}
                  placeholder="Todas"
                  onChange={(value) => setFilter("province", value)}
                />
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-gray-700">
                    Ciudad
                  </span>
                  <input
                    type="text"
                    value={filters.city}
                    placeholder="Todas"
                    onChange={(event) => setFilter("city", event.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-[#0b1f33] outline-none transition placeholder:text-[#0b1f33] focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
                  />
                </label>
                <SelectField
                  label="Combustible"
                  value={filters.fuel}
                  options={fuels}
                  placeholder="Todos"
                  onChange={(value) => setFilter("fuel", value)}
                />
                <SelectField
                  label="Transmisión"
                  value={filters.transmission}
                  options={transmissions}
                  placeholder="Todas"
                  onChange={(value) => setFilter("transmission", value)}
                />
                <SelectField
                  label="Color"
                  value={filters.color}
                  options={colors}
                  placeholder="Todos"
                  onChange={(value) => setFilter("color", value)}
                />
                <SelectField
                  label="Estado"
                  value={filters.estado}
                  options={opcionesAvanzadas.estado}
                  placeholder="Todos"
                  onChange={(value) => setFilter("estado", value)}
                />
                <SelectField
                  label="Ordenar por"
                  value={filters.sortBy}
                  options={["score", "priceAsc", "priceDesc", "kmAsc", "yearDesc"]}
                  placeholder="Mejor score"
                  showPlaceholder={false}
                  onChange={(value) => setFilter("sortBy", value || "score")}
                />
              </div>
            </div>
          </details>

          <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Los resultados se calculan con precio, kilometraje, ubicación y
              score.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={searchVehicles}
                className="w-full rounded-xl bg-[#ffc400] px-8 py-3 text-sm font-medium text-[#0b1f33] shadow-md transition hover:bg-[#e5b800] hover:shadow-lg sm:w-auto"
              >
                Buscar vehículos
              </button>
            </div>
          </div>
        </div>
      </section>

      {searchCount > 0 && (
        <section className="mx-auto mt-8 max-w-6xl px-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Vehículos encontrados
              </h2>
              <p className="mt-1 text-sm text-white/70">
  {results.length} publicaciones encontradas.
</p>
            </div>
          </div>

          <div key={resultsListKey} className="space-y-5">
            {results.map((car, index) => (
              <div
                key={getVehicleResultKey(car, index)}
                ref={index === 0 ? firstResultRef : undefined}
              >
                <VehicleResultCard
  car={car}
  onOpenDetail={openDetail}
  onOpenImages={openDetailAtImage}
/>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
              <h3 className="text-xl font-extrabold text-[#0b1f33]">
                No encontramos vehículos con esos filtros.
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Probá ampliar el rango de precio, año o kilometraje.
              </p>
            </div>
          )}
        </section>
      )}

      {selectedVehicleDetail && (
     <VehicleDetailModal
  car={selectedVehicleDetail}
  selectedImageIndex={selectedImageIndex}
  onSelectImage={setSelectedImageIndex}
  onClose={() => setSelectedVehicle(null)}
  openMode={detailOpenMode}
/>
      )}
    </>
  );
}
