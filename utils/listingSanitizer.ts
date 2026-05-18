import type { ManagedVehicle } from "@/utils/listings";

const knownWrongRangerImage =
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80";

export function sanitizeManagedVehicle(listing: ManagedVehicle): ManagedVehicle {
  if (
    listing.brand === "Ford" &&
    listing.model === "Ranger" &&
    listing.version === "XLT" &&
    listing.year === 2021
  ) {
    const images = listing.images.filter((image) => image !== knownWrongRangerImage);
    return { ...listing, images: images.length > 0 ? images : ["/cars/ranger.jpg"] };
  }

  return listing;
}
