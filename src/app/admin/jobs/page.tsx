"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobWithRelations } from "@/lib/supabase";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobListTable } from "./components/job-list-table";
import { JobPagination } from "./components/job-pagination";
import { JobSearch } from "./components/job-search";

export default function AdminJobsPage() {
  const supabase = useSupabase();
  const [activeJobs, setActiveJobs] = useState<JobWithRelations[]>([]);
  const [expiredJobs, setExpiredJobs] = useState<JobWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("active");
  
  // Pagination state
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [currentExpiredPage, setCurrentExpiredPage] = useState(1);
  const [totalActivePages, setTotalActivePages] = useState(1);
  const [totalExpiredPages, setTotalExpiredPages] = useState(1);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Items per page
  const itemsPerPage = 10;

  const fetchJobs = useCallback(async (tab = currentTab, page = 1, query = searchQuery) => {
    setLoading(true);
    try {
      // Calculate pagination range
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Build the base query
      let baseQuery = supabase
        .from("jobs")
        .select(
          "*, category:categories(*), job_type:job_types(*), location:locations(*)",
          { count: 'exact' }
        )
        .is('deleted_at', null)
        .order("posted_at", { ascending: false });
      
      // Apply filters based on tab
      const now = new Date().toISOString();
      if (tab === "active") {
        baseQuery = baseQuery.or(`expires_at.gt.${now},expires_at.is.null`);
      } else if (tab === "expired") {
        baseQuery = baseQuery.lt('expires_at', now);
      }
      
      // Apply search query if provided
      if (query) {
        baseQuery = baseQuery.or(
          `title.ilike.%${query}%,slug.ilike.%${query}%,company_name.ilike.%${query}%`
        );
      }
      
      // Apply pagination
      const { data, error, count } = await baseQuery
        .range(from, to);

      if (error) throw error;
      
      // Update state based on current tab
      if (tab === "active") {
        setActiveJobs(data as JobWithRelations[]);
        setTotalActivePages(Math.ceil((count || 0) / itemsPerPage));
      } else {
        setExpiredJobs(data as JobWithRelations[]);
        setTotalExpiredPages(Math.ceil((count || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error(`Error fetching ${tab} jobs:`, error);
    } finally {
      setLoading(false);
    }
  }, [supabase, itemsPerPage, currentTab, searchQuery]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (value === "active") {
      fetchJobs("active", currentActivePage, searchQuery);
    } else {
      fetchJobs("expired", currentExpiredPage, searchQuery);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (currentTab === "active") {
      setCurrentActivePage(page);
      fetchJobs("active", page, searchQuery);
    } else {
      setCurrentExpiredPage(page);
      fetchJobs("expired", page, searchQuery);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (currentTab === "active") {
      setCurrentActivePage(1); // Reset to first page on new search
      fetchJobs("active", 1, query);
    } else {
      setCurrentExpiredPage(1); // Reset to first page on new search
      fetchJobs("expired", 1, query);
    }
  };

  useEffect(() => {
    // Initial fetch for active jobs
    fetchJobs("active", currentActivePage, searchQuery);
    // Also fetch expired jobs in background
    fetchJobs("expired", currentExpiredPage, searchQuery);
  }, [fetchJobs, currentActivePage, currentExpiredPage, searchQuery]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      // Soft delete by updating the deleted_at field
      const { error } = await supabase
        .from('jobs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;

      // Refresh jobs list for current tab
      if (currentTab === "active") {
        fetchJobs("active", currentActivePage, searchQuery);
      } else {
        fetchJobs("expired", currentExpiredPage, searchQuery);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Job
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <JobSearch onSearch={handleSearch} />
          
          <Tabs defaultValue="active" value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">Active Jobs</TabsTrigger>
              <TabsTrigger value="expired">Expired Jobs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <JobListTable 
                jobs={activeJobs} 
                loading={loading && currentTab === "active"} 
                onDeleteJob={handleDeleteJob} 
              />
              {totalActivePages > 1 && (
                <JobPagination 
                  currentPage={currentActivePage} 
                  totalPages={totalActivePages} 
                  onPageChange={handlePageChange} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="expired">
              <JobListTable 
                jobs={expiredJobs} 
                loading={loading && currentTab === "expired"} 
                onDeleteJob={handleDeleteJob} 
              />
              {totalExpiredPages > 1 && (
                <JobPagination 
                  currentPage={currentExpiredPage} 
                  totalPages={totalExpiredPages} 
                  onPageChange={handlePageChange} 
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
