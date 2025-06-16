"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { preprocessTextForSlug, cn } from "@/lib/utils";

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
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { LexicalEditor } from "@/components/ui/lexical-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

// Define form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  cover_image_url: z.string().min(1, "Cover image is required"),
  author_id: z.string().min(1, "Author is required"),
  is_published: z.boolean().default(false),
  published_at: z.date().nullable(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  canonical_url: z.string().optional(),
  // Keep meta_keywords in the form but mark it as not to be submitted to DB
  meta_keywords: z.string().optional(),
});

// Define form values type from schema
type FormValues = z.infer<typeof formSchema>;

// Import the shared BlogPost type
import { BlogPost } from "../types";

// Define component props
interface BlogFormProps {
  initialData?: BlogPost;
  blogId?: string;
}

export function BlogForm({ initialData, blogId }: BlogFormProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [jobCategories, setJobCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedJobCategories, setSelectedJobCategories] = useState<string[]>([]);
  const [slugChanged, setSlugChanged] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const currentBlogId = blogId || initialData?.id;

  // Initialize the form
  const form = useForm<FormValues>({
    // Type assertion is necessary due to compatibility issues between zodResolver and useForm
    // The 'any' type is used here to bridge the gap between the expected types
    // This is a known issue with react-hook-form and zod integration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any, // Type assertion needed for compatibility
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_url: "",
      author_id: "",
      is_published: false,
      published_at: null,
      meta_title: "",
      meta_description: "",
      canonical_url: "",
      meta_keywords: "",
    },
  });

  // Load authors, categories, and tags for the dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch authors
        const { data: authorsData, error: authorsError } = await supabase
          .from("blog_authors")
          .select("id, name")
          .order("name");

        if (authorsError) throw authorsError;
        setAuthors(authorsData || []);

        // Fetch blog categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("blog_categories")
          .select("id, name")
          .is("deleted_at", null)
          .order("name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from("tags")
          .select("id, name")
          .is("deleted_at", null)
          .order("name");

        if (tagsError) throw tagsError;
        setTags(tagsData || []);

        // Fetch job categories
        const { data: jobCategoriesData, error: jobCategoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .is("deleted_at", null)
          .order("name");

        if (jobCategoriesError) throw jobCategoriesError;
        setJobCategories(jobCategoriesData || []);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [supabase, toast]);

  // Auto-generate slug from title if slug hasn't been manually changed
  const watchedTitle = form.watch("title");
  
  useEffect(() => {
    // Only auto-generate slug if it hasn't been manually changed
    if (watchedTitle && !slugChanged && !form.getValues("slug")) {
      const generatedSlug = preprocessTextForSlug(watchedTitle)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      form.setValue("slug", generatedSlug);
    }
  }, [watchedTitle, form, slugChanged]);

  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      // Create a stable object for form reset
      const formValues = {
        title: initialData.title || "",
        slug: initialData.slug || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        cover_image_url: initialData.cover_image_url || "",
        author_id: initialData.author_id || "",
        is_published: initialData.is_published || false,
        published_at: initialData.published_at ? new Date(initialData.published_at) : null,
        meta_title: initialData.meta_title || "",
        meta_description: initialData.meta_description || "",
        canonical_url: initialData.canonical_url || "",
        meta_keywords: initialData.meta_keywords || "",
      };
      form.reset(formValues);
      
      // Fetch associated categories and tags
      const fetchRelationships = async () => {
        try {
          // Fetch blog categories
          const { data: blogCategories, error: blogCategoriesError } = await supabase
            .from("blog_post_categories")
            .select("category_id")
            .eq("blog_post_id", initialData.id);
          
          if (blogCategoriesError) throw blogCategoriesError;
          setSelectedCategories(blogCategories?.map((item: { category_id: string }) => item.category_id) || []);
          
          // Fetch blog tags
          const { data: blogTags, error: blogTagsError } = await supabase
            .from("blog_post_tags")
            .select("tag_id")
            .eq("blog_post_id", initialData.id);
          
          if (blogTagsError) throw blogTagsError;
          setSelectedTags(blogTags?.map((item: { tag_id: string }) => item.tag_id) || []);
          
          // Fetch job categories
          const { data: blogJobCategories, error: blogJobCategoriesError } = await supabase
            .from("blog_post_job_categories")
            .select("category_id")
            .eq("blog_post_id", initialData.id);
          
          if (blogJobCategoriesError) throw blogJobCategoriesError;
          setSelectedJobCategories(blogJobCategories?.map((item: { category_id: string }) => item.category_id) || []);
        } catch (error) {
          console.error("Error fetching blog relationships:", error);
          toast({
            title: "Error",
            description: "Failed to load blog categories and tags.",
            variant: "destructive",
          });
        }
      };
      
      fetchRelationships();
    }
  }, [initialData, resetKey, form, supabase, toast]);

  // Form submission handler with proper typing
  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      // Prepare the data for submission
      const blogData = {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        cover_image_url: values.cover_image_url,
        author_id: values.author_id,
        is_published: values.is_published,
        published_at: values.is_published && values.published_at ? values.published_at : null,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        canonical_url: values.canonical_url,
        meta_keywords: values.meta_keywords,
      };

      let blogId = currentBlogId;

      // Determine if we're creating or updating
      if (blogId) {
        // Update existing blog post
        const { error } = await supabase
          .from("blog_posts")
          .update(blogData)
          .eq("id", blogId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Blog post updated successfully.",
        });
      } else {
        // Create new blog post
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(blogData)
          .select("id")
          .single();

        if (error) throw error;

        // Set the blog ID for potential future updates
        if (data?.id) {
          blogId = data.id;
        }

        toast({
          title: "Success",
          description: "Blog post created successfully.",
        });
      }

      // If we have a blog ID, update the relationships
      if (blogId) {
        // Handle blog categories
        if (selectedCategories.length > 0) {
          // First delete existing relationships
          await supabase
            .from("blog_post_categories")
            .delete()
            .eq("blog_post_id", blogId);
          
          // Then insert new relationships
          const categoryRelationships = selectedCategories.map((categoryId: string) => ({
            blog_post_id: blogId,
            category_id: categoryId
          }));
          
          const { error: categoriesError } = await supabase
            .from("blog_post_categories")
            .insert(categoryRelationships);
          
          if (categoriesError) throw categoriesError;
        }
        
        // Handle blog tags
        if (selectedTags.length > 0) {
          // First delete existing relationships
          await supabase
            .from("blog_post_tags")
            .delete()
            .eq("blog_post_id", blogId);
          
          // Then insert new relationships
          const tagRelationships = selectedTags.map((tagId: string) => ({
            blog_post_id: blogId,
            tag_id: tagId
          }));
          
          const { error: tagsError } = await supabase
            .from("blog_post_tags")
            .insert(tagRelationships);
          
          if (tagsError) throw tagsError;
        }
        
        // Handle job categories
        if (selectedJobCategories.length > 0) {
          // First delete existing relationships
          await supabase
            .from("blog_post_job_categories")
            .delete()
            .eq("blog_post_id", blogId);
          
          // Then insert new relationships
          const jobCategoryRelationships = selectedJobCategories.map((categoryId: string) => ({
            blog_post_id: blogId,
            category_id: categoryId
          }));
          
          const { error: jobCategoriesError } = await supabase
            .from("blog_post_job_categories")
            .insert(jobCategoryRelationships);
          
          if (jobCategoriesError) throw jobCategoriesError;
        }
      }

      // Reset the form if this is a new blog post
      if (!currentBlogId) {
        form.reset();
        setResetKey((prev) => prev + 1);
        setSelectedCategories([]);
        setSelectedTags([]);
        setSelectedJobCategories([]);
      }
    } catch (error) {
      console.error("Error submitting blog post:", error);
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Blog post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="blog-post-slug" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            setSlugChanged(true);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used in the URL: remotechakri.com/blog/[slug]
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief summary of the blog post" 
                          className="resize-none h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This will be displayed in blog listings and social media shares
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an author" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {authors.map((author) => (
                            <SelectItem key={author.id} value={author.id}>
                              {author.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          folder="blog_covers"
                          label="Upload Cover Image"
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended size: 1200x630px
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Blog Categories</h3>
                    <MultiSelect
                      options={categories.map(category => ({ label: category.name, value: category.id }))}
                      selected={selectedCategories}
                      onChange={setSelectedCategories}
                      placeholder="Select blog categories..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <MultiSelect
                      options={tags.map(tag => ({ label: tag.name, value: tag.id }))}
                      selected={selectedTags}
                      onChange={setSelectedTags}
                      placeholder="Select tags..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Job Categories</h3>
                    <MultiSelect
                      options={jobCategories.map(category => ({ label: category.name, value: category.id }))}
                      selected={selectedJobCategories}
                      onChange={setSelectedJobCategories}
                      placeholder="Select job categories..."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>
                          This blog post will be visible to the public
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published_at"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publish Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Schedule when this post should be published
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="SEO title (optional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use the post title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="SEO description (optional)" 
                          className="resize-none h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use the post excerpt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canonical_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/original-content" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL of the original content if this is a republished article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords for SEO
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <LexicalEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog post content here..."
                  className="min-h-[400px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blogs")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} Blog Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
