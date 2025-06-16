import { createClient } from "@/lib/supabase-server";
// Use the BlogPost interface from blog-queries for type consistency
import type { BlogPost } from "./blog-queries";

/**
 * Get the latest published blog posts
 * @param limit Number of posts to return
 * @param offset Number of posts to skip (for pagination)
 * @param categorySlug Optional category slug to filter by
 * @param tagSlug Optional tag slug to filter by
 * @returns Array of blog posts
 */
export async function getLatestBlogPosts(limit = 3, offset = 0, categorySlug?: string, tagSlug?: string): Promise<BlogPost[]> {
  const supabase = createClient();
  
  // Start with the base query
  let query = supabase
    .from("blog_posts_with_authors")
    .select("*")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false });
  
  // If category filter is provided
  if (categorySlug) {
    // First get the category ID from the slug
    const { data: category } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    
    if (category) {
      // Get blog post IDs that belong to this category
      const { data: categoryPosts } = await supabase
        .from("blog_post_categories")
        .select("blog_post_id")
        .eq("category_id", category.id);
      
      if (categoryPosts && categoryPosts.length > 0) {
        // Filter the main query by these post IDs
        const postIds = categoryPosts.map(item => item.blog_post_id);
        query = query.in("id", postIds);
      } else {
        // No posts in this category, return empty array
        return [];
      }
    }
  }
  
  // If tag filter is provided
  if (tagSlug) {
    // First get the tag ID from the slug
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();
    
    if (tag) {
      // Get blog post IDs that have this tag
      const { data: tagPosts } = await supabase
        .from("blog_post_tags")
        .select("blog_post_id")
        .eq("tag_id", tag.id);
      
      if (tagPosts && tagPosts.length > 0) {
        // Filter the main query by these post IDs
        const postIds = tagPosts.map(item => item.blog_post_id);
        query = query.in("id", postIds);
      } else {
        // No posts with this tag, return empty array
        return [];
      }
    }
  }
  
  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  
  // Execute the query
  const { data: posts, error } = await query;
    
  if (error) {
    console.error("Error fetching latest blog posts:", error);
    return [];
  }
  
  return posts.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    cover_image_url: post.cover_image_url,
    published_at: post.published_at,
    author_name: post.author_name,
    author_avatar: post.author_avatar,
    content: post.content,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    meta_keywords: post.meta_keywords,
    canonical_url: post.canonical_url
  }));
}

/**
 * Get total count of published blog posts
 * @param categorySlug Optional category slug to filter by
 * @param tagSlug Optional tag slug to filter by
 * @returns Total count of blog posts
 */
export async function getBlogPostsCount(categorySlug?: string, tagSlug?: string): Promise<number> {
  const supabase = createClient();
  
  // Start with the base query
  let query = supabase
    .from("blog_posts_with_authors")
    .select("id", { count: "exact" })
    .eq("is_published", true)
    .is("deleted_at", null);
  
  // If category filter is provided
  if (categorySlug) {
    // First get the category ID from the slug
    const { data: category } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    
    if (category) {
      // Get blog post IDs that belong to this category
      const { data: categoryPosts } = await supabase
        .from("blog_post_categories")
        .select("blog_post_id")
        .eq("category_id", category.id);
      
      if (categoryPosts && categoryPosts.length > 0) {
        // Filter the main query by these post IDs
        const postIds = categoryPosts.map(item => item.blog_post_id);
        query = query.in("id", postIds);
      } else {
        // No posts in this category
        return 0;
      }
    }
  }
  
  // If tag filter is provided
  if (tagSlug) {
    // First get the tag ID from the slug
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();
    
    if (tag) {
      // Get blog post IDs that have this tag
      const { data: tagPosts } = await supabase
        .from("blog_post_tags")
        .select("blog_post_id")
        .eq("tag_id", tag.id);
      
      if (tagPosts && tagPosts.length > 0) {
        // Filter the main query by these post IDs
        const postIds = tagPosts.map(item => item.blog_post_id);
        query = query.in("id", postIds);
      } else {
        // No posts with this tag
        return 0;
      }
    }
  }
  
  // Execute the query
  const { count, error } = await query;
    
  if (error) {
    console.error("Error fetching blog posts count:", error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Get a single blog post by slug
 * @param slug The blog post slug
 * @returns Blog post or null if not found
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  
  const { data: post, error } = await supabase
    .from("blog_posts_with_authors")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();
    
  if (error || !post) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }
  
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    cover_image_url: post.cover_image_url,
    published_at: post.published_at,
    author_name: post.author_name,
    author_avatar: post.author_avatar,
    content: post.content,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    meta_keywords: post.meta_keywords,
    canonical_url: post.canonical_url
  };
}

/**
 * Get all blog categories with post counts
 * @returns Array of categories with post counts
 */
export async function getAllBlogCategories() {
  const supabase = createClient();
  
  const { data: categories, error } = await supabase
    .from("blog_categories")
    .select(`
      id,
      name,
      slug,
      blog_post_categories!inner (
        blog_post_id
      )
    `)
    .is("deleted_at", null);
  
  if (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
  
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: Array.isArray(cat.blog_post_categories) ? cat.blog_post_categories.length : 0
  })).sort((a, b) => b.count - a.count);
}

/**
 * Get popular tags with post counts
 * @param limit Number of tags to return
 * @returns Array of tags with post counts
 */
/**
 * Get recent blog posts
 * @param limit Number of posts to return
 * @param excludePostId Optional post ID to exclude from results
 * @returns Array of blog posts
 */
export async function getRecentBlogPosts(limit = 5, excludePostId?: string): Promise<BlogPost[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('blog_posts_with_authors')
    .select('*')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(limit);
    
  if (excludePostId) {
    query = query.neq('id', excludePostId);
  }
  
  const { data: posts, error } = await query;
  
  if (error) {
    console.error('Error fetching recent blog posts:', error);
    return [];
  }
  
  return posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.cover_image_url,
    published_at: post.published_at,
    author_name: post.author_name,
    author_avatar: post.author_avatar,
    category_name: post.category_name,
    category_slug: post.category_slug,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    meta_keywords: post.meta_keywords,
    canonical_url: post.canonical_url
  }));
}

export async function getPopularBlogTags(limit = 15) {
  const supabase = createClient();
  
  const { data: tags, error } = await supabase
    .from("tags")
    .select(`
      id,
      name,
      slug,
      blog_post_tags!inner (
        blog_post_id
      )
    `);
  
  if (error) {
    console.error("Error fetching blog tags:", error);
    return [];
  }
  
  return tags
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: Array.isArray(tag.blog_post_tags) ? tag.blog_post_tags.length : 0
    }))
    .filter(tag => tag.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
