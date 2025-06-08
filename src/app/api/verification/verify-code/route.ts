import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    // Create a new cookie store that can be passed to the Supabase client
    const cookieStore = cookies();
    
    // Get the user's session using the route handler client
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // First try to get user from authorization header if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      
      if (!tokenError && tokenUser) {
        userId = tokenUser.id;
        console.log('User authenticated via token:', userId);
      }
    }
    
    // If no user from token, try to get from session
    if (!userId) {
      const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !sessionUser) {
        console.error('Authentication error:', userError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Not authenticated', 
            error: userError?.message || 'No user found'
          }, 
          { status: 401 }
        );
      }
      
      userId = sessionUser.id;
      console.log('User authenticated via session:', userId);
    }
    
    // Get request body
    const { verificationCode } = await request.json();
    
    if (!verificationCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Verification code is required' 
        }, 
        { status: 400 }
      );
    }
    
    // Create a Supabase client with the service role key for privileged operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Call the database function to verify the code
    const { data, error } = await supabaseAdmin.rpc(
      'verify_whatsapp_code',
      { 
        user_uuid: userId,
        verification_code: verificationCode
      }
    );
    
    if (error) {
      console.error('Error verifying code:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to verify code' 
        }, 
        { status: 500 }
      );
    }
    
    // Check if verification was successful
    if (!data) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired verification code' 
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'WhatsApp number verified successfully' 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('General error in verification API route:', error);
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
