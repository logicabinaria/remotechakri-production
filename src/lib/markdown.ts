import fs from 'fs';
import path from 'path';

/**
 * Read and parse markdown content from a file
 * @param filePath Path to the markdown file
 * @returns The markdown content as a string
 */
export function readMarkdownFile(filePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return fileContents;
  } catch (error) {
    console.error(`Error reading markdown file: ${error}`);
    return '# Content Not Found\n\nThe requested content could not be loaded.';
  }
}
