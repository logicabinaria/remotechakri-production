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
    <Card className={`overflow-hidden ${featured ? 'border-primary border-2' : ''}`}>
      <CardContent className="p-6">
        {/* Company logo and info */}
        <div className="flex items-center mb-4">
          <div className="relative h-12 w-12 mr-4 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
            {job.company_logo_url ? (
              <Image
                src={job.company_logo_url}
                alt={job.company_name}
                fill
                className="object-contain p-1"
              />
            ) : (
              <Building className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">
              {job.company_name}
            </h3>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{postedDate}</span>
            </div>
          </div>
          {featured && (
            <React.Fragment key="featured-fragment">
              <Badge variant="default" className="ml-auto">
                Featured
              </Badge>
            </React.Fragment>
          )}
        </div>

        {/* Job title and details */}
        <Link href={`/jobs/${job.slug}`} className="hover:no-underline">
          <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {job.title}
          </h2>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {job.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{job.location.name}</span>
            </div>
          )}
          
          {job.job_type && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{job.job_type.name}</span>
            </div>
          )}
        </div>

        {/* Salary info */}
        <div className="text-sm font-medium mb-4">
          {salaryRange}
        </div>

        {/* Short description - truncate after 120 characters */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {job.description.replace(/<[^>]*>?/gm, '').substring(0, 120)}
          {job.description.length > 120 ? '...' : ''}
        </p>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 3).map((tag) => (
              <React.Fragment key={`tag-fragment-${tag.id}`}>
                <Badge variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              </React.Fragment>
            ))}
            {job.tags.length > 3 && (
              <React.Fragment key="more-tags-fragment">
                <Badge variant="outline" className="text-xs">
                  +{job.tags.length - 3} more
                </Badge>
              </React.Fragment>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
        <Link href={`/jobs/${job.slug}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        
        <a href={job.external_url} target="_blank" rel="noopener noreferrer">
          <Button size="sm">
            Apply Now <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
