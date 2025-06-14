"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterSection } from './filter-section';
import { useJobFilters } from '@/components/providers/job-filter-provider';

interface Tag {
  id: string;
  name: string;
  slug: string;
  job_count: number;
}

interface TagFilterProps {
  tags: Tag[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const { filterState, dispatch, applyFilters } = useJobFilters();
  
  const handleTagClick = (slug: string) => {
    if (filterState.tags.includes(slug)) {
      dispatch({ type: 'REMOVE_TAG', payload: slug });
    } else {
      dispatch({ type: 'ADD_TAG', payload: slug });
    }
    applyFilters();
  };
  
  const isTagSelected = (slug: string) => {
    return filterState.tags.includes(slug);
  };
  
  return (
    <FilterSection 
      title="Skills" 
      count={filterState.tags.length}
    >
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={isTagSelected(tag.slug) ? "secondary" : "outline"}
            size="sm"
            className="rounded-full h-auto py-1 px-3 text-xs font-medium"
            onClick={() => handleTagClick(tag.slug)}
          >
            {tag.name}
            {tag.job_count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {tag.job_count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </FilterSection>
  );
}
