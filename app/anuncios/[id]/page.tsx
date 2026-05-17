import ManageListingClient from "@/components/ManageListingClient";

export default async function GestionAnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ManageListingClient listingId={id} />;
}
