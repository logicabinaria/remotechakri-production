"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Category } from "@/lib/supabase";

interface CategoryIconProps {
  iconUrl?: string | null;
  name: string;
}

// Client component to handle image loading errors
function CategoryIcon({ iconUrl, name }: CategoryIconProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!iconUrl || imageError) {
    return <Briefcase className="h-6 w-6 text-primary" />;
  }
  
  return (
    <div className="h-6 w-6 relative flex items-center justify-center">
      <Image 
        src={iconUrl} 
        alt={name}
        fill
        sizes="24px"
        className="object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

interface CategoriesSectionProps {
  categories: (Category & { job_count: number })[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  // Filter out categories with no jobs
  const activeCategories = categories.filter(category => category.job_count > 0);
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Heading 
          title="Browse Jobs by Category"
          description="Discover opportunities across various industries and find the perfect remote job that matches your skills."
          size="lg"
          align="center"
          gradient={true}
        />
      </div>
        
        {activeCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {activeCategories.map((category) => (
              <Link
                key={category.id}
                href={`/jobs?category=${category.slug}`}
                className="group"
              >
                <Card hoverable={true} className="h-full relative overflow-hidden group-hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                        <CategoryIcon iconUrl={category.icon_url} name={category.name} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {category.job_count} {category.job_count === 1 ? 'job' : 'jobs'}
                    </Badge>
                  </CardContent>
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No active job categories available at the moment.
            </p>
          </div>
        )}
        
        {activeCategories.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/categories">
              <Button variant="gradient" size="lg" className="group">
                View All Categories
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        )}
    </div>
  );
}
