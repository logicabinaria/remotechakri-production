"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSection } from './filter-section';
import { SelectedFilters } from './selected-filters';
import { TagFilter } from './tag-filter';
import { SortOptions } from './sort-options';
import { useJobFilters } from '@/components/providers/job-filter-provider';

interface FilterOption {
  id: string;
  name: string;
  slug: string;
  job_count: number;
}

interface JobFiltersProps {
  categories: FilterOption[];
  locations: FilterOption[];
  jobTypes: FilterOption[];
  tags?: FilterOption[];
}

export function JobFilters({ categories, locations, jobTypes, tags = [] }: JobFiltersProps) {
  const { 
    filterState, 
    dispatch, 
    resetFilters
  } = useJobFilters();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };

  const handleCategoryClick = (slug: string) => {
    dispatch({ 
      type: 'SET_CATEGORY', 
      payload: filterState.category === slug ? null : slug 
    });
  };

  const handleLocationClick = (slug: string) => {
    dispatch({ 
      type: 'SET_LOCATION', 
      payload: filterState.location === slug ? null : slug 
    });
  };

  const handleJobTypeClick = (slug: string) => {
    dispatch({ 
      type: 'SET_JOB_TYPE', 
      payload: filterState.jobType === slug ? null : slug 
    });
  };

  const handleDatePostedClick = (value: string) => {
    dispatch({ 
      type: 'SET_DATE_POSTED', 
      payload: filterState.datePosted === value ? null : value 
    });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  return (
    <div className="space-y-6 relative">
      <div className="top-0 bg-transparent backdrop-blur-sm border-b border-border/50 z-10 space-y-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <SortOptions />
        </div>
        
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs..."
            className="pl-8"
            value={filterState.search}
            onChange={handleSearchChange}
          />
        </form>
        
        {/* Reset Button */}
        <div className="py-2">
          <Button 
            variant="outline" 
            className="w-full text-sm h-9" 
            onClick={handleResetFilters}
          >
            Reset All Filters
          </Button>
        </div>
        
        <SelectedFilters />
      </div>
      
      <div className="space-y-4">
        
        <FilterSection 
          title="Date Posted" 
          count={filterState.datePosted ? 1 : 0}
        >
          <div className="space-y-2 mt-2">
            {[
              { id: '24h', name: 'Last 24 hours' },
              { id: '3d', name: 'Last 3 days' },
              { id: '7d', name: 'Last 7 days' },
              { id: '30d', name: 'Last 30 days' },
            ].map((option) => (
              <Button
                key={option.id}
                variant={filterState.datePosted === option.id ? "secondary" : "outline"}
                size="sm"
                className="justify-start h-auto py-2 px-3 text-sm font-medium w-full"
                onClick={() => handleDatePostedClick(option.id)}
              >
                {option.name}
              </Button>
            ))}
          </div>
        </FilterSection>
        
        <FilterSection 
          title="Categories" 
          count={filterState.category ? 1 : 0}
        >
          <div className="space-y-2 mt-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={filterState.category === category.slug ? "secondary" : "outline"}
                size="sm"
                className="justify-start h-auto py-2 px-3 text-sm font-medium w-full"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <span className="truncate">{category.name}</span>
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
                  {category.job_count}
                </span>
              </Button>
            ))}
          </div>
        </FilterSection>
        
        <FilterSection 
          title="Locations" 
          count={filterState.location ? 1 : 0}
        >
          <div className="space-y-2 mt-2">
            {locations.map((location) => (
              <Button
                key={location.id}
                variant={filterState.location === location.slug ? "secondary" : "outline"}
                size="sm"
                className="justify-start h-auto py-2 px-3 text-sm font-medium w-full"
                onClick={() => handleLocationClick(location.slug)}
              >
                <span className="truncate">{location.name}</span>
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
                  {location.job_count}
                </span>
              </Button>
            ))}
          </div>
        </FilterSection>
        
        <FilterSection 
          title="Job Types" 
          count={filterState.jobType ? 1 : 0}
        >
          <div className="space-y-2 mt-2">
            {jobTypes.map((jobType) => (
              <Button
                key={jobType.id}
                variant={filterState.jobType === jobType.slug ? "secondary" : "outline"}
                size="sm"
                className="justify-start h-auto py-2 px-3 text-sm font-medium w-full"
                onClick={() => handleJobTypeClick(jobType.slug)}
              >
                <span className="truncate">{jobType.name}</span>
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
                  {jobType.job_count}
                </span>
              </Button>
            ))}
          </div>
        </FilterSection>
        
        {/* Add the Tag Filter component if tags are provided */}
        {tags.length > 0 && <TagFilter tags={tags} />}
      </div>
    </div>
  );
}
