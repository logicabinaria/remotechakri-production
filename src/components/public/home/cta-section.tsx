import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <section className="py-20 bg-gradient-to-br from-primary/20 via-primary/5 to-background dark:from-primary/10 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left column - Text content */}
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Join thousands of remote workers
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
              Ready to Find Your Next Remote Opportunity?
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Browse thousands of hand-picked remote jobs from top companies around the world.
            </p>
            
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
              <Button size="lg" className="group text-base font-medium px-8 py-6">
                Start Exploring Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Right column - Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Remote Jobs</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Companies</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Categories</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
