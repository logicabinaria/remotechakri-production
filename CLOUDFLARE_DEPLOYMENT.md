# Deploying RemoteChakri to Cloudflare Pages

This guide provides step-by-step instructions for deploying the RemoteChakri Next.js application to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account
2. Git repository with your project code
3. Node.js version 18 (recommended)
4. Cloudflare Wrangler CLI (installed as a dev dependency)

## Local Development with Cloudflare Pages

Before deploying, you can test your application locally with Cloudflare Pages:

```bash
# Install dependencies if you haven't already
npm install

# Run the Cloudflare Pages build process
npm run pages:build

# Start a local development server
npm run pages:dev
```

## Deployment Options

### Option 1: Direct Deployment via Wrangler CLI

1. Make sure you're logged in to Cloudflare:
   ```bash
   npx wrangler login
   ```

2. Build and deploy your application:
   ```bash
   npm run pages:deploy
   ```

### Option 2: Cloudflare Dashboard Deployment

#### 1. Connect Your Repository to Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Navigate to **Pages** from the sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize Cloudflare to access your repository
6. Select the repository containing your RemoteChakri project
7. Click **Begin setup**

#### 2. Configure Build Settings

Enter the following build settings:

- **Project name**: `remotechakri` (or your preferred name)
- **Production branch**: `main` (or your main branch)
- **Framework preset**: Select `Next.js`
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/` (leave as default)

#### 3. Environment Variables

Add the following environment variables in the Cloudflare Pages dashboard:

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

**Important**: Replace `your-supabase-anon-key` and `your-cloudinary-api-key` with your actual keys. Never commit these keys to your repository.

#### 4. Advanced Settings

Under **Advanced settings**, set:

- **Node.js version**: 18
- **Compatibility flags**: Add `nodejs_compat`
- **Build system**: Set to "V2" if available

## Post-Deployment Configuration

### Custom Domain Setup (Optional)

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain name and follow the instructions

### Environment Variables for Different Environments

You can set different environment variables for production and preview environments:

1. Go to your project in Cloudflare Pages
2. Navigate to **Settings** > **Environment variables**
3. Use the dropdown to select the environment (Production or Preview)
4. Add or modify variables as needed

## Troubleshooting

### CSS Optimization Issues ("Cannot find module 'critters'")

If you encounter this error during build:

```
Error: Cannot find module 'critters'
```

This is related to Next.js CSS optimization. Fix it by:

1. Ensuring `critters` is installed as a dev dependency:
   ```bash
   npm install critters --save-dev
   ```

2. Disabling CSS optimization in `next.config.mjs`:
   ```javascript
   experimental: {
     optimizeCss: false,
     // other options...
   }
   ```

### Image Optimization Issues

If you encounter issues with Next.js Image Optimization:

1. Ensure `unoptimized: true` is set in your `next.config.mjs` file
2. Verify that Cloudinary URLs are correctly formatted

### API Routes Not Working

If API routes return 404 errors:

1. Check that `_worker.js` and `_routes.json` are properly configured
2. Verify that the Cloudflare Pages Functions are enabled

### Database Connection Issues

If you're having trouble connecting to Supabase:

1. Verify that environment variables are correctly set in Cloudflare Pages
2. Check Supabase access policies to ensure Cloudflare's IP ranges are allowed

### Build Failures with @cloudflare/next-on-pages

If the build fails with the Cloudflare adapter:

1. Make sure you're using Node.js version 18 (not higher)
2. Try running the build locally first with `npm run pages:build`
3. Check that all dependencies are properly installed

## Monitoring and Logs

After deployment, you can monitor your application:

1. Go to your project in Cloudflare Pages
2. Navigate to **Logs** to view build and deployment logs
3. Use **Analytics** to monitor traffic and performance

## Continuous Deployment

Cloudflare Pages automatically deploys when changes are pushed to your repository. You can configure:

1. Preview branches in **Settings** > **Builds & deployments**
2. Build hooks for triggering deployments from external systems

## Security Considerations

1. Store sensitive API keys as environment variables in Cloudflare Pages
2. Use Cloudflare Access to add authentication to your admin pages
3. Configure Cloudflare Web Application Firewall (WAF) rules for additional protection
