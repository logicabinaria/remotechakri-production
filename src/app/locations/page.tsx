import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { getAllLocations } from '@/lib/public/taxonomy-queries';
import { generateMetadata } from '@/components/public/seo/metadata';

// Generate metadata for SEO
export const metadata = generateMetadata({
  title: "Browse Jobs by Location | RemoteChakri.com",
  description: "Explore remote job opportunities by location. Find remote positions available worldwide or in specific regions on RemoteChakri.com.",
  keywords: ["remote jobs by location", "work from home locations", "remote work regions", "global remote jobs", "location-specific remote work"],
  canonical: "https://remotechakri.com/locations",
});

export default async function LocationsPage() {
  // Fetch all locations with job counts
  const locations = await getAllLocations();
  
  // Sort locations by job count (descending)
  const sortedLocations = [...locations].sort((a, b) => b.job_count - a.job_count);
  
  return (
    <PublicLayout>
      {/* Page header */}
      <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Browse Jobs by Location
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find remote jobs available in specific regions or worldwide
            </p>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-12">
        {/* Locations grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedLocations.map((location) => (
            <Link 
              key={location.id} 
              href={`/locations/${location.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2 group-hover:text-primary transition-colors dark:text-white">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {location.job_count} {location.job_count === 1 ? 'job' : 'jobs'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* If no locations are found */}
          {sortedLocations.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No locations available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
