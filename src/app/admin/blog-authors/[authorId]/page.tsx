"use client";

import { useState, useEffect } from "react";
import { BlogAuthor } from "../components/author-list";
import { useParams, useRouter } from "next/navigation";
import { AuthorForm } from "../components/author-form";
import { Heading } from "../../../../components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditAuthorPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [author, setAuthor] = useState<BlogAuthor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!params.authorId) return;
      
      try {
        const { data, error } = await supabase
          .from("blog_authors")
          .select("*")
          .eq("id", params.authorId)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Not found",
            description: "Author not found",
            variant: "destructive",
          });
          router.push("/admin/blog-authors");
          return;
        }

        setAuthor(data);
      } catch (error) {
        console.error("Error fetching author:", error);
        toast({
          title: "Error",
          description: "Failed to load author",
          variant: "destructive",
        });
        router.push("/admin/blog-authors");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [params.authorId, supabase, toast, router]);

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
          title="Edit Author"
          description={`Edit details for ${author?.name}`}
        />
      </div>
      <Separator className="my-4" />
      {/* Convert null values to undefined to match the expected type */}
      <AuthorForm initialData={author ? {
        ...author,
        bio: author.bio || undefined,
        avatar_url: author.avatar_url || undefined,
        website: author.website || undefined,
        twitter_handle: author.twitter_handle || undefined,
        linkedin_url: author.linkedin_url || undefined
      } : undefined} />
    </div>
  );
}
