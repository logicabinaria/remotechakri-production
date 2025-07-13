import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
  gradient?: boolean;
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl"
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right"
};

export function Heading({ 
  title, 
  description, 
  className,
  size = "md",
  align = "left",
  gradient = false
}: HeadingProps) {
  return (
    <div className={cn(alignClasses[align], className)}>
      <h2 className={cn(
        sizeClasses[size],
        "font-bold tracking-tight transition-all duration-300 leading-tight pb-1",
        gradient && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          "text-muted-foreground mt-4 transition-all duration-300 leading-relaxed",
          size === "sm" ? "text-sm" : size === "xl" ? "text-lg" : "text-base"
        )}>
          {description}
        </p>
      )}
    </div>
  );
}
