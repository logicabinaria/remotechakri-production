"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { theme } = useTheme();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");

  // Check for registration success message
  useEffect(() => {
    // Check URL parameters for registration success
    const params = new URLSearchParams(window.location.search);
    const registered = params.get('registered');
    
    // Check localStorage for registration success
    const success = localStorage.getItem('registration_success');
    const email = localStorage.getItem('registration_email');
    
    if (registered === 'true' || success === 'true') {
      setRegistrationSuccess(true);
      if (email) {
        setRegistrationEmail(email);
      }
      
      // Clear the localStorage items
      localStorage.removeItem('registration_success');
      localStorage.removeItem('registration_email');
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        try {
          // Create user profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: data.session.user.id,
              full_name: data.session.user.user_metadata?.full_name || '',
              avatar_url: data.session.user.user_metadata?.avatar_url || '',
            }, { onConflict: 'user_id' });
          
          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }
          
          // Check if WhatsApp is verified
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('is_whatsapp_verified')
            .eq('user_id', data.session.user.id)
            .single();
            
          // Always redirect to dashboard - verification will be handled via the reminder component
          router.push('/dashboard');
          
          // Set flag if WhatsApp is not verified to show the reminder
          if (profileData && !profileData.is_whatsapp_verified) {
            localStorage.setItem('whatsapp_verification_pending', 'true');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          router.push('/dashboard');
        }
      }
    };
    checkUserSession();
  }, [router, supabase]);

  // Set up auth state change listener for user redirection
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'USER_DELETED' | 'PASSWORD_RECOVERY', 
       session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Create user profile if it doesn't exist
            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert({
                user_id: session.user.id,
                full_name: session.user.user_metadata?.full_name || '',
                avatar_url: session.user.user_metadata?.avatar_url || '',
              }, { onConflict: 'user_id' });
            
            if (profileError) {
              console.error('Error creating user profile:', profileError);
            }
            
            // Check if WhatsApp is verified
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('is_whatsapp_verified')
              .eq('user_id', session.user.id)
              .single();
              
            // Always redirect to dashboard - verification will be handled via the reminder component
            router.push('/dashboard');
            
            // Set flag if WhatsApp is not verified to show the reminder
            if (profileData && !profileData.is_whatsapp_verified) {
              localStorage.setItem('whatsapp_verification_pending', 'true');
            }
          } catch (error) {
            console.error('Authentication error:', error);
            router.push('/dashboard');
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
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to login to your account
            </CardDescription>
          </CardHeader>
          {registrationSuccess && (
            <div className="px-6 pb-2">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Registration successful! {registrationEmail ? `You can now login with ${registrationEmail}` : 'You can now login with your email and password'}
                </AlertDescription>
              </Alert>
            </div>
          )}
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
                // Custom styles will be added via CSS
              }}
              theme={theme === 'dark' ? 'dark' : 'light'}
              providers={[]}
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
              onlyThirdPartyProviders={false}
              magicLink={false}
              view="sign_in"
              showLinks={true}
            />
            
            <div className="mt-4 text-center">
              <div className="mb-2">
                <Link 
                  href="/password-reset" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/register" 
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
