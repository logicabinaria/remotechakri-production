// This file contains shared types and utilities that can be used in both client and server components
// Server-specific functionality is in blog-server-queries.ts

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  cover_image_url: string;
  published_at: string;
  author_name: string;
  author_avatar: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
}

// Utility functions that can be used in both client and server components

/**
 * Calculate estimated reading time for a blog post
 * @param content HTML content of the blog post
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(content: string): string {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Calculate word count (average reading speed is ~200-250 words per minute)
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 225));
  
  return `${minutes} min read`;
}
