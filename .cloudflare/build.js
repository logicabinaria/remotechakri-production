// Custom build script for Cloudflare Pages
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Execute a command and log output
function exec(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

// Main build function
async function build() {
  try {
    console.log('Starting build process for Cloudflare Pages...');
    
    // Install dependencies
    console.log('Installing dependencies...');
    exec('npm ci');
    
    // Build Next.js app
    console.log('Building Next.js application...');
    exec('npm run build');
    
    // Run Cloudflare Pages adapter
    console.log('Running Cloudflare Pages adapter...');
    exec('npx @cloudflare/next-on-pages');
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
