"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  type ManagedVehicle,
} from "@/utils/listings";
import { fetchRemoteListings } from "@/utils/listingsRemote";

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
    let cancelled = false;

    async function loadDashboardVehicles() {
      const localListings = getStoredListings();

      try {
        const remoteListings = process.env.NEXT_PUBLIC_SUPABASE_URL
          ? await fetchRemoteListings()
          : [];
        const mergedListings = Array.from(
          new Map(
            [...localListings, ...remoteListings].map((listing) => [
              listing.id,
              listing,
            ])
          ).values()
        );

        if (cancelled) return;

        setListings(mergedListings);
      } catch {
        if (cancelled) return;

        setListings(localListings);
      }

      if (cancelled) return;

      setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
    }

    loadDashboardVehicles();

    return () => {
      cancelled = true;
    };
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
