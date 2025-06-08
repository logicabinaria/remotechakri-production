"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { theme } = useTheme();

  // Check if user is already logged in and is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get authenticated user data
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // No authenticated user, stay on login page
          return;
        }
        
        // Use RPC function to check admin status
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        
        if (rpcError) {
          console.error('Error checking admin status via RPC:', rpcError);
          return;
        }
        
        if (isAdmin) {
          // User is an admin, redirect to admin dashboard
          router.push('/admin');
        } else {
          // User is not an admin, redirect to user login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error in admin check:', error);
      }
    };
    checkAdminStatus();
  }, [router, supabase]);

  // Set up auth state change listener with admin-only redirection
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'USER_DELETED' | 'PASSWORD_RECOVERY', 
       session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Get authenticated user data
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              console.error('Error getting authenticated user:', userError);
              return;
            }
            
            // Use RPC function to check admin status
            const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', {
              user_id: user.id
            });
            
            if (rpcError) {
              console.error('Error checking admin status via RPC:', rpcError);
              return;
            }
            
            if (isAdmin) {
              // User is an admin, redirect to admin dashboard
              router.push('/admin');
            } else {
              // User is not an admin, redirect to user login
              router.push('/login');
            }
          } catch (error) {
            console.error('Error in admin check:', error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Login to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--color-primary))',
                      brandAccent: 'rgb(var(--color-primary-dark))',
                    },
                  },
                },
              }}
              theme={theme === 'dark' ? 'dark' : 'light'}
              providers={[]}
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
              onlyThirdPartyProviders={false}
              magicLink={false}
              view="sign_in"
              showLinks={false}
            />
            
            <div className="mt-4 text-center">
              <Link 
                href="/password-reset" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link 
              href="/" 
              className="flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Website
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
