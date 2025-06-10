export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAllLocations } from "@/lib/public/taxonomy-queries";

/**
 * GET /api/public/locations
 * Fetch all active locations with job counts
 */
export async function GET() {
  try {
    console.log("Fetching locations data...");
    const startTime = Date.now();
    
    const locations = await getAllLocations();
    
    const endTime = Date.now();
    console.log(`Successfully fetched ${locations.length} locations in ${endTime - startTime}ms`);
    
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch locations", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
