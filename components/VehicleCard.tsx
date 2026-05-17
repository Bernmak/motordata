"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  getScoreClass,
  getScoreDescription,
  getScoreLabel,
} from "../utils/score";
import type { Vehicle } from "../types/vehicle";

type VehicleCardProps = {
  car: Vehicle;
};

export function VehicleCard({ car }: VehicleCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const cardId = `${car.brand}-${car.model}-${car.version}-${car.year}-${car.price}`;
  const showPreviousImage = () => {
  setSelectedImageIndex((currentIndex) =>
    currentIndex === 0 ? car.images.length - 1 : currentIndex - 1
  );
};

const showNextImage = () => {
  setSelectedImageIndex((currentIndex) =>
    currentIndex === car.images.length - 1 ? 0 : currentIndex + 1
  );
};
useEffect(() => {
  const closeDetails = (event: Event) => {
    const customEvent = event as CustomEvent<string>;

    if (customEvent.detail !== cardId) {
      setShowDetails(false);
    }
  };

  window.addEventListener("motordata:open-detail", closeDetails);

  return () => {
    window.removeEventListener("motordata:open-detail", closeDetails);
  };
}, [cardId]);
  const handleToggleDetails = () => {
    const nextValue = !showDetails;
    setShowDetails(nextValue);
   if (nextValue) {
  window.dispatchEvent(
    new CustomEvent("motordata:open-detail", {
      detail: cardId,
    })
  );
}
    if (nextValue) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };

  return (
    <article
      ref={cardRef}
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl transition-colors hover:border-cyan-400/60 md:grid md:grid-cols-[320px_1fr]"
    >
      <div className="bg-zinc-950 md:h-full">
        <div className="relative h-64 w-full">
        <Image
          src={car.images[0] || "/placeholder-car.svg"}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(min-width: 768px) 320px, 100vw"
          className="object-cover"
        />
        </div>
      </div>

     <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px] md:items-start">
        <div>
          <h3 className="text-3xl font-bold text-white">
            {car.brand} {car.model} {car.version}
          </h3>
        </div>

       <div className="text-left md:text-right">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Precio publicado
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            USD {car.price.toLocaleString("es-AR")}
          </p>

          <span
            className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-bold ${getScoreClass(
              car.score
            )}`}
          >
            {getScoreLabel(car.score)}
          </span>

          <p className="mt-3 text-base font-medium text-zinc-300">
            {getScoreDescription(car.score)}
          </p>

          <button
            type="button"
            onClick={handleToggleDetails}
            className="mt-5 w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-zinc-950 transition-colors hover:bg-cyan-300"
          >
            {showDetails ? "Ocultar detalle" : "Ver detalle"}
          </button>
        </div>
      </div>

      {showDetails && (
  <div className="border-t border-zinc-800 bg-zinc-950 p-6 md:col-span-2">
    <h4 className="text-center text-2xl font-bold text-white">
      Detalle del vehículo
    </h4>

    <div className="relative mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {car.images.length > 1 && (
        <button
          type="button"
          onClick={showPreviousImage}
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl font-bold text-white hover:bg-black"
        >
          ‹
        </button>
      )}

      <div className="relative h-[260px] w-full">
        <Image
          src={car.images[selectedImageIndex] || "/placeholder-car.svg"}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {car.images.length > 1 && (
        <button
          type="button"
          onClick={showNextImage}
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl font-bold text-white hover:bg-black"
        >
          ›
        </button>
      )}
    </div>

    <div className="mt-6 space-y-5 text-lg text-zinc-300">
  <div className="flex justify-between gap-10">
    <p>
      <span className="font-semibold text-zinc-100">Vehículo:</span>{" "}
      {car.brand} {car.model}
    </p>

    <p className="text-right">
      <span className="font-semibold text-zinc-100">Año:</span> {car.year}
    </p>
  </div>

  <div className="flex justify-between gap-10">
    <p>
      <span className="font-semibold text-zinc-100">Versión:</span>{" "}
      {car.version}
    </p>

    <p className="text-right">
      <span className="font-semibold text-zinc-100">Color:</span>{" "}
      {car.color}
    </p>
  </div>

  <div className="flex justify-between gap-10">
    <p>
      <span className="font-semibold text-zinc-100">Kilómetros:</span>{" "}
      {car.kilometers.toLocaleString("es-AR")} km
    </p>

    <p className="text-right">
      <span className="font-semibold text-zinc-100">Ubicación:</span>{" "}
      {car.province} · {car.city}
    </p>
  </div>

  <div className="flex justify-between gap-10">
    <p>
      <span className="font-semibold text-zinc-100">Combustible:</span>{" "}
      {car.fuel}
    </p>

    <p className="text-right">
      <span className="font-semibold text-zinc-100">Transmisión:</span>{" "}
      {car.transmission}
    </p>
  </div>

  <div className="flex justify-between gap-10">
    <p>
      <span className="font-semibold text-zinc-100">Precio:</span> USD{" "}
      {car.price.toLocaleString("es-AR")}
    </p>

    <p className="text-right">
      <span className="font-semibold text-zinc-100">Score:</span>{" "}
      <span className="font-bold text-emerald-400">
        {getScoreLabel(car.score)}
      </span>
    </p>
  </div>
      <p className="text-center text-xl font-bold text-white">
        {getScoreDescription(car.score)}
      </p>
    </div>
      </div>
)}
    </article>
  );
}
