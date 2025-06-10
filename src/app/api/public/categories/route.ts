export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/public/taxonomy-queries";

/**
 * GET /api/public/categories
 * Fetch all active categories with job counts
 */
export async function GET() {
  try {
    console.log("Fetching categories data...");
    const startTime = Date.now();
    
    const categories = await getAllCategories();
    
    const endTime = Date.now();
    console.log(`Successfully fetched ${categories.length} categories in ${endTime - startTime}ms`);
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch categories", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
