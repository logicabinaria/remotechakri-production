"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function PasswordUpdatePage() {
  const router = useRouter();
  const supabase = useSupabase();
  // Theme is used in conditional rendering if needed in the future
  // const { theme } = useTheme();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidHash, setIsValidHash] = useState(false);

  // Check if the URL contains valid hash parameters for password reset
  useEffect(() => {
    const checkHashParams = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'recovery') {
        setIsValidHash(true);
        
        // Set the session using the recovery tokens
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
      } else {
        setMessage({
          type: "error",
          text: "Invalid or expired password reset link. Please request a new password reset."
        });
      }
    };
    
    checkHashParams();
  }, [supabase.auth]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    
    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setMessage({ 
        type: "success", 
        text: "Your password has been updated successfully. You will be redirected to login shortly." 
      });
      
      // Clear form
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while updating your password.";
      setMessage({ 
        type: "error", 
        text: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
            <CardDescription className="text-center">
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className={`mb-4 ${message.type === "success" ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                <div className="flex items-center gap-2">
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </div>
              </Alert>
            )}
            
            {isValidHash ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  This link appears to be invalid or expired.
                </p>
                <Link 
                  href="/password-reset" 
                  className="mt-4 inline-flex items-center text-primary hover:underline"
                >
                  Request a new password reset
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link 
              href="/login" 
              className="flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
