"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Building, Briefcase, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { JobWithRelations } from "@/lib/supabase";
import { JobBookmarkButton } from "./job-bookmark-button";

interface JobCardProps {
  job: JobWithRelations;
  featured?: boolean;
}

export function JobCard({ job, featured = false }: JobCardProps) {
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
        : "Salary not specified";

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-md dark:hover:shadow-lg ${
      featured 
        ? 'border-primary border-2 shadow-sm' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <CardContent className="p-6 relative">
        {/* Featured gradient overlay */}
        {featured && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        )}
        
        {/* Company logo and info */}
        <div className="flex items-center mb-4 relative z-10">
          <div className="relative h-14 w-14 mr-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50 group-hover:ring-primary/20 transition-all duration-300">
            {job.company_logo_url ? (
              <Image
                src={job.company_logo_url}
                alt={job.company_name}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <Building className="h-7 w-7 text-gray-400 dark:text-gray-500 transition-colors duration-300 group-hover:text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300">
              {job.company_name}
            </h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>{postedDate}</span>
            </div>
          </div>
          {featured && (
            <React.Fragment key="featured-fragment">
              <Badge variant="default" className="ml-auto bg-gradient-to-r from-primary to-secondary text-white shadow-sm">
                Featured
              </Badge>
            </React.Fragment>
          )}
        </div>

        {/* Job title and bookmark button */}
        <div className="flex justify-between items-start mb-3 relative z-10">
          <Link href={`/jobs/${job.slug}`} className="hover:no-underline flex-1 group/title">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover/title:text-primary transition-all duration-300 pr-2 leading-tight">
              {job.title}
            </h2>
          </Link>
          <div className="flex-shrink-0 ml-2">
            <div className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              <JobBookmarkButton 
                jobId={job.id} 
                variant="ghost" 
                size="sm" 
                showText={false} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 relative z-10">
          {job.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors duration-300 group-hover:bg-primary/5">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-2">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">{job.location.name}</span>
            </div>
          )}
          
          {job.job_type && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors duration-300 group-hover:bg-primary/5">
              <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-md mr-2">
                <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">{job.job_type.name}</span>
            </div>
          )}
        </div>

        {/* Salary info */}
        <div className="mb-4 relative z-10">
          <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-lg border border-primary/20">
            <span className="text-sm font-semibold text-primary dark:text-primary-light">
              💰 {salaryRange}
            </span>
          </div>
        </div>

        {/* Short description - truncate after 120 characters */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {job.description.replace(/<[^>]*>?/gm, '').substring(0, 120)}
          {job.description.length > 120 ? '...' : ''}
        </p>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 relative z-10">
            {job.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={`tag-${tag.id || index}`}
                variant="outline" 
                className="text-xs font-medium bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
              >
                #{tag.name}
              </Badge>
            ))}
            {job.tags.length > 3 && (
              <React.Fragment key="more-tags-fragment">
                <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                  +{job.tags.length - 3} more
                </Badge>
              </React.Fragment>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-700/50">
        <Link href={`/jobs/${job.slug}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="group/btn border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <span className="group-hover/btn:text-primary transition-colors duration-300">View Details</span>
          </Button>
        </Link>
        
        <a href={job.external_url} target="_blank" rel="noopener noreferrer">
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-sm hover:shadow-md transition-all duration-300 group/apply"
          >
            Apply Now 
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover/apply:translate-x-0.5 transition-transform duration-300" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
