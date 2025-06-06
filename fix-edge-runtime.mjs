#!/usr/bin/env node

// Script to add Edge Runtime to specific routes for Cloudflare Pages compatibility
import { readFile, writeFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { constants } from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Routes that need the Edge Runtime based on the error message
const routesToFix = [
  '/admin/jobs/[id]/edit',
  '/api/jobs/recent',
  '/api/public/job-views',
  '/api/public/jobs/[slug]',
  '/api/public/jobs',
  '/api/public/tags',
  '/categories/[slug]',
  '/job-types/[slug]',
  '/jobs/[slug]',
  '/jobs',
  '/locations/[slug]',
  '/tags/[slug]'
];

const APP_DIR = join(__dirname, 'src', 'app');
const EDGE_RUNTIME_CODE = "export const runtime = 'edge';\n\n";

// Check if a file exists
async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Add Edge Runtime to a file if it doesn't already have it
async function addEdgeRuntimeToFile(filePath) {
  try {
    if (!(await fileExists(filePath))) {
      console.log(`⚠️ File not found: ${filePath}`);
      return false;
    }

    const content = await readFile(filePath, 'utf8');
    
    // Skip if runtime is already defined
    if (content.includes("export const runtime")) {
      console.log(`✅ Runtime already defined in ${filePath}`);
      return true;
    }
    
    // Add the Edge Runtime at the beginning of the file
    const updatedContent = EDGE_RUNTIME_CODE + content;
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ Added Edge Runtime to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Process a route path
async function processRoute(routePath) {
  // Convert route path to directory path
  const parts = routePath.replace(/^\//, '').split('/');
  const dirPath = join(APP_DIR, ...parts);
  
  // Check for page.js/page.tsx
  const pageFiles = [
    join(dirPath, 'page.js'),
    join(dirPath, 'page.jsx'),
    join(dirPath, 'page.ts'),
    join(dirPath, 'page.tsx')
  ];
  
  // Check for route.js/route.ts
  const routeFiles = [
    join(dirPath, 'route.js'),
    join(dirPath, 'route.jsx'),
    join(dirPath, 'route.ts'),
    join(dirPath, 'route.tsx')
  ];
  
  let success = false;
  
  // Try to add Edge Runtime to page files
  for (const file of pageFiles) {
    if (await fileExists(file)) {
      success = await addEdgeRuntimeToFile(file) || success;
    }
  }
  
  // Try to add Edge Runtime to route files
  for (const file of routeFiles) {
    if (await fileExists(file)) {
      success = await addEdgeRuntimeToFile(file) || success;
    }
  }
  
  if (!success) {
    console.log(`⚠️ No files found for route: ${routePath}`);
  }
  
  return success;
}

// Main function
async function main() {
  console.log('🔍 Adding Edge Runtime to dynamic routes for Cloudflare Pages compatibility...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const route of routesToFix) {
    console.log(`\n📂 Processing route: ${route}`);
    const success = await processRoute(route);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n✅ Successfully processed ${successCount} routes`);
  if (failCount > 0) {
    console.log(`⚠️ Failed to process ${failCount} routes`);
  }
  
  console.log('\n🚀 Done! Your Next.js app should now be compatible with Cloudflare Pages.');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
