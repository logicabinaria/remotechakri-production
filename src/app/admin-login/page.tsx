"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useSupabase();
  useTheme(); // Keep the hook for theme functionality
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
      
      // Use RPC function to check admin status
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (rpcError) {
        throw rpcError;
      }
      
      if (isAdmin) {
        // User is an admin, redirect to admin dashboard
        router.push('/admin');
      } else {
        // User is not an admin, show error
        setError('You do not have admin privileges');
        await supabase.auth.signOut();
      }
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
    try {
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
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
    }
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
                  sizes="300px"
                  className="hidden dark:block object-contain"
                  priority
                />
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_LIGHT_URL || ''}
                  alt="RemoteChakri.com"
                  fill
                  sizes="300px"
                  className="block dark:hidden object-contain"
                  priority
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Login to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
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
            </form>
            
            <div className="mt-4 text-center">
              <Link 
                href="/password-reset" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link 
              href="/" 
              className="flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Website
            </Link>
            <Link 
              href="/login" 
              className="flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            >
              User Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
