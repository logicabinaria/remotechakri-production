/**
 * Global cache configuration for RemoteChakri
 * 
 * This file centralizes all caching settings for the application
 * to make it easier to manage and update caching policies.
 */

// Set to true to completely disable caching during development
// In production, we'll use controlled revalidation times
export const DISABLE_ALL_CACHE = process.env.NODE_ENV === 'development';

// Revalidation times in seconds
export const CACHE_TIMES = {
  // Very short cache for frequently updated content (15 seconds)
  VERY_SHORT: 15,
  
  // Short cache for content that changes often (1 minute)
  SHORT: 60,
  
  // Medium cache for content that changes several times daily (10 minutes)
  MEDIUM: 600,
  
  // Long cache for content that changes daily (1 hour)
  LONG: 3600,
}

// Cache configuration for different page types
export const PAGE_CACHE_CONFIG = {
  // Home page (refresh every 1 minute)
  HOME: DISABLE_ALL_CACHE ? 0 : CACHE_TIMES.SHORT,
  
  // Job listings (refresh every 15 seconds)
  JOB_LISTINGS: DISABLE_ALL_CACHE ? 0 : CACHE_TIMES.VERY_SHORT,
  
  // Job details (refresh every 1 minute)
  JOB_DETAILS: DISABLE_ALL_CACHE ? 0 : CACHE_TIMES.SHORT,
  
  // Categories, locations, job types (refresh every 10 minutes)
  TAXONOMIES: DISABLE_ALL_CACHE ? 0 : CACHE_TIMES.MEDIUM,
}

// Cache configuration for fetch requests
export const fetchCacheConfig = {
  // No caching at all
  noCache: {
    cache: 'no-store',
  },
  
  // Revalidate on every request but use cache if available
  revalidateOnRequest: {
    next: { revalidate: 0 },
  },
  
  // Custom revalidation time
  revalidate: (seconds: number) => ({
    next: { revalidate: seconds },
  }),
}
