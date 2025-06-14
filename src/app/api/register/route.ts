import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Initialize Supabase client with service role key
// Use empty strings as fallbacks during build time to prevent build failures
// These will be replaced with actual values at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create the client if we have the required values
// This prevents build errors while still ensuring the client works at runtime
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { email, password, fullName, phoneNumber } = await request.json();
    
    console.log('Registration API received phone number:', phoneNumber);
    
    // Clean phone number - ensure it only contains digits
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    
    if (cleanPhoneNumber.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Phone number appears to be invalid (too short)' 
        }, 
        { status: 400 }
      );
    }
    
    console.log('Cleaned phone number:', cleanPhoneNumber);
    
    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields' 
        }, 
        { status: 400 }
      );
    }
    
    // 1. Create user in auth.users with metadata
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    });
    
    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { 
          success: false, 
          message: authError.message 
        }, 
        { status: 400 }
      );
    }
    
    // 2. Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userData.user.id,
        full_name: fullName,
        phone_number: cleanPhoneNumber,
        created_at: new Date().toISOString(),
      });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      
      // Clean up: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create user profile' 
        }, 
        { status: 500 }
      );
    }
    
    // No longer generating verification code during registration
    // Users will request a code when they're ready to verify in the dashboard
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        userId: userData.user.id
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('General error in registration API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}
