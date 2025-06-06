"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/lib/supabase";

interface CategoryIconProps {
  iconUrl?: string | null;
  name: string;
}

// Client component to handle image loading errors
function CategoryIcon({ iconUrl, name }: CategoryIconProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!iconUrl || imageError) {
    return <Briefcase className="h-8 w-8 text-primary mb-3" />;
  }
  
  return (
    <div className="h-12 w-12 mb-3 relative flex items-center justify-center">
      <Image 
        src={iconUrl} 
        alt={name}
        fill
        sizes="(max-width: 768px) 24px, 48px"
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
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
            Browse Jobs by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore remote opportunities across various industries and specializations
          </p>
        </div>
        
        {activeCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {activeCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group"
              >
                <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <CategoryIcon iconUrl={category.icon_url || undefined} name={category.name} />
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.job_count} {category.job_count === 1 ? 'job' : 'jobs'}
                    </p>
                  </CardContent>
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
          <div className="text-center mt-8">
            <Link href="/categories">
              <Button variant="outline">
                View All Categories
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
