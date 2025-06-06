import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { JobCard } from '@/components/public/jobs/job-card';
import { Pagination } from '@/components/public/shared/pagination';
import { getLatestJobs } from '@/lib/public/job-queries';
import { getCategoryBySlug } from '@/lib/public/taxonomy-queries';
import { createDynamicMetadata } from '@/components/public/seo/metadata';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    return createDynamicMetadata({
      title: 'Category Not Found | RemoteChakri.com',
      description: 'The category you are looking for could not be found.',
      noindex: true
    });
  }
  
  return createDynamicMetadata({
    title: `${category.name} Jobs | RemoteChakri.com`,
    description: `Browse ${category.name} remote job opportunities on RemoteChakri.com. Find the latest ${category.name} positions from top companies worldwide.`,
    keywords: [
      `${category.name} jobs`,
      `remote ${category.name} jobs`,
      `${category.name} careers`,
      `${category.name} remote work`,
      'remote jobs'
    ],
    canonical: `https://remotechakri.com/categories/${category.slug}`,
  });
}

interface SearchParams {
  page?: string;
}

export default async function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: { slug: string };
  searchParams: SearchParams;
}) {
  // Get page from query params
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  
  // Fetch category details
  const category = await getCategoryBySlug(params.slug);
  
  // Return 404 if category not found
  if (!category) {
    notFound();
  }
  
  // Fetch jobs for this category with pagination
  const { jobs, total } = await getLatestJobs({
    page,
    limit: 12,
    categorySlug: category.slug
  });
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / 12);
  
  return (
    <PublicLayout>
      {/* Page header */}
      <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/categories" className="text-primary hover:underline inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                All Categories
              </Link>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold dark:text-white">
                {category.name} Jobs
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Browse {total} remote {category.name} jobs available on RemoteChakri.com
            </p>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Jobs listing */}
        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4 dark:text-white">
              No jobs found in this category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back soon for new opportunities or browse other categories.
            </p>
            <Link href="/categories">
              <Button>
                Browse All Categories
              </Button>
            </Link>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl={`/categories/${params.slug}`}
              preserveParams={true}
            />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
