"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  toPublicVehicles,
} from "@/utils/listings";
import { fetchPublicRemoteListings } from "@/utils/listingsRemote";

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
    let cancelled = false;

    async function loadPublishedVehicles() {
      try {
        const listings = process.env.NEXT_PUBLIC_SUPABASE_URL
          ? await fetchPublicRemoteListings()
          : getStoredListings();

        const approvedListings = listings.filter(
          (listing) => listing.publicationStatus === "approved"
        );

        if (cancelled) return;

        setApprovedVehicles(toPublicVehicles(approvedListings));
        setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
        setIsReady(true);
      } catch {
        if (cancelled) return;

        setApprovedVehicles(toPublicVehicles(getStoredListings()));
        setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
        setIsReady(true);
      }
    }

    loadPublishedVehicles();

    return () => {
      cancelled = true;
    };
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
        !process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !editedBaseIndexes.has(index) &&
        !hiddenBaseIndexSet.has(index)
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
