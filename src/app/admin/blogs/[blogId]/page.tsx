"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { BlogPost } from "../types";
import { useParams, useRouter } from "next/navigation";
import { BlogForm } from "../components/blog-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!params.blogId) return;
      
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", params.blogId)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Not found",
            description: "Blog post not found",
            variant: "destructive",
          });
          router.push("/admin/blogs");
          return;
        }

        // Convert published_at string to Date object if it exists
        if (data.published_at) {
          data.published_at = new Date(data.published_at);
        }

        setBlogPost(data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
        router.push("/admin/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [params.blogId, supabase, toast, router]);

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/4" />
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex items-center justify-between">
        <Heading
          title="Edit Blog Post"
          description={`Edit "${blogPost?.title}"`}
        />
      </div>
      <Separator className="my-4" />
      {/* Pass undefined instead of null to match the expected type */}
      <BlogForm initialData={blogPost || undefined} />
    </div>
  );
}
