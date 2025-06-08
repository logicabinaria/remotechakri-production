"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Filter
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ViewedJob {
  id: string;
  status: 'viewed' | 'applied' | 'ignored';
  viewed_at: string;
  job: {
    id: string;
    title: string;
    company_name: string;
    slug: string;
    posted_at: string;
    category: { name: string } | null;
    location: { name: string } | null;
    job_type: { name: string } | null;
  };
}

export default function ViewedJobsPage() {
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  
  const [viewedJobs, setViewedJobs] = useState<ViewedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(statusFilter || 'all');

  const fetchViewedJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userId = session.user.id;
      
      // Build query
      let query = supabase
        .from('viewed_jobs')
        .select(`
          id,
          status,
          viewed_at,
          job:jobs (
            id,
            title,
            company_name,
            slug,
            posted_at,
            category:categories (name),
            location:locations (name),
            job_type:job_types (name)
          )
        `)
        .eq('user_id', userId);
      
      // Apply status filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      // Execute query
      const { data, error } = await query.order('viewed_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching viewed jobs:', error);
        return;
      }
      
      setViewedJobs(data || []);
    } catch (error) {
      console.error('Error in fetchViewedJobs:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, filter]);
  
  useEffect(() => {
    fetchViewedJobs();
  }, [fetchViewedJobs]);

  const updateJobStatus = async (jobId: string, newStatus: 'viewed' | 'applied' | 'ignored') => {
    try {
      const { error } = await supabase
        .from('viewed_jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
      
      if (error) {
        console.error('Error updating job status:', error);
        toast({
          title: "Error",
          description: "Failed to update job status. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setViewedJobs(viewedJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
      toast({
        title: "Success",
        description: `Job marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Applied
          </span>
        );
      case 'ignored':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Ignored
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Eye className="h-3 w-3 mr-1" />
            Viewed
          </span>
        );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Viewed Jobs</h1>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : viewedJobs.length > 0 ? (
        <div className="space-y-4">
          {viewedJobs.map((viewedJob) => (
            <Card key={viewedJob.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {viewedJob.job.title}
                        </h3>
                        {getStatusBadge(viewedJob.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {viewedJob.job.company_name}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {viewedJob.job.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {viewedJob.job.category.name}
                          </span>
                        )}
                        {viewedJob.job.location && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {viewedJob.job.location.name}
                          </span>
                        )}
                        {viewedJob.job.job_type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            {viewedJob.job.job_type.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Viewed on: {formatDate(viewedJob.viewed_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                      <Link href={`/jobs/${viewedJob.job.slug}`} passHref>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <ExternalLink className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Status update buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-1 ${
                        viewedJob.status === 'viewed' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                          : ''
                      }`}
                      onClick={() => updateJobStatus(viewedJob.id, 'viewed')}
                      disabled={viewedJob.status === 'viewed'}
                    >
                      <Eye className="h-4 w-4" />
                      <span>Mark as Viewed</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-1 ${
                        viewedJob.status === 'applied' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                          : ''
                      }`}
                      onClick={() => updateJobStatus(viewedJob.id, 'applied')}
                      disabled={viewedJob.status === 'applied'}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark as Applied</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-1 ${
                        viewedJob.status === 'ignored' 
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                          : ''
                      }`}
                      onClick={() => updateJobStatus(viewedJob.id, 'ignored')}
                      disabled={viewedJob.status === 'ignored'}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Mark as Ignored</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No viewed jobs</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filter === 'all' 
              ? "You haven't viewed any jobs yet." 
              : `You don't have any jobs marked as '${filter}'.`}
          </p>
          <Link href="/" passHref>
            <Button>
              Browse Jobs
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
