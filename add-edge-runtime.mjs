#!/usr/bin/env node

// Script to add Edge Runtime configuration to all dynamic routes
import { readFile, writeFile, stat } from 'fs/promises';
import path from 'path';

const APP_DIR = './src/app';
const EDGE_RUNTIME_CODE = "export const runtime = 'edge';\n\n";

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

// Convert route paths to filesystem paths
const routeFilePaths = routesToFix.map(route => {
  // Convert route to directory path
  const routePath = route.replace(/^\//g, '').split('/');
  
  // Check if it's a dynamic route with parameters
  const dirPath = path.join(APP_DIR, ...routePath);
  
  // Return both the directory path and potential page.tsx/route.ts paths
  return {
    route,
    dirPath,
    pagePath: path.join(dirPath, 'page.tsx'),
    routePath: path.join(dirPath, 'route.ts')
  };
});

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function addEdgeRuntimeToFile(filePath) {
  try {
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    
    // Check if the runtime is already defined
    if (content.includes("export const runtime")) {
      console.log(`✅ Runtime already defined in ${filePath}`);
      return;
    }
    
    // Add the Edge Runtime at the beginning of the file
    const updatedContent = EDGE_RUNTIME_CODE + content;
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ Added Edge Runtime to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  console.log('🔍 Finding and updating dynamic routes with Edge Runtime...');
  
  for (const routeInfo of routeFilePaths) {
    console.log(`\n📂 Processing route: ${routeInfo.route}`);
    
    // Check for page.tsx
    if (await fileExists(routeInfo.pagePath)) {
      await addEdgeRuntimeToFile(routeInfo.pagePath);
    } else {
      console.log(`⚠️ No page.tsx found at ${routeInfo.pagePath}`);
    }
    
    // Check for route.ts
    if (await fileExists(routeInfo.routePath)) {
      await addEdgeRuntimeToFile(routeInfo.routePath);
    } else {
      // Try route.js if route.ts doesn't exist
      const routeJsPath = routeInfo.routePath.replace('.ts', '.js');
      if (await fileExists(routeJsPath)) {
        await addEdgeRuntimeToFile(routeJsPath);
      } else {
        console.log(`⚠️ No route handler found at ${routeInfo.routePath}`);
      }
    }
  }
  
  console.log('\n✨ Finished adding Edge Runtime to dynamic routes!');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
