import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4", className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
