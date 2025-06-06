"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold dark:text-white">
            Recent Job Opportunities
          </h2>
          <Link href="/jobs" className="text-primary hover:underline font-medium">
            View all jobs
          </Link>
        </div>
        
        {jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <JobCompactCard key={job.id} job={job} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 text-center">
                <Button 
                  onClick={loadMoreJobs} 
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Loading...
                    </>
                  ) : (
                    'Load More Jobs'
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
    </section>
  );
}
