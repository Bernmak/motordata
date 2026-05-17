"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  type ManagedVehicle,
} from "@/utils/listings";

type AdminDashboardStatsProps = {
  vehicles: Vehicle[];
  brandCount: number;
};

export default function AdminDashboardStats({
  vehicles,
  brandCount,
}: AdminDashboardStatsProps) {
  const [listings, setListings] = useState<ManagedVehicle[]>([]);
  const [hiddenBaseIndexes, setHiddenBaseIndexes] = useState<number[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setListings(getStoredListings());
      setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const dashboardVehicles = useMemo(() => {
    const editedBaseIndexes = new Set(
      listings
        .map((listing) => listing.sourceBaseIndex)
        .filter((index): index is number => index !== undefined)
    );
    const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);
    const visibleBaseVehicles = vehicles.filter(
      (_vehicle, index) =>
        !hiddenBaseIndexSet.has(index) && !editedBaseIndexes.has(index)
    );

    return [...listings, ...visibleBaseVehicles];
  }, [hiddenBaseIndexes, listings, vehicles]);

  const averageScore =
    dashboardVehicles.length > 0
      ? dashboardVehicles.reduce((total, vehicle) => total + vehicle.score, 0) /
        dashboardVehicles.length
      : 0;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <p className="text-sm font-bold text-gray-500">
          Vehículos en inventario
        </p>
        <p className="mt-2 text-4xl font-black text-[#063b75]">
          {dashboardVehicles.length}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <p className="text-sm font-bold text-gray-500">Marcas cargadas</p>
        <p className="mt-2 text-4xl font-black text-[#063b75]">
          {brandCount}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <p className="text-sm font-bold text-gray-500">Score promedio</p>
        <p className="mt-2 text-4xl font-black text-[#063b75]">
          {averageScore.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
