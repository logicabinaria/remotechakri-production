export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a simple Supabase client with public URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    console.log('API route /api/user-profile called');
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get user profile data only from user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError) {
      return NextResponse.json(
        { error: 'User profile not found', details: profileError },
        { status: 404 }
      );
    }
    
    // Return a simplified user object with just the profile data
    return NextResponse.json({ 
      data: {
        id: profileData.user_id,
        email: '', // We don't have email in user_profiles
        created_at: profileData.created_at,
        updated_at: null,
        profile: {
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          is_whatsapp_verified: profileData.is_whatsapp_verified || false,
          whatsapp_verified_at: profileData.whatsapp_verified_at || null
        }
      }, 
      error: null 
    });
  } catch (error) {
    console.error('Error in user-profile API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
