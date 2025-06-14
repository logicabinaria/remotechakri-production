"use client";

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { useJobFilters } from '@/components/providers/job-filter-provider';

interface MobileFilterDrawerProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function MobileFilterDrawer({ trigger, children }: MobileFilterDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const { activeFilterCount, resetFilters, applyFilters } = useJobFilters();

  const handleApplyFilters = () => {
    applyFilters();
    setOpen(false);
  };

  const handleResetFilters = () => {
    resetFilters();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </SheetHeader>
        
        <div className="overflow-y-auto p-4 h-[calc(100vh-8rem)]">
          {children}
        </div>
        
        <SheetFooter className="flex-row gap-2 px-4 py-3 border-t">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleResetFilters}
          >
            Reset
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
