"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";

export type ComboboxItem = {
  value: string;
  label: string;
};

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  createNew?: (value: string) => Promise<string>;
  createNewPlaceholder?: string;
  disabled?: boolean;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select an item",
  emptyMessage = "No items found.",
  createNew,
  createNewPlaceholder = "Create new item",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Reset input value when dropdown closes
  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const handleCreateNew = async () => {
    if (!createNew || !inputValue) return;
    
    setIsCreating(true);
    try {
      const newValue = await createNew(inputValue);
      onChange(newValue);
      setOpen(false);
    } catch (error) {
      console.error("Error creating new item:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedItem = items.find((item) => item.value === value);
  
  // Filter items based on input value
  const filteredItems = inputValue === "" 
    ? items 
    : items.filter((item) => 
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      );

  // Check if we should show the create option
  const showCreateOption = createNew && 
    inputValue && 
    !filteredItems.some(item => 
      item.label.toLowerCase() === inputValue.toLowerCase()
    );

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value ? selectedItem?.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0" 
          style={{ zIndex: 9999 }}
          align="start"
          sideOffset={5}
        >
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search..." 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList className="max-h-[300px] overflow-auto">
              <CommandEmpty>
                {emptyMessage}
                {showCreateOption && (
                  <div
                    className="px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-gray-200 rounded-sm flex items-center"
                    onClick={handleCreateNew}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isCreating ? "Creating..." : `${createNewPlaceholder}: "${inputValue}"`}
                  </div>
                )}
              </CommandEmpty>
              
              {filteredItems.length > 0 && (
                <CommandGroup>
                  {filteredItems.map((item) => (
                    <div
                      key={item.value}
                      className="px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-gray-200 rounded-sm flex items-center"
                      onClick={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </div>
                  ))}
                </CommandGroup>
              )}
              
              {showCreateOption && filteredItems.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <div
                      className="px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-gray-200 rounded-sm flex items-center"
                      onClick={handleCreateNew}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {isCreating ? "Creating..." : `Create "${inputValue}"`}
                    </div>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
