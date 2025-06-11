"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Edit, Trash2 } from "lucide-react";
import { JobWithRelations } from "@/lib/supabase";

interface JobListTableProps {
  jobs: JobWithRelations[];
  loading: boolean;
  onDeleteJob: (jobId: string) => void;
}

export function JobListTable({ jobs, loading, onDeleteJob }: JobListTableProps) {
  if (loading) {
    return <div className="text-center py-4">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return <div className="text-center py-4">No jobs found.</div>;
  }

  return (
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
                  onClick={() => onDeleteJob(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
