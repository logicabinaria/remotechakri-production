export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Delete verification code for the user
    const { error } = await supabase
      .from('verification_codes')
      .delete()
      .eq('user_id', userId)
      .eq('type', 'whatsapp'); // Assuming there's a type column to distinguish between different verification types
    
    if (error) {
      console.error('Error deleting verification code:', error);
      return NextResponse.json(
        { error: 'Failed to delete verification code', details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'WhatsApp verification code deleted successfully' 
    });
  } catch (error) {
    console.error('Error in delete-verification-code API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
