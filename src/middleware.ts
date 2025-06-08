import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {
  // Log the current path for debugging
  console.log('Middleware processing path:', request.nextUrl.pathname);

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
    
    // Get authenticated user data (more secure than using session.user directly)
    const { data: { user } } = await supabase.auth.getUser();
    
    const currentPath = request.nextUrl.pathname;
    
    // Special handling for admin-login path
    if (currentPath === '/admin-login') {
      console.log('On admin login page');
      
      // If already logged in, check if admin and redirect appropriately
      if (session) {
        try {
          // Get authenticated user data
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.error('Error getting authenticated user:', userError);
            return response; // Stay on admin login page
          }
          
          // Use RPC function to check admin status
          const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', {
            user_id: user.id
          });
          
          if (rpcError) {
            console.error('Error checking admin status via RPC:', rpcError);
            return response; // Stay on admin login page if error
          }
          
          if (isAdmin) {
            console.log('Admin user confirmed, redirecting to admin dashboard');
            return NextResponse.redirect(new URL('/admin', request.url));
          } else {
            console.log('Non-admin user confirmed, redirecting to user dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch (error) {
          console.error('Error in admin check:', error);
          return response; // Stay on admin login page if error
        }
      }
      
      // Not logged in, stay on admin login page
      return response;
    }
    
    // Handle regular login page
    if (currentPath === '/login' && session) {
      console.log('Session found on login page, redirecting to verification check');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Handle register page
    if (currentPath === '/register' && session) {
      console.log('Session found on register page, redirecting to verification check');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Protect admin routes (except admin-login)
    if (currentPath.startsWith('/admin') && !session) {
      console.log('No session found, redirecting to admin login');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    
    // Protect dashboard routes and check verification
    if (currentPath.startsWith('/dashboard') && session) {
      // Get user profile to check verification status
      // Set headers for the request
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_whatsapp_verified')
        .eq('user_id', user?.id || session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error checking verification status:', profileError);
      } else if (!profile || !profile.is_whatsapp_verified) {
        console.log('User not verified, redirecting to verification page');
        // Only redirect if not already on the verify page
        if (!currentPath.includes('/dashboard/verify')) {
          return NextResponse.redirect(new URL('/dashboard/verify', request.url));
        }
      }
    }
    
    // Protect dashboard routes for unauthenticated users
    if (currentPath.startsWith('/dashboard') && !session) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
  } catch (error) {
    console.error('Error in middleware:', error);
  }

  // Continue with the response
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/admin-login', '/dashboard/:path*', '/register'],
};
