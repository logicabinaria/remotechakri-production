export const runtime = 'edge';

// Force dynamic rendering to ensure fresh data on each page visit
export const dynamic = 'force-dynamic';

// Remove revalidation setting since we're using dynamic rendering

import { Suspense } from 'react';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { JobCard } from '@/components/public/jobs/job-card';
import { JobFilterPagination } from "@/components/public/shared/job-filter-pagination";
import { getLatestJobs } from '@/lib/public/job-queries';
import { getAllCategories, getAllJobTypes, getAllLocations } from '@/lib/public/taxonomy-queries';
import { generateMetadata } from '@/components/public/seo/metadata';
import { JobFilterProvider } from '@/components/providers/job-filter-provider';
import { JobFilters } from '@/components/public/jobs/job-filters';
import { MobileFilterDrawer } from '@/components/public/jobs/mobile-filter-drawer';

// Generate metadata for SEO
export const metadata = generateMetadata({
  title: "Browse Remote Jobs | RemoteChakri.com",
  description: "Find your next remote job opportunity. Browse thousands of remote jobs across various categories, locations, and job types.",
  keywords: ["remote jobs", "work from home", "remote work", "job listings", "remote career"],
});

// Define search params interface
interface SearchParams {
  page?: string;
  category?: string;
  location?: string;
  jobType?: string;
  search?: string;
  datePosted?: string;
  sortBy?: string;
  tags?: string;
  tag?: string;
}

// Jobs list page component
export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  // Parse search params
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const categorySlug = searchParams.category;
  const locationSlug = searchParams.location;
  const jobTypeSlug = searchParams.jobType;
  const searchQuery = searchParams.search;
  const datePosted = searchParams.datePosted;
  const sortBy = searchParams.sortBy || 'newest';
  // Handle both 'tag' (singular) and 'tags' (plural) parameters
  const tagSlugs = searchParams.tags ? searchParams.tags.split(',') : 
                   searchParams.tag ? [searchParams.tag] : [];
  
  // Fetch filter data
  const [allCategories, allLocations, allJobTypes] = await Promise.all([
    getAllCategories(),
    getAllLocations(),
    getAllJobTypes()
  ]);
  
  // Filter out items with zero job counts for the sidebar
  const categories = allCategories.filter(category => category.job_count > 0);
  const locations = allLocations.filter(location => location.job_count > 0);
  const jobTypes = allJobTypes.filter(jobType => jobType.job_count > 0);
  
  // Fetch jobs with filters and pagination
  const { jobs, total } = await getLatestJobs({
    page,
    limit: 12,
    categorySlug,
    locationSlug,
    jobTypeSlug,
    searchQuery,
    datePosted,
    sortBy,
    tagSlugs
  });
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / 12);
  
  // Create a unique key based on all filter parameters to force re-render when filters change
  const filterKey = `${categorySlug || ''}-${locationSlug || ''}-${jobTypeSlug || ''}-${searchQuery || ''}-${datePosted || ''}-${sortBy || ''}-${tagSlugs.join(',') || ''}-${searchParams.tag || ''}-${page}`;
  
  return (
    <JobFilterProvider>
      <PublicLayout key={filterKey}>
        {/* Page header */}
        <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                Browse Remote Jobs
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Find your next remote opportunity from our curated list of remote-friendly positions
              </p>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar - desktop */}
            <aside className="hidden md:block w-64 shrink-0">
              <Suspense fallback={<FiltersSkeleton />}>
                <JobFilters 
                  categories={categories}
                  locations={locations}
                  jobTypes={jobTypes}
                />
              </Suspense>
            </aside>
            
            {/* Jobs listing */}
            <main className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold dark:text-white">
                  {total} {total === 1 ? 'Job' : 'Jobs'} Found
                </h2>
                
                <div className="flex items-center gap-2">
                  <MobileFilterDrawer
                    trigger={
                      <Button variant="outline" size="sm" className="md:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    }
                  >
                    <JobFilters 
                      categories={categories}
                      locations={locations}
                      jobTypes={jobTypes}
                    />
                  </MobileFilterDrawer>
                </div>
              </div>
              
              {jobs.length > 0 ? (
                <div className="grid gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <h3 className="text-xl font-medium mb-2 dark:text-white">No jobs found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Try adjusting your search filters or check back later for new opportunities.
                    </p>
                    <Link href="/jobs">
                      <Button>Clear Filters</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <JobFilterPagination
          currentPage={page}
          totalPages={totalPages}
        />
                </div>
              )}
            </main>
          </div>
        </div>
      </PublicLayout>
    </JobFilterProvider>
  );
}



// Skeleton loader for filters
function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-5 w-24 mb-2" />
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-5 w-24 mb-2" />
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-5 w-24 mb-2" />
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}
