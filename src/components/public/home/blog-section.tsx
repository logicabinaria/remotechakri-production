"use client";

import Link from "next/link";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock blog post data
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
  };
}

// Mock data for blog posts
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Essential Tips for Remote Job Interviews",
    excerpt: "Master the art of virtual interviews with these proven strategies that will help you stand out from the competition.",
    slug: "essential-tips-remote-job-interviews",
    coverImage: "/images/blog/remote-interview.jpg",
    publishedAt: "2025-06-10",
    readTime: "5 min read",
    author: {
      name: "Sarah Johnson",
      avatar: "/images/avatars/sarah.jpg"
    }
  },
  {
    id: "2",
    title: "How to Build a Productive Home Office Setup",
    excerpt: "Create an efficient and comfortable workspace that boosts your productivity and helps maintain work-life balance.",
    slug: "productive-home-office-setup",
    coverImage: "/images/blog/home-office.jpg",
    publishedAt: "2025-06-05",
    readTime: "7 min read",
    author: {
      name: "Michael Chen",
      avatar: "/images/avatars/michael.jpg"
    }
  },
  {
    id: "3",
    title: "The Future of Remote Work: Trends to Watch",
    excerpt: "Explore emerging remote work trends that are shaping how companies and employees approach the virtual workplace.",
    slug: "future-remote-work-trends",
    coverImage: "/images/blog/remote-trends.jpg",
    publishedAt: "2025-05-28",
    readTime: "6 min read",
    author: {
      name: "Priya Patel",
      avatar: "/images/avatars/priya.jpg"
    }
  }
];

interface BlogSectionProps {
  posts?: BlogPost[];
}

export function BlogSection({ posts = mockBlogPosts }: BlogSectionProps) {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <Link href="/blog" className="text-primary text-sm font-medium hover:underline flex items-center">
          View all articles
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            {/* Image container with fixed aspect ratio */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              {/* Fallback div if image doesn't exist yet */}
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Image</span>
              </div>
              {/* Uncomment when images are available */}
              {/* <Image 
                src={post.coverImage} 
                alt={post.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              /> */}
            </div>
            
            <CardContent className="flex-1 flex flex-col p-5">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.publishedAt)}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{post.readTime}</span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              
              <div className="mt-auto">
                <Button asChild variant="link" className="p-0 h-auto font-medium">
                  <Link href={`/blog/${post.slug}`} className="flex items-center text-primary">
                    Read more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/blog">
            Browse All Articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
