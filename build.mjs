#!/usr/bin/env node

// Custom build script for Cloudflare Pages deployment
import { execSync } from 'child_process';

// Execute a command and log output
function exec(command) {
  console.log(`> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${command}`);
    console.error(err);
    process.exit(1);
  }
}

// Main build function
async function build() {
  try {
    console.log('Starting build process for Cloudflare Pages...');
    
    // Install dependencies (including critters)
    console.log('Installing dependencies...');
    exec('npm install critters --save-dev');
    
    // Apply Edge Runtime fix to all dynamic routes
    console.log('Applying Edge Runtime fix to dynamic routes...');
    exec('node edge-runtime-fix.mjs');
    
    // Build Next.js app with Cloudflare adapter
    console.log('Building Next.js application with Cloudflare adapter...');
    exec('npx @cloudflare/next-on-pages');
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
