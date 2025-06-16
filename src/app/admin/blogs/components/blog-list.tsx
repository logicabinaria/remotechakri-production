"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPost } from "../types";

export function BlogList() {
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const fetchBlogPosts = useCallback(async () => {
    setLoading(true);
    try {
      // For admin panel, we need to fetch all blog posts, not just published ones
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id, 
          title, 
          slug, 
          excerpt, 
          is_published, 
          published_at, 
          created_at, 
          updated_at, 
          author_id
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author information for each post
      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post: BlogPost) => {
          // Get author information
          const { data: authorData, error: authorError } = await supabase
            .from("blog_authors")
            .select("name")
            .eq("id", post.author_id)
            .single();

          if (authorError) {
            console.error("Error fetching author:", authorError);
          }

          // Get view count
          const { count } = await supabase
            .from("blog_views")
            .select("id", { count: "exact", head: true })
            .eq("blog_post_id", post.id);
          
          return {
            ...post,
            author_name: authorData?.name || "Unknown Author",
            view_count: count || 0
          };
        })
      );

      setBlogPosts(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, setBlogPosts, setLoading]);

  // Call fetchBlogPosts when component mounts
  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        const { error } = await supabase
          .from("blog_posts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Blog post deleted successfully",
        });
        
        // Refresh the list
        fetchBlogPosts();
      } catch (error) {
        console.error("Error deleting blog post:", error);
        toast({
          title: "Error",
          description: "Failed to delete blog post",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (slug: string) => {
    // Open blog post in a new tab
    window.open(`/blog/${slug}`, "_blank");
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
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
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No blog posts found. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              blogPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {post.title}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author_name}
                  </TableCell>
                  <TableCell>
                    {post.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {post.published_at ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.published_at), "MMM d, yyyy")}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{post.view_count}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/blogs/${post.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleView(post.slug)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(post.id)}
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
