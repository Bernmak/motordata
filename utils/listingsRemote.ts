import type { ManagedVehicle } from "@/utils/listings";

type ListingsResponse = {
  listings?: ManagedVehicle[];
  error?: string;
};

type ListingResponse = {
  listing?: ManagedVehicle;
  error?: string;
};

async function readJson<T>(response: Response) {
  const data = (await response.json()) as T;

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data && "error" in data
        ? String((data as { error?: string }).error)
        : "No se pudo conectar con Supabase.";
    throw new Error(errorMessage);
  }

  return data;
}

export async function fetchRemoteListings() {
  const response = await fetch("/api/listings", { cache: "no-store" });
  const data = await readJson<ListingsResponse>(response);
  return data.listings || [];
}

export async function fetchPublicRemoteListings() {
  const response = await fetch("/api/public/listings", { cache: "no-store" });
  const data = await readJson<ListingsResponse>(response);
  return data.listings || [];
}

export async function upsertRemoteListing(listing: ManagedVehicle) {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing }),
  });
  const data = await readJson<ListingResponse>(response);
  return data.listing;
}

export async function updateRemoteListing(listing: ManagedVehicle) {
  const response = await fetch(`/api/listings/${encodeURIComponent(listing.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing }),
  });
  const data = await readJson<ListingResponse>(response);
  return data.listing;
}

export async function deleteRemoteListing(listingId: string) {
  const response = await fetch(`/api/listings/${encodeURIComponent(listingId)}`, {
    method: "DELETE",
  });
  await readJson<{ ok?: boolean; error?: string }>(response);
}
