"use client";

import { ReactNode } from "react";
import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";
import { CookieConsent } from "@/components/public/cookie-consent";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
