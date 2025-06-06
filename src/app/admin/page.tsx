"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// No type imports needed here

export default function AdminDashboardPage() {
  const supabase = useSupabase();
  const [stats, setStats] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    categories: 0,
    jobTypes: 0,
    locations: 0,
    tags: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Get total jobs count
        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);

        // Get published jobs count
        const { count: publishedJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null)
          .eq('is_published', true);

        // Get categories count
        const { count: categories } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);

        // Get job types count
        const { count: jobTypes } = await supabase
          .from('job_types')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);

        // Get locations count
        const { count: locations } = await supabase
          .from('locations')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);

        // Get tags count
        const { count: tags } = await supabase
          .from('tags')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);

        setStats({
          totalJobs: totalJobs || 0,
          publishedJobs: publishedJobs || 0,
          categories: categories || 0,
          jobTypes: jobTypes || 0,
          locations: locations || 0,
          tags: tags || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && (
          <p className="text-gray-500 mt-1">
            Welcome back, {user.email}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.totalJobs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Published Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.publishedJobs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.categories}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Job Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.jobTypes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.locations}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : stats.tags}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
