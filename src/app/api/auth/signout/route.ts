import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Sign out the user
    await supabase.auth.signOut();
    
    // Redirect to the home page
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://remotechakri.com'));
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://remotechakri.com'));
  }
}
