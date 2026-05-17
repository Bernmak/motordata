import AdminVehicleDetailClient from "@/components/AdminVehicleDetailClient";
import { vehicles } from "@/data/vehicles";

export default async function DetalleVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminVehicleDetailClient vehicleId={id} baseVehicles={vehicles} />;
}
