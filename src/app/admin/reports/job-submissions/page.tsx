"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

type JobSubmission = {
  id: string;
  title: string;
  company_name: string;
  posted_at: string;
  admin_name: string;
  admin_id: string;
};

type GroupedSubmissions = {
  date: string;
  jobs: JobSubmission[];
};

export default function JobSubmissionsPage() {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [groupedSubmissions, setGroupedSubmissions] = useState<GroupedSubmissions[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;
  
  // Date filters
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  // Fetch jobs with admin information
  const fetchJobSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      // First fetch jobs with date filtering
      const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
      const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
      
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          posted_at,
          posted_by
        `)
        .is('deleted_at', null)
        .order('posted_at', { ascending: false });
      
      // Apply date filters if provided
      if (startDateStr) {
        query = query.gte('posted_at', `${startDateStr}T00:00:00`);
      }
      
      if (endDateStr) {
        query = query.lte('posted_at', `${endDateStr}T23:59:59`);
      }
      
      const { data: jobsData, error: jobsError } = await query;

      if (jobsError) throw jobsError;
      
      // Then fetch admin information for each job
      const jobsWithAdmins = [];
      
      for (const job of jobsData || []) {
        // Get admin info for this job using the user_id directly
        const { data: adminData } = await supabase
          .from('admins')
          .select('name')
          .eq('user_id', job.posted_by)
          .maybeSingle();
          
        jobsWithAdmins.push({
          id: job.id,
          title: job.title,
          company_name: job.company_name,
          posted_at: job.posted_at,
          admin_id: job.posted_by,
          admin_name: adminData?.name || 'Unknown Admin'
        });
      }
      
      // Group submissions by date
      const grouped = groupSubmissionsByDate(jobsWithAdmins);
      setGroupedSubmissions(grouped);
      
      // Calculate pagination
      setTotalPages(Math.ceil(grouped.length / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching job submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, startDate, endDate]);

  // Group submissions by date
  const groupSubmissionsByDate = (submissions: JobSubmission[]): GroupedSubmissions[] => {
    const grouped: Record<string, JobSubmission[]> = {};
    
    submissions.forEach(job => {
      const date = job.posted_at.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(job);
    });
    
    return Object.entries(grouped)
      .map(([date, jobs]) => ({
        date,
        jobs
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  // Get paginated groups
  const getPaginatedGroups = (): GroupedSubmissions[] => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return groupedSubmissions.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchJobSubmissions();
  }, [fetchJobSubmissions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Submissions Report</h1>
      </div>

      {/* Date filters */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <DatePicker date={startDate} setDate={setStartDate} label="Select start date" />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker date={endDate} setDate={setEndDate} label="Select end date" />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchJobSubmissions}>Apply Filter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Job Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading job submissions...</span>
            </div>
          ) : getPaginatedGroups().length === 0 ? (
            <div className="text-center py-8">
              <p>No job submissions found for the selected date range.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {getPaginatedGroups().map((group) => (
                <AccordionItem key={group.date} value={group.date}>
                  <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-800 px-4">
                    <div className="flex justify-between w-full">
                      <span>{format(new Date(group.date), 'MMMM d, yyyy')}</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {group.jobs.length} {group.jobs.length === 1 ? 'job' : 'jobs'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b dark:border-gray-700">
                            <th className="text-left py-3 px-4">Job Title</th>
                            <th className="text-left py-3 px-4">Company</th>
                            <th className="text-left py-3 px-4">Time</th>
                            <th className="text-left py-3 px-4">Admin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.jobs.map((job) => (
                            <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="py-3 px-4">{job.title}</td>
                              <td className="py-3 px-4">{job.company_name}</td>
                              <td className="py-3 px-4">{format(new Date(job.posted_at), 'h:mm a')}</td>
                              <td className="py-3 px-4">{job.admin_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
