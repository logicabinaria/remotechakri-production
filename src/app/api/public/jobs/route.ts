import { NextRequest, NextResponse } from "next/server";
import { getLatestJobs } from "@/lib/public/job-queries";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/public/jobs
 * Fetch jobs with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Optional filters
    const categorySlug = searchParams.get("category_slug");
    const locationSlug = searchParams.get("location_slug");
    const jobTypeSlug = searchParams.get("job_type_slug");
    const tagSlug = searchParams.get("tag_slug");
    const searchQuery = searchParams.get("search") || undefined;
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter" },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 50" },
        { status: 400 }
      );
    }
    
    // Fetch jobs with pagination
    const { jobs, total } = await getLatestJobs({
      page,
      limit,
      categorySlug: categorySlug || undefined,
      locationSlug: locationSlug || undefined,
      jobTypeSlug: jobTypeSlug || undefined,
      tagSlug: tagSlug || undefined,
      searchQuery
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
