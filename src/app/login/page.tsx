"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/providers/theme-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Session } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabase();
  useTheme(); // Keep the hook for theme functionality
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      // Get authenticated user data
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Error getting authenticated user');
      }
      
      // Create user profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        }, { onConflict: 'user_id' });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
      
      // Check if WhatsApp verification is enabled via environment variable
      const enableWhatsAppVerification = process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_VERIFICATION === 'true';
      
      if (enableWhatsAppVerification) {
        // Check if WhatsApp is verified
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('is_whatsapp_verified')
          .eq('user_id', user.id)
          .single();
          
        // Set flag if WhatsApp is not verified to show the reminder
        if (profileData && !profileData.is_whatsapp_verified) {
          localStorage.setItem('whatsapp_verification_pending', 'true');
        }
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to login. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
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
            
            // Check if WhatsApp verification is enabled via environment variable
            const enableWhatsAppVerification = process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_VERIFICATION === 'true';
            
            if (enableWhatsAppVerification) {
              // Check if WhatsApp is verified
              const { data: profileData } = await supabase
                .from('user_profiles')
                .select('is_whatsapp_verified')
                .eq('user_id', data.session.user.id)
                .single();
                
              // Set flag if WhatsApp is not verified to show the reminder
              if (profileData && !profileData.is_whatsapp_verified) {
                localStorage.setItem('whatsapp_verification_pending', 'true');
              }
            }
            
            // Always redirect to dashboard - verification will be handled via the reminder component
            router.push('/dashboard');
          } catch (error) {
            console.error('Authentication error:', error);
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
            
            // Check if WhatsApp verification is enabled via environment variable
            const enableWhatsAppVerification = process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_VERIFICATION === 'true';
            
            if (enableWhatsAppVerification) {
              // Check if WhatsApp is verified
              const { data: profileData } = await supabase
                .from('user_profiles')
                .select('is_whatsapp_verified')
                .eq('user_id', session.user.id)
                .single();
                
              // Set flag if WhatsApp is not verified to show the reminder
              if (profileData && !profileData.is_whatsapp_verified) {
                localStorage.setItem('whatsapp_verification_pending', 'true');
              }
            }
            
            // Always redirect to dashboard - verification will be handled via the reminder component
            router.push('/dashboard');
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
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_LOGIN_BG_URL})` }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md px-4 relative">
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-0 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="relative h-12 w-48">
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_DARK_URL || ''}
                  alt="RemoteChakri.com"
                  fill
                  sizes="192px"
                  className="hidden dark:block object-contain"
                  priority
                />
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_LIGHT_URL || ''}
                  alt="RemoteChakri.com"
                  fill
                  sizes="192px"
                  className="block dark:hidden object-contain"
                  priority
                />
              </div>
            </div>
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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {registrationSuccess && (
              <div className="mb-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Registration successful! {registrationEmail ? `You can now login with ${registrationEmail}` : 'You can now login with your email and password'}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/register" 
                  className="text-sm text-primary hover:underline"
                >
                  Don&apos;t have an account? Register
                </Link>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <div className="mb-2">
                <Link 
                  href="/password-reset" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
            <div className="flex justify-center w-full">
              <Link 
                href="/" 
                className="flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Website
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
