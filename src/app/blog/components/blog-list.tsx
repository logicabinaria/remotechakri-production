"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/lib/public/blog-queries";
import { calculateReadingTime } from "@/lib/public/blog-queries";

interface BlogListProps {
  initialPosts: BlogPost[];
  currentPage: number;
  totalPages: number;
  categorySlug?: string;
  tagSlug?: string;
}

export default function BlogList({ initialPosts, currentPage, totalPages, categorySlug, tagSlug }: BlogListProps) {
  const [posts] = useState<BlogPost[]>(initialPosts);
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No blog posts found</h3>
        <p className="text-muted-foreground">Check back soon for new content!</p>
      </div>
    );
  }

  // Build pagination URL with current filters
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    
    if (categorySlug) {
      params.set('category', categorySlug);
    }
    
    if (tagSlug) {
      params.set('tag', tagSlug);
    }
    
    return `/blog?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="md:flex">
            {/* Image container with consistent 16/9 aspect ratio */}
            <div className="relative w-full md:w-2/5 aspect-[16/9] overflow-hidden">
              {post.cover_image_url ? (
                <Image 
                  src={post.cover_image_url} 
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  priority={post.id === posts[0]?.id} // Prioritize loading the first image
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </div>
            
            <CardContent className="flex-1 flex flex-col p-5 md:p-6">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.published_at)}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{calculateReadingTime(post.content)}</span>
              </div>
              
              <h2 className="font-bold text-xl md:text-2xl mb-3 line-clamp-2 hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              
              <div className="flex items-center mb-4">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {post.author_name}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              
              <div className="mt-auto">
                <Button asChild variant="outline" className="font-medium">
                  <Link href={`/blog/${post.slug}`}>
                    Read Article
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-12">
          {/* Previous page button */}
          <Button 
            variant={currentPage === 1 ? "outline" : "default"}
            size="sm"
            disabled={currentPage === 1}
            asChild
          >
            <Link href={getPaginationUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          </Button>
          
          {/* Page number buttons */}
          <div className="flex items-center space-x-1">
            {/* First page */}
            {currentPage > 2 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={getPaginationUrl(1)}>1</Link>
              </Button>
            )}
            
            {/* Ellipsis */}
            {currentPage > 3 && (
              <span className="px-2">...</span>
            )}
            
            {/* Previous page number */}
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={getPaginationUrl(currentPage - 1)}>{currentPage - 1}</Link>
              </Button>
            )}
            
            {/* Current page */}
            <Button variant="default" size="sm">
              {currentPage}
            </Button>
            
            {/* Next page number */}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={getPaginationUrl(currentPage + 1)}>{currentPage + 1}</Link>
              </Button>
            )}
            
            {/* Ellipsis */}
            {currentPage < totalPages - 2 && (
              <span className="px-2">...</span>
            )}
            
            {/* Last page */}
            {currentPage < totalPages - 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={getPaginationUrl(totalPages)}>{totalPages}</Link>
              </Button>
            )}
          </div>
          
          {/* Next page button */}
          <Button 
            variant={currentPage === totalPages ? "outline" : "default"}
            size="sm"
            disabled={currentPage === totalPages}
            asChild
          >
            <Link href={getPaginationUrl(currentPage + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
