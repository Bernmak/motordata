"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  type ManagedVehicle,
} from "@/utils/listings";

type AdminExportCountProps = {
  vehicles: Vehicle[];
};

export default function AdminExportCount({ vehicles }: AdminExportCountProps) {
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

  const exportableCount = useMemo(() => {
    const editedBaseIndexes = new Set(
      listings
        .map((listing) => listing.sourceBaseIndex)
        .filter((index): index is number => index !== undefined)
    );
    const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);
    const visibleBaseCount = vehicles.filter(
      (_vehicle, index) =>
        !hiddenBaseIndexSet.has(index) && !editedBaseIndexes.has(index)
    ).length;

    return visibleBaseCount + listings.length;
  }, [hiddenBaseIndexes, listings, vehicles]);

  return (
    <span className="font-black text-[#063b75]">
      {isReady ? exportableCount : "-"}
    </span>
  );
}
