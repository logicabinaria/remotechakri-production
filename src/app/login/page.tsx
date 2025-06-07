"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { theme } = useTheme();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/admin');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'USER_DELETED' | 'PASSWORD_RECOVERY', 
       session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/admin');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">RemoteChakri.com Admin</CardTitle>
            <CardDescription className="text-center">
              Login to access the admin panel
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
                // Custom styles will be added via CSS
              }}
              theme={theme === 'dark' ? 'dark' : 'light'}
              providers={[]}
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin'}
              onlyThirdPartyProviders={false}
              magicLink={false}
              view="sign_in"
              showLinks={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
