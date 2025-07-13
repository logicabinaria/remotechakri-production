import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Location } from "@/lib/supabase";

interface LocationsSectionProps {
  locations: (Location & { job_count: number })[];
}

export function LocationsSection({ locations }: LocationsSectionProps) {
  // Filter out locations with no jobs
  const activeLocations = locations.filter(location => location.job_count > 0);
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Heading 
          title="Popular Remote Job Locations"
          description="Discover remote opportunities from companies around the world and explore global career possibilities."
          size="lg"
          align="center"
        />
      </div>
        
        {activeLocations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {activeLocations.map((location) => (
              <Link
                key={location.id}
                href={`/jobs?location=${location.slug}`}
                className="group"
              >
                <Card className="h-full relative overflow-hidden group-hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                        <MapPin className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-300">
                      {location.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {location.job_count} {location.job_count === 1 ? 'job' : 'jobs'}
                    </Badge>
                  </CardContent>
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
  );
}
