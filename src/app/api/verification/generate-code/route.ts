import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Phone number is required' 
        }, 
        { status: 400 }
      );
    }
    
    // Clean phone number - ensure it only contains digits
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Create a Supabase client with the service role key for privileged operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Log the authenticated user ID for debugging
    console.log('Authenticated user ID:', userId);
    
    // Call the database function to generate a verification code
    const { data, error } = await supabaseAdmin.rpc(
      'generate_verification_code',
      { user_uuid: userId }
    );
    
    if (error) {
      console.error('Error generating verification code:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to generate verification code' 
        }, 
        { status: 500 }
      );
    }
    
    const verificationCode = data;
    
    // Send the verification code via WhatsApp
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'https://api.wacloud.app'}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': process.env.WHATSAPP_API_KEY || '',
        },
        body: JSON.stringify({
          recipient: cleanPhoneNumber,
          content: `Your RemoteChakri verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
          instance_id: process.env.NEXT_PUBLIC_WHATSAPP_INSTANCE_ID || '',
          message_type: 'text'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }
      
      // Log the WhatsApp message
      await supabaseAdmin
        .from('whatsapp_logs')
        .insert({
          recipient: cleanPhoneNumber,
          message_type: 'verification_code',
          success: true,
          response_code: response.status,
          response_message: 'Sent via server-side API',
        });
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Verification code sent successfully' 
        }, 
        { status: 200 }
      );
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // Log the failed attempt
      await supabaseAdmin
        .from('whatsapp_logs')
        .insert({
          recipient: cleanPhoneNumber,
          message_type: 'verification_code',
          success: false,
          response_code: 500,
          response_message: error instanceof Error ? error.message : String(error),
        });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to send verification code' 
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error in verification code API route:', error);
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
