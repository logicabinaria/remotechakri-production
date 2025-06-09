export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API route to fetch recent jobs with pagination
 * Supports excluding featured jobs
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '5');
  const excludeFeatured = searchParams.get('excludeFeatured') === 'true';
  
  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;
  
  // Start building the query
  let query = supabase
    .from('jobs')
    .select(`
      *,
      category:categories(*),
      location:locations(*),
      job_type:job_types(*),
      tags:job_tags(tag:tags(*))
    `)
    .eq('is_published', true)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  
  // Exclude featured jobs if requested
  if (excludeFeatured) {
    query = query.eq('is_featured', false);
  }
  
  // Get total count of matching jobs
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .is('deleted_at', null)
    .eq(excludeFeatured ? 'is_featured' : 'is_published', excludeFeatured ? false : true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  
  if (countError) {
    console.error('Error counting jobs:', countError);
    return NextResponse.json({ jobs: [], total: 0 }, { status: 500 });
  }
  
  // Complete the query with ordering and pagination
  const { data, error } = await query
    .order('posted_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching recent jobs:', error);
    return NextResponse.json({ jobs: [], total: 0 }, { status: 500 });
  }
  
  // Process the nested tag structure before returning
  const processedJobs = data?.map(job => {
    // Define the interface for the nested tag structure
    interface TagItem {
      tag: {
        id: string;
        name: string;
        slug: string;
      };
    }

    // Process tags from the nested structure
    const processedTags = job.tags
      ?.filter((item: unknown): item is TagItem => 
        !!item && typeof item === 'object' && item !== null && 'tag' in item && !!item.tag)
      .map((item: TagItem) => ({
        id: String(item.tag.id || ''),
        name: String(item.tag.name || ''),
        slug: String(item.tag.slug || '')
      })) || [];

    return {
      ...job,
      tags: processedTags
    };
  }) || [];

  return NextResponse.json({ 
    jobs: processedJobs, 
    total: count || 0 
  });
}
