import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ManagedVehicle } from "@/utils/listings";
import { sanitizeManagedVehicle } from "@/utils/listingSanitizer";

type ListingRow = {
  id: string;
  data: ManagedVehicle;
  publication_status: ManagedVehicle["publicationStatus"];
  owner_email: string | null;
  edit_token: string | null;
  source_base_index: number | null;
  created_at: string;
  updated_at: string;
};

type ListingPayload = {
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

function rowToListing(row: ListingRow): ManagedVehicle {
  return sanitizeManagedVehicle({
    ...row.data,
    id: row.id,
    publicationStatus: row.publication_status,
    ownerEmail: row.owner_email || row.data.ownerEmail,
    editToken: row.edit_token || row.data.editToken,
    sourceBaseIndex: row.source_base_index ?? row.data.sourceBaseIndex,
    createdAt: row.data.createdAt || row.created_at,
    updatedAt: row.data.updatedAt || row.updated_at,
  });
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return supabaseNotConfigured();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .neq("publication_status", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      listings: ((data || []) as ListingRow[]).map(rowToListing),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return supabaseNotConfigured();

  let body: ListingPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const listing = body.listing;

  if (!listing?.id) {
    return NextResponse.json(
      { error: "Falta la publicación a guardar." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const data: ManagedVehicle = {
    ...listing,
    updatedAt: listing.updatedAt || now,
  };

  const { error } = await supabase.from("listings").upsert({
    id: listing.id,
    data,
    publication_status: listing.publicationStatus,
    owner_email: listing.ownerEmail || null,
    edit_token: listing.editToken || null,
    source_base_index: listing.sourceBaseIndex ?? null,
    created_at: listing.createdAt || now,
    updated_at: data.updatedAt,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing: data });
}
