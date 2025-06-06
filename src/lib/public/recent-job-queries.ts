/**
 * Additional job queries for the recent jobs section
 */
import { supabase } from '@/lib/supabase';
import type { JobWithRelations } from '@/lib/supabase';

/**
 * Fetch recent jobs, excluding featured ones
 */
export async function getRecentJobs(limit = 5): Promise<{
  jobs: JobWithRelations[];
  total: number;
}> {
  // Get total count of active non-featured jobs
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .eq('is_featured', false)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (countError) {
    console.error('Error counting recent jobs:', countError);
    return { jobs: [], total: 0 };
  }

  // Fetch the recent jobs
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*),
      tags:job_tags(tag:tags(*))
    `)
    .eq('is_published', true)
    .eq('is_featured', false)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent jobs:', error);
    return { jobs: [], total: 0 };
  }

  return { 
    jobs: data || [], 
    total: count || 0 
  };
}
