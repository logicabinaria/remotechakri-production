'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from '@/components/ui/use-toast';

interface JobBookmarkButtonProps {
  jobId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function JobBookmarkButton({
  jobId,
  variant = 'outline',
  size = 'default',
  className = '',
  showText = true
}: JobBookmarkButtonProps) {
  const supabase = useSupabase();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user is authenticated and get user ID
  useEffect(() => {
    // Check if job is already bookmarked by user
    const checkIfBookmarked = async (uid: string) => {
      try {
        // Get the Supabase URL and API key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        // Get the auth token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        // Check if already bookmarked using direct fetch with proper headers
        const response = await fetch(
          `${supabaseUrl}/rest/v1/my_jobs?select=*&user_id=eq.${uid}&job_id=eq.${jobId}`,
          {
            method: 'GET',
            headers: {
              'apikey': apiKey || '',
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          }
        );

        if (!response.ok) {
          console.error('Error checking bookmark:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        setIsBookmarked(data && data.length > 0);
      } catch (error) {
        console.error('Error in checkIfBookmarked:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await checkIfBookmarked(session.user.id);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [supabase, jobId]);

  // Toggle bookmark status
  const toggleBookmark = async () => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to bookmark jobs',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the Supabase URL and API key
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      // Common headers for all requests
      const headers = {
        'apikey': apiKey || '',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      if (isBookmarked) {
        // Remove bookmark using direct fetch
        const response = await fetch(
          `${supabaseUrl}/rest/v1/my_jobs?user_id=eq.${userId}&job_id=eq.${jobId}`,
          {
            method: 'DELETE',
            headers
          }
        );

        if (!response.ok) {
          console.error('Error removing bookmark:', response.status, response.statusText);
          toast({
            title: 'Error',
            description: 'Could not remove bookmark',
            variant: 'destructive',
          });
          return;
        }

        setIsBookmarked(false);
        toast({
          title: 'Bookmark removed',
          description: 'Job removed from your saved jobs',
        });
      } else {
        // Add bookmark using direct fetch
        const response = await fetch(
          `${supabaseUrl}/rest/v1/my_jobs`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              user_id: userId,
              job_id: jobId,
              saved_at: new Date().toISOString(),
            })
          }
        );

        if (!response.ok) {
          console.error('Error adding bookmark:', response.status, response.statusText);
          toast({
            title: 'Error',
            description: 'Could not save job',
            variant: 'destructive',
          });
          return;
        }

        setIsBookmarked(true);
        toast({
          title: 'Job saved',
          description: 'Job added to your saved jobs',
        });
      }
    } catch (error) {
      console.error('Error in toggleBookmark:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in, show login prompt button
  if (!userId && !isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => window.location.href = '/login'}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        {showText && 'Save Job'}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleBookmark}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-pulse">
          <Bookmark className="h-4 w-4 mr-2" />
        </span>
      ) : isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {showText && (isBookmarked ? 'Saved' : 'Save Job')}
    </Button>
  );
}
