"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { WhatsAppVerificationModal } from "../users/components/whatsapp-verification-modal";
import { Search, Loader2 } from "lucide-react";

interface User {
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
}

interface UserProfile {
  user_id: string;
  full_name: string | null;
  phone_number: string | null;
  is_whatsapp_verified: boolean;
  whatsapp_verified_at: string | null;
  created_at: string;
}

export default function WhatsAppVerificationPage() {
  const supabase = useSupabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const PAGE_SIZE = 10;
  
  // Load users with pagination
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  
  // Function to fetch users with WhatsApp information
  const fetchUsers = async () => {
    setLoadingUsers(true);
    
    try {
      // Get total count first
      const { count, error: countError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
      
      // Fetch paginated data
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Function to search for a user by phone number
  const searchUser = async () => {
    if (!searchQuery) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Find the user profile by phone number
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          full_name,
          phone_number,
          is_whatsapp_verified,
          whatsapp_verified_at,
          created_at
        `)
        .eq("phone_number", searchQuery)
        .single();

      if (profileError || !profileData) {
        setError("No user found with the provided phone number");
        return;
      }

      // Format the user object for the modal directly from profile data
      // No need to call an API route
      const formattedUser: User = {
        id: profileData.user_id,
        email: "", // We don't have access to email from client side
        created_at: profileData.created_at || "",
        last_sign_in_at: null,
        profile: {
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          is_whatsapp_verified: profileData.is_whatsapp_verified || false,
          whatsapp_verified_at: profileData.whatsapp_verified_at || null
        }
      };

      setUser(formattedUser);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error searching for user:', error);
      setError("An error occurred while searching for the user");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Function to handle verification update
  const handleVerificationUpdate = () => {
    // Refresh user data after verification update
    if (searchQuery) {
      searchUser();
    }
    // Also refresh the user list
    fetchUsers();
  };

  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Function to open modal for a specific user
  const openModalForUser = async (userProfile: UserProfile) => {
    setLoading(true);
    try {
      // Format the user object for the modal directly from the user profile
      // No need to call an API route
      const formattedUser: User = {
        id: userProfile.user_id,
        email: "", // We don't have access to email from client side
        created_at: userProfile.created_at || "",
        last_sign_in_at: null,
        profile: {
          full_name: userProfile.full_name,
          phone_number: userProfile.phone_number,
          is_whatsapp_verified: userProfile.is_whatsapp_verified || false,
          whatsapp_verified_at: userProfile.whatsapp_verified_at || null
        }
      };

      setUser(formattedUser);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Verification Management</CardTitle>
          <CardDescription>
            Manage WhatsApp verification status for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search form */}
          <div className="flex items-center space-x-2 mb-6">
            <Input
              placeholder="Search by phone number (e.g., 8801712345678)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* User details from search */}
          {user && searchQuery && (
            <div className="border rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium mb-2">{user.profile?.full_name || "No name"}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p>{user.profile?.phone_number || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp Verified</p>
                  <p>
                    {user.profile?.is_whatsapp_verified ? (
                      <span className="text-green-600 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">No</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Verified At</p>
                  <p>
                    {user.profile?.whatsapp_verified_at
                      ? new Date(user.profile.whatsapp_verified_at).toLocaleString()
                      : "Not verified"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => setIsModalOpen(true)}>Manage WhatsApp Verification</Button>
              </div>
            </div>
          )}

          {/* Users Grid */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Recent Users</h3>

            {loadingUsers ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-8 border rounded-md">
                No users found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((userProfile) => (
                  <div
                    key={userProfile.user_id}
                    className="border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => openModalForUser(userProfile)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium truncate">{userProfile.full_name || "No name"}</h4>
                      <Badge variant={userProfile.is_whatsapp_verified ? "default" : "destructive"} className={userProfile.is_whatsapp_verified ? "bg-green-500 hover:bg-green-600" : ""}>
                        {userProfile.is_whatsapp_verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {userProfile.phone_number || "No phone number"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {userProfile.whatsapp_verified_at
                        ? `Verified: ${format(new Date(userProfile.whatsapp_verified_at), 'PPP')}`
                        : "Not verified"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Verification Modal */}
      {user && (
        <WhatsAppVerificationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onVerificationUpdate={handleVerificationUpdate}
          user={user}
        />
      )}
    </div>
  );
}
