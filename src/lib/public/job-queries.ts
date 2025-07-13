/**
 * Optimized job queries for public pages
 */
import { supabase } from '@/lib/supabase';
import type { JobWithRelations } from '@/lib/supabase';

/**
 * Fetch featured jobs with pagination and related data
 */
export async function getFeaturedJobs(limit = 6): Promise<JobWithRelations[]> {
  // Ensure we always get fresh data by checking expiration
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*),
      tags:job_tags(tags(id, name, slug))
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured jobs:', error);
    return [];
  }

  // Process tags for each job
  const jobsWithProcessedTags = data?.map(job => {
    // Define interfaces for the tag data structure
    interface TagData {
      id: string | number;
      name: string;
      slug: string;
    }

    interface TagItem {
      tags: TagData;
    }

    // Process tags from the nested structure
    const processedTags = job.tags
      ?.filter((item: unknown): item is TagItem => 
        !!item && typeof item === 'object' && item !== null && 'tags' in item && !!item.tags)
      .map((item: TagItem) => ({
        id: String(item.tags.id || ''),
        name: String(item.tags.name || ''),
        slug: String(item.tags.slug || '')
      })) || [];

    return {
      ...job,
      tags: processedTags
    };
  }) || [];

  return jobsWithProcessedTags;
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
  tagSlugs?: string[];
  datePosted?: string;
  sortBy?: string;
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
    tagSlug,
    tagSlugs = [],
    datePosted,
    sortBy = 'newest'
  } = options;
  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;

  // We'll calculate the total count after applying filters
  let totalCount = 0;
  let categoryId, locationId, jobTypeId, tagId, jobIdsWithTag;
  
  // Get IDs for filters if provided
  if (categorySlug) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    categoryId = categoryData?.id;
  }
  
  if (locationSlug) {
    const { data: locationData } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', locationSlug)
      .single();
    locationId = locationData?.id;
  }
  
  if (jobTypeSlug) {
    const { data: jobTypeData } = await supabase
      .from('job_types')
      .select('id')
      .eq('slug', jobTypeSlug)
      .single();
    jobTypeId = jobTypeData?.id;
  }
  
  if (tagSlug) {
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single();
    tagId = tagData?.id;
    
    if (tagId) {
      const { data: jobsWithTag } = await supabase
        .from('job_tags')
        .select('job_id')
        .eq('tag_id', tagId);
      
      if (jobsWithTag && jobsWithTag.length > 0) {
        jobIdsWithTag = jobsWithTag.map(item => item.job_id);
      } else {
        return { jobs: [], total: 0 };
      }
    }
  }
  
  // Build count query with all filters
  let countQuery = supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  
  // Apply the same filters to count query
  if (categoryId) countQuery = countQuery.eq('category_id', categoryId);
  if (locationId) countQuery = countQuery.eq('location_id', locationId);
  if (jobTypeId) countQuery = countQuery.eq('job_type_id', jobTypeId);
  if (jobIdsWithTag) countQuery = countQuery.in('id', jobIdsWithTag);
  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    countQuery = countQuery.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }
  
  // Apply date posted filter to count query as well
  if (datePosted) {
    const now = new Date();
    let dateFilter: Date;
    
    switch(datePosted) {
      case '24h':
        dateFilter = new Date(now.setHours(now.getHours() - 24));
        break;
      case '3d':
        dateFilter = new Date(now.setDate(now.getDate() - 3));
        break;
      case '7d':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        dateFilter = new Date(0); // Default to epoch if invalid value
    }
    
    countQuery = countQuery.gte('posted_at', dateFilter.toISOString());
  }
  
  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error counting jobs:', countError);
    return { jobs: [], total: 0 };
  }
  
  totalCount = count || 0;

  // Construct the query
  let query = supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*),
      tags:job_tags(tags(id, name, slug))
    `, { count: 'exact' })
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  // Apply date posted filter if provided
  if (datePosted) {
    const now = new Date();
    let dateFilter: Date;
    
    switch(datePosted) {
      case '24h':
        dateFilter = new Date(now.setHours(now.getHours() - 24));
        break;
      case '3d':
        dateFilter = new Date(now.setDate(now.getDate() - 3));
        break;
      case '7d':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        dateFilter = new Date(0); // Default to epoch if invalid value
    }
    
    query = query.gte('posted_at', dateFilter.toISOString());
  }
  
  // Apply category filter if provided
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  if (locationId) {
    query = query.eq('location_id', locationId);
  }
  
  if (jobTypeId) {
    query = query.eq('job_type_id', jobTypeId);
  }
  
  if (searchQuery) {
    const searchTerm = `%${searchQuery}%`;
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }
  
  // Apply tag filter if provided (single tag)
  if (jobIdsWithTag) {
    query = query.in('id', jobIdsWithTag);
  }
  
  // Apply multiple tags filter if provided
  if (tagSlugs.length > 0) {
    // Get tag IDs from slugs
    const { data: tagsData } = await supabase
      .from('tags')
      .select('id')
      .in('slug', tagSlugs);
      
    if (tagsData && tagsData.length > 0) {
      const tagIds = tagsData.map(tag => tag.id);
      
      // Get job IDs that have any of these tags
      const { data: jobTagsData } = await supabase
        .from('job_tags')
        .select('job_id')
        .in('tag_id', tagIds);
        
      if (jobTagsData && jobTagsData.length > 0) {
        // Create a unique array of job IDs
        const jobIds = Array.from(new Set(jobTagsData.map(jt => jt.job_id)));
        query = query.in('id', jobIds);
      } else {
        // If no jobs have these tags, return empty result
        return { jobs: [], total: 0 };
      }
    }
  }

  // Apply sorting
  switch (sortBy) {
    case 'oldest':
      query = query.order('posted_at', { ascending: true });
      break;
    case 'salary_high':
      query = query.order('salary_max', { ascending: false });
      break;
    case 'salary_low':
      query = query.order('salary_min', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('posted_at', { ascending: false });
      break;
  }
  
  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  
  // Execute the query
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching latest jobs:', error);
    return { jobs: [], total: 0 };
  }

  // Process tags for each job
  const jobsWithProcessedTags = data?.map(job => {
    // Define interfaces for the tag data structure
    interface TagData {
      id: string | number;
      name: string;
      slug: string;
    }

    interface TagItem {
      tags: TagData;
    }

    // Process tags from the nested structure
    const processedTags = job.tags
      ?.filter((item: unknown): item is TagItem => 
        !!item && typeof item === 'object' && item !== null && 'tags' in item && !!item.tags)
      .map((item: TagItem) => ({
        id: String(item.tags.id || ''),
        name: String(item.tags.name || ''),
        slug: String(item.tags.slug || '')
      })) || [];

    return {
      ...job,
      tags: processedTags
    };
  }) || [];

  return { 
    jobs: jobsWithProcessedTags, 
    total: totalCount 
  };
}

/**
 * Fetch a single job by slug with related data
 */
export async function getJobBySlug(slug: string): Promise<JobWithRelations | null> {
  // Fetch the job with its direct relations including tags
  // Now that RLS policies are fixed, we can fetch tags directly in a single query
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*),
      tags:job_tags(tags(id, name, slug))
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .single();

  if (error) {
    console.error(`Error fetching job with slug ${slug}:`, error);
    return null;
  }

  if (!job) return null;

  // Define interfaces for the tag data structure
  interface TagData {
    id: string | number;
    name: string;
    slug: string;
  }

  interface TagItem {
    tags: TagData;
  }

  // We need to handle potentially undefined or null items in the array
  type JobTagItem = TagItem | Record<string, unknown> | null | undefined;

  // Process tags from the nested structure
  // The structure is job.tags = [{ tags: { id, name, slug } }, ...]
  const processedTags = job.tags
    ?.filter((item: JobTagItem): item is TagItem => 
      !!item && 'tags' in item && !!item.tags)
    .map((item: TagItem) => ({
      id: String(item.tags.id || ''),
      name: String(item.tags.name || ''),
      slug: String(item.tags.slug || '')
    })) || [];

  // Return the job with processed tags
  return {
    ...job,
    tags: processedTags
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
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
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
