import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Location } from "@/lib/supabase";

interface LocationsSectionProps {
  locations: (Location & { job_count: number })[];
}

export function LocationsSection({ locations }: LocationsSectionProps) {
  // Filter out locations with no jobs
  const activeLocations = locations.filter(location => location.job_count > 0);
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
            Browse Jobs by Location
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find remote jobs available in specific regions or worldwide
          </p>
        </div>
        
        {activeLocations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {activeLocations.map((location) => (
            <Link 
              key={location.id} 
              href={`/locations/${location.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <MapPin className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {location.job_count} {location.job_count === 1 ? 'job' : 'jobs'}
                  </p>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No active job locations available at the moment.
            </p>
          </div>
        )}
        
        {activeLocations.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/locations">
              <Button variant="outline">
                View All Locations
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
