'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from '@/components/ui/button';
import { Check, X, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface JobStatusTrackerProps {
  jobId: string;
}

type JobStatus = 'viewed' | 'applied' | 'ignored';

export function JobStatusTracker({ jobId }: JobStatusTrackerProps) {
  const supabase = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Define functions in the correct order to avoid "used before declaration" errors
    const trackJobView = async (uid: string) => {
      try {
        const trackInitialView = async (uid: string) => {
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

            // Check if already viewed
            const checkResponse = await fetch(
              `${supabaseUrl}/rest/v1/viewed_jobs?select=status&user_id=eq.${uid}&job_id=eq.${jobId}`,
              {
                method: 'GET',
                headers
              }
            );

            if (!checkResponse.ok && checkResponse.status !== 406) {
              console.error('Error checking view status:', checkResponse.status, checkResponse.statusText);
              return;
            }

            const data = await checkResponse.json();

            // If not already viewed, add view record
            if (!data || data.length === 0) {
              const insertResponse = await fetch(
                `${supabaseUrl}/rest/v1/viewed_jobs`,
                {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    user_id: uid,
                    job_id: jobId,
                    status: 'viewed',
                    viewed_at: new Date().toISOString(),
                  })
                }
              );

              if (!insertResponse.ok) {
                console.error('Error tracking view:', insertResponse.status, insertResponse.statusText);
              }
            }
          } catch (error) {
            console.error('Error in trackInitialView:', error);
          }
        };
        
        await trackInitialView(uid);
      } catch (error) {
        console.error('Error in trackJobView:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchCurrentStatus = async (uid: string) => {
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

        // Check current status
        const response = await fetch(
          `${supabaseUrl}/rest/v1/viewed_jobs?select=status&user_id=eq.${uid}&job_id=eq.${jobId}`,
          {
            method: 'GET',
            headers
          }
        );

        if (!response.ok && response.status !== 406) {
          console.error('Error fetching status:', response.status, response.statusText);
          return;
        }

        const data = await response.json();

        if (data && data.length > 0) {
          setCurrentStatus(data[0].status as JobStatus);
        } else {
          await trackJobView(uid);
        }
      } catch (error) {
        console.error('Error in fetchCurrentStatus:', error);
      }
    };
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await fetchCurrentStatus(session.user.id);
      }
    };

    checkAuth();
  }, [supabase, jobId]);

  const updateJobStatus = async (status: JobStatus) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to track job status',
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
        'Prefer': 'return=representation,resolution=merge-duplicates'
      };

      // Update or insert the record using direct fetch
      const response = await fetch(
        `${supabaseUrl}/rest/v1/viewed_jobs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: userId,
            job_id: jobId,
            status: status,
            viewed_at: new Date().toISOString(),
            // No updated_at column in the schema
          })
        }
      );

      if (!response.ok) {
        console.error('Error updating status:', response.status, response.statusText);
        toast({
          title: 'Error',
          description: 'Could not update job status',
          variant: 'destructive',
        });
        return;
      }

      setCurrentStatus(status);
      toast({
        title: 'Status updated',
        description: `Job marked as ${status}`,
      });
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if user is not logged in
  if (!userId) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Button
        variant={currentStatus === 'applied' ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateJobStatus('applied')}
        disabled={isLoading}
        className="flex-1"
      >
        <Check className="h-4 w-4 mr-2" />
        {currentStatus === 'applied' ? 'Applied' : 'Mark as Applied'}
      </Button>
      
      <Button
        variant={currentStatus === 'ignored' ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateJobStatus('ignored')}
        disabled={isLoading}
        className="flex-1"
      >
        <X className="h-4 w-4 mr-2" />
        {currentStatus === 'ignored' ? 'Not Interested' : 'Not Interested'}
      </Button>
      
      {currentStatus && currentStatus !== 'viewed' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateJobStatus('viewed')}
          disabled={isLoading}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          Reset Status
        </Button>
      )}
    </div>
  );
}
