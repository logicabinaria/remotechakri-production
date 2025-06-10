// Configure Edge Runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// Force dynamic rendering to ensure fresh data on each page visit
export const dynamic = 'force-dynamic';

// Remove revalidation setting since we're using dynamic rendering

import { PublicLayout } from "@/components/public/layout/public-layout";
import { getFeaturedJobs } from "@/lib/public/job-queries";
import { getRecentJobs } from "@/lib/public/recent-job-queries";
import { getAllCategories, getAllLocations, getPopularTags, getAllJobTypes } from "@/lib/public/taxonomy-queries";
import { generateMetadata } from "@/components/public/seo/metadata";
import type { Category, Location } from "@/lib/supabase";
import {
  HeroSection,
  FeaturedJobsSection,
  CategoriesSection,
  RecentJobsSection,
  LocationsSection,
  PopularTagsSection,
  CtaSection,
  SearchSidebar
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
  
  // Fetch job types for search sidebar
  const jobTypes = await getAllJobTypes();
  
  return (
    <PublicLayout>
      {/* Hero Section - Full Width */}
      <HeroSection />
      
      {/* Two Column Layout - Main Content + Sidebar */}
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Main Content - 8 columns on desktop */}
          <main className="lg:col-span-8 order-2 lg:order-1">
            {/* Featured Jobs Section */}
            <FeaturedJobsSection featuredJobs={featuredJobs} />
            
            {/* Browse By Category Section */}
            <CategoriesSection categories={topCategories} />
            
            {/* Recent Jobs Section */}
            <RecentJobsSection initialJobs={recentJobs} totalJobs={totalRecentJobs} />
            
            {/* Browse By Location Section */}
            <LocationsSection locations={topLocations} />
            
            {/* Popular Tags Section */}
            <PopularTagsSection tags={popularTags} />
          </main>
          
          {/* Sidebar - 4 columns on desktop */}
          <aside className="lg:col-span-4 order-1 lg:order-2">
            <SearchSidebar 
              categories={categories as (Category & { job_count: number })[]} 
              locations={locations as (Location & { job_count: number })[]} 
              jobTypes={jobTypes} 
            />
          </aside>
        </div>
      </div>
      
      {/* CTA Section - Full Width */}
      <CtaSection />
    </PublicLayout>
  );
}
