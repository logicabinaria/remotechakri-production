"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { BlogPost } from "@/lib/public/blog-queries";

interface RecentArticlesProps {
  posts: BlogPost[];
  currentPostId?: string;
}

export default function RecentArticles({ posts, currentPostId }: RecentArticlesProps) {
  // Filter out the current post if we're on a blog post page
  const filteredPosts = currentPostId 
    ? posts.filter(post => post.id !== currentPostId)
    : posts;
  
  // Take only up to 5 posts
  const displayPosts = filteredPosts.slice(0, 5);
  
  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Recent Articles</h3>
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="flex items-start gap-3 group"
            >
              {/* Small thumbnail */}
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                {post.cover_image_url ? (
                  <Image 
                    src={post.cover_image_url} 
                    alt={post.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Post title */}
              <div>
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
