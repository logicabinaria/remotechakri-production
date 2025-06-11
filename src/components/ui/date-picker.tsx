"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
}

export function DatePicker({ date, setDate, label = "Pick a date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-center text-sm text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const currentDate = new Date();
                const isSelected = date && day === date.getDate() && 
                  currentDate.getMonth() === date.getMonth() && 
                  currentDate.getFullYear() === date.getFullYear();
                
                return (
                  <Button
                    key={day}
                    variant={isSelected ? "default" : "ghost"}
                    className={cn(
                      "h-8 w-8 p-0 font-normal",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      const newDate = new Date();
                      newDate.setDate(day);
                      setDate(newDate);
                    }}
                  >
                    {day}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
