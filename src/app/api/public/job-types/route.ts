import { NextResponse } from "next/server";
import { getAllJobTypes } from "@/lib/public/taxonomy-queries";

/**
 * GET /api/public/job-types
 * Fetch all active job types with job counts
 */
export async function GET() {
  try {
    const jobTypes = await getAllJobTypes();
    
    return NextResponse.json({ jobTypes });
  } catch (error) {
    console.error("Error fetching job types:", error);
    return NextResponse.json(
      { error: "Failed to fetch job types" },
      { status: 500 }
    );
  }
}
