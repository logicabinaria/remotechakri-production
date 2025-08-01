import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore
      }
    );
    
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to password update page with hash fragment preserved
  return NextResponse.redirect(`${requestUrl.origin}/password-update${request.url.split('?')[1] ? '#' + request.url.split('?')[1] : ''}`);
}
