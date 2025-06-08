"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

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
  const supabase = useSupabase();
  useTheme(); // Keep the hook for theme toggle functionality
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+880"); // Default to Bangladesh
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        router.push('/dashboard');
      }
    };
    checkUserSession();
  }, [router, supabase]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Validate form
      if (!fullName.trim()) {
        throw new Error("Please enter your full name");
      }
      
      if (!email.trim()) {
        throw new Error("Please enter your email address");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      if (!phoneNumber.trim()) {
        throw new Error("Please enter your phone number");
      }
      
      // Clean and validate phone number
      let cleanPhoneNumber = phoneNumber.trim();
      
      // Remove any spaces, dashes, or parentheses
      cleanPhoneNumber = cleanPhoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Check if the user already included a country code (starts with + or the selected country code)
      if (cleanPhoneNumber.startsWith('+') || countryCode.substring(1).split('').every(digit => cleanPhoneNumber.startsWith(digit))) {
        throw new Error("Please don't include the country code in your phone number as it's already selected separately");
      }
      
      // Basic validation - phone number should only contain digits
      if (!/^\d+$/.test(cleanPhoneNumber)) {
        throw new Error("Phone number should only contain digits");
      }
      
      // Format phone number - remove the + from country code
      const cleanCountryCode = countryCode.startsWith('+') ? countryCode.substring(1) : countryCode;
      const formattedPhoneNumber = `${cleanCountryCode}${cleanPhoneNumber}`;
      
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader className="space-y-1">
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
          <CardFooter>
            <p className="text-sm text-center w-full text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
