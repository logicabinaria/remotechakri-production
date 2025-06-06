/**
 * Optimized taxonomy queries for public pages (categories, locations, job types, tags)
 */
import { supabase } from '@/lib/supabase';
import type { Category, Location, JobType, Tag } from '@/lib/supabase';

/**
 * Fetch all active categories with job counts
 */
export async function getAllCategories(): Promise<(Category & { job_count: number })[]> {
  // First get all categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  if (!categories?.length) return [];

  // For each category, get the job count
  const categoriesWithCount = await Promise.all(
    categories.map(async (category: Category) => {
      const { count, error: countError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_published', true)
        .is('deleted_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (countError) {
        console.error(`Error counting jobs for category ${category.id}:`, countError);
        return { ...category, job_count: 0 };
      }

      return { ...category, job_count: count || 0 };
    })
  );

  return categoriesWithCount;
}

/**
 * Fetch a single category by slug with job count
 */
export async function getCategoryBySlug(slug: string): Promise<(Category & { job_count: number }) | null> {
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }

  if (!category) return null;

  // Get job count for this category
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (countError) {
    console.error(`Error counting jobs for category ${category.id}:`, countError);
    return { ...category, job_count: 0 };
  }

  return { ...category, job_count: count || 0 };
}

/**
 * Fetch all active locations with job counts
 */
export async function getAllLocations(): Promise<(Location & { job_count: number })[]> {
  // First get all locations
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  if (!locations?.length) return [];

  // For each location, get the job count
  const locationsWithCount = await Promise.all(
    locations.map(async (location) => {
      const { count, error: countError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', location.id)
        .eq('is_published', true)
        .is('deleted_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (countError) {
        console.error(`Error counting jobs for location ${location.id}:`, countError);
        return { ...location, job_count: 0 };
      }

      return { ...location, job_count: count || 0 };
    })
  );

  return locationsWithCount;
}

/**
 * Fetch a single location by slug with job count
 */
export async function getLocationBySlug(slug: string): Promise<(Location & { job_count: number }) | null> {
  const { data: location, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error(`Error fetching location with slug ${slug}:`, error);
    return null;
  }

  if (!location) return null;

  // Get job count for this location
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', location.id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (countError) {
    console.error(`Error counting jobs for location ${location.id}:`, countError);
    return { ...location, job_count: 0 };
  }

  return { ...location, job_count: count || 0 };
}

/**
 * Fetch all active job types with job counts
 */
export async function getAllJobTypes(): Promise<(JobType & { job_count: number })[]> {
  // First get all job types
  const { data: jobTypes, error } = await supabase
    .from('job_types')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Error fetching job types:', error);
    return [];
  }

  if (!jobTypes?.length) return [];

  // For each job type, get the job count
  const jobTypesWithCount = await Promise.all(
    jobTypes.map(async (jobType) => {
      const { count, error: countError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('job_type_id', jobType.id)
        .eq('is_published', true)
        .is('deleted_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (countError) {
        console.error(`Error counting jobs for job type ${jobType.id}:`, countError);
        return { ...jobType, job_count: 0 };
      }

      return { ...jobType, job_count: count || 0 };
    })
  );

  return jobTypesWithCount;
}

/**
 * Fetch a single job type by slug with job count
 */
export async function getJobTypeBySlug(slug: string): Promise<(JobType & { job_count: number }) | null> {
  const { data: jobType, error } = await supabase
    .from('job_types')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error(`Error fetching job type with slug ${slug}:`, error);
    return null;
  }

  if (!jobType) return null;

  // Get job count for this job type
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('job_type_id', jobType.id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (countError) {
    console.error(`Error counting jobs for job type ${jobType.id}:`, countError);
    return { ...jobType, job_count: 0 };
  }

  return { ...jobType, job_count: count || 0 };
}

/**
 * Fetch popular tags with job counts
 */
export async function getPopularTags(limit = 10): Promise<(Tag & { job_count: number })[]> {
  try {
    // Get active jobs first
    const { data: activeJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('is_published', true)
      .is('deleted_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      
    if (jobsError) {
      console.error('Error fetching active jobs:', jobsError);
      return [];
    }
    
    if (!activeJobs?.length) return [];
    
    // Get the active job IDs
    const activeJobIds = activeJobs.map(job => job.id);
    
    // Get tags for active jobs
    const { data: jobTags, error: jobTagsError } = await supabase
      .from('job_tags')
      .select('tag_id, tags:tags(id, name, slug)')
      .in('job_id', activeJobIds);
      
    if (jobTagsError) {
      console.error('Error fetching job tags:', jobTagsError);
      return [];
    }
    
    // Count tags and collect tag info
    const tagMap: Record<string, { count: number; tag: Tag }> = {};
    
    jobTags?.forEach(jt => {
      if (jt.tag_id && jt.tags) {
        // The tags property contains a single tag object, not an array
        const tagData = jt.tags as unknown as { id: string; name: string; slug: string };
        
        if (!tagMap[jt.tag_id]) {
          // Ensure we have a proper Tag object with all required properties
          const tag: Tag = {
            id: tagData.id,
            name: tagData.name,
            slug: tagData.slug,
            deleted_at: null
          };
          tagMap[jt.tag_id] = { count: 0, tag: tag };
        }
        tagMap[jt.tag_id].count += 1;
      }
    });
    
    // Convert to array, sort by count, and limit
    const popularTags = Object.values(tagMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ count, tag }) => ({
        ...tag,
        job_count: count
      }));
    
    return popularTags;
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    return [];
  }
}

/**
 * Fetch a single tag by slug with job count
 */
export async function getTagBySlug(slug: string): Promise<(Tag & { job_count: number }) | null> {
  const { data: tag, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error(`Error fetching tag with slug ${slug}:`, error);
    return null;
  }

  if (!tag) return null;

  // Count jobs with this tag via job_tags
  const { count, error: countError } = await supabase
    .from('job_tags')
    .select('job_id', { count: 'exact', head: true })
    .eq('tag_id', tag.id);

  if (countError) {
    console.error(`Error counting jobs for tag ${tag.id}:`, countError);
    return { ...tag, job_count: 0 };
  }

  return { ...tag, job_count: count || 0 };
}
