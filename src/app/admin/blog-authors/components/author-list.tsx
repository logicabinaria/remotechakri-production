"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Globe,
  Twitter,
  Linkedin
} from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface BlogAuthor {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export function AuthorList() {
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_authors")
        .select("*")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error("Error fetching blog authors:", error);
      toast({
        title: "Error",
        description: "Failed to load blog authors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, setAuthors, setLoading]);

  // Call fetchAuthors when component mounts
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
      try {
        // Check if author has any blog posts
        const { count, error: countError } = await supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", id)
          .is("deleted_at", null);
          
        if (countError) throw countError;
        
        if (count && count > 0) {
          toast({
            title: "Cannot Delete",
            description: `This author has ${count} blog posts. Please reassign or delete those posts first.`,
            variant: "destructive",
          });
          return;
        }

        // Soft delete the author
        const { error } = await supabase
          .from("blog_authors")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Author deleted successfully",
        });
        
        // Refresh the list
        fetchAuthors();
      } catch (error) {
        console.error("Error deleting author:", error);
        toast({
          title: "Error",
          description: "Failed to delete author",
          variant: "destructive",
        });
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Social Links</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Social Links</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No authors found. Create your first author!
                </TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={author.avatar_url || ""} alt={author.name} />
                        <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{author.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {author.bio || "No bio provided"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {author.website && (
                        <a 
                          href={author.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      {author.twitter_handle && (
                        <a 
                          href={`https://twitter.com/${author.twitter_handle.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {author.linkedin_url && (
                        <a 
                          href={author.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/blog-authors/${author.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(author.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
