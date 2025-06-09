export const runtime = 'edge';

// Use a balanced approach with a short revalidation time
// This provides fresh data without excessive database load
export const revalidate = 60; // Revalidate every minute

import { Suspense } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { JobCard } from '@/components/public/jobs/job-card';
import { Pagination } from '@/components/public/shared/pagination';
import { getLatestJobs } from '@/lib/public/job-queries';
import { getAllCategories, getAllJobTypes, getAllLocations } from '@/lib/public/taxonomy-queries';
import { generateMetadata } from '@/components/public/seo/metadata';

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
}

// Jobs list page component
export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  // Parse search params
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const categorySlug = searchParams.category;
  const locationSlug = searchParams.location;
  const jobTypeSlug = searchParams.jobType;
  const searchQuery = searchParams.search;
  
  // Fetch jobs with filters and pagination
  const { jobs, total } = await getLatestJobs({
    page,
    limit: 12,
    categorySlug,
    locationSlug,
    jobTypeSlug,
    searchQuery
  });
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / 12);
  
  return (
    <PublicLayout>
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
          {/* Filters sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <Suspense fallback={<FiltersSkeleton />}>
              <JobFilters 
                selectedCategory={categorySlug} 
                selectedLocation={locationSlug} 
                selectedJobType={jobTypeSlug}
                searchQuery={searchQuery}
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
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
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
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  baseUrl="/jobs"
                  preserveParams={true}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}

// Filters component
async function JobFilters({ 
  selectedCategory, 
  selectedLocation, 
  selectedJobType,
  searchQuery
}: { 
  selectedCategory?: string;
  selectedLocation?: string;
  selectedJobType?: string;
  searchQuery?: string;
}) {
  // Fetch filter options
  const [categories, locations, jobTypes] = await Promise.all([
    getAllCategories(),
    getAllLocations(),
    getAllJobTypes()
  ]);
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium dark:text-white">Filters</h3>
          <Link href="/jobs" className="text-sm text-primary hover:underline">
            Clear all
          </Link>
        </div>
        
        {/* Search filter */}
        <div className="mb-6">
          <form action="/jobs" method="get" className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium block dark:text-gray-300">
              Search Jobs
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={searchQuery}
                placeholder="Job title, skills, etc."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </div>
          </form>
        </div>
        
        {/* Category filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <Link 
                  href={`/jobs?category=${category.slug}${selectedLocation ? `&location=${selectedLocation}` : ''}${selectedJobType ? `&jobType=${selectedJobType}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className={`text-sm hover:text-primary flex items-center justify-between w-full ${selectedCategory === category.slug ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({category.job_count})</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Location filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Locations</h4>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center">
                <Link 
                  href={`/jobs?location=${location.slug}${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedJobType ? `&jobType=${selectedJobType}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className={`text-sm hover:text-primary flex items-center justify-between w-full ${selectedLocation === location.slug ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{location.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({location.job_count})</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Job Type filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Job Types</h4>
          <div className="space-y-2">
            {jobTypes.map((jobType) => (
              <div key={jobType.id} className="flex items-center">
                <Link 
                  href={`/jobs?jobType=${jobType.slug}${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedLocation ? `&location=${selectedLocation}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className={`text-sm hover:text-primary flex items-center justify-between w-full ${selectedJobType === jobType.slug ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{jobType.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({jobType.job_count})</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
