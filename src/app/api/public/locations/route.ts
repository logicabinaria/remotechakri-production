import { NextResponse } from "next/server";
import { getAllLocations } from "@/lib/public/taxonomy-queries";

/**
 * GET /api/public/locations
 * Fetch all active locations with job counts
 */
export async function GET() {
  try {
    const locations = await getAllLocations();
    
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
