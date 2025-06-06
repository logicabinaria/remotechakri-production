import { NextRequest, NextResponse } from "next/server";
import { getJobBySlug } from "@/lib/public/job-queries";

/**
 * GET /api/public/jobs/[slug]
 * Fetch a single job by its slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: "Job slug is required" },
        { status: 400 }
      );
    }
    
    const job = await getJobBySlug(slug);
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ job });
  } catch (error) {
    console.error(`Error fetching job with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
