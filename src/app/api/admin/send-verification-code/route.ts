import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Create supabase client for authentication checks
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {}, // Not needed for API routes
          remove: () => {}, // Not needed for API routes
        },
      }
    );

    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        }, 
        { status: 401 }
      );
    }

    // Verify admin status (optional for development)
    // const { data: adminCheck } = await supabase
    //   .from('admins')
    //   .select('id')
    //   .eq('user_id', session.user.id)
    //   .single();
    
    // if (!adminCheck) {
    //   return NextResponse.json(
    //     { 
    //       success: false, 
    //       message: 'Not authorized' 
    //     }, 
    //     { status: 403 }
    //   );
    // }

    // Get request body
    const { userId, phoneNumber } = await request.json();
    
    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User ID and phone number are required' 
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
    
    // First, delete any existing verification codes for this user
    try {
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('user_id', userId);
    } catch (deleteError) {
      console.warn('Error deleting existing verification codes:', deleteError);
      // Continue anyway - not a critical error
    }
    
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
          message: 'Failed to generate verification code',
          error: error.message
        }, 
        { status: 500 }
      );
    }
    
    const verificationCode = data;
    
    // Get API key from environment variable
    const apiKey = process.env.WHATSAPP_API_KEY;
    
    if (!apiKey) {
      console.error('WhatsApp API key not configured');
      return NextResponse.json(
        { 
          success: false, 
          message: 'WhatsApp API configuration error' 
        }, 
        { status: 500 }
      );
    }
    
    // Send the verification code via WhatsApp
    try {
      let result: { success: boolean; message?: string; code?: number } = {
        success: false
      };
      
      // Real API call with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch('https://api.wacloud.app/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'API-Key': apiKey
          },
          body: JSON.stringify({
            recipient: cleanPhoneNumber,
            content: `Your RemoteChakri verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
            media_url: "", // Leave blank for text-only messages
            instance_id: process.env.NEXT_PUBLIC_WHATSAPP_INSTANCE_ID || ''
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`WhatsApp API error (${response.status}): ${errorText}`);
        }
        
        result = await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        // Type guard for AbortError
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('WhatsApp API request timed out after 10 seconds');
        }
        throw error;
      }
      
      // Log the WhatsApp message attempt
      await supabaseAdmin
        .from('whatsapp_logs')
        .insert({
          recipient: cleanPhoneNumber,
          message_type: 'verification_code',
          success: result.success,
          response_code: result.code || 200,
          response_message: result.message || 'Sent via admin API'
        });
      
      if (!result.success) {
        throw new Error(result.message || 'WhatsApp API returned error');
      }
      
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
          message: 'Failed to send verification code',
          error: error instanceof Error ? error.message : String(error)
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error in admin verification code API route:', error);
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
