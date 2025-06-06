// _worker.js - Cloudflare Pages Worker for Next.js
import { next } from '@cloudflare/next-on-pages';

// Export a default object containing a fetch handler
export default next({
  // Optional: Configure caching
  experimental: {
    skipMiddlewareUrlNormalize: true,
    optimizeServerReact: true,
  },
});

// Catch errors
export const onError = ({ error }) => {
  console.error('Worker error:', error);
  return new Response('Server Error', { status: 500 });
};
