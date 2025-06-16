// Configure Edge Runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// Force dynamic rendering to ensure fresh data on each page visit
export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/public/layout/public-layout";
import { getBlogPostBySlug, getRecentBlogPosts } from "@/lib/public/blog-server-queries";
import { calculateReadingTime } from "@/lib/public/blog-queries";
import RecentArticles from "../components/recent-articles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { generateMetadata as baseGenerateMetadata } from "@/components/public/seo/metadata";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return baseGenerateMetadata({
      title: "Blog Post Not Found | RemoteChakri.com",
      description: "The requested blog post could not be found.",
    });
  }
  
  return baseGenerateMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords?.split(',').map((k: string) => k.trim()) || [],
    canonical: post.canonical_url,
    ogImage: post.cover_image_url,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  const recentPosts = await getRecentBlogPosts(5, post?.id);
  
  if (!post) {
    notFound();
  }
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Track blog view
  const supabase = createClient();
  await supabase.from("blog_views").insert({
    blog_post_id: post.id,
    viewer_ip: null, // IP will be captured by RLS policy
  });
  
  // Fetch related categories and tags
  const { data: categoryData } = await supabase
    .from("blog_post_categories")
    .select(`
      category_id,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .eq("blog_post_id", post.id);
    
  const { data: tagData } = await supabase
    .from("blog_post_tags")
    .select(`
      tag_id,
      tags (
        id,
        name,
        slug
      )
    `)
    .eq("blog_post_id", post.id);
    
  const { data: jobCategoryData } = await supabase
    .from("blog_post_job_categories")
    .select(`
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("blog_post_id", post.id);
  
  // Define proper types for the category, tag, and job category items
  interface CategoryItem {
    id: string;
    name: string;
    slug: string;
  }
  
  const categories = categoryData?.map(item => item.blog_categories as unknown as CategoryItem) || [];
  const tags = tagData?.map(item => item.tags as unknown as CategoryItem) || [];
  const jobCategories = jobCategoryData?.map(item => item.categories as unknown as CategoryItem) || [];
  
  return (
    <PublicLayout>
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        {/* Back to blog link */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="hover:bg-transparent">
            <Link href="/blog" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all articles
            </Link>
          </Button>
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Post Content */}
          <div className="lg:col-span-2">
            {/* Blog Post Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{calculateReadingTime(post.content)}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author_name}</span>
                </div>
              </div>
              
              {/* Featured Image */}
              {post.cover_image_url && (
                <div className="relative w-full rounded-lg overflow-hidden mb-8 bg-muted/10">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Article Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: CategoryItem) => (
                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                      <Badge variant="outline" className="hover:bg-secondary transition-colors">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Articles */}
            <RecentArticles posts={recentPosts} currentPostId={post.id} />
            
            {/* Categories */}
            {categories.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <ul className="space-y-1">
                    {categories.map((category: CategoryItem) => (
                      <li key={category.id}>
                        <Link 
                          href={`/blog?category=${category.slug}`}
                          className="text-sm hover:text-primary transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {/* Related Jobs */}
            {jobCategories.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Related Job Categories</h3>
                  <ul className="space-y-1">
                    {jobCategories.map((category: CategoryItem) => (
                      <li key={category.id}>
                        <Link 
                          href={`/jobs?category=${category.slug}`}
                          className="text-sm hover:text-primary transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
