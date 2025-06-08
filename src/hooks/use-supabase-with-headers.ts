"use client";

import { useSupabase } from "@/components/providers/supabase-provider";
import { createClient } from '@supabase/supabase-js';
import { useMemo } from "react";

/**
 * Custom hook that returns a Supabase client with proper headers configured
 * to avoid 406 Not Acceptable errors
 */
export const useSupabaseWithHeaders = () => {
  const { supabaseUrl, supabaseKey } = useSupabase();
  
  // Create a custom Supabase client with explicit headers
  const customClient = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) return null;
    
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }, [supabaseUrl, supabaseKey]);
  
  // Get the default client as fallback
  const defaultClient = useSupabase();
  
  // Return the custom client if available, otherwise the default client
  return customClient || defaultClient;
};
