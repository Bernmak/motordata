"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  toPublicVehicles,
} from "@/utils/listings";

type PublicInventoryStatsProps = {
  vehicles: Vehicle[];
};

export default function PublicInventoryStats({
  vehicles,
}: PublicInventoryStatsProps) {
  const [approvedVehicles, setApprovedVehicles] = useState<Vehicle[]>([]);
  const [hiddenBaseIndexes, setHiddenBaseIndexes] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setApprovedVehicles(toPublicVehicles(getStoredListings()));
      setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const visibleVehicles = useMemo(() => {
    const editedBaseIndexes = new Set(
      approvedVehicles
        .map((vehicle) => vehicle.sourceBaseIndex)
        .filter((index): index is number => index !== undefined)
    );
    const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);
    const visibleBaseVehicles = vehicles.filter(
      (_vehicle, index) =>
        !editedBaseIndexes.has(index) && !hiddenBaseIndexSet.has(index)
    );

    return [...approvedVehicles, ...visibleBaseVehicles];
  }, [approvedVehicles, hiddenBaseIndexes, vehicles]);

  const topScore =
    visibleVehicles.length > 0
      ? Math.max(...visibleVehicles.map((vehicle) => vehicle.score))
      : 0;

  return (
  <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
    <div className="rounded-2xl bg-[#f8fafc] p-4 ring-1 ring-gray-200">
      <p className="text-2xl font-black text-[#063b75]">
        {isReady ? visibleVehicles.length : "-"}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-500">Vehículos publicados</p>
    </div>

    <div className="rounded-2xl bg-[#f8fafc] p-4 ring-1 ring-gray-200">
      <p className="text-2xl font-black text-[#063b75]">14</p>
      <p className="mt-1 text-sm font-bold text-gray-500">Filtros</p>
    </div>

    <div className="rounded-2xl bg-[#f8fafc] p-4 ring-1 ring-gray-200">
      <p className="text-2xl font-black text-[#063b75]">
        {isReady ? topScore.toFixed(2) : "-"}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-500">Score top</p>
    </div>
  </div>
);
}
