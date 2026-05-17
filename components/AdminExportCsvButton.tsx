"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  type ManagedVehicle,
} from "@/utils/listings";

type AdminExportCsvButtonProps = {
  vehicles: Vehicle[];
};

const columns: Array<[string, keyof Vehicle]> = [
  ["id", "id"],
  ["marca", "brand"],
  ["modelo", "model"],
  ["version", "version"],
  ["anio", "year"],
  ["precio", "price"],
  ["kilometros", "kilometers"],
  ["provincia", "province"],
  ["ciudad", "city"],
  ["combustible", "fuel"],
  ["transmision", "transmission"],
  ["color", "color"],
  ["estado", "estado"],
  ["vendedor", "vendedor"],
  ["contacto_nombre", "contactName"],
  ["contacto_telefono", "contactPhone"],
  ["contacto_email", "contactEmail"],
  ["estado_publicacion", "publicationStatus"],
  ["creado", "createdAt"],
  ["actualizado", "updatedAt"],
];

function escapeCsvValue(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(vehiclesToExport: Vehicle[]) {
  const separator = ";";
  const header = columns.map(([label]) => escapeCsvValue(label)).join(separator);
  const rows = vehiclesToExport.map((vehicle) =>
    columns
      .map(([, key]) => escapeCsvValue(vehicle[key]))
      .join(separator)
  );

  return [header, ...rows].join("\r\n");
}

export default function AdminExportCsvButton({
  vehicles,
}: AdminExportCsvButtonProps) {
  const [listings, setListings] = useState<ManagedVehicle[]>([]);
  const [hiddenBaseIndexes, setHiddenBaseIndexes] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setListings(getStoredListings());
      setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const exportableVehicles = useMemo(() => {
    const editedBaseIndexes = new Set(
      listings
        .map((listing) => listing.sourceBaseIndex)
        .filter((index): index is number => index !== undefined)
    );
    const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);
    const visibleBaseVehicles = vehicles
      .map((vehicle, index) => ({
        ...vehicle,
        id: vehicle.id || `base-${index}`,
      }))
      .filter(
        (_vehicle, index) =>
          !hiddenBaseIndexSet.has(index) && !editedBaseIndexes.has(index)
      );

    return [...listings, ...visibleBaseVehicles];
  }, [hiddenBaseIndexes, listings, vehicles]);

  function exportCsv() {
    const csv = buildCsv(exportableVehicles);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `motordata-vehiculos-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={!isReady || exportableVehicles.length === 0}
      className="mt-5 rounded-xl bg-[#063b75] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#052f5f] disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      Exportar CSV
    </button>
  );
}
