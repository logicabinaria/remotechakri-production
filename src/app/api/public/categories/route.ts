import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/public/taxonomy-queries";

/**
 * GET /api/public/categories
 * Fetch all active categories with job counts
 */
export async function GET() {
  try {
    const categories = await getAllCategories();
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
