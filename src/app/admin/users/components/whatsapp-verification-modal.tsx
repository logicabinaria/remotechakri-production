"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

// Define types
type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile: {
    full_name: string | null;
    phone_number: string | null;
    is_whatsapp_verified: boolean;
    whatsapp_verified_at: string | null;
  } | null;
};

interface WhatsAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onVerificationUpdate: (updatedUser: User) => void;
}

export function WhatsAppVerificationModal({
  isOpen,
  onClose,
  user,
  onVerificationUpdate,
}: WhatsAppVerificationModalProps) {
  const supabase = useSupabase();
  const [phoneNumber, setPhoneNumber] = useState(user.profile?.phone_number || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [deletingCode, setDeletingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to update user's phone number
  const updatePhoneNumber = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.trim() === "") {
        throw new Error("Please enter a valid phone number");
      }

      // Clean the phone number - remove any non-digit characters
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");

      // Update the user's phone number in the user_profiles table
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          phone_number: cleanPhoneNumber,
        })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(`Failed to update phone number: ${updateError.message}`);
      }

      // Update the local user object
      const updatedUser: User = {
        ...user,
        profile: user.profile ? {
          ...user.profile,
          phone_number: cleanPhoneNumber,
        } : null,
      };

      onVerificationUpdate(updatedUser);
      setSuccess("Phone number updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to send verification code
  const sendVerificationCode = async () => {
    setSendingCode(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.trim() === "") {
        throw new Error("Please enter a valid phone number");
      }

      // Clean the phone number - remove any non-digit characters
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication session expired. Please refresh the page and try again.");
      }

      // Call the admin-specific API endpoint for sending verification codes
      const response = await fetch('/api/admin/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          phoneNumber: cleanPhoneNumber,
        }),
      });

      try {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to send WhatsApp verification code");
        }

        // Verification code was generated and sent (or mock-sent in development)
        setSuccess("Verification code generated and sent successfully. Note: The code is stored in the database even if WhatsApp delivery fails.");
      } catch (responseErr) {
        // If there was an error in processing the response, but the code might still have been generated
        console.error('Error processing API response:', responseErr);
        setError(`${responseErr instanceof Error ? responseErr.message : "Unknown error"} - Note: A verification code may still have been generated in the database.`);
      }
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSendingCode(false);
    }
  };

  // Function to manually verify a user's WhatsApp
  const manuallyVerifyWhatsApp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update the user's WhatsApp verification status
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          is_whatsapp_verified: true,
          whatsapp_verified_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(`Failed to update verification status: ${updateError.message}`);
      }

      // Update the local user object
      const updatedUser: User = {
        ...user,
        profile: user.profile ? {
          ...user.profile,
          is_whatsapp_verified: true,
          whatsapp_verified_at: new Date().toISOString(),
        } : null,
      };

      onVerificationUpdate(updatedUser);
      setSuccess("User&apos;s WhatsApp has been manually verified");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete existing verification codes
  const deleteVerificationCode = async () => {
    setDeletingCode(true);
    setError(null);
    setSuccess(null);

    try {
      // Delete verification code from the database
      // The verification_codes table only has user_id, no type column
      const { error: deleteError } = await supabase
        .from("verification_codes")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        throw new Error(`Failed to delete verification code: ${deleteError.message}`);
      }

      setSuccess("Verification code deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setDeletingCode(false);
    }
  };

  // Function to manually verify with a specific code
  const verifyWithCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!verificationCode || verificationCode.trim() === "") {
        throw new Error("Please enter a verification code");
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication session expired. Please refresh the page and try again.");
      }

      // Call the verify-code API with the user's ID and the verification code
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          verificationCode: verificationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to verify code");
      }

      // Update the local user object
      const updatedUser: User = {
        ...user,
        profile: user.profile ? {
          ...user.profile,
          is_whatsapp_verified: true,
          whatsapp_verified_at: new Date().toISOString(),
        } : null,
      };

      onVerificationUpdate(updatedUser);
      setSuccess("WhatsApp number verified successfully");
      setVerificationCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage WhatsApp Verification</DialogTitle>
          <DialogDescription>
            Update phone number and manage WhatsApp verification status for {user.email}
          </DialogDescription>
        </DialogHeader>

        {/* Status information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-4">
          <h4 className="text-sm font-medium mb-2">User Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Name:</div>
            <div>{user.profile?.full_name || "Not set"}</div>
            <div>Email:</div>
            <div>{user.email}</div>
            <div>WhatsApp Status:</div>
            <div>
              {user.profile?.is_whatsapp_verified ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                  {user.profile?.whatsapp_verified_at && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({format(new Date(user.profile.whatsapp_verified_at), "MMM d, yyyy")})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-red-600">Not Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Error and success messages */}
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* Phone number update */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex space-x-2">
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 8801712345678"
                disabled={loading || sendingCode}
              />
              <Button 
                onClick={updatePhoneNumber} 
                disabled={loading || sendingCode}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update
              </Button>
            </div>
          </div>

          {/* Send verification code */}
          <div>
            <Button
              variant="outline"
              onClick={sendVerificationCode}
              disabled={loading || sendingCode || !phoneNumber}
              className="w-full"
            >
              {sendingCode ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              This will send a new verification code to the user&apos;s WhatsApp number
            </p>
          </div>

          {/* Manual verification with code */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="code">Verification Code</Label>
            <div className="flex space-x-2">
              <Input
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                disabled={loading}
              />
              <Button 
                onClick={verifyWithCode} 
                disabled={loading || !verificationCode}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter a verification code that the user has received
            </p>
          </div>

          {/* Manual verification button */}
          <div className="pt-4 border-t">
            <Button
              variant="secondary"
              onClick={manuallyVerifyWhatsApp}
              disabled={loading || user.profile?.is_whatsapp_verified}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Manually Mark as Verified
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Use this option only if you have confirmed the user&apos;s WhatsApp number through other means
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={deleteVerificationCode}
            disabled={deletingCode}
            className="mr-auto"
          >
            {deletingCode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Verification Code"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
