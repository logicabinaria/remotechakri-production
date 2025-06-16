import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function Heading({ 
  title, 
  description, 
  className 
}: HeadingProps) {
  return (
    <div className={className}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
