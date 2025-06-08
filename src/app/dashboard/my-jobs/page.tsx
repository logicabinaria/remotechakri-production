"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

interface BookmarkedJob {
  id: string;
  saved_at: string;
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

export default function MyJobsPage() {
  const supabase = useSupabase();
  const [bookmarkedJobs, setBookmarkedJobs] = useState<BookmarkedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarkedJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userId = session.user.id;
      
      // Fetch bookmarked jobs with job details
      const { data, error } = await supabase
        .from('my_jobs')
        .select(`
          id,
          saved_at,
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
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookmarked jobs:', error);
        return;
      }
      
      setBookmarkedJobs(data || []);
    } catch (error) {
      console.error('Error in fetchBookmarkedJobs:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  
  useEffect(() => {
    fetchBookmarkedJobs();
  }, [fetchBookmarkedJobs]);

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('my_jobs')
        .delete()
        .eq('id', bookmarkId);
      
      if (error) {
        console.error('Error removing bookmark:', error);
        toast({
          title: "Error",
          description: "Failed to remove bookmark. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setBookmarkedJobs(bookmarkedJobs.filter(job => job.id !== bookmarkId));
      
      toast({
        title: "Success",
        description: "Job removed from bookmarks",
      });
    } catch (error) {
      console.error('Error in removeBookmark:', error);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Bookmarked Jobs</h1>
        <Bookmark className="h-6 w-6 text-primary" />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bookmarkedJobs.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedJobs.map((bookmark) => (
            <Card key={bookmark.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {bookmark.job.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {bookmark.job.company_name}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bookmark.job.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {bookmark.job.category.name}
                        </span>
                      )}
                      {bookmark.job.location && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {bookmark.job.location.name}
                        </span>
                      )}
                      {bookmark.job.job_type && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          {bookmark.job.job_type.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Posted: {formatDate(bookmark.job.posted_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <Link href={`/jobs/${bookmark.job.slug}`} passHref>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No bookmarked jobs</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t bookmarked any jobs yet.</p>
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
