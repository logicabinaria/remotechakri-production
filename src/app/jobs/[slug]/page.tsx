export const runtime = 'edge';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  Building, 
  Calendar, 
  Clock, 
  ExternalLink, 
  MapPin, 
  Share2, 
  Tag, 
  Briefcase,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { JobStructuredData } from '@/components/public/seo/job-structured-data';
import { getJobBySlug, getSimilarJobs } from '@/lib/public/job-queries';
import { createDynamicMetadata } from '@/components/public/seo/metadata';
import { JobCard } from '@/components/public/jobs/job-card';
import { JobViewTracker } from '@/components/public/jobs/job-view-tracker';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const job = await getJobBySlug(params.slug);
  
  if (!job) {
    return createDynamicMetadata({
      title: 'Job Not Found | RemoteChakri.com',
      description: 'The job you are looking for could not be found.',
      noindex: true
    });
  }
  
  const companyName = job.company_name || 'Company';
  const locationName = job.location?.name || 'Remote';
  const categoryName = job.category?.name || '';
  
  return createDynamicMetadata({
    title: `${job.title} at ${companyName} | RemoteChakri.com`,
    description: job.description?.substring(0, 160) || `${job.title} job opportunity at ${companyName}. ${locationName} based ${categoryName} position.`,
    keywords: [
      job.title.toLowerCase(),
      companyName.toLowerCase(),
      locationName.toLowerCase(),
      categoryName.toLowerCase(),
      'remote job',
      'job opportunity',
      ...(job.tags?.map(tag => tag.name.toLowerCase()) || [])
    ],
    canonical: `https://remotechakri.com/jobs/${job.slug}`,
  });
}

export default async function JobDetailsPage({ params }: { params: { slug: string } }) {
  // Fetch job details
  const job = await getJobBySlug(params.slug);
  
  // Return 404 if job not found
  if (!job) {
    notFound();
  }
  
  // Fetch similar jobs
  const similarJobs = await getSimilarJobs(job.id, job.category_id || undefined);
  
  // Format date
  const postedDate = job.posted_at ? format(new Date(job.posted_at), 'MMM dd, yyyy') : 'Recently';
  const expiryDate = job.expires_at ? format(new Date(job.expires_at), 'MMM dd, yyyy') : null;
  
  return (
    <PublicLayout>
      {/* Track job view */}
      <JobViewTracker jobId={job.id} />
      
      {/* Structured data for SEO */}
      <JobStructuredData job={job} baseUrl="https://remotechakri.com" />
      
      {/* Job details */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs" className="text-primary hover:underline inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  {job.company_logo_url ? (
                    <div className="mr-4 h-16 w-16 relative rounded-md overflow-hidden border dark:border-gray-700">
                      <Image 
                        src={job.company_logo_url} 
                        alt={job.company_name} 
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mr-4 h-16 w-16 flex items-center justify-center bg-primary/10 text-primary rounded-md">
                      <Building className="h-8 w-8" />
                    </div>
                  )}
                  
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 dark:text-white">
                      {job.title}
                    </h1>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span>{job.company_name || 'Company'}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="icon" className="rounded-full" title="Share job">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <Link href={`/locations/${job.location?.slug || '#'}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
                    {job.location?.name || 'Remote'}
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                  <Link href={`/job-types/${job.job_type?.slug || '#'}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
                    {job.job_type?.name || 'Full-time'}
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Posted {postedDate}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {expiryDate ? `Expires ${expiryDate}` : 'Open until filled'}
                  </span>
                </div>
              </div>
              
              {job.salary_min && job.salary_max ? (
                <div className="bg-primary/5 p-4 rounded-md mb-6 flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <span className="font-medium dark:text-white">
                      {job.salary_currency || '$'}{job.salary_min.toLocaleString()} - {job.salary_currency || '$'}{job.salary_max.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {job.salary_type || 'Yearly'}{job.salary_period ? ` / ${job.salary_period}` : ''}
                    </span>
                  </div>
                </div>
              ) : null}
              
              <div className="prose dark:prose-invert max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: job.description || '' }} />
              </div>
              
              {job.tags && job.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3 dark:text-white">Skills & Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map(tag => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <Badge variant="secondary" className="px-3 py-1">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator className="my-8" />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" asChild>
                  <a href={job.apply_url || '#'} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                
                <Button variant="outline" className="flex-1">
                  Save Job
                </Button>
              </div>
            </div>
            
            {/* Company website button - moved outside the removed About Company section */}
            {job.company_website && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Visit Company Website
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Similar jobs */}
            {similarJobs.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 dark:text-white">Similar Jobs</h2>
                <div className="space-y-4">
                  {similarJobs.map(similarJob => (
                    <JobCard key={similarJob.id} job={similarJob} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="mb-6 sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Job Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                      <Link href={`/categories/${job.category?.slug || '#'}`} className="font-medium hover:text-primary dark:text-white">
                        {job.category?.name || 'General'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <Link href={`/locations/${job.location?.slug || '#'}`} className="font-medium hover:text-primary dark:text-white">
                        {job.location?.name || 'Remote'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Job Type</p>
                      <Link href={`/job-types/${job.job_type?.slug || '#'}`} className="font-medium hover:text-primary dark:text-white">
                        {job.job_type?.name || 'Full-time'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Posted Date</p>
                      <p className="font-medium dark:text-white">{postedDate}</p>
                    </div>
                  </div>
                  
                  {expiryDate && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
                        <p className="font-medium dark:text-white">{expiryDate}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Salary Range</p>
                        <p className="font-medium dark:text-white">
                          {job.salary_currency || '$'}{job.salary_min.toLocaleString()} - {job.salary_currency || '$'}{job.salary_max.toLocaleString()}
                          {' '}{job.salary_type || 'Yearly'}{job.salary_period ? ` / ${job.salary_period}` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Related Tags Section */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Related Tags</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.tags.map((tag, index) => (
                            <Link key={tag.id || index} href={`/tags/${tag.slug}`}>
                              <Badge variant="secondary" className="px-2 py-0.5 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                {tag.name}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Button className="w-full" asChild>
                    <a href={job.apply_url || '#'} target="_blank" rel="noopener noreferrer">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
