"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Clock } from "lucide-react";
import type { JobWithRelations } from "@/lib/supabase";
import { JobBookmarkButton } from "./job-bookmark-button";

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
      <div className={`bg-white dark:bg-gray-900 rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
        featured 
          ? 'border-primary/20 shadow-md bg-gradient-to-br from-white to-primary/5 dark:from-gray-900 dark:to-primary/5' 
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
      } p-6 h-full`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="relative h-12 w-12 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
            {job.company_logo_url ? (
              <Image
                src={job.company_logo_url}
                alt={job.company_name}
                fill
                className="object-contain p-2"
              />
            ) : (
              <Building className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors duration-200">
                  {job.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 truncate mt-1">{job.company_name}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {featured && (
                  <Badge variant="gradient" className="text-xs font-medium">
                    ⭐ Featured
                  </Badge>
                )}
                <JobBookmarkButton 
                  jobId={job.id} 
                  variant="ghost" 
                  size="sm" 
                  showText={false} 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-y-3 gap-x-6 mb-4 text-sm">
          {job.location && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="truncate">{job.location.name}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{postedDate}</span>
          </div>
          {salaryRange && (
            <div className="flex items-center font-semibold text-green-600 dark:text-green-400">
              <span>{salaryRange}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {job.category && (
            <Badge 
              key={`category-${job.category.id}`}
              variant="secondary" 
              className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            >
              {job.category.name}
            </Badge>
          )}
          {job.job_type && (
            <Badge 
              key={`job-type-${job.job_type.id}`}
              variant="secondary" 
              className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
            >
              {job.job_type.name}
            </Badge>
          )}
          {job.tags && job.tags.length > 0 && job.tags.slice(0, 2).map((tag, index) => (
            <Badge 
              key={`tag-${tag.id || index}`}
              variant="outline" 
              className="text-xs font-medium border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {tag.name}
            </Badge>
          ))}
          {job.tags && job.tags.length > 2 && (
            <Badge 
              key="more-tags"
              variant="outline" 
              className="text-xs font-medium border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              +{job.tags.length - 2} more
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
