"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function DashboardVerifyPage() {
  const router = useRouter();
  const supabase = useSupabase();
  
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [isWhatsAppVerificationEnabled, setIsWhatsAppVerificationEnabled] = useState(true);
  
  // Check if WhatsApp verification is enabled
  useEffect(() => {
    const enableWhatsAppVerification = process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_VERIFICATION === 'true';
    setIsWhatsAppVerificationEnabled(enableWhatsAppVerification);
    
    // If WhatsApp verification is disabled, redirect to dashboard
    if (!enableWhatsAppVerification) {
      router.push('/dashboard');
    }
  }, [router]);

  // Check if user is logged in and get their details
  useEffect(() => {
    const checkUserSession = async () => {
      // Get session and user data
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!sessionData.session || !userData.user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      setUser(userData.user);
      
      // Check if user is already verified with proper headers
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('phone_number, is_whatsapp_verified')
        .eq('user_id', sessionData.session.user.id)
        .single({
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      
      if (profileData) {
        setPhoneNumber(profileData.phone_number || "");
        
        if (profileData.is_whatsapp_verified) {
          setIsVerified(true);
          setSuccess("Your WhatsApp number is already verified!");
          // Already verified, redirect to dashboard after a brief message
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    };
    
    checkUserSession();
  }, [router, supabase]);

  // Handle sending verification code via WhatsApp
  const sendVerificationCode = async () => {
    try {
      setError(null);
      setSendingCode(true);
      
      if (!phoneNumber) {
        throw new Error("Phone number not found. Please update your profile.");
      }
      
      // Validate and format phone number
      if (phoneNumber.trim() === '') {
        throw new Error("Phone number is missing. Please update your profile.");
      }
      
      // Clean the phone number - remove any non-digit characters including +
      const formattedRecipient = phoneNumber.replace(/[^\d]/g, '');
      
      if (formattedRecipient.length < 10) {
        throw new Error("Phone number appears to be too short. Please update your profile.");
      }
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication session expired. Please refresh the page and try again.");
      }
      
      // Call the secure server-side API to generate and send verification code
      const response = await fetch('/api/verification/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include', // Include credentials (cookies) with the request
        body: JSON.stringify({
          phoneNumber: formattedRecipient,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to send WhatsApp message");
      }
      
      // Start countdown for resend button (60 seconds)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setSuccess("Verification code sent to your WhatsApp number!");
    } catch (err: unknown) {
      console.error('Error sending verification code:', err);
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  // Handle verification code submission
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        throw new Error("You need to be logged in to verify your WhatsApp number");
      }
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication session expired. Please refresh the page and try again.");
      }
      
      // Call the secure server-side API to verify the code
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include', // Include credentials (cookies) with the request
        body: JSON.stringify({
          verificationCode: verificationCode,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to verify code");
      }
      
      setSuccess("WhatsApp number verified successfully!");
      setIsVerified(true);
      
      // Remove the verification pending flag from localStorage
      localStorage.removeItem('whatsapp_verification_pending');
      localStorage.removeItem('whatsapp_verification_reminder_time');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // If WhatsApp verification is disabled, show a message
  if (!isWhatsAppVerificationEnabled) {
    return (
      <div className="container max-w-3xl py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">WhatsApp Verification</CardTitle>
            <CardDescription className="text-center">
              WhatsApp verification is currently disabled
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg font-medium text-center">WhatsApp verification is temporarily disabled.</p>
            <p className="text-sm text-gray-500 text-center mt-2">You can continue using the platform without verification.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already verified, show success message
  if (isVerified) {
    return (
      <div className="container max-w-3xl py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verify Your WhatsApp</CardTitle>
            <CardDescription className="text-center">
              We recommend verifying your WhatsApp number for a better experience
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-center">Your WhatsApp number is verified!</p>
            <p className="text-sm text-gray-500 text-center mt-2">You&apos;re all set to receive notifications.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view - verification form
  return (
    <div className="container max-w-3xl py-6">
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Verify Your WhatsApp</CardTitle>
          <CardDescription className="text-center">
            We recommend verifying your WhatsApp number for a better experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Your WhatsApp Number</Label>
              <div className="flex mt-1">
                <Input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 8801712345678"
                  className="flex-1"
                  disabled={sendingCode || loading}
                />
                <Button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sendingCode || countdown > 0 || !phoneNumber}
                  className="ml-2 whitespace-nowrap"
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll send a verification code to this WhatsApp number
              </p>
            </div>
            
            <form onSubmit={verifyCode}>
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="mt-1"
                  disabled={loading}
                />
              </div>
              
              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !verificationCode || verificationCode.length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
