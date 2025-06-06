"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Clock } from "lucide-react";
import type { JobWithRelations } from "@/lib/supabase";

interface JobCompactCardProps {
  job: JobWithRelations;
  featured?: boolean;
}

export function JobCompactCard({ job, featured = false }: JobCompactCardProps) {
  // Format the posted date as relative time (e.g., "2 days ago")
  const postedDate = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });
  
  // Format salary range if available
  const salaryType = job.salary_type || 'Yearly';
  const salaryRange = job.salary_min && job.salary_max 
    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()} ${salaryType}`
    : job.salary_min
      ? `From $${job.salary_min.toLocaleString()} ${salaryType}`
      : job.salary_max
        ? `Up to $${job.salary_max.toLocaleString()} ${salaryType}`
        : null;
  
  return (
    <Link 
      href={`/jobs/${job.slug}`} 
      className="block group"
    >
      <div className={`bg-white dark:bg-gray-800 rounded-lg border ${featured ? 'border-primary border-2' : 'border-gray-200 dark:border-gray-700'} p-5 h-full transition-all hover:shadow-md`}>
        <div className="flex items-start gap-4 mb-3">
          <div className="relative h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
            {job.company_logo_url ? (
              <Image
                src={job.company_logo_url}
                alt={job.company_name}
                fill
                className="object-contain p-1"
              />
            ) : (
              <Building className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              {featured && (
                <Badge variant="default" className="ml-2 flex-shrink-0 bg-gray-900 hover:bg-gray-800">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {job.company_name}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          {job.location && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="truncate">{job.location.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{postedDate}</span>
          </div>
          {salaryRange && (
            <div className="flex items-center font-medium">
              <span>{salaryRange}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {job.category && (
            <Badge variant="outline" className="text-xs py-1 px-3 rounded-full border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              {job.category.name}
            </Badge>
          )}
          {job.job_type && (
            <Badge variant="outline" className="text-xs py-1 px-3 rounded-full border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              {job.job_type.name}
            </Badge>
          )}
          {job.tags && job.tags.length > 0 && job.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs py-1 px-3 rounded-full border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              {tag.name}
            </Badge>
          ))}
          {job.tags && job.tags.length > 3 && (
            <Badge variant="outline" className="text-xs py-1 px-3 rounded-full border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              +{job.tags.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
