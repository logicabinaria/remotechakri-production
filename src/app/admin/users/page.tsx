"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { WhatsAppVerificationModal } from "./components/whatsapp-verification-modal";
import { toast } from "@/components/ui/use-toast";

// Define types

type RpcUserData = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  full_name: string | null;
  phone_number: string | null;
  is_whatsapp_verified: boolean;
  whatsapp_verified_at: string | null;
};

type ProcessedUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  full_name: string;
  phone_number: string;
  is_whatsapp_verified: boolean;
  whatsapp_verified_at: string | null;
};

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

export default function ManageUsersPage() {
  const supabase = useSupabase();
  const [users, setUsers] = useState<ProcessedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<{id: string, phoneNumber: string, userObject: User} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const PAGE_SIZE = 10;

  // Function to fetch users with pagination
  const fetchUsers = useCallback(async (pageNumber: number, query: string = '') => {
    setLoading(true);
    try {
      // Calculate offset for pagination
      const offset = (pageNumber - 1) * PAGE_SIZE;
      
      // Call the admin_get_users RPC function
      const { data: usersData, error: usersError } = await supabase
        .rpc('admin_get_users', {
          page_size: PAGE_SIZE,
          page_offset: offset,
          search_query: query || ''
        });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
        return;
      }

      // Call the admin_count_users RPC function
      const { data: countData, error: countError } = await supabase
        .rpc('admin_count_users', {
          search_query: query || ''
        });

      if (countError) {
        console.error('Error fetching count:', countError);
        toast({
          title: 'Error',
          description: 'Failed to fetch user count',
          variant: 'destructive',
        });
        return;
      }

      // Process user data
      const processedUsers = usersData.map((user: RpcUserData) => {
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          full_name: user.full_name || '',
          phone_number: user.phone_number || '',
          is_whatsapp_verified: user.is_whatsapp_verified || false,
          whatsapp_verified_at: user.whatsapp_verified_at
        } as ProcessedUser;
      });

      setUsers(processedUsers);
      setTotalPages(Math.ceil((countData?.[0]?.count || 0) / PAGE_SIZE));
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, PAGE_SIZE]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [fetchUsers, page, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchUsers(1, searchQuery);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Handle WhatsApp verification modal
  const openWhatsAppVerificationModal = (userId: string, phoneNumber: string) => {
    // Find the user in the users array
    const userToVerify = users.find(user => user.id === userId);
    if (userToVerify) {
      // Create a User object from the ProcessedUser
      const userForModal: User = {
        id: userToVerify.id,
        email: userToVerify.email,
        created_at: userToVerify.created_at,
        last_sign_in_at: userToVerify.last_sign_in_at,
        profile: {
          full_name: userToVerify.full_name,
          phone_number: phoneNumber,
          is_whatsapp_verified: userToVerify.is_whatsapp_verified,
          whatsapp_verified_at: userToVerify.whatsapp_verified_at
        }
      };
      setSelectedUser({ id: userId, phoneNumber, userObject: userForModal });
      setIsModalOpen(true);
    }
  };

  const closeWhatsAppModal = () => {
    setIsModalOpen(false);
  };



  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>
            View and manage end users, search by name or email, and handle WhatsApp verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Users table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Users</TableCaption>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Email</TableHeader>
                      <TableHeader>Full Name</TableHeader>
                      <TableHeader>Phone Number</TableHeader>
                      <TableHeader>WhatsApp Status</TableHeader>
                      <TableHeader>Joined</TableHeader>
                      <TableHeader>Last Login</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            {user.is_whatsapp_verified ? (
                              <span className="text-green-500 font-medium">Verified</span>
                            ) : (
                              <span className="text-red-500 font-medium">Not Verified</span>
                            )}
                          </TableCell>
                          <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? format(new Date(user.last_sign_in_at), "MMM d, yyyy") 
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWhatsAppVerificationModal(user.id, user.phone_number)}
                              disabled={!user.phone_number || user.is_whatsapp_verified}
                            >
                              Verify WhatsApp
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {users.length} of {totalPages * PAGE_SIZE} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp verification modal */}
      {isModalOpen && selectedUser && (
        <WhatsAppVerificationModal
          isOpen={isModalOpen}
          onClose={closeWhatsAppModal}
          user={selectedUser.userObject}
          onVerificationUpdate={() => {
            closeWhatsAppModal();
            fetchUsers(page, searchQuery);
          }}
        />
      )}
    </div>
  );
}
