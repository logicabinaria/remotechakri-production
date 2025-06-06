"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
  preserveParams?: boolean;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  queryParams = {},
  preserveParams = false
}: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Function to build URL with query parameters
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Add existing query params
    Object.entries(queryParams).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    // Preserve URL parameters if enabled
    if (preserveParams && typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((value, key) => {
        if (key !== 'page' && !params.has(key)) {
          params.append(key, value);
        }
      });
    }
    
    // Add page param
    params.append('page', page.toString());
    
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push('ellipsis');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }
    
    // Always show last page if more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label="Pagination" className="flex justify-center my-8">
      <ul className="flex items-center gap-1">
        {/* Previous button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={currentPage === 1}
            asChild={currentPage !== 1}
          >
            {currentPage === 1 ? (
              <span aria-disabled="true">
                <ChevronLeft className="h-4 w-4" />
              </span>
            ) : (
              <Link 
                href={buildUrl(currentPage - 1)}
                aria-label="Previous page"
                rel="prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
          </Button>
        </li>
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === 'ellipsis' ? (
              <span className="px-3 py-2">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                asChild={page !== currentPage}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page === currentPage ? (
                  <span>{page}</span>
                ) : (
                  <Link 
                    href={buildUrl(page)}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </Link>
                )}
              </Button>
            )}
          </li>
        ))}
        
        {/* Next button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={currentPage === totalPages}
            asChild={currentPage !== totalPages}
          >
            {currentPage === totalPages ? (
              <span aria-disabled="true">
                <ChevronRight className="h-4 w-4" />
              </span>
            ) : (
              <Link 
                href={buildUrl(currentPage + 1)}
                aria-label="Next page"
                rel="next"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </Button>
        </li>
      </ul>
    </nav>
  );
}
