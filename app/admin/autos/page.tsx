import AdminVehiclesClient from "@/components/AdminVehiclesClient";
import { vehicles } from "@/data/vehicles";

export default function VehiculosPage() {
  return <AdminVehiclesClient vehicles={vehicles} />;
}
