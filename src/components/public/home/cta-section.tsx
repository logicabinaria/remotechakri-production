import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { SectionContainer } from "@/components/ui/section-container";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CtaSection() {
  // Benefits of using RemoteChakri
  const benefits = [
    "Access to exclusive remote opportunities",
    "Connect with top remote-friendly companies",
    "Find jobs matching your skills and experience",
    "Work from anywhere in the world"
  ];

  return (
    <SectionContainer variant="gradient" size="xl" className="">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left column - Text content */}
        <div>
          <Badge variant="outline" className="mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Join thousands of remote workers
          </Badge>
          
          <Heading 
            title="Ready to Find Your Next Remote Opportunity?"
            description="Browse thousands of hand-picked remote jobs from top companies around the world."
            size="lg"
            align="left"
            className="mb-8"
          />
            
            {/* Benefits list */}
            <div className="space-y-3 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
            
            <Link href="/jobs">
              <Button variant="gradient" size="lg" className="group text-base font-medium px-8 py-6">
                Start Exploring Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Right column - Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">5,00+</div>
              <div className="text-gray-600 dark:text-gray-300">Remote Jobs</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-gray-600 dark:text-gray-300">Companies</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-gray-600 dark:text-gray-300">Categories</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-300">Free Access</div>
            </div>
          </div>
      </div>
    </SectionContainer>
  );
}
