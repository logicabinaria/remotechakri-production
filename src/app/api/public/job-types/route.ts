export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAllJobTypes } from "@/lib/public/taxonomy-queries";

/**
 * GET /api/public/job-types
 * Fetch all active job types with job counts
 */
export async function GET() {
  try {
    console.log("Fetching job types data...");
    const startTime = Date.now();
    
    const jobTypes = await getAllJobTypes();
    
    const endTime = Date.now();
    console.log(`Successfully fetched ${jobTypes.length} job types in ${endTime - startTime}ms`);
    
    return NextResponse.json({ jobTypes });
  } catch (error) {
    console.error("Error fetching job types:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch job types", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
