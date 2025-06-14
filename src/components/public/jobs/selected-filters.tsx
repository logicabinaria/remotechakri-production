"use client";

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJobFilters } from '@/components/providers/job-filter-provider';

interface FilterLabelMap {
  [key: string]: {
    label: string;
    valueFormatter?: (value: string) => string;
  };
}

const filterLabels: FilterLabelMap = {
  search: { 
    label: 'Search',
  },
  category: { 
    label: 'Category',
    valueFormatter: (value) => value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  },
  location: { 
    label: 'Location',
    valueFormatter: (value) => value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  },
  jobType: { 
    label: 'Job Type',
    valueFormatter: (value) => value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  },
  datePosted: { 
    label: 'Date Posted',
    valueFormatter: (value) => {
      switch(value) {
        case '24h': return 'Last 24 hours';
        case '3d': return 'Last 3 days';
        case '7d': return 'Last week';
        case '30d': return 'Last month';
        default: return value;
      }
    }
  },
};

export function SelectedFilters() {
  const { filterState, removeFilter, resetFilters, activeFilterCount } = useJobFilters();
  
  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        {Object.entries(filterState).map(([key, value]) => {
          // Skip page, sortBy, and null/empty values
          if (key === 'page' || key === 'sortBy' || !value) return null;
          
          const filterInfo = filterLabels[key];
          if (!filterInfo) return null;
          
          const displayValue = filterInfo.valueFormatter 
            ? filterInfo.valueFormatter(value as string) 
            : value;
            
          return (
            <Badge 
              key={key} 
              variant="outline" 
              className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10"
            >
              <span className="font-medium text-gray-600 dark:text-gray-300">{filterInfo.label}:</span>
              <span>{displayValue}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => removeFilter(key as keyof typeof filterState)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {filterInfo.label} filter</span>
              </Button>
            </Badge>
          );
        })}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-primary"
          onClick={resetFilters}
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
}
