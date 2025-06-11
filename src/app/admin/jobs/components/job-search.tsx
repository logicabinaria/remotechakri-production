"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface JobSearchProps {
  onSearch: (query: string) => void;
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search by title, company, or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit">
        <Search className="h-4 w-4 mr-2" /> Search
      </Button>
    </form>
  );
}
