// _worker.js - Cloudflare Pages Worker
export default {
  async fetch(request, env) {
    // Forward the request to the Next.js server
    return env.ASSETS.fetch(request);
  }
};
