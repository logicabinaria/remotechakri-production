"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Eye, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { VerificationReminder } from "@/components/verification-reminder";
import { JobBookmarkButton } from "@/components/public/jobs/job-bookmark-button";

interface DashboardStats {
  bookmarkedJobs: number;
  viewedJobs: number;
  appliedJobs: number;
  totalJobs: number;
}

export default function DashboardPage() {
  const supabase = useSupabase();
  const [stats, setStats] = useState<DashboardStats>({
    bookmarkedJobs: 0,
    viewedJobs: 0,
    appliedJobs: 0,
    totalJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  interface RecentJob {
    id: string;
    title: string;
    company_name: string;
    slug: string;
    created_at: string;
    category?: { name: string };
    location?: { name: string };
    job_type?: { name: string };
  }
  
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const userId = session.user.id;
        
        // Fetch bookmarked jobs count
        const { count: bookmarkedCount, error: bookmarkError } = await supabase
          .from('my_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        // Fetch viewed jobs count
        const { count: viewedCount, error: viewedError } = await supabase
          .from('viewed_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        // Fetch applied jobs count
        const { count: appliedCount, error: appliedError } = await supabase
          .from('viewed_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'applied');
        
        // Fetch total jobs count
        const { count: totalCount, error: totalError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        // Fetch recent jobs
        const { data: recentJobsData, error: recentError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            company_name,
            slug,
            updated_at,
            category:categories(name),
            location:locations(name),
            job_type:job_types(name)
          `)
          .order('updated_at', { ascending: false })
          .limit(5);
        
        if (bookmarkError) console.error('Error fetching bookmarked jobs:', bookmarkError);
        if (viewedError) console.error('Error fetching viewed jobs:', viewedError);
        if (appliedError) console.error('Error fetching applied jobs:', appliedError);
        if (totalError) console.error('Error fetching total jobs:', totalError);
        if (recentError) console.error('Error fetching recent jobs:', recentError);
        
        setStats({
          bookmarkedJobs: bookmarkedCount || 0,
          viewedJobs: viewedCount || 0,
          appliedJobs: appliedCount || 0,
          totalJobs: totalCount || 0,
        });
        
        setRecentJobs(recentJobsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Verification Reminder */}
          <VerificationReminder />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bookmarked Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Bookmark className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.bookmarkedJobs}</p>
                    <Link 
                      href="/dashboard/my-jobs" 
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View all bookmarks
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Viewed Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.viewedJobs}</p>
                    <Link 
                      href="/dashboard/viewed-jobs" 
                      className="text-xs text-purple-500 hover:underline"
                    >
                      View history
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Applied Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.appliedJobs}</p>
                    <Link 
                      href="/dashboard/viewed-jobs?status=applied" 
                      className="text-xs text-green-500 hover:underline"
                    >
                      View applications
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Available Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-amber-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                    <Link 
                      href="/" 
                      className="text-xs text-amber-500 hover:underline"
                    >
                      Browse jobs
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Jobs */}
          <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
          <div className="space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Link 
                      href={`/jobs/${job.slug}`}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h3>
                            <div className="flex-shrink-0 ml-2">
                              <JobBookmarkButton 
                                jobId={job.id} 
                                variant="ghost" 
                                size="sm" 
                                showText={false} 
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{job.company_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          {job.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {job.category.name}
                            </span>
                          )}
                          {job.location && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {job.location.name}
                            </span>
                          )}
                          {job.job_type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              {job.job_type.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 py-4">No recent jobs found.</p>
            )}
            
            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                View All Jobs
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
