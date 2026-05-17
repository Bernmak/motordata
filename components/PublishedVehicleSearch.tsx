"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import {
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  toPublicVehicles,
} from "@/utils/listings";
import { fetchPublicRemoteListings } from "@/utils/listingsRemote";
import PublicVehicleSearch from "./PublicVehicleSearch";

type PublishedVehicleSearchProps = {
  vehicles: Vehicle[];
};

export default function PublishedVehicleSearch({
  vehicles,
}: PublishedVehicleSearchProps) {
  const [approvedVehicles, setApprovedVehicles] = useState<Vehicle[]>([]);
  const [hiddenBaseIndexes, setHiddenBaseIndexes] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedVehicles() {
      try {
        const localListings = getStoredListings();
        const remoteListings = process.env.NEXT_PUBLIC_SUPABASE_URL
          ? await fetchPublicRemoteListings()
          : [];

        const approvedListings = [...localListings, ...remoteListings].filter(
          (listing) => listing.publicationStatus === "approved"
        );

        const uniqueApprovedListings = Array.from(
          new Map(
            approvedListings.map((listing) => [
              [
                listing.brand,
                listing.model,
                listing.version,
                listing.year,
                listing.price,
                listing.kilometers,
                listing.city,
              ].join("|"),
              listing,
            ])
          ).values()
        );

        const publishedVehicles = toPublicVehicles(uniqueApprovedListings);

        if (cancelled) return;

        setApprovedVehicles(publishedVehicles);
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
  }, [vehicles]);

  const visibleBaseVehicles = useMemo(() => {
  const makeKey = (vehicle: Vehicle) =>
    [
      vehicle.brand,
      vehicle.model,
      vehicle.version,
      vehicle.year,
      vehicle.kilometers,
      vehicle.city,
    ]
      .join("|")
      .toLowerCase();

  const editedBaseIndexes = new Set(
    approvedVehicles
      .map((vehicle) => vehicle.sourceBaseIndex)
      .filter((index): index is number => index !== undefined)
  );

  const editedBaseKeys = new Set(approvedVehicles.map(makeKey));
  const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);

  return vehicles.filter(
    (vehicle, index) =>
      !editedBaseIndexes.has(index) &&
      !hiddenBaseIndexSet.has(index) &&
      !editedBaseKeys.has(makeKey(vehicle))
  );
}, [approvedVehicles, hiddenBaseIndexes, vehicles]);

  const visibleVehicles = useMemo(
    () => [...approvedVehicles, ...visibleBaseVehicles],
    [approvedVehicles, visibleBaseVehicles]
  );

  if (!isReady) return null;

  return <PublicVehicleSearch vehicles={visibleVehicles} />;
}
