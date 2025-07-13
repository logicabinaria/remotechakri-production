"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

// Define filter state interface
export interface JobFilterState {
  search: string;
  category: string | null;
  location: string | null;
  jobType: string | null;
  datePosted: string | null;
  tags: string[];
  sortBy: string;
  page: number;
  loading: boolean;
}

// Define action types
type FilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_LOCATION'; payload: string | null }
  | { type: 'SET_JOB_TYPE'; payload: string | null }
  | { type: 'SET_DATE_POSTED'; payload: string | null }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_FILTERS_FROM_URL'; payload: Partial<JobFilterState> };

// Define context interface
interface JobFilterContextType {
  filterState: JobFilterState;
  dispatch: React.Dispatch<FilterAction>;
  activeFilterCount: number;
  isLoading: boolean;
  applyFilters: () => void;
  removeFilter: (filterType: keyof JobFilterState) => void;
  resetFilters: () => void;
}

// Initial state
const initialState: JobFilterState = {
  search: '',
  category: null,
  location: null,
  jobType: null,
  datePosted: null,
  tags: [],
  sortBy: 'newest',
  page: 1,
  loading: false,
};

// Create context
const JobFilterContext = createContext<JobFilterContextType | undefined>(undefined);

// Reducer function
function filterReducer(state: JobFilterState, action: FilterAction): JobFilterState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 1 };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload, page: 1 };
    case 'SET_LOCATION':
      return { ...state, location: action.payload, page: 1 };
    case 'SET_JOB_TYPE':
      return { ...state, jobType: action.payload, page: 1 };
    case 'SET_DATE_POSTED':
      return { ...state, datePosted: action.payload, page: 1 };
    case 'ADD_TAG':
      // Only add the tag if it doesn't already exist
      return { 
        ...state, 
        tags: state.tags.includes(action.payload) 
          ? state.tags 
          : [...state.tags, action.payload],
        page: 1 
      };
    case 'REMOVE_TAG':
      return { 
        ...state, 
        tags: state.tags.filter(tag => tag !== action.payload),
        page: 1 
      };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload, page: 1 };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'RESET_FILTERS':
      return { ...initialState };
    case 'SET_FILTERS_FROM_URL':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Provider component
export function JobFilterProvider({ children }: { children: ReactNode }) {
  const [filterState, dispatch] = useReducer(filterReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Debounce search to avoid excessive URL updates
  const debouncedSearch = useDebounce(filterState.search, 500);

  // Calculate active filter count
  const activeFilterCount = Object.entries(filterState).reduce((count, [key, value]) => {
    if (key === 'page' || key === 'sortBy' || key === 'loading') return count;
    if (key === 'tags') return count + (value as string[]).length;
    return value ? count + 1 : count;
  }, 0);

  // Track if this is the initial mount
  const isInitialMount = React.useRef(true);

  // Sync URL with filter state on initial load only
  useEffect(() => {
    if (isInitialMount.current) {
      // Parse URL params on initial load
      const category = searchParams.get('category');
      const location = searchParams.get('location');
      const jobType = searchParams.get('jobType');
      const search = searchParams.get('search');
      const datePosted = searchParams.get('datePosted');
      const sortBy = searchParams.get('sortBy') || 'newest';
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
      
      // Handle tags which can be multiple
      const tagsParam = searchParams.get('tags');
      const tags = tagsParam ? tagsParam.split(',') : [];

      // Update filter state from URL
      dispatch({
        type: 'SET_FILTERS_FROM_URL',
        payload: {
          category: category || null,
          location: location || null,
          jobType: jobType || null,
          search: search || '',
          datePosted: datePosted || null,
          tags: tags,
          sortBy: sortBy,
          page: page,
        },
      });
      
      // Set loading state to false after initializing filters
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Mark initial mount as complete
      isInitialMount.current = false;
    }
  }, [searchParams, dispatch]);

  // Update URL when filter state changes (but not on initial load)
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch, 
    filterState.category, 
    filterState.location, 
    filterState.jobType, 
    filterState.datePosted, 
    filterState.tags, 
    filterState.sortBy, 
    filterState.page
  ]);

  // Apply filters by updating URL
  const applyFilters = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Create new URLSearchParams object
    const params = new URLSearchParams();
    
    // Add non-null filter values to params
    if (filterState.category) params.set('category', filterState.category);
    if (filterState.location) params.set('location', filterState.location);
    if (filterState.jobType) params.set('jobType', filterState.jobType);
    if (filterState.datePosted) params.set('datePosted', filterState.datePosted);
    if (filterState.search) params.set('search', filterState.search);
    if (filterState.sortBy !== 'newest') params.set('sortBy', filterState.sortBy);
    if (filterState.page > 1) params.set('page', filterState.page.toString());
    
    // Handle tags array
    if (filterState.tags.length > 0) {
      params.set('tags', filterState.tags.join(','));
    }
    
    // Update URL - use replace to trigger server component re-execution
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl);
    
    // Set loading state with a small delay to allow for UI updates
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 300);
  };

  // Remove a specific filter
  const removeFilter = (filterType: keyof JobFilterState) => {
    if (filterType === 'search') {
      dispatch({ type: 'SET_SEARCH', payload: '' });
    } else if (filterType === 'category') {
      dispatch({ type: 'SET_CATEGORY', payload: null });
    } else if (filterType === 'location') {
      dispatch({ type: 'SET_LOCATION', payload: null });
    } else if (filterType === 'jobType') {
      dispatch({ type: 'SET_JOB_TYPE', payload: null });
    } else if (filterType === 'datePosted') {
      dispatch({ type: 'SET_DATE_POSTED', payload: null });
    } else if (filterType === 'tags') {
      // Reset tags to empty array
      dispatch({ type: 'SET_FILTERS_FROM_URL', payload: { tags: [] } });
    } else if (filterType === 'sortBy') {
      dispatch({ type: 'SET_SORT_BY', payload: 'newest' });
    }
    
    // Reset page when removing filters
    dispatch({ type: 'SET_PAGE', payload: 1 });
    
    // applyFilters will be called automatically by useEffect
  };

  // Reset all filters
  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    router.push(pathname);
  };

  return (
    <JobFilterContext.Provider value={{ 
      filterState, 
      dispatch, 
      applyFilters, 
      removeFilter, 
      resetFilters,
      activeFilterCount,
      isLoading: filterState.loading
    }}>
      {children}
    </JobFilterContext.Provider>
  );
}

// Custom hook to use the filter context
export function useJobFilters() {
  const context = useContext(JobFilterContext);
  if (context === undefined) {
    throw new Error('useJobFilters must be used within a JobFilterProvider');
  }
  return context;
}
