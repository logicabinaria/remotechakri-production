import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {
  // Create a response object that we'll modify and return
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client using the request and response objects
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set the cookie on the response
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove the cookie by setting an empty value and immediate expiration
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  try {
    // Get the session - this will refresh the session if needed
    const { data: { session } } = await supabase.auth.getSession();

    // If the user is not signed in and the route is protected, redirect to login
    if (!session && request.nextUrl.pathname.startsWith('/admin')) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If we have a session but we're on the login page, redirect to admin
    if (session && request.nextUrl.pathname === '/login') {
      console.log('Session found on login page, redirecting to admin');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  } catch (error) {
    console.error('Error in middleware:', error);
  }

  // Continue with the response
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
