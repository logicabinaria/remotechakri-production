'use client';

import { useEffect } from 'react';

interface JobViewTrackerProps {
  jobId: string;
}

/**
 * Component that tracks job views by making a request to the job-views API
 * Uses client-side rendering to track views when the component mounts
 * Implements debouncing to prevent multiple rapid requests
 */
export function JobViewTracker({ jobId }: JobViewTrackerProps) {
  useEffect(() => {
    // Create a variable to store the timeout ID for debouncing
    // Initialize with null to avoid TypeScript error when clearing timeout
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Function to record the job view
    const recordView = async () => {
      try {
        // Send request to the job-views API endpoint
        const response = await fetch('/api/public/job-views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        });
        
        if (!response.ok) {
          // Log error but don't show to user
          console.error('Failed to record job view');
        }
      } catch (error) {
        // Silently fail - we don't want to interrupt user experience
        console.error('Error recording job view:', error);
      }
    };
    
    // Debounce the view recording to prevent multiple rapid requests
    // This helps with page refreshes and quick navigation
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      recordView();
    }, 1000); // 1 second debounce
    
    // Clean up the timeout when component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [jobId]); // Only re-run when jobId changes
  
  // This component doesn't render anything
  return null;
}
