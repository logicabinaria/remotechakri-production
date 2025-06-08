"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PasswordResetPage() {
  // Router will be used for future redirects if needed
  // const router = useRouter();
  const supabase = useSupabase();
  // Theme is used by Supabase Auth UI
  // const { theme } = useTheme();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-callback`,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({ 
        type: "success", 
        text: "Password reset instructions have been sent to your email address. Please check your inbox." 
      });
      setEmail("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the password reset email.";
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
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we&apos;ll send you instructions to reset your password
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
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </form>
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
