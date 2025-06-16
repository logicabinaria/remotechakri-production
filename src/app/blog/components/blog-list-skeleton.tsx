import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogListSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden">
          <div className="md:flex">
            {/* Image skeleton */}
            <div className="relative w-full md:w-1/3 aspect-[16/9] md:aspect-square">
              <Skeleton className="h-full w-full" />
            </div>
            
            <CardContent className="flex-1 flex flex-col p-5 md:p-6">
              {/* Date and reading time skeleton */}
              <div className="flex items-center mb-3">
                <Skeleton className="h-4 w-24 mr-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Title skeleton */}
              <Skeleton className="h-8 w-full mb-3" />
              
              {/* Author skeleton */}
              <Skeleton className="h-4 w-32 mb-4" />
              
              {/* Excerpt skeleton */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              
              {/* Button skeleton */}
              <div className="mt-auto">
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
