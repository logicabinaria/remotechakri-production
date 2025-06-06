// Cloudflare Pages configuration for Next.js
module.exports = {
  // Configure build settings
  build: {
    // Use the standalone output format for Next.js
    command: 'npm run build',
    environment: {
      NODE_VERSION: '18',
    },
  },
  
  // Configure deployment settings
  deploy: {
    // Use the Cloudflare Pages adapter for Next.js
    adapter: '@cloudflare/next-on-pages',
    // Configure output directory
    outputDir: '.vercel/output/static',
  },
  
  // Configure routes
  routes: [
    // Serve static assets from the .next/static directory
    {
      pattern: '/_next/static/*',
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    // Handle all other routes with the Next.js application
    {
      pattern: '*',
      script: 'worker.js',
    },
  ],
};
