"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Job, JobWithRelations } from "@/lib/supabase";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

export default function AdminJobsPage() {
  const supabase = useSupabase();
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch jobs with their relations
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          *,
          location:locations(*),
          job_type:job_types(*),
          category:categories(*)
        `)
        .is('deleted_at', null)
        .order('posted_at', { ascending: false });

      if (error) throw error;

      // For each job, fetch its tags
      const jobsWithTags = await Promise.all(
        (jobsData || []).map(async (job: Job) => {
          const { data: tagData } = await supabase
            .from('job_tags')
            .select('tags(*)')
            .eq('job_id', job.id);

          const tags = tagData?.map((t: { tags: { id: string; name: string; slug: string; deleted_at: string | null } }) => t.tags) || [];
          return { ...job, tags };
        })
      );

      setJobs(jobsWithTags);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      // Soft delete by updating the deleted_at field
      const { error } = await supabase
        .from('jobs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;

      // Refresh the jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Job
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-4">No jobs found. Create your first job!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm dark:text-gray-200">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Salary</th>
                    <th className="text-left py-3 px-4">Posted</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium">{job.title}</div>
                      </td>
                      <td className="py-3 px-4">{job.company_name}</td>
                      <td className="py-3 px-4">{job.category?.name || "-"}</td>
                      <td className="py-3 px-4">{job.job_type?.name || "-"}</td>
                      <td className="py-3 px-4">{job.location?.name || "-"}</td>
                      <td className="py-3 px-4">
                        {job.salary_min && job.salary_max ? (
                          <span>
                            ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} {job.salary_type || 'Yearly'}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {job.posted_at ? format(new Date(job.posted_at), 'MMM d, yyyy') : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.is_published
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          }`}
                        >
                          {job.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link href={`/jobs/${job.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
