/**
 * Optimized job queries for public pages
 */
import { supabase } from '@/lib/supabase';
import type { JobWithRelations } from '@/lib/supabase';

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

  try {
    console.log(`\n=== DEBUG: Starting tag fetch for job ${job.id} ===`);
    console.log(`Job title: ${job.title}`);
    console.log(`Job slug: ${job.slug}`);
    
    // Use the database function that implements the exact SQL query provided by the user
    // This is more efficient and reliable than complex Supabase client queries
    console.log(`Attempting RPC call: get_job_tags with job_uuid: ${job.id}`);
    const { data: tagData, error: tagsError } = await supabase
      .rpc('get_job_tags', { job_uuid: job.id });

    console.log(`RPC Response - Data:`, tagData);
    console.log(`RPC Response - Error:`, tagsError);

    if (tagsError) {
      console.error(`❌ Error fetching tags for job ${job.id}:`, tagsError);
      console.log(`🔄 Attempting fallback query...`);
      
      // Fallback to direct query if RPC fails
      const { data: fallbackTags, error: fallbackError } = await supabase
        .from('job_tags')
        .select(`
          tags (
            id,
            name,
            slug
          )
        `)
        .eq('job_id', job.id);
      
      console.log(`Fallback Query - Data:`, fallbackTags);
      console.log(`Fallback Query - Error:`, fallbackError);
      
      if (fallbackError) {
        console.error(`❌ Fallback query also failed for job ${job.id}:`, fallbackError);
        console.log(`=== DEBUG: Returning job with empty tags ===\n`);
        return {
          ...job,
          tags: []
        };
      }
      
      // Process fallback data
      console.log(`Processing fallback data...`);
      const fallbackExtractedTags = (fallbackTags || [])
        .map(item => {
          console.log(`Processing fallback item:`, item);
          const tag = item.tags;
          if (tag && typeof tag === 'object' && 'id' in tag && 'name' in tag && 'slug' in tag) {
            const processedTag = {
              id: String(tag.id),
              name: String(tag.name),
              slug: String(tag.slug)
            };
            console.log(`✅ Processed fallback tag:`, processedTag);
            return processedTag;
          }
          console.log(`❌ Invalid fallback tag structure:`, tag);
          return null;
        })
        .filter(Boolean) as Array<{id: string, name: string, slug: string}>;
      
      console.log(`Final fallback tags:`, fallbackExtractedTags);
      console.log(`=== DEBUG: Returning job with ${fallbackExtractedTags.length} fallback tags ===\n`);
      return {
        ...job,
        tags: fallbackExtractedTags
      };
    }

    // If no tags found, return job with empty tags array
    if (!tagData || tagData.length === 0) {
      console.log(`⚠️ No tags found for job ${job.id}`);
      console.log(`TagData is null/undefined:`, !tagData);
      console.log(`TagData length is 0:`, tagData && tagData.length === 0);
      console.log(`=== DEBUG: Returning job with empty tags ===\n`);
      return {
        ...job,
        tags: []
      };
    }

    // The RPC function returns the tags directly in the expected format
    console.log(`✅ RPC returned ${tagData.length} tags. Processing...`);
    const extractedTags = tagData.map((tag: { id: number | string, name: string, slug: string }, index: number) => {
      console.log(`Processing tag ${index + 1}:`, tag);
      const processedTag = {
        id: String(tag.id),
        name: String(tag.name),
        slug: String(tag.slug)
      };
      console.log(`✅ Processed tag ${index + 1}:`, processedTag);
      return processedTag;
    });

    console.log(`🎉 Successfully found ${extractedTags.length} tags for job ${job.id}:`, extractedTags);
    console.log(`=== DEBUG: Returning job with ${extractedTags.length} tags ===\n`);

    // Return the job with all its relations including tags
    return {
      ...job,
      tags: extractedTags
    };
  } catch (err) {
    console.error(`Unexpected error fetching tags for job ${job.id}:`, err);
    // Return job without tags on unexpected error
    return {
      ...job,
      tags: []
    };
  }
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
