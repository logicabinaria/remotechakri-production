import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Clock, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

      {/* Enhanced responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="group"
          >
            <Card className="h-full flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Simplified image container */}
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                {post.cover_image_url ? (
                  <Image 
                    src={post.cover_image_url} 
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <span className="text-primary/60 font-medium text-sm">Article</span>
                    </div>
                  </div>
                )}
                {/* Reading time badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="glass" className="text-xs font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    {calculateReadingTime(post.content)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="flex-1 flex flex-col p-6">
                {/* Enhanced metadata */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">{formatDate(post.published_at)}</span>
                </div>
                
                {/* Simplified title */}
                <h3 className="font-bold text-xl mb-3 line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                
                {/* Simplified excerpt */}
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
                
                {/* Simplified CTA button */}
                <div className="mt-auto">
                  <Link href={`/blog/${post.slug}`} className="group/link">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                    >
                      Read full article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Simplified CTA section */}
      <div className="mt-12 text-center">
        <Link href="/blog">
          <Button 
            variant="gradient" 
            size="lg" 
            className="group px-8 py-4 text-lg font-semibold"
          >
            <BookOpen className="mr-3 h-5 w-5" />
            Explore All Articles
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
