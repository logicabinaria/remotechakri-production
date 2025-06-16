// Configure Edge Runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// Force dynamic rendering to ensure fresh data on each page visit
export const dynamic = 'force-dynamic';

// Remove revalidation setting since we're using dynamic rendering

import { PublicLayout } from "@/components/public/layout/public-layout";
import { getFeaturedJobs } from "@/lib/public/job-queries";
import { getRecentJobs } from "@/lib/public/recent-job-queries";
import { getAllCategories, getAllLocations, getPopularTags } from "@/lib/public/taxonomy-queries";
import { getLatestBlogPosts } from "@/lib/public/blog-server-queries";
import { generateMetadata } from "@/components/public/seo/metadata";
import {
  HeroSection,
  FeaturedJobsSection,
  CategoriesSection,
  RecentJobsSection,
  LocationsSection,
  PopularTagsSection,
  CtaSection,
  BlogSection
} from "@/components/public/home";

// Generate metadata for SEO
export const metadata = generateMetadata({
  title: "RemoteChakri.com | Find Your Dream Remote Job",
  description: "RemoteChakri.com connects talented professionals with the best remote opportunities worldwide. Browse thousands of remote jobs across various categories.",
  keywords: ["remote jobs", "work from home", "remote work", "remote career", "job board"],
});

export default async function Home() {
  // Fetch featured jobs
  const featuredJobs = await getFeaturedJobs(6);
  
  // Fetch recent jobs (excluding featured ones)
  const { jobs: recentJobs, total: totalRecentJobs } = await getRecentJobs(6);
  
  // Fetch popular categories
  const categories = await getAllCategories();
  const topCategories = categories
    .sort((a, b) => b.job_count - a.job_count)
    .slice(0, 8);
  
  // Fetch popular locations
  const locations = await getAllLocations();
  const topLocations = locations
    .sort((a, b) => b.job_count - a.job_count)
    .slice(0, 8);
  
  // Fetch popular tags
  const popularTags = await getPopularTags(12);
  
  // Fetch latest blog posts
  const latestBlogPosts = await getLatestBlogPosts(3);
  
  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content - Full Width Sections */}
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-16">
        {/* Featured Jobs Section */}
        <section>
          <FeaturedJobsSection featuredJobs={featuredJobs} />
        </section>
        
        {/* Browse By Category Section */}
        <section>
          <CategoriesSection categories={topCategories} />
        </section>
        
        {/* Recent Jobs Section */}
        <section>
          <RecentJobsSection initialJobs={recentJobs} totalJobs={totalRecentJobs} />
        </section>
        
        {/* Blog Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
            <p className="text-muted-foreground mt-2">Stay updated with the latest remote work trends and tips</p>
          </div>
          <BlogSection posts={latestBlogPosts} />
        </section>
        
        {/* Browse By Location Section */}
        <section>
          <LocationsSection locations={topLocations} />
        </section>
        
        {/* Popular Tags Section */}
        <section>
          <PopularTagsSection tags={popularTags} />
        </section>
      </div>
      
      {/* CTA Section */}
      <CtaSection />
    </PublicLayout>
  );
}
