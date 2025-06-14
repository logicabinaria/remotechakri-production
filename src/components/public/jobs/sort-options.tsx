"use client";

import React from 'react';
import { Check, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useJobFilters } from '@/components/providers/job-filter-provider';

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'salary_high', label: 'Highest salary' },
  { value: 'salary_low', label: 'Lowest salary' },
];

export function SortOptions() {
  const { filterState, dispatch, applyFilters } = useJobFilters();
  
  const handleSortChange = (value: string) => {
    dispatch({ type: 'SET_SORT_BY', payload: value });
    applyFilters();
  };
  
  const currentSortLabel = sortOptions.find(
    option => option.value === filterState.sortBy
  )?.label || 'Sort by';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>{currentSortLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            {option.label}
            {filterState.sortBy === option.value && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
