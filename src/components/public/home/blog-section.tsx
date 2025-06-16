import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogPost, calculateReadingTime } from "@/lib/public/blog-queries";

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
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
              {post.cover_image_url ? (
                <Image 
                  src={post.cover_image_url} 
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </div>
            
            <CardContent className="flex-1 flex flex-col p-5">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.published_at)}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{calculateReadingTime(post.content)}</span>
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
