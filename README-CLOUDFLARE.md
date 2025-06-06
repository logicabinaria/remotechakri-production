# RemoteChakri.com - Cloudflare Pages Deployment Guide

This guide provides detailed instructions for deploying the RemoteChakri.com Next.js application to Cloudflare Pages.

## Quick Start

To deploy your RemoteChakri application to Cloudflare Pages, you can use the automated deployment script:

```bash
# Make sure you're logged in to Cloudflare
npx wrangler login

# Run the automated deployment script
npm run cloudflare:deploy
```

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build the application with Cloudflare Pages adapter
npm run pages:build
```

### 2. Deploy to Cloudflare Pages

```bash
# Deploy the built application
npm run pages:deploy
```

## Local Development

To test your application locally with Cloudflare Pages:

```bash
# Build the application
npm run pages:build

# Start a local development server
npm run pages:dev
```

## Configuration Files

The following configuration files are used for Cloudflare Pages deployment:

- `_worker.js`: Cloudflare Pages Worker using @cloudflare/next-on-pages adapter
- `_routes.json`: Specifies routing rules for Cloudflare Pages
- `wrangler.toml`: Cloudflare Workers configuration
- `cloudflare.toml`: Cloudflare Pages configuration
- `.env.production`: Production environment variables
- `next.config.mjs`: Next.js configuration with Cloudflare compatibility settings
- `pages.config.js`: Cloudflare Pages build and deployment configuration
- `build.mjs`: Custom build script for Cloudflare Pages
- `deploy-cloudflare.mjs`: Automated deployment script

## Environment Variables

Make sure to set the following environment variables in your Cloudflare Pages dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://hdgnnxzanpbpbrboifem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=debd5zncr
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=remotechakri
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-api-key
NEXT_PUBLIC_MAX_IMAGE_WIDTH=1200
NEXT_PUBLIC_MAX_IMAGE_HEIGHT=800
NEXT_PUBLIC_IMAGE_QUALITY=80
NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT=webp
NEXT_PUBLIC_CLOUDINARY_COMPANY_LOGOS_FOLDER=company_logos
NEXT_PUBLIC_CLOUDINARY_CATEGORY_ICONS_FOLDER=category_icons
NODE_VERSION=18
```

## Troubleshooting

For detailed troubleshooting information, refer to the [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) file.

Common issues:

1. **CSS Optimization Issues**: If you encounter "Cannot find module 'critters'" error, make sure `critters` is installed and CSS optimization is disabled in `next.config.mjs`.

2. **Image Optimization Issues**: Ensure `unoptimized: true` is set in your `next.config.mjs` file.

3. **Node.js Version**: Make sure you're using Node.js version 18 for compatibility with Cloudflare Pages.

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [@cloudflare/next-on-pages Documentation](https://github.com/cloudflare/next-on-pages)
