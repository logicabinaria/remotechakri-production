import Link from "next/link";
import { JobCompactCard } from "@/components/public/jobs/job-compact-card";
import { JobWithRelations } from "@/lib/supabase";

interface FeaturedJobsSectionProps {
  featuredJobs: JobWithRelations[];
}

export function FeaturedJobsSection({ featuredJobs }: FeaturedJobsSectionProps) {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold dark:text-white">
            Featured Remote Jobs
          </h2>
          <Link href="/jobs" className="text-primary hover:underline font-medium">
            View all jobs
          </Link>
        </div>
        
        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {featuredJobs.map((job) => (
              <JobCompactCard key={job.id} job={job} featured={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No featured jobs available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
