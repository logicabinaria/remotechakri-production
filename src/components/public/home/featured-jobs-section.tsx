import Link from "next/link";
import { ArrowRight, Star, Briefcase } from "lucide-react";
import { JobCompactCard } from "@/components/public/jobs/job-compact-card";
import { JobWithRelations } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";

interface FeaturedJobsSectionProps {
  featuredJobs: JobWithRelations[];
}

export function FeaturedJobsSection({ featuredJobs }: FeaturedJobsSectionProps) {
  return (
    <SectionContainer variant="gradient" background="white" size="xl" className="relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center mb-4">
            <Badge variant="gradient" className="mr-3">
              <Star className="h-4 w-4 mr-2 fill-current" />
              Handpicked Opportunities
            </Badge>
          </div>
          <Heading 
            title="⭐ Featured Remote Jobs"
            description="Carefully curated opportunities from top companies looking for exceptional talent. These positions offer the best remote work experiences."
            size="xl"
            align="left"
            gradient
          />
        </div>
        
        <Link href="/jobs" className="mt-4 md:mt-0">
          <Button 
            variant="glass" 
            size="lg"
            className="group px-8 py-4 font-semibold transition-all duration-300 hover:scale-105"
          >
            <Briefcase className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            View All Jobs
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </Link>
      </div>
        
        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id}>
                <JobCompactCard job={job} featured={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🔍 No Featured Jobs Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
               We&apos;re carefully curating the best remote opportunities for you. Check back soon for amazing featured positions!
             </p>
            <Link href="/jobs">
              <Button 
                variant="gradient" 
                size="lg"
                className="group"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Browse All Jobs
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
        )}
    </SectionContainer>
  );
}
