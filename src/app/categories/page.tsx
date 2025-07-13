import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { getAllCategories } from '@/lib/public/taxonomy-queries';
import { generateMetadata } from '@/components/public/seo/metadata';

// Generate metadata for SEO
export const metadata = generateMetadata({
  title: "Browse Jobs by Category | RemoteChakri.com",
  description: "Explore remote job opportunities by category. Find positions in software development, marketing, design, customer support, and more on RemoteChakri.com.",
  keywords: ["job categories", "remote work categories", "job types", "career fields", "remote jobs by category"],
  canonical: "https://remotechakri.com/categories",
});

export default async function CategoriesPage() {
  // Fetch all categories with job counts
  const categories = await getAllCategories();
  
  // Filter out categories with zero job counts and sort by job count (descending)
  const sortedCategories = [...categories]
    .filter(category => category.job_count > 0)
    .sort((a, b) => b.job_count - a.job_count);
  
  return (
    <PublicLayout>
      {/* Page header */}
      <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Browse Jobs by Category
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore remote opportunities across various industries and specializations
            </p>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-12">
        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedCategories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2 group-hover:text-primary transition-colors dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.job_count} {category.job_count === 1 ? 'job' : 'jobs'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* If no categories are found */}
          {sortedCategories.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No categories available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
