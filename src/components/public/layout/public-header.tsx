"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, User, Home, LogOut, Settings, Bookmark, Eye, Briefcase, Grid, MapPin, LogIn, UserPlus, FileText, ChevronDown, BookOpen, Scale } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const supabase = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        try {
          // First check if user is an admin
          const { data: adminData } = await supabase
            .from('admins')
            .select('name')
            .eq('user_id', session.user.id)
            .single();
          
          if (adminData?.name) {
            // Admin user found, use admin name
            const nameParts = adminData.name.split(' ');
            const firstInitial = nameParts[0]?.[0] || '';
            const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
            const initials = `${firstInitial}${lastInitial}`;
            setUserInitials(initials.toUpperCase());
          } else {
            // Not an admin, try regular user profile
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name')
              .eq('user_id', session.user.id)
              .single();
            
            if (profile?.full_name) {
              // Split the full name and get initials from first and last parts
              const nameParts = profile.full_name.split(' ');
              const firstInitial = nameParts[0]?.[0] || '';
              const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
              const initials = `${firstInitial}${lastInitial}`;
              setUserInitials(initials.toUpperCase());
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Use email as fallback
          if (session.user.email) {
            const initial = session.user.email[0].toUpperCase();
            setUserInitials(initial);
          } else {
            setUserInitials('U');
          }
        }
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED') => {
      if (event === 'SIGNED_IN') {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-40">
              <Image 
                src={process.env.NEXT_PUBLIC_LOGO_DARK_URL || ''}
                alt="RemoteChakri.com"
                fill
                sizes="300px"
                className="hidden dark:block object-contain"
                priority
              />
              <Image 
                src={process.env.NEXT_PUBLIC_LOGO_LIGHT_URL || ''}
                alt="RemoteChakri.com"
                fill
                sizes="300px"
                className="block dark:hidden object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link 
              href="/jobs" 
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              <Briefcase className="h-4 w-4" /> Browse Jobs
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              <Grid className="h-4 w-4" /> Categories
            </Link>
            <Link 
              href="/locations" 
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              <MapPin className="h-4 w-4" /> Locations
            </Link>
            <Link 
              href="/blog" 
              className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" /> Blog
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1">
                <Scale className="h-4 w-4" /> Legal <ChevronDown className="h-3 w-3 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/privacy-policy" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" /> Privacy Policy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/terms-and-conditions" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" /> Terms and Conditions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/my-jobs" className="flex items-center gap-2 cursor-pointer">
                      <Bookmark className="h-4 w-4" /> My Saved Jobs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/viewed-jobs" className="flex items-center gap-2 cursor-pointer">
                      <Eye className="h-4 w-4" /> Jobs Viewed
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4" /> Logout
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" /> Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" /> Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg p-4 z-50">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" /> Home
              </Link>
              <Link 
                href="/jobs" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase className="h-4 w-4" /> Browse Jobs
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Grid className="h-4 w-4" /> Categories
              </Link>
              <Link 
                href="/locations" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="h-4 w-4" /> Locations
              </Link>
              <Link 
                href="/blog" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" /> Blog
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Scale className="h-4 w-4" /> Legal
                </div>
                <div className="pl-6 flex flex-col space-y-3">
                  <Link 
                    href="/privacy-policy" 
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" /> Privacy Policy
                  </Link>
                  <Link 
                    href="/terms-and-conditions" 
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" /> Terms and Conditions
                  </Link>
                </div>
              </div>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    className="text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2 text-left w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/login" 
                    className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" /> Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
