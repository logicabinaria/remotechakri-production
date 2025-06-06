import { NextRequest, NextResponse } from "next/server";
import { recordJobView } from "@/lib/public/job-queries";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Simple in-memory rate limiting
// In production, consider using Redis or another distributed solution
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 views per job per IP per hour

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

// In-memory store for rate limiting
// Key format: `${ip}-${jobId}`
const rateLimitStore: Record<string, RateLimitEntry> = {};

// Clean up expired rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (now - rateLimitStore[key].timestamp > RATE_LIMIT_WINDOW) {
      delete rateLimitStore[key];
    }
  });
}, RATE_LIMIT_WINDOW);

/**
 * POST /api/public/job-views
 * Record a job view with rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // Get request data
    const body = await request.json();
    const { jobId } = body;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Get IP address (partially anonymized for privacy)
    const forwardedFor = request.headers.get("x-forwarded-for");
    let ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    
    // Anonymize IP by removing last octet
    ip = ip.split(".").slice(0, 3).join(".") + ".0";
    
    // Get viewer ID from cookies if user is authenticated
    // We'll use this only for analytics, not for DB foreign key
    const cookieStore = cookies();
    let viewerCookieId = cookieStore.get("viewer_id")?.value;
    
    if (!viewerCookieId) {
      viewerCookieId = uuidv4();
      // Cookie will be set in the response
    }
    
    // Get user agent
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // Apply rate limiting
    const rateLimitKey = `${ip}-${jobId}`;
    const now = Date.now();
    
    if (rateLimitStore[rateLimitKey]) {
      const entry = rateLimitStore[rateLimitKey];
      
      // If within rate limit window and exceeded max requests
      if (now - entry.timestamp < RATE_LIMIT_WINDOW && entry.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
      
      // Reset count if window expired
      if (now - entry.timestamp >= RATE_LIMIT_WINDOW) {
        rateLimitStore[rateLimitKey] = { count: 1, timestamp: now };
      } else {
        // Increment count
        entry.count += 1;
      }
    } else {
      // First request for this IP and job
      rateLimitStore[rateLimitKey] = { count: 1, timestamp: now };
    }
    
    // Record the job view - pass null for viewer_id to avoid foreign key constraint
    const success = await recordJobView(jobId, ip, null, userAgent);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to record job view" },
        { status: 500 }
      );
    }
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set viewer ID cookie if it doesn't exist
    // This is just for analytics tracking, not for database foreign key
    if (!cookieStore.get("viewer_id")) {
      response.cookies.set({
        name: "viewer_id",
        value: viewerCookieId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/"
      });
    }
    
    return response;
  } catch (error) {
    console.error("Error recording job view:", error);
    return NextResponse.json(
      { error: "Failed to record job view" },
      { status: 500 }
    );
  }
}
