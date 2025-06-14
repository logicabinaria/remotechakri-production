"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSupabase } from "@/components/providers/supabase-provider";
import { 
  LayoutDashboard, 
  Bookmark, 
  Eye, 
  Settings, 
  LogOut, 
  Phone,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PublicHeader } from "@/components/public/layout/public-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useSupabase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session, redirect to login
          router.push('/login');
          return;
        }
        
        // Check if user is an admin using secure RPC function
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', {
          user_id: session.user.id
        });
        
        if (rpcError) {
          console.error('Error checking admin status via RPC:', rpcError);
        } else if (isAdmin) {
          // If user is an admin, redirect to admin dashboard
          router.push('/admin');
          return;
        }
        
        // Fetch user profile with proper headers
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single({
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }
        
        setUserProfile(profileData || {
          user_id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          bio: null,
          location: null,
          website: null
        });
      } catch (error) {
        console.error('Dashboard auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get WhatsApp verification toggle from environment variable
  const enableWhatsAppVerification = process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_VERIFICATION === 'true';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'My Jobs', href: '/dashboard/my-jobs', icon: <Bookmark className="h-5 w-5" /> },
    { name: 'Viewed Jobs', href: '/dashboard/viewed-jobs', icon: <Eye className="h-5 w-5" /> },
    // Only show WhatsApp verification menu if the feature is enabled
    ...(enableWhatsAppVerification ? [{ name: 'Verify WhatsApp', href: '/dashboard/verify', icon: <Phone className="h-5 w-5" /> }] : []),
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const userInitials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Use the same header as the public site */}
      <PublicHeader />

      {/* Main content */}
      {/* Mobile menu button */}
      <div className="container mx-auto px-4 py-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {sidebarOpen ? "Close Menu" : "Menu"}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Responsive */}
          <aside className={cn(
            "w-full md:w-64 md:shrink-0",
            sidebarOpen ? "block" : "hidden md:block"
          )}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                {/* Logo for mobile sidebar */}
                <div className="flex justify-center mb-4">
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
                </div>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || 'User'} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {userProfile?.full_name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userProfile?.bio || 'Welcome to your dashboard'}
                  </p>
                </div>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:text-primary dark:hover:bg-gray-800 transition-colors"
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-red-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
