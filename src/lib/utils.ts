import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Preprocesses text to ensure proper word spacing before slug generation
 * This helps create more SEO-friendly slugs with proper word boundaries
 */
export function preprocessTextForSlug(text: string): string {
  if (!text) return '';
  
  return text
    // Handle camelCase and special formatting cases
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between camelCase words
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2')  // Add space between letters and numbers
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
    
    // Replace common separators with spaces
    .replace(/[_\-+]/g, ' ')  // Replace underscores, hyphens, and plus signs with spaces
    
    // Handle special characters and punctuation
    .replace(/[&\/\\#,+()$~%.'":*?<>{}|!;=]/g, ' ')  // Replace special chars with spaces
    
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a URL-friendly slug from the given text
 * Note: This is used for client-side slug generation only.
 * For database slugs, use the preprocessTextForSlug function before calling the database function.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
