import { Metadata } from "next";

// Type for dynamic metadata generation params
export interface DynamicMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

/**
 * Generate metadata for Next.js pages with SEO best practices
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  ogImage = "/og-image.jpg",
  canonical,
  noIndex = false,
}: SEOProps): Metadata {
  // Ensure title is not too long (Google typically displays 50-60 characters)
  const formattedTitle = title.length > 60 
    ? `${title.substring(0, 57)}...` 
    : title;
  
  // Ensure description is not too long (Google typically displays 155-160 characters)
  const formattedDescription = description.length > 160 
    ? `${description.substring(0, 157)}...` 
    : description;
    
  // Set metadataBase to fix the warning during build
  const metadataBase = new URL('https://remotechakri.com');
  
  // Base metadata
  const metadata: Metadata = {
    metadataBase,
    title: formattedTitle,
    description: formattedDescription,
    keywords: keywords.join(", "),
    openGraph: {
      title: formattedTitle,
      description: formattedDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: formattedTitle,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description: formattedDescription,
      images: [ogImage],
    },
  };

  // Add canonical URL if provided
  if (canonical) {
    metadata.alternates = {
      canonical: canonical,
    };
  }

  // Add robots meta tag if noIndex is true
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

/**
 * Generate dynamic metadata for Next.js pages with params
 * This is a separate function to avoid conflicts with Next.js built-in generateMetadata
 */
export function createDynamicMetadata(params: DynamicMetadataParams): Metadata {
  return generateMetadata({
    title: params.title,
    description: params.description,
    keywords: params.keywords || [],
    ogImage: params.ogImage,
    canonical: params.canonical,
    noIndex: params.noindex
  });
}
