"use client";

import Image from "next/image";
import { isStoredDataImage } from "@/utils/listings";

type VehicleImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export default function VehicleImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: VehicleImageProps) {
  if (isStoredDataImage(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`block ${className || ""}`} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
