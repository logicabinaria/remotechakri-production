"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Building, Home, LogOut, Menu, Tag, MapPin, Briefcase, BarChart, MessageCircle, X, Users, FileText, ChevronDown, ChevronRight, BookOpen, User } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Inline media query hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // Set the initial value
      setMatches(media.matches);

      // Define a callback function to handle changes
      const listener = () => {
        setMatches(media.matches);
      };

      // Add the listener
      media.addEventListener('change', listener);

      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
    
    return () => {};
  }, [query]);

  return matches;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const supabase = useSupabase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Close sidebar on mobile when pathname changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [pathname, isMobile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ reports: true, blog: true });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/whatsapp-verification", label: "WhatsApp Verification", icon: MessageCircle },
    { href: "/admin/categories", label: "Categories", icon: Building },
    { href: "/admin/job-types", label: "Job Types", icon: Tag },
    { href: "/admin/locations", label: "Locations", icon: MapPin },
    { href: "/admin/tags", label: "Tags", icon: Tag },
    { href: "/admin/whatsapp-logs", label: "WhatsApp Logs", icon: MessageCircle },
  ];

  const reportItems = [
    { href: "/admin/reports/analytics", label: "Analytics", icon: BarChart },
    { href: "/admin/reports/job-submissions", label: "Job Submissions", icon: FileText },
  ];

  const blogItems = [
    { href: "/admin/blogs", label: "Blog Posts", icon: BookOpen },
    { href: "/admin/blog-authors", label: "Blog Authors", icon: User },
    { href: "/admin/blog-categories", label: "Blog Categories", icon: Tag },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b dark:border-gray-700 px-4 py-4">
            <Link href="/admin" className="flex items-center">
              <div className="relative h-8 w-40">
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_DARK_URL || '/logo-dark.svg'}
                  alt="RemoteChakri.com"
                  fill
                  sizes="160px"
                  className="hidden dark:block object-contain"
                  priority
                />
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_LIGHT_URL || '/logo-light.svg'}
                  alt="RemoteChakri.com"
                  fill
                  sizes="160px"
                  className="block dark:hidden object-contain"
                  priority
                />
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-gray-700 dark:text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Blog Management Section with Dropdown */}
              <div className="mt-4">
                <button
                  onClick={() => toggleSection('blog')}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {expandedSections.blog ? (
                    <ChevronDown className="mr-3 h-5 w-5" />
                  ) : (
                    <ChevronRight className="mr-3 h-5 w-5" />
                  )}
                  Blog Management
                </button>
                
                {expandedSections.blog && (
                  <div className="ml-6 mt-1 space-y-1">
                    {blogItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-gray-700 dark:text-white"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                          )}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reports Section with Dropdown */}
              <div className="mt-4">
                <button
                  onClick={() => toggleSection('reports')}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {expandedSections.reports ? (
                    <ChevronDown className="mr-3 h-5 w-5" />
                  ) : (
                    <ChevronRight className="mr-3 h-5 w-5" />
                  )}
                  Reports
                </button>
                
                {expandedSections.reports && (
                  <div className="ml-6 mt-1 space-y-1">
                    {reportItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-gray-700 dark:text-white"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                          )}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="border-t dark:border-gray-700 p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="md:hidden relative h-8 w-32">
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_DARK_URL || '/logo-dark.svg'}
                  alt="RemoteChakri.com"
                  fill
                  sizes="128px"
                  className="hidden dark:block object-contain"
                  priority
                />
                <Image 
                  src={process.env.NEXT_PUBLIC_LOGO_LIGHT_URL || '/logo-light.svg'}
                  alt="RemoteChakri.com"
                  fill
                  sizes="128px"
                  className="block dark:hidden object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
