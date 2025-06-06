import Script from "next/script";
import type { JobWithRelations } from "@/lib/supabase";

interface JobStructuredDataProps {
  job: JobWithRelations;
  baseUrl: string;
}

/**
 * Generates JSON-LD structured data for job postings
 * Following Google's guidelines: https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
export function JobStructuredData({ job, baseUrl }: JobStructuredDataProps) {
  // Format salary data if available
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    return {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "USD",
      ...(job.salary_min && { "minValue": job.salary_min }),
      ...(job.salary_max && { "maxValue": job.salary_max }),
      "unitText": job.salary_period || "YEAR"
    };
  };

  // Format employment type based on job type
  const getEmploymentType = () => {
    if (!job.job_type) return "FULL_TIME"; // Default
    
    const jobTypeName = job.job_type?.name?.toLowerCase() || "";
    
    if (jobTypeName.includes("full")) return "FULL_TIME";
    if (jobTypeName.includes("part")) return "PART_TIME";
    if (jobTypeName.includes("contract")) return "CONTRACTOR";
    if (jobTypeName.includes("temporary")) return "TEMPORARY";
    if (jobTypeName.includes("intern")) return "INTERN";
    
    return "FULL_TIME"; // Default fallback
  };

  // Build the structured data object
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.posted_at || new Date().toISOString(),
    "validThrough": job.expires_at || undefined,
    "employmentType": getEmploymentType(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name || "Company",
      "logo": job.company_logo_url || undefined,
      "sameAs": job.company_website || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location?.name || "Remote",
        "addressCountry": job.location?.country_code || "US"
      }
    },
    "applicantLocationRequirements": job.location?.name !== "Remote" ? undefined : {
      "@type": "Country",
      "name": "Anywhere"
    },
    "jobLocationType": job.location?.name === "Remote" ? "TELECOMMUTE" : undefined,
    "baseSalary": formatSalary(),
    "skills": job.tags?.map(tag => tag.name || "").filter(Boolean).join(", ") || undefined,
    "industry": job.category?.name || undefined,
    "url": `${baseUrl}/jobs/${job.slug}`
  };

  return (
    <Script id="job-structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
}
