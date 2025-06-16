// Shared type definitions for blog components

/**
 * Complete BlogPost interface with all fields needed across components
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_id: string;
  author_name?: string; // Optional for list view
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  meta_keywords?: string;
  view_count?: number; // Optional for list view
  deleted_at?: string | null;
}
