// Cloudflare Pages build configuration
module.exports = {
  // Configure build settings
  build: {
    command: 'npx @cloudflare/next-on-pages',
    environment: {
      NODE_VERSION: '18',
    },
  },
  
  // Configure deployment settings
  deploy: {
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
