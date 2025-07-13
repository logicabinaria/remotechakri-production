// Configure Edge Runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// Force dynamic rendering to ensure fresh data on each page visit
export const dynamic = 'force-dynamic';

// Remove revalidation setting since we're using dynamic rendering

import Link from "next/link";
import { PublicLayout } from "@/components/public/layout/public-layout";
import { getFeaturedJobs } from "@/lib/public/job-queries";
import { getRecentJobs } from "@/lib/public/recent-job-queries";
import { getAllCategories, getAllLocations, getPopularTags } from "@/lib/public/taxonomy-queries";
import { getLatestBlogPosts } from "@/lib/public/blog-server-queries";
import { generateMetadata } from "@/components/public/seo/metadata";
import {
  HeroSection,
  CategoriesSection,
  RecentJobsSection,
  LocationsSection,
  PopularTagsSection,
  CtaSection,
  BlogSection
} from "@/components/public/home";
import { JobCompactCard } from "@/components/public/jobs/job-compact-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Star, Briefcase, ArrowRight } from "lucide-react";

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
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-20">
        {/* Featured Jobs Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <Badge variant="gradient" className="mr-3">
                    <Star className="h-4 w-4 mr-2 fill-current" />
                    Handpicked Opportunities
                  </Badge>
                </div>
                <Heading 
                  title="⭐ Featured Remote Jobs"
                  description="Carefully curated opportunities from top companies looking for exceptional talent. These positions offer the best remote work experiences."
                  size="xl"
                  align="left"
                  gradient
                />
              </div>
              
              <Link href="/jobs" className="mt-4 md:mt-0">
                <Button 
                  variant="glass" 
                  size="lg"
                  className="group px-8 py-4 font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Briefcase className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  View All Jobs
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
              
            {featuredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredJobs.map((job) => (
                  <div key={job.id}>
                    <JobCompactCard job={job} featured={true} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  🔍 No Featured Jobs Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                   We&apos;re carefully curating the best remote opportunities for you. Check back soon for amazing featured positions!
                 </p>
                <Link href="/jobs">
                  <Button 
                    variant="gradient" 
                    size="lg"
                    className="group"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Browse All Jobs
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* Browse By Category Section */}
        <section className="py-12">
          <CategoriesSection categories={topCategories} />
        </section>
        
        {/* Recent Jobs Section */}
        <section className="py-12">
          <RecentJobsSection initialJobs={recentJobs} totalJobs={totalRecentJobs} />
        </section>
        
        {/* Blog Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Heading 
                title="📚 Latest Articles"
                description="Stay updated with the latest remote work trends, career tips, and industry insights from our expert team."
                size="lg"
                align="center"
                gradient
              />
            </div>
            <BlogSection posts={latestBlogPosts} />
          </div>
        </section>
        
        {/* Browse By Location Section */}
        <section className="py-12">
          <LocationsSection locations={topLocations} />
        </section>
        
        {/* Popular Tags Section */}
        <section className="py-12">
          <PopularTagsSection tags={popularTags} />
        </section>
      </div>
      
      {/* CTA Section */}
      <CtaSection />
    </PublicLayout>
  );
}
