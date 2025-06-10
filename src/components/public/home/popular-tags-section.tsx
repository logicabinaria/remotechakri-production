import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/lib/supabase";

interface PopularTagsSectionProps {
  tags: (Tag & { job_count: number })[];
}

export function PopularTagsSection({ tags }: PopularTagsSectionProps) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
            Popular Skills & Technologies
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover jobs by in-demand skills and technologies
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {tags.map((tag) => (
            <Link 
              key={tag.id} 
              href={`/tags/${tag.slug}`}
            >
              <React.Fragment key={`tag-badge-${tag.id}`}>
                <Badge variant="secondary" className="px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors">
                  {tag.name} ({tag.job_count})
                </Badge>
              </React.Fragment>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/tags">
            <Button variant="outline">
              View All Tags
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
