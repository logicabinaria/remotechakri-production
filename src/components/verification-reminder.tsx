"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function VerificationReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if verification is pending
    const isPending = localStorage.getItem('whatsapp_verification_pending');
    
    // Check if there's a reminder time set
    const reminderTime = localStorage.getItem('whatsapp_verification_reminder_time');
    
    if (isPending === 'true') {
      // If there's a reminder time, check if it's passed
      if (reminderTime) {
        const nextReminder = new Date(reminderTime);
        const now = new Date();
        
        if (now >= nextReminder) {
          setShowReminder(true);
        }
      } else {
        // No reminder time set, show the reminder
        setShowReminder(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    // Don't show the reminder again for 24 hours
    const nextReminderTime = new Date();
    nextReminderTime.setHours(nextReminderTime.getHours() + 24);
    localStorage.setItem('whatsapp_verification_reminder_time', nextReminderTime.toISOString());
    setShowReminder(false);
  };

  const handleVerifyNow = () => {
    // Clear the pending flag when navigating to verification page
    localStorage.removeItem('whatsapp_verification_pending');
    router.push('/dashboard/verify');
  };

  if (!showReminder) {
    return null;
  }

  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-blue-700">
            Your WhatsApp number is not verified. Verify now for a better experience.
          </AlertDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-200 hover:bg-blue-100"
            onClick={handleVerifyNow}
          >
            Verify Now
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
