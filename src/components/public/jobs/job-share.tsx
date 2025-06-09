"use client";

import { useState } from 'react';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Copy, 
  Check,
  MessageCircle
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface JobShareProps {
  jobTitle: string;
  jobUrl: string;
  companyName: string;
}

export function JobShare({ jobTitle, jobUrl, companyName }: JobShareProps) {
  const [copied, setCopied] = useState(false);
  const shareText = `Check out this job: ${jobTitle} at ${companyName}`;
  
  // Encode for URL parameters
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(jobUrl);
  
  // Social media share URLs
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Job Opportunity: ${jobTitle}`)}&body=${encodeURIComponent(`I found this job that might interest you: ${jobTitle} at ${companyName}.\n\n${jobUrl}`)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${jobUrl}`)}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jobUrl).then(() => {
      setCopied(true);
      toast({
        title: "URL copied!",
        description: "Job URL has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-full w-full">
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <h3 className="font-medium mb-3">Share this job</h3>
        <div className="grid grid-cols-4 gap-2">
          <a 
            href={facebookUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <span className="text-xs mt-1">Facebook</span>
          </a>
          
          <a 
            href={twitterUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Twitter className="h-5 w-5 text-sky-500" />
            <span className="text-xs mt-1">Twitter</span>
          </a>
          
          <a 
            href={linkedinUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
            <span className="text-xs mt-1">LinkedIn</span>
          </a>
          
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MessageCircle className="h-5 w-5 text-green-500" />
            <span className="text-xs mt-1">WhatsApp</span>
          </a>
          
          <a 
            href={emailUrl}
            className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Mail className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Email</span>
          </a>
          
          <button 
            onClick={copyToClipboard}
            className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-gray-600" />
            )}
            <span className="text-xs mt-1">Copy URL</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
