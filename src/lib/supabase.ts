import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on our database schema
export type JobType = {
  id: string;
  name: string;
  slug: string;
  deleted_at: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  deleted_at: string | null;
};

export type Location = {
  id: string;
  name: string;
  slug: string;
  deleted_at: string | null;
  country_code?: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  deleted_at: string | null;
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  description: string;
  company_name: string;
  company_website: string | null;
  company_logo_url: string | null;
  location_id: string | null;
  job_type_id: string | null;
  category_id: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  apply_url?: string | null;
  external_url: string;
  is_published: boolean;
  is_featured: boolean;
  posted_at: string;
  updated_at: string;
  expires_at: string | null;
  deleted_at: string | null;
  created_at?: string;
  expiry_date?: string | null;
};

export type JobWithRelations = Job & {
  location?: Location;
  job_type?: JobType;
  category?: Category;
  tags?: Tag[];
};

export type JobTag = {
  job_id: string;
  tag_id: string;
};

export type JobView = {
  id: string;
  job_id: string;
  viewer_id: string | null;
  viewer_ip: string | null;
  user_agent: string | null;
  viewed_at: string;
};
