// Middleware for Cloudflare Pages compatibility
export const runtime = 'edge';

export default function middleware() {
  // This middleware doesn't modify the request
  // It's only here to ensure the Edge Runtime is used for all routes
  return;
}

// Configure the middleware to run on all routes
export const config = {
  matcher: [
    // Match all routes except for static files and API routes that already have Edge Runtime
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
