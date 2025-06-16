"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

// This component creates a multi-select dropdown with search functionality
// It renders a button that opens a popover with a list of options
// Selected options appear as badges that can be removed
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const filteredOptions = options.filter((option) => 
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            selected.length > 0 ? "h-full" : "h-10",
            className
          )}
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((selectedValue) => {
                const option = options.find((o) => o.value === selectedValue);
                return (
                  <Badge
                    key={selectedValue}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {option?.label || selectedValue}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(selectedValue);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleUnselect(selectedValue);
                        }
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[100]" align="start" sideOffset={5}>
        <Command>
          <CommandInput 
            placeholder="Search..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto pointer-events-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onSelect={() => {
                  const isSelected = selected.includes(option.value);
                  if (isSelected) {
                    onChange(selected.filter((value) => value !== option.value));
                  } else {
                    onChange([...selected, option.value]);
                  }
                  // Keep the popover open after selection
                  setOpen(true);
                  // Prevent default behavior that might close the popover
                  setTimeout(() => {
                    setSearchValue("");
                  }, 10);
                }}
              >
                <div className="flex items-center w-full pointer-events-auto">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
