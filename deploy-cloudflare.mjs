#!/usr/bin/env node

// Automated deployment script for Cloudflare Pages
import { execSync } from 'child_process';

// Execute a command and log output
function exec(command) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`Command failed: ${command}`);
    console.error(err);
    return false;
  }
}

// Main deployment function
async function deploy() {
  try {
    console.log('🚀 Starting RemoteChakri deployment to Cloudflare Pages...');
    
    // Step 1: Check if Node.js version is 18
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    if (!nodeVersion.startsWith('v18')) {
      console.warn('⚠️ Warning: Recommended Node.js version is 18. Current version:', nodeVersion);
      console.warn('You may encounter compatibility issues with Cloudflare Pages.');
      
      const proceed = await askQuestion('Do you want to proceed anyway? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Deployment canceled.');
        process.exit(0);
      }
    }
    
    // Step 2: Install dependencies
    console.log('📦 Installing dependencies...');
    if (!exec('npm install')) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
    
    // Step 3: Ensure critters is installed
    console.log('📦 Installing critters...');
    if (!exec('npm install critters --save-dev')) {
      console.error('❌ Failed to install critters');
      process.exit(1);
    }
    
    // Step 4: Build the project
    console.log('🏗️ Building project with Cloudflare Pages adapter...');
    if (!exec('npm run pages:build')) {
      console.error('❌ Build failed');
      process.exit(1);
    }
    
    // Step 5: Deploy to Cloudflare Pages
    console.log('🌩️ Deploying to Cloudflare Pages...');
    if (!exec('npx wrangler pages deploy .vercel/output/static')) {
      console.error('❌ Deployment failed');
      process.exit(1);
    }
    
    console.log('\n✅ Deployment completed successfully!');
    console.log('Visit your Cloudflare Pages dashboard to see your deployment.');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Run the deployment
deploy();
