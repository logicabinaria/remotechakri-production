#!/usr/bin/env node

// Script to fix the order of "use client" and Edge Runtime directives
import { readFile, writeFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { constants } from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Routes that need fixing based on the error message
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
const EDGE_RUNTIME_CODE = "export const runtime = 'edge';";
const USE_CLIENT_DIRECTIVE = '"use client";';

// Check if a file exists
async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Fix the order of directives in a file
async function fixDirectivesOrder(filePath) {
  try {
    if (!(await fileExists(filePath))) {
      console.log(`⚠️ File not found: ${filePath}`);
      return false;
    }

    const content = await readFile(filePath, 'utf8');
    
    // Check if the file has both directives
    const hasUseClient = content.includes(USE_CLIENT_DIRECTIVE);
    const hasEdgeRuntime = content.includes(EDGE_RUNTIME_CODE);
    
    if (!hasUseClient && !hasEdgeRuntime) {
      console.log(`✅ No directives to fix in ${filePath}`);
      return true;
    }
    
    if (hasUseClient && !hasEdgeRuntime) {
      // Only has "use client" - add Edge Runtime after it
      const updatedContent = content.replace(
        USE_CLIENT_DIRECTIVE,
        `${USE_CLIENT_DIRECTIVE}\n\n${EDGE_RUNTIME_CODE}`
      );
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Added Edge Runtime after "use client" in ${filePath}`);
      return true;
    }
    
    if (!hasUseClient && hasEdgeRuntime) {
      // Only has Edge Runtime - no need to fix
      console.log(`✅ File only has Edge Runtime, no "use client" in ${filePath}`);
      return true;
    }
    
    // Has both directives - ensure "use client" comes first
    let updatedContent = content;
    
    // Remove both directives
    updatedContent = updatedContent.replace(USE_CLIENT_DIRECTIVE, '');
    updatedContent = updatedContent.replace(EDGE_RUNTIME_CODE, '');
    
    // Clean up any extra newlines
    updatedContent = updatedContent.replace(/^\s+/g, '');
    
    // Add directives in the correct order
    updatedContent = `${USE_CLIENT_DIRECTIVE}\n\n${EDGE_RUNTIME_CODE}\n\n${updatedContent}`;
    
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ Fixed directive order in ${filePath}`);
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
  
  // Check for page files with different extensions
  const pageFiles = [
    join(dirPath, 'page.js'),
    join(dirPath, 'page.jsx'),
    join(dirPath, 'page.ts'),
    join(dirPath, 'page.tsx')
  ];
  
  // Check for route files with different extensions
  const routeFiles = [
    join(dirPath, 'route.js'),
    join(dirPath, 'route.jsx'),
    join(dirPath, 'route.ts'),
    join(dirPath, 'route.tsx')
  ];
  
  let success = false;
  
  // Try to fix page files
  for (const file of pageFiles) {
    if (await fileExists(file)) {
      success = await fixDirectivesOrder(file) || success;
    }
  }
  
  // Try to fix route files
  for (const file of routeFiles) {
    if (await fileExists(file)) {
      success = await fixDirectivesOrder(file) || success;
    }
  }
  
  if (!success) {
    console.log(`⚠️ No files found or fixed for route: ${routePath}`);
  }
  
  return success;
}

// Main function
async function main() {
  console.log('🔍 Fixing directive order in Next.js files...');
  
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
  
  console.log('\n🚀 Done! Your Next.js app should now have correctly ordered directives.');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
