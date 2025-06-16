// Configure Edge Runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// Force dynamic rendering to ensure fresh data on each page visit
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { PublicLayout } from "@/components/public/layout/public-layout";
import { generateMetadata } from "@/components/public/seo/metadata";
import { getLatestBlogPosts, getBlogPostsCount, getAllBlogCategories, getPopularBlogTags } from "@/lib/public/blog-server-queries";
import BlogList from "@/app/blog/components/blog-list";
import BlogSidebar from "@/app/blog/components/blog-sidebar";
import BlogListSkeleton from "@/app/blog/components/blog-list-skeleton";

// Generate metadata for SEO
export const metadata = generateMetadata({
  title: "Blog | RemoteChakri.com",
  description: "Read the latest articles about remote work, job hunting tips, and career advice for remote professionals.",
  keywords: ["remote work blog", "remote job tips", "remote career advice", "work from home blog"],
});

// Define the props for the page component including search params
interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Get current page from URL query params or default to 1
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const postsPerPage = 6;
  const offset = (currentPage - 1) * postsPerPage;
  
  // Get category and tag filters from URL query params
  const categorySlug = searchParams.category;
  const tagSlug = searchParams.tag;
  
  // Fetch blog posts with pagination and filters
  const blogPosts = await getLatestBlogPosts(postsPerPage, offset, categorySlug, tagSlug);
  
  // Fetch total post count for pagination
  const totalPosts = await getBlogPostsCount(categorySlug, tagSlug);
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // Fetch categories and tags for sidebar
  const categories = await getAllBlogCategories();
  const popularTags = await getPopularBlogTags();
  
  return (
    <PublicLayout>
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights, tips, and resources for remote professionals
          </p>
          
          {/* Active filters display */}
          {(categorySlug || tagSlug) && (
            <div className="mt-4 flex items-center text-sm">
              <span className="mr-2">Filtering by:</span>
              {categorySlug && (
                <span className="bg-secondary px-2 py-1 rounded mr-2">
                  Category: {categories.find(c => c.slug === categorySlug)?.name || categorySlug}
                </span>
              )}
              {tagSlug && (
                <span className="bg-secondary px-2 py-1 rounded">
                  Tag: {popularTags.find(t => t.slug === tagSlug)?.name || tagSlug}
                </span>
              )}
              <a href="/blog" className="ml-2 text-primary hover:underline">Clear filters</a>
            </div>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Posts */}
          <div className="lg:col-span-2">
            <Suspense fallback={<BlogListSkeleton />}>
              <BlogList 
                initialPosts={blogPosts} 
                currentPage={currentPage} 
                totalPages={totalPages} 
                categorySlug={categorySlug} 
                tagSlug={tagSlug} 
              />
            </Suspense>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar 
              categories={categories} 
              popularTags={popularTags} 
              activeCategorySlug={categorySlug} 
              activeTagSlug={tagSlug} 
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
