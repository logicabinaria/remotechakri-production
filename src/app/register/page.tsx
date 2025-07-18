"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { LegalModal, useTermsModal, usePrivacyModal } from "@/components/public/legal/legal-modals";

// Country codes for phone numbers
const countryCodes = [
  { code: "+880", country: "Bangladesh" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+61", country: "Australia" },
];

export default function RegisterPage() {
  const router = useRouter();
  useTheme(); // Keep the hook for theme toggle functionality
  const supabase = useSupabase();
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+880"); // Default to Bangladesh
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Legal modals
  const termsModal = useTermsModal();
  const privacyModal = usePrivacyModal();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    checkUserSession();
  }, [router, supabase]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate terms and privacy policy acceptance
    if (!termsAccepted || !privacyAccepted) {
      setError("You must accept the Terms and Conditions and Privacy Policy to create an account.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate inputs
      if (!fullName || !email || !password || !phoneNumber) {
        throw new Error("All fields are required");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      // Format phone number
      // Remove leading zero if present when using country code and remove any spaces, dashes, or parentheses
      const cleanPhoneNumber = phoneNumber.trim().replace(/^0+/, '').replace(/[\s\-\(\)]/g, '');
      
      // Check if the user already included a country code (starts with + or the selected country code)
      if (cleanPhoneNumber.startsWith('+') || countryCode.substring(1).split('').every(digit => cleanPhoneNumber.startsWith(digit))) {
        throw new Error("Please don't include the country code in your phone number as it's already selected separately");
      }
      
      // Basic validation - phone number should only contain digits
      if (!/^\d+$/.test(cleanPhoneNumber)) {
        throw new Error("Phone number should only contain digits");
      }
      
      // Format phone number - ensure we're using the country code without the + symbol
      const formattedCountryCode = countryCode.startsWith('+') ? countryCode.substring(1) : countryCode;
      const formattedPhoneNumber = `${formattedCountryCode}${cleanPhoneNumber}`;
      
      // Call server-side registration API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phoneNumber: formattedPhoneNumber,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      // Instead of signing in automatically, redirect to login page with success message
      // Store success message in localStorage to display on login page
      localStorage.setItem('registration_success', 'true');
      localStorage.setItem('registration_email', email);
      
      // Redirect to login page
      router.push('/login?registered=true');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-t from-purple-400/5 to-pink-500/5 rounded-full blur-2xl" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
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
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Register to find remote jobs on RemoteChakri.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Full Name - First field as requested */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="Enter your full name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a password (min. 6 characters)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>
              
              {/* Phone Number with Country Code */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (WhatsApp)</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={countryCode} 
                    onValueChange={setCountryCode}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This number will be used for WhatsApp verification
                </p>
              </div>
              
              {/* Terms and Privacy Policy Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    disabled={loading}
                  />
                  <Label 
                    htmlFor="terms" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <button 
                      type="button" 
                      className="text-primary hover:underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        termsModal.openModal();
                      }}
                    >
                      Terms and Conditions
                    </button>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                    disabled={loading}
                  />
                  <Label 
                    htmlFor="privacy" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <button 
                      type="button" 
                      className="text-primary hover:underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        privacyModal.openModal();
                      }}
                    >
                      Privacy Policy
                    </button>
                  </Label>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-center w-full text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
            <div className="flex justify-start w-full">
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
      
      {/* Legal Modals */}
      <LegalModal 
        title="Terms and Conditions"
        content={termsModal.content}
        isOpen={termsModal.isOpen}
        onClose={termsModal.closeModal}
      />
      
      <LegalModal 
        title="Privacy Policy"
        content={privacyModal.content}
        isOpen={privacyModal.isOpen}
        onClose={privacyModal.closeModal}
      />
    </div>
  );
}
