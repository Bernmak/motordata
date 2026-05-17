import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ManagedVehicle } from "@/utils/listings";

type ListingRow = {
  id: string;
  data: ManagedVehicle;
  publication_status: ManagedVehicle["publicationStatus"];
  created_at: string;
  updated_at: string;
};

function rowToListing(row: ListingRow): ManagedVehicle {
  return {
    ...row.data,
    id: row.id,
    publicationStatus: row.publication_status,
    createdAt: row.data.createdAt || row.created_at,
    updatedAt: row.data.updatedAt || row.updated_at,
  };
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ listings: [] });
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("publication_status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    listings: ((data || []) as ListingRow[]).map(rowToListing),
  });
}
