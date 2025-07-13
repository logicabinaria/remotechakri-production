import React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "glass" | "pattern";
  size?: "sm" | "md" | "lg" | "xl";
  background?: "white" | "gray" | "transparent";
}

const sizeClasses = {
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
  xl: "py-20"
};

const variantClasses = {
  default: "",
  gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden",
  glass: "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-y border-gray-200/50 dark:border-gray-700/50",
  pattern: "relative overflow-hidden"
};

const backgroundClasses = {
  white: "bg-white dark:bg-gray-900",
  gray: "bg-gray-50 dark:bg-gray-800",
  transparent: "bg-transparent"
};

export function SectionContainer({
  children,
  className,
  variant = "default",
  size = "lg",
  background = "transparent"
}: SectionContainerProps) {
  return (
    <section className={cn(
      sizeClasses[size],
      backgroundClasses[background],
      variantClasses[variant],
      "relative",
      className
    )}>
      {/* Pattern variant with simplified background */}
      {variant === "pattern" && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/3 rounded-full blur-lg" />
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
        </>
      )}
      
      {/* Gradient variant with simplified effects */}
      {variant === "gradient" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-xl" />
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-secondary/5 rounded-full blur-lg" />
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        {children}
      </div>
    </section>
  );
}

// Add grid pattern to global CSS if not already present
export const gridPatternCSS = `
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
`;