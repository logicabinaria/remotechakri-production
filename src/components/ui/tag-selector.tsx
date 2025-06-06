"use client";

import * as React from "react";
import { useState } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type TagItem = {
  id: string;
  name: string;
};

interface TagSelectorProps {
  tags: TagItem[];
  selectedTags: string[];
  onChange: (selectedIds: string[]) => void;
  createNew?: (value: string) => Promise<TagItem>;
}

export function TagSelector({
  tags,
  selectedTags,
  onChange,
  createNew,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = async () => {
    if (!createNew || !searchQuery.trim()) return;
    
    setIsCreating(true);
    try {
      const newTag = await createNew(searchQuery.trim());
      onChange([...selectedTags, newTag.id]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error creating new tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && createNew) {
      e.preventDefault();
      handleCreateNew();
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shouldShowCreateOption = 
    createNew && 
    searchQuery.trim() && 
    !filteredTags.some(tag => tag.name.toLowerCase() === searchQuery.toLowerCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        {shouldShowCreateOption && (
          <button
            type="button"
            onClick={handleCreateNew}
            disabled={isCreating}
            className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 dark:bg-primary/80 dark:hover:bg-primary/70"
          >
            {isCreating ? "Creating..." : `Create "${searchQuery}"`}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <p className="text-sm font-medium mr-2">Selected:</p>
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              if (!tag) return null;
              
              return (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-primary-foreground dark:bg-primary/80"
                >
                  {tag.name}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => handleTagToggle(tag.id)}
                  />
                </span>
              );
            })}
          </div>
        )}
        
        {filteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredTags
              .filter(tag => !selectedTags.includes(tag.id))
              .map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </span>
              ))}
          </div>
        ) : (
          !shouldShowCreateOption && (
            <p className="text-sm text-muted-foreground dark:text-gray-400">No tags found.</p>
          )
        )}
      </div>
    </div>
  );
}
