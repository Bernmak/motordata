"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import VehicleImage from "@/components/VehicleImage";
import {
  createApprovalMailto,
  getHiddenBaseVehicleIndexes,
  getStoredListings,
  hideBaseVehicle,
  removeListing,
  upsertListing,
  type ManagedVehicle,
} from "@/utils/listings";
import {
  deleteRemoteListing,
  fetchRemoteListings,
  upsertRemoteListing,
} from "@/utils/listingsRemote";

const formatPrice = (value: number) => `$ ${value.toLocaleString("es-AR")}`;

function statusLabel(status: ManagedVehicle["publicationStatus"]) {
  if (status === "approved") return "Aprobado";
  if (status === "deleted") return "Borrado";
  return "Pendiente";
}

function makeVehicleKey(vehicle: Vehicle) {
  return [
    vehicle.brand,
    vehicle.model,
    vehicle.version,
    vehicle.year,
    vehicle.kilometers,
    vehicle.city,
  ]
    .join("|")
    .toLowerCase();
}

function mergeListings(localListings: ManagedVehicle[], remoteListings: ManagedVehicle[]) {
  return Array.from(
    new Map(
      [...localListings, ...remoteListings].map((listing) => [listing.id, listing])
    ).values()
  );
}

function matchesVehicleQuery(vehicle: Vehicle, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  return [
    vehicle.brand,
    vehicle.model,
    vehicle.version,
    vehicle.year,
    vehicle.city,
    vehicle.province,
    vehicle.fuel,
    vehicle.transmission,
    vehicle.color,
    vehicle.vendedor,
    vehicle.ownerEmail,
    vehicle.contact,
    vehicle.contactName,
    vehicle.contactPhone,
    vehicle.contactEmail,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

type AdminVehiclesClientProps = {
  vehicles: Vehicle[];
};

export default function AdminVehiclesClient({ vehicles }: AdminVehiclesClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState<ManagedVehicle[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [searchMessage, setSearchMessage] = useState("");
  const [hiddenBaseIndexes, setHiddenBaseIndexes] = useState<number[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [approvingListingId, setApprovingListingId] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState("");
  const [approvalErrorListingId, setApprovalErrorListingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      const localListings = getStoredListings();

      try {
        let nextListings = localListings;

        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const remoteListings = await fetchRemoteListings();
          nextListings = mergeListings(localListings, remoteListings);
        }

        if (cancelled) return;

        setListings(nextListings);
      } catch {
        if (cancelled) return;

        setListings(localListings);
      }

      if (cancelled) return;

      setHiddenBaseIndexes(getHiddenBaseVehicleIndexes());
      setIsLoadingInventory(false);
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || isLoadingInventory) return;

    const interval = window.setInterval(() => {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        fetchRemoteListings()
          .then((remoteListings) =>
            setListings((currentListings) =>
              mergeListings(currentListings, remoteListings)
            )
          )
          .catch(() => undefined);
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [isLoadingInventory]);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesQuery = matchesVehicleQuery(listing, normalizedQuery);
      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Publicados" &&
          listing.publicationStatus === "approved") ||
        (statusFilter === "Pendientes" &&
          listing.publicationStatus === "pending");

      return matchesQuery && matchesStatus;
    });
  }, [listings, query, statusFilter]);

  const editedBaseIndexes = useMemo(
    () =>
      new Set(
        listings
          .map((listing) => listing.sourceBaseIndex)
          .filter((index): index is number => index !== undefined)
      ),
    [listings]
  );

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);

    if (statusFilter !== "Todos" && statusFilter !== "Publicados") return [];

    return vehicles
      .map((vehicle, index) => ({ vehicle, index }))
      .filter(({ index }) => !hiddenBaseIndexSet.has(index))
      .filter(({ index }) => !editedBaseIndexes.has(index))
      .filter(({ vehicle }) => matchesVehicleQuery(vehicle, normalizedQuery));
  }, [editedBaseIndexes, hiddenBaseIndexes, query, statusFilter, vehicles]);

  const visibleBaseVehicleCount = useMemo(() => {
    const hiddenBaseIndexSet = new Set(hiddenBaseIndexes);

    return vehicles.filter(
      (_vehicle, index) =>
        !hiddenBaseIndexSet.has(index) && !editedBaseIndexes.has(index)
    ).length;
  }, [editedBaseIndexes, hiddenBaseIndexes, vehicles]);

  const totalInventoryCount = visibleBaseVehicleCount + listings.length;

  async function approveListing(listingId: string) {
    const listingToApprove = listings.find((item) => item.id === listingId);
    if (!listingToApprove || approvingListingId) return;

    const now = new Date().toISOString();
    const approvedListing: ManagedVehicle = {
      ...listingToApprove,
      publicationStatus: "approved",
      approvedAt: listingToApprove.approvedAt || now,
      updatedAt: now,
    };

    setApprovingListingId(listingId);
    setApprovalError("");
    setApprovalErrorListingId(null);

    try {
      const remoteListing = process.env.NEXT_PUBLIC_SUPABASE_URL
        ? await upsertRemoteListing(approvedListing)
        : approvedListing;
      const nextListing = remoteListing || approvedListing;
      const updatedListings = upsertListing(nextListing);

      setListings((currentListings) =>
        mergeListings(
          currentListings.map((item) =>
            item.id === listingId ? nextListing : item
          ),
          updatedListings
        )
      );
      window.location.assign(createApprovalMailto(nextListing));
    } catch (error) {
      setApprovalError(
        error instanceof Error
          ? error.message
          : "No se pudo aprobar el vehículo."
      );
      setApprovalErrorListingId(listingId);
    } finally {
      setApprovingListingId(null);
    }
  }

  function markAsDeleted(listingId: string) {
    const listingToDelete = listings.find((listing) => listing.id === listingId);

    if (listingToDelete?.sourceBaseIndex !== undefined) {
      setHiddenBaseIndexes(hideBaseVehicle(listingToDelete.sourceBaseIndex));
    }

    const updatedListings = removeListing(listingId);
    setListings(updatedListings);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      void deleteRemoteListing(listingId);
    }
  }

  function editBaseVehicle(baseIndex: number, vehicle: Vehicle) {
    const existingListing = listings.find(
      (listing) => listing.sourceBaseIndex === baseIndex
    );

    if (existingListing) {
      router.push(`/admin/autos/${encodeURIComponent(existingListing.id)}/editar`);
      return;
    }

    const editableListing: ManagedVehicle = {
      ...vehicle,
      id: `base-edit-${baseIndex}`,
      ownerEmail: vehicle.ownerEmail || "",
      contact: vehicle.contact || "",
      contactName: vehicle.contactName || "",
      contactPhone: vehicle.contactPhone || "",
      contactEmail: vehicle.contactEmail || "",
      ownerPasswordHash: vehicle.ownerPasswordHash || crypto.randomUUID(),
      editToken: vehicle.editToken || crypto.randomUUID(),
      publicationStatus: "approved",
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      sourceBaseIndex: baseIndex,
    };
    const updatedListings = upsertListing(editableListing);

    setListings(updatedListings);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      void upsertRemoteListing(editableListing);
    }

    router.push(`/admin/autos/${encodeURIComponent(editableListing.id)}/editar`);
  }

  function deleteBaseVehicle(baseIndex: number) {
    setHiddenBaseIndexes(hideBaseVehicle(baseIndex));
  }

  function searchVehicles(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchDraft.trim();
    if (nextQuery.length > 0 && nextQuery.length < 3) {
      setSearchMessage("Ingresá al menos 3 caracteres para buscar.");
      return;
    }

    setSearchMessage("");
    setQuery(nextQuery);
  }

  function clearSearch() {
    setSearchDraft("");
    setQuery("");
    setSearchMessage("");
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#f5c400]">
            Inventario
          </p>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Administración de vehículos
          </h2>
          <p className="mt-2 text-white/65">
            {isLoadingInventory
              ? "Cargando inventario completo..."
              : `${totalInventoryCount} vehículos en inventario: ${visibleBaseVehicleCount} de base local y ${listings.length} gestionados.`}
          </p>
        </div>

        <Link
          href="/admin/autos/nuevo"
          className="rounded-xl bg-[#063b75] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#052f5f]"
        >
          Nuevo vehículo
        </Link>
      </div>

      <form
        onSubmit={searchVehicles}
        className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
      >
        <div className="grid gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-gray-700">
              Buscar vehículo
            </span>
            <input
              type="text"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Marca, modelo, versión, ubicación o email"
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-gray-700">
              Estado
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
            >
              <option>Todos</option>
              <option>Publicados</option>
              <option>Pendientes</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="h-12 flex-1 rounded-xl bg-[#f5c400] px-4 text-sm font-bold text-[#0b1f33] transition hover:bg-[#e5b800]"
            >
              Buscar
            </button>
            {(query || searchDraft) && (
              <button
                type="button"
                onClick={clearSearch}
                className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="md:col-span-4">
            <div className="flex min-h-10 flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold text-[#7a6100]">
                {isLoadingInventory
                  ? "Cargando resultados..."
                  : `${filteredListings.length + filteredVehicles.length} resultados`}
              </p>
              {searchMessage && (
                <p className="font-semibold text-red-600">{searchMessage}</p>
              )}
              {query && !searchMessage && (
                <p className="text-gray-500">Búsqueda aplicada: {query}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {isLoadingInventory && (
          <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-gray-500 ring-1 ring-gray-200">
            Cargando inventario completo desde la base de datos...
          </div>
        )}

        {!isLoadingInventory && filteredListings.map((car, index) => (
          <article
            key={car.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
          >
            <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
              <div className="relative h-44 overflow-hidden bg-gray-100 lg:h-48 lg:self-start">
                <VehicleImage
                  src={car.images[0] || "/placeholder-car.svg"}
                  alt={`${car.brand} ${car.model}`}
                  sizes="(min-width: 1024px) 220px, 100vw"
                  className="h-full w-full object-cover"
                  priority={index === 0}
                />
              </div>

              <div className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0b1f33]">
                      {car.brand} {car.model}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-gray-500">
                      {car.version} · {car.year} · {car.city}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">{car.ownerEmail}</p>
                    {(car.contactName || car.contact) && (
                      <p className="mt-1 text-sm font-semibold text-[#063b75]">
                        Contacto: {car.contactName || car.contact}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xl font-black text-[#063b75]">
                      {formatPrice(car.price)}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-[#eef4fb] px-3 py-1 text-xs font-bold text-[#063b75]">
                      {statusLabel(car.publicationStatus)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    {car.kilometers.toLocaleString("es-AR")} km · {car.fuel} ·{" "}
                    {car.transmission}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {car.publicationStatus === "pending" && (
                      <button
                        type="button"
                        onClick={() => approveListing(car.id)}
                        disabled={approvingListingId !== null}
                        className="rounded-xl bg-[#063b75] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#052f5f] disabled:cursor-wait disabled:bg-[#063b75]/70"
                      >
                        {approvingListingId === car.id ? "Aprobando..." : "Aprobar"}
                      </button>
                    )}
                    <Link
                      href={`/admin/autos/${encodeURIComponent(car.id)}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      Detalles
                    </Link>
                    <Link
                      href={`/admin/autos/${encodeURIComponent(car.id)}/editar`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#063b75] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#052f5f]"
                    >
                      Editar
                    </Link>
                    {car.publicationStatus !== "deleted" && (
                      <button
                        type="button"
                        onClick={() => markAsDeleted(car.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Borrar
                      </button>
                    )}
                  </div>
                  {approvalError &&
                    approvalErrorListingId === car.id &&
                    approvingListingId === null && (
                    <p className="basis-full text-sm font-semibold text-red-600">
                      {approvalError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        {!isLoadingInventory &&
          filteredListings.length === 0 &&
          filteredVehicles.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-sm text-gray-500 ring-1 ring-gray-200">
            No hay vehículos para ese filtro.
          </div>
        )}

        {!isLoadingInventory && filteredVehicles.map(({ vehicle: car, index }) => (
          <article
            key={`base-${index}-${makeVehicleKey(car)}`}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
          >
            <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
              <div className="relative h-44 overflow-hidden bg-gray-100 lg:h-48 lg:self-start">
                <VehicleImage
                  src={car.images[0] || "/placeholder-car.svg"}
                  alt={`${car.brand} ${car.model}`}
                  sizes="(min-width: 1024px) 220px, 100vw"
                  className="h-full w-full object-cover"
                  priority={filteredListings.length === 0 && index === 0}
                />
              </div>

              <div className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0b1f33]">
                      {car.brand} {car.model}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-gray-500">
                      {car.version} · {car.year} · {car.city}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xl font-black text-[#063b75]">
                      {formatPrice(car.price)}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-[#eef4fb] px-3 py-1 text-xs font-bold text-[#063b75]">
                      Disponible
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <Link
                    href={`/admin/autos/base-${index}`}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    Detalles
                  </Link>
                  <button
                    type="button"
                    onClick={() => editBaseVehicle(index, car)}
                    className="inline-flex items-center justify-center rounded-xl bg-[#063b75] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#052f5f]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBaseVehicle(index)}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
