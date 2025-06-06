/**
 * Optimized job queries for public pages
 */
import { supabase } from '@/lib/supabase';
import type { JobWithRelations, Tag } from '@/lib/supabase';

/**
 * Fetch featured jobs with pagination and related data
 */
export async function getFeaturedJobs(limit = 6): Promise<JobWithRelations[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .is('deleted_at', null)
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured jobs:', error);
    return [];
  }

  return data || [];
}

/**
 * Options for fetching latest jobs
 */
interface GetLatestJobsOptions {
  page?: number;
  limit?: number;
  categorySlug?: string;
  locationSlug?: string;
  jobTypeSlug?: string;
  searchQuery?: string;
  tagSlug?: string;
}

/**
 * Fetch latest jobs with pagination and related data
 */
export async function getLatestJobs(options: GetLatestJobsOptions = {}): Promise<{
  jobs: JobWithRelations[];
  total: number;
}> {
  const { 
    page = 1, 
    limit = 10, 
    categorySlug, 
    locationSlug, 
    jobTypeSlug,
    searchQuery,
    tagSlug 
  } = options;
  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;

  // Get total count of active jobs
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (countError) {
    console.error('Error counting jobs:', countError);
    return { jobs: [], total: 0 };
  }

  // Start building the query
  let query = supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*),
      tags:job_tags(tags(*))
    `)
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    
  // Apply filters if provided
  if (categorySlug) {
    query = query.eq('category.slug', categorySlug);
  }
  
  if (locationSlug) {
    query = query.eq('location.slug', locationSlug);
  }
  
  if (jobTypeSlug) {
    query = query.eq('job_type.slug', jobTypeSlug);
  }
  
  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }
  
  if (tagSlug) {
    // This requires a more complex query with joins
    query = query.eq('tags.tags.slug', tagSlug);
  }
  
  // Complete the query with ordering and pagination
  const { data, error } = await query
    .order('posted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching latest jobs:', error);
    return { jobs: [], total: 0 };
  }

  return { 
    jobs: data || [], 
    total: count || 0 
  };
}

/**
 * Fetch a single job by slug with related data
 */
export async function getJobBySlug(slug: string): Promise<JobWithRelations | null> {
  // Fetch the job with its direct relations
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error(`Error fetching job with slug ${slug}:`, error);
    return null;
  }

  if (!job) return null;

  // Fetch related tags for the job
  const { data: jobTags, error: tagsError } = await supabase
    .from('job_tags')
    .select(`
      tag_id,
      tags(*)
    `)
    .eq('job_id', job.id);

  if (tagsError) {
    console.error(`Error fetching tags for job ${job.id}:`, tagsError);
    return job;
  }

  // Extract tags from the join table results and process them correctly
  const tags = jobTags?.map(jt => {
    if (!jt.tags) return null;
    
    // First convert to unknown
    const tagData = jt.tags as unknown;
    
    // Define an interface for the tag data structure
    interface TagData {
      id: string;
      name: string;
      slug: string;
      deleted_at?: string | null;
    }
    
    // Check if the data has the expected structure
    if (typeof tagData === 'object' && tagData !== null && 
        'id' in tagData && 'name' in tagData && 'slug' in tagData) {
      // Cast to our interface
      const typedTagData = tagData as TagData;
      
      // Return a properly formatted Tag object
      return {
        id: typedTagData.id,
        name: typedTagData.name,
        slug: typedTagData.slug,
        deleted_at: typedTagData.deleted_at || null
      };
    }
    return null;
  }).filter(Boolean) as Tag[]; // Filter out any null values

  // Return the job with all its relations
  return {
    ...job,
    tags
  };
}

/**
 * Record a job view in the job_views table
 */
export async function recordJobView(
  jobId: string, 
  viewerIp?: string, 
  viewerId?: string | null, 
  userAgent?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('job_views')
      .insert({
        job_id: jobId,
        viewer_ip: viewerIp,
        viewer_id: viewerId,
        user_agent: userAgent,
        viewed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording job view:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception recording job view:', error);
    return false;
  }
}

/**
 * Get similar jobs based on category and tags
 */
export async function getSimilarJobs(
  jobId: string, 
  categoryId?: string, 
  limit = 3
): Promise<JobWithRelations[]> {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*)
    `)
    .eq('is_published', true)
    .is('deleted_at', null)
    .neq('id', jobId) // Exclude the current job
    .order('posted_at', { ascending: false })
    .limit(limit);

  // Filter by category if provided
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching similar jobs:', error);
    return [];
  }

  return data || [];
}
