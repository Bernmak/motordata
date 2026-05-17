import type { Vehicle } from "@/types/vehicle";

export type ManagedVehicle = Vehicle & {
  id: string;
  ownerEmail: string;
  ownerPasswordHash: string;
  editToken: string;
  publicationStatus: "pending" | "approved" | "deleted";
  createdAt: string;
};

const STORAGE_KEY = "motordata-user-vehicles";
const HIDDEN_BASE_KEY = "motordata-hidden-base-vehicles";

const textEncoder = new TextEncoder();

function isBrowser() {
  return typeof window !== "undefined";
}

export function createListingId() {
  return `veh-${Date.now()}-${crypto.randomUUID()}`;
}

export function getStoredListings(): ManagedVehicle[] {
  if (!isBrowser()) return [];

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];
    const parsedData = JSON.parse(rawData);
    if (!Array.isArray(parsedData)) return [];

    const activeListings = parsedData.filter(
      (listing) => listing.publicationStatus !== "deleted"
    );

    if (activeListings.length !== parsedData.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeListings));
    }

    return activeListings;
  } catch {
    return [];
  }
}

export function saveStoredListings(listings: ManagedVehicle[]) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (error) {
    throw new Error(
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "No hay espacio suficiente para guardar las fotos. Probá subir menos imágenes o imágenes más livianas."
        : "No se pudo guardar la publicación."
    );
  }
}

export function upsertListing(listing: ManagedVehicle) {
  const listings = getStoredListings();
  const currentIndex = listings.findIndex((item) => item.id === listing.id);

  if (currentIndex >= 0) {
    listings[currentIndex] = listing;
  } else {
    listings.unshift(listing);
  }

  saveStoredListings(listings);
  return listings;
}

export function updateListing(
  listingId: string,
  updater: (listing: ManagedVehicle) => ManagedVehicle
) {
  const listings = getStoredListings();
  const updatedListings = listings.map((listing) =>
    listing.id === listingId ? updater(listing) : listing
  );

  saveStoredListings(updatedListings);
  return updatedListings;
}

export function removeListing(listingId: string) {
  const listings = getStoredListings().filter(
    (listing) => listing.id !== listingId
  );

  saveStoredListings(listings);
  return listings;
}

export function purgeDeletedListings() {
  return getStoredListings();
}

export async function hashPassword(password: string) {
  const passwordHash = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(password)
  );

  return Array.from(new Uint8Array(passwordHash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, passwordHash: string) {
  return (await hashPassword(password)) === passwordHash;
}

export function createManagementUrl(listing: ManagedVehicle) {
  const origin = isBrowser() ? window.location.origin : "";
  const params = new URLSearchParams({ token: listing.editToken });
  return `${origin}/anuncios/${listing.id}?${params.toString()}`;
}

export function createApprovalMailto(listing: ManagedVehicle) {
  const managementUrl = createManagementUrl(listing);
  const subject = encodeURIComponent(
    `Tu anuncio ${listing.brand} ${listing.model} fue aprobado`
  );
  const body = encodeURIComponent(
    [
      `Hola, tu anuncio ${listing.brand} ${listing.model} ${listing.version} ya fue aprobado en MotorData.`,
      "",
      "Abrí tu panel de gestión para editar los datos o borrar el anuncio:",
      managementUrl,
      "",
      "Si tu correo lo muestra como enlace, podés tocarlo directamente.",
      "",
      "Por seguridad, la página te pedirá la contraseña que creaste al cargar el vehículo.",
    ].join("\n")
  );

  return `mailto:${listing.ownerEmail}?subject=${subject}&body=${body}`;
}

export function toPublicVehicles(listings: ManagedVehicle[]) {
  return listings.filter(
    (listing) => listing.publicationStatus === "approved"
  ) as Vehicle[];
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo leer la imagen."));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function imageFileToStoredDataUrl(file: File) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
      img.src = sourceUrl;
    });

    const maxSize = 1200;
    const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const width = Math.round(image.width * ratio);
    const height = Math.round(image.height * ratio);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return fileToDataUrl(file);

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function isStoredDataImage(src: string) {
  return src.startsWith("data:image/");
}

export function getHiddenBaseVehicleIndexes() {
  if (!isBrowser()) return [];

  try {
    const rawData = window.localStorage.getItem(HIDDEN_BASE_KEY);
    if (!rawData) return [];
    const parsedData = JSON.parse(rawData);
    return Array.isArray(parsedData)
      ? parsedData.filter((index) => Number.isInteger(index))
      : [];
  } catch {
    return [];
  }
}

export function hideBaseVehicle(index: number) {
  if (!isBrowser()) return [];

  const hiddenIndexes = new Set(getHiddenBaseVehicleIndexes());
  hiddenIndexes.add(index);
  const nextIndexes = Array.from(hiddenIndexes);

  window.localStorage.setItem(HIDDEN_BASE_KEY, JSON.stringify(nextIndexes));
  return nextIndexes;
}
