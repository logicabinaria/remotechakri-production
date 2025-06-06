"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { Category, Location, JobType } from "@/lib/supabase";

// Extended types with job_count property
interface CategoryWithCount extends Category {
  job_count: number;
}

interface LocationWithCount extends Location {
  job_count: number;
}

interface SearchSidebarProps {
  categories: CategoryWithCount[];
  locations: LocationWithCount[];
  jobTypes: JobType[];
}

export function SearchSidebar({ categories, locations, jobTypes }: SearchSidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState("all");
  const [locationSlug, setLocationSlug] = useState("all");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  // Handle job type checkbox changes
  const toggleJobType = (slug: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(slug) 
        ? prev.filter(item => item !== slug) 
        : [...prev, slug]
    );
  };

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    
    if (categorySlug && categorySlug !== 'all') {
      params.append("category", categorySlug);
    }
    
    if (locationSlug && locationSlug !== 'all') {
      params.append("location", locationSlug);
    }
    
    if (selectedJobTypes.length > 0) {
      params.append("jobType", selectedJobTypes[0]); // Currently API supports only one job type
    }
    
    // Navigate to jobs page with filters
    router.push(`/jobs?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategorySlug("all");
    setLocationSlug("all");
    setSelectedJobTypes([]);
  };

  return (
    <Card className="sticky top-24 w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Search className="mr-2 h-4 w-4" />
          Find Your Dream Job
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4 w-full">
          {/* Keyword search */}
          <div className="space-y-2">
            <Label htmlFor="search">Keywords</Label>
            <Input
              id="search"
              placeholder="Job title, skills, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Category dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name} ({category.job_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Location dropdown */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={locationSlug} onValueChange={setLocationSlug}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.slug}>
                    {location.name} ({location.job_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Job types checkboxes */}
          <div className="space-y-2">
            <Label>Job Type</Label>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {jobTypes.map((jobType) => (
                <div key={jobType.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`job-type-${jobType.slug}`}
                    checked={selectedJobTypes.includes(jobType.slug)}
                    onChange={() => toggleJobType(jobType.slug)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`job-type-${jobType.slug}`}
                    className="text-sm font-medium leading-none"
                  >
                    {jobType.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Search Jobs
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-center">
        <Button variant="link" onClick={clearFilters} className="text-sm">
          Clear All Filters
        </Button>
      </CardFooter>
    </Card>
  );
}
