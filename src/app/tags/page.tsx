import Link from 'next/link';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PublicLayout } from '@/components/public/layout/public-layout';
import { getPopularTags } from '@/lib/public/taxonomy-queries';
import { generateMetadata } from '@/components/public/seo/metadata';

// Generate metadata for SEO
export const metadata = generateMetadata({
  title: "Browse Jobs by Skills & Technologies | RemoteChakri.com",
  description: "Explore remote job opportunities by skills and technologies. Find jobs matching your expertise in programming languages, frameworks, tools, and more on RemoteChakri.com.",
  keywords: ["job skills", "tech skills", "remote job skills", "programming languages", "technology jobs"],
  canonical: "https://remotechakri.com/tags",
});

export default async function TagsPage() {
  // Fetch all popular tags with job counts (get a large number to show a comprehensive list)
  const tags = await getPopularTags(100);
  
  // Sort tags by job count (descending)
  const sortedTags = [...tags].sort((a, b) => b.job_count - a.job_count);
  
  return (
    <PublicLayout>
      {/* Page header */}
      <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Browse Jobs by Skills & Technologies
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find remote opportunities that match your expertise and interests
            </p>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-12">
        {/* Popular tags section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white">
              Popular Skills & Technologies
            </h2>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {sortedTags.map((tag) => (
                  <Link 
                    key={tag.id} 
                    href={`/tags/${tag.slug}`}
                  >
                    <Badge variant="secondary" className="px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors">
                      {tag.name} ({tag.job_count})
                    </Badge>
                  </Link>
                ))}
                
                {/* If no tags are found */}
                {sortedTags.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400 p-4">
                    No tags available at the moment. Check back soon!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Skills categories section - for better organization */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Browse by Skill Category
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Programming Languages */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 dark:text-white">Programming Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedTags
                    .filter(tag => ['javascript', 'python', 'java', 'typescript', 'php', 'ruby', 'go', 'c#', 'c++', 'scala', 'swift', 'kotlin'].includes(tag.slug))
                    .slice(0, 8)
                    .map(tag => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <Badge variant="outline" className="hover:bg-primary/10">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            {/* Frameworks & Libraries */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 dark:text-white">Frameworks & Libraries</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedTags
                    .filter(tag => ['react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'laravel', 'spring', 'rails'].includes(tag.slug))
                    .slice(0, 8)
                    .map(tag => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <Badge variant="outline" className="hover:bg-primary/10">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            {/* Design & UX */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 dark:text-white">Design & UX</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedTags
                    .filter(tag => ['ui', 'ux', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'indesign', 'xd', 'design'].includes(tag.slug))
                    .slice(0, 8)
                    .map(tag => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <Badge variant="outline" className="hover:bg-primary/10">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            {/* DevOps & Cloud */}
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 dark:text-white">DevOps & Cloud</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedTags
                    .filter(tag => ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'devops', 'cloud'].includes(tag.slug))
                    .slice(0, 8)
                    .map(tag => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <Badge variant="outline" className="hover:bg-primary/10">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
