import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Tag } from "@/lib/supabase";

interface PopularTagsSectionProps {
  tags: (Tag & { job_count: number })[];
}

export function PopularTagsSection({ tags }: PopularTagsSectionProps) {
  // Filter out tags with no jobs and limit to top 20
  const activeTags = tags.filter(tag => tag.job_count > 0).slice(0, 20);
  
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Heading 
          title="Popular Skills & Technologies"
          description="Explore the most in-demand skills in the remote job market and discover opportunities that match your expertise."
          size="lg"
          align="center"
        />
      </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {activeTags.map((tag, index) => (
            <Link 
              key={tag.id} 
              href={`/tags/${tag.slug}`}
              className="group"
            >
              <Badge 
                variant={index < 5 ? "gradient" : "outline"}
                className="px-4 py-2 text-sm cursor-pointer group-hover:scale-110 transform duration-200 shadow-sm hover:shadow-md"
              >
                {tag.name}
                <span className="ml-2 text-xs opacity-80">
                  ({tag.job_count})
                </span>
              </Badge>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/tags">
            <Button variant="glass" size="lg" className="group">
              View All Skills
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
    </div>
  );
}
