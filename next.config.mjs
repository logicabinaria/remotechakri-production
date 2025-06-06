/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Cloudflare Pages compatibility
  output: 'standalone',
  
  // Disable CSS optimization to avoid critters dependency issues
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Image configuration
  images: {
    // Keep specific domains for backward compatibility
    domains: [
      // Allow Cloudinary domains
      'res.cloudinary.com',
      'cloudinary.com',
      
      // Keep any existing domains
      'placehold.co',
      'placekitten.com',
      'picsum.photos'
    ],
    
    // Allow images from any domain with remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Set unoptimized to true for Cloudflare Pages compatibility
    unoptimized: true,
  },
  
  // Ensure compatibility with Cloudflare Pages
  webpack: (config, { isServer }) => {
    // Avoid WebSocket-related issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
