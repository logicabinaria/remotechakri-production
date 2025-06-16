'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

// Google Analytics Measurement ID from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ZXPC9KRP34';

// Check if the current path is in the admin section
const isAdminPath = (path: string) => {
  return path.startsWith('/admin') || path === '/admin-login';
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  
  // Initialize GA and track page views
  useEffect(() => {
    // Only track for non-admin paths
    if (pathname && !isAdminPath(pathname)) {
      // Send pageview with path
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);
  
  // Skip rendering scripts for admin paths
  if (pathname && isAdminPath(pathname)) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Helper function to track events
export function trackEvent(action: string, category: string, label: string, value?: number) {
  if (typeof window !== 'undefined' && !isAdminPath(window.location.pathname)) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Type definition for the global gtag function
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: Array<unknown>;
  }
}
