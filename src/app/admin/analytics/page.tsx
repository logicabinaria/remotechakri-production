"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";

type JobViewStat = {
  job_id: string;
  job_title: string;
  view_count: number;
};

type DailyViewStat = {
  date: string;
  count: number;
};

export default function AnalyticsPage() {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [topViewedJobs, setTopViewedJobs] = useState<JobViewStat[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyViewStat[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueViewers, setUniqueViewers] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Get total view count
      const { count: viewCount } = await supabase
        .from('job_views')
        .select('*', { count: 'exact', head: true });
      
      setTotalViews(viewCount || 0);

      // Get unique viewers count
      const { data: uniqueData } = await supabase
        .from('job_views')
        .select('viewer_id')
        .not('viewer_id', 'is', null);
      
      const uniqueIds = new Set((uniqueData || []).map((item: { viewer_id: string }) => item.viewer_id));
      setUniqueViewers(uniqueIds.size);

      // Get top viewed jobs
      const { data: topJobsData } = await supabase
        .from('job_views')
        .select(`
          job_id,
          jobs!job_views_job_id_fkey (
            title
          )
        `)
        .is('jobs.deleted_at', null);

      // Count job views
      const jobViewCounts: Record<string, { count: number; title: string }> = {};
      (topJobsData || []).forEach((view: { job_id?: string; jobs?: { title: string } }) => {
        if (!view.job_id) return;
        
        if (!jobViewCounts[view.job_id]) {
          jobViewCounts[view.job_id] = {
            count: 0,
            title: view.jobs?.title || 'Unknown Job'
          };
        }
        jobViewCounts[view.job_id].count += 1;
      });

      // Convert to array and sort
      const topJobs = Object.entries(jobViewCounts)
        .map(([job_id, { count, title }]) => ({
          job_id,
          job_title: title,
          view_count: count
        }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);
      
      setTopViewedJobs(topJobs);

      // Get daily views for the last 7 days
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), i);
        return format(date, 'yyyy-MM-dd');
      }).reverse();

      const { data: dailyViewsData } = await supabase
        .from('job_views')
        .select('viewed_at');

      // Count views per day
      const dailyViewCounts: Record<string, number> = {};
      last7Days.forEach(day => {
        dailyViewCounts[day] = 0;
      });

      (dailyViewsData || []).forEach((view: { viewed_at?: string }) => {
        if (!view.viewed_at) return;
        
        const viewDate = format(new Date(view.viewed_at), 'yyyy-MM-dd');
        if (dailyViewCounts[viewDate] !== undefined) {
          dailyViewCounts[viewDate] += 1;
        }
      });

      // Convert to array
      const dailyViewStats = Object.entries(dailyViewCounts)
        .map(([date, count]) => ({
          date,
          count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      setDailyViews(dailyViewStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Job Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : totalViews}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Unique Viewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : uniqueViewers}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Viewed Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading analytics...</div>
          ) : topViewedJobs.length === 0 ? (
            <div className="text-center py-4">No job views recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Job Title</th>
                    <th className="text-right py-3 px-4">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topViewedJobs.map((job) => (
                    <tr key={job.job_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{job.job_title}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {job.view_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Views (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading analytics...</div>
          ) : (
            <div className="h-64">
              <div className="flex h-full items-end space-x-2">
                {dailyViews.map((day) => {
                  const maxCount = Math.max(...dailyViews.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-primary rounded-t" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500">
                        {format(new Date(day.date), 'MMM d')}
                      </div>
                      <div className="text-xs font-medium">
                        {day.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
