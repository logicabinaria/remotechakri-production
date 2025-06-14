import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { JobCompactCard } from "@/components/public/jobs/job-compact-card";
import { JobWithRelations } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface FeaturedJobsSectionProps {
  featuredJobs: JobWithRelations[];
}

export function FeaturedJobsSection({ featuredJobs }: FeaturedJobsSectionProps) {
  return (
    <section className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 text-yellow-500 mr-2 fill-yellow-500" />
              <span className="text-sm font-medium text-primary">Handpicked Opportunities</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">
              Featured Remote Jobs
            </h2>
          </div>
          
          <Link href="/jobs" className="mt-4 md:mt-0">
            <Button variant="outline" className="group">
              View all jobs
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id} className="relative transition-all duration-300 hover:shadow-md rounded-lg group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <JobCompactCard job={job} featured={true} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No featured jobs available at the moment. Check back soon!
            </p>
            <Link href="/jobs">
              <Button variant="outline" size="sm">Browse all jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
