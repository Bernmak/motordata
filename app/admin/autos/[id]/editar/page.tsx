import AdminVehicleEditClient from "@/components/AdminVehicleEditClient";

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminVehicleEditClient vehicleId={id} />;
}
