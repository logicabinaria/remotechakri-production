import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { recipient, content, instance_id } = body;
    
    // Validate required fields
    if (!recipient || !content || !instance_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: recipient, content, or instance_id' 
        }, 
        { status: 400 }
      );
    }
    
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
    
    // Create supabase client for logging
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookies().get(name)?.value,
          set: () => {}, // Not needed for API routes
          remove: () => {}, // Not needed for API routes
        },
      }
    );
    
    // Call WhatsApp API
    try {
      const response = await fetch('https://api.wacloud.app/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': apiKey
        },
        body: JSON.stringify({
          recipient,
          content,
          media_url: null, // No media for verification codes
          instance_id,
          message_type: 'text' // Specify message type as per API requirements
        })
      });
      
      const result = await response.json();
      
      // Log the API call result
      await supabase.from('whatsapp_logs').insert({
        recipient,
        message_type: 'verification_code',
        success: result.success,
        response_code: result.code,
        response_message: result.message
      });
      
      if (!result.success) {
        console.error('WhatsApp API error:', result);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to send WhatsApp message',
            error: result.message
          }, 
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'WhatsApp message sent successfully' 
        }, 
        { status: 200 }
      );
    } catch (error) {
      console.error('Error calling WhatsApp API:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error calling WhatsApp API',
          error: error instanceof Error ? error.message : String(error)
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error in WhatsApp API route:', error);
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
