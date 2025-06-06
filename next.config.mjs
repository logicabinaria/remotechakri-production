/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
};

export default nextConfig;
