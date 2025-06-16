"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent } from "@/components/ui/card";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter_handle: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{1,15}$/, "Must be a valid Twitter handle")
    .optional()
    .or(z.literal("")),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Define form data type that matches the form schema
type FormData = z.infer<typeof formSchema>;

// Type for initialData that can be passed to the form
type AuthorFormData = {
  id?: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  created_at?: string;
  updated_at?: string;
};

interface AuthorFormProps {
  initialData?: AuthorFormData;
}

export function AuthorForm({ initialData }: AuthorFormProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize the form with proper typing
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      bio: initialData?.bio || "",
      avatar_url: initialData?.avatar_url || "",
      website: initialData?.website || "",
      twitter_handle: initialData?.twitter_handle || "",
      linkedin_url: initialData?.linkedin_url || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      // Format Twitter handle to include @ if not present
      if (values.twitter_handle && !values.twitter_handle.startsWith('@')) {
        values.twitter_handle = `@${values.twitter_handle}`;
      }

      if (initialData) {
        // Update existing author
        const { error } = await supabase
          .from("blog_authors")
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Author updated successfully",
        });
      } else {
        // Create new author
        const { error } = await supabase.from("blog_authors").insert([
          {
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Author created successfully",
        });
      }

      // Redirect back to author list
      router.push("/admin/blog-authors");
      router.refresh();
    } catch (error) {
      console.error("Error saving author:", error);
      toast({
        title: "Error",
        description: "Failed to save author",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as FormData))} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief author biography" 
                          className="resize-none h-32"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                          folder="blog_authors"
                          label="Upload Avatar"
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended size: 200x200px
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blog-authors")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} Author
          </Button>
        </div>
      </form>
    </Form>
  );
}
