"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { JobCompactCard } from "@/components/public/jobs/job-compact-card";
import type { JobWithRelations } from "@/lib/supabase";

// Simple spinner component
function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 ${className || ''}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface RecentJobsSectionProps {
  initialJobs: JobWithRelations[];
  totalJobs: number;
}

export function RecentJobsSection({ initialJobs, totalJobs }: RecentJobsSectionProps) {
  const [jobs, setJobs] = useState<JobWithRelations[]>(initialJobs);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialJobs.length < totalJobs);
  
  // Load more jobs when the "Load More" button is clicked
  const loadMoreJobs = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/jobs/recent?page=${nextPage}&excludeFeatured=true`);
      const data = await response.json();
      
      if (data.jobs.length > 0) {
        setJobs(prevJobs => [...prevJobs, ...data.jobs]);
        setPage(nextPage);
        setHasMore(data.jobs.length + jobs.length < data.total);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Heading 
          title="Recent Job Opportunities"
          description="Discover the latest remote job postings from top companies worldwide and find your next career opportunity."
          size="lg"
          align="center"
          gradient={true}
        />
      </div>
      <div className="flex justify-end mb-8">
        <Link href="/jobs" className="text-primary hover:underline font-medium">
          View all jobs
        </Link>
      </div>
        
        {jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCompactCard key={job.id} job={job} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 text-center">
                <Button 
                  onClick={loadMoreJobs} 
                  disabled={loading}
                  variant="glass"
                  size="lg"
                  className="min-w-[200px] group"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Jobs
                      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No recent jobs available at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
