export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { getPopularTags } from "@/lib/public/taxonomy-queries";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/public/tags
 * Fetch popular tags with job counts
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Fetching popular tags data...");
    const startTime = Date.now();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 50" },
        { status: 400 }
      );
    }
    
    const tags = await getPopularTags(limit);
    
    const endTime = Date.now();
    console.log(`Successfully fetched ${tags.length} popular tags in ${endTime - startTime}ms`);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch tags", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
