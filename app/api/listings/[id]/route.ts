import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ManagedVehicle } from "@/utils/listings";

type ListingRouteProps = {
  params: Promise<{ id: string }>;
};

type UpdatePayload = {
  listing?: ManagedVehicle;
};

function supabaseNotConfigured() {
  return NextResponse.json(
    {
      error:
        "Supabase no está configurado. Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.",
    },
    { status: 503 }
  );
}

export async function PATCH(request: Request, { params }: ListingRouteProps) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return supabaseNotConfigured();

  const { id } = await params;
  let body: UpdatePayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const listing = body.listing;

  if (!listing) {
    return NextResponse.json(
      { error: "Falta la publicación a actualizar." },
      { status: 400 }
    );
  }

  const updatedAt = new Date().toISOString();
  const data: ManagedVehicle = {
    ...listing,
    id,
    updatedAt,
  };

  const { error } = await supabase
    .from("listings")
    .update({
      data,
      publication_status: data.publicationStatus,
      owner_email: data.ownerEmail || null,
      edit_token: data.editToken || null,
      source_base_index: data.sourceBaseIndex ?? null,
      updated_at: updatedAt,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing: data });
}

export async function DELETE(_request: Request, { params }: ListingRouteProps) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return supabaseNotConfigured();

  const { id } = await params;
  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from("listings")
    .update({
      publication_status: "deleted",
      updated_at: updatedAt,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
