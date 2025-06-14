"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Briefcase, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Use window.location.href for a full page navigation instead of client-side routing
      // This ensures the search parameter is properly passed and processed by the server
      window.location.href = `/jobs?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Over 500+ remote jobs available
          </div>
          
          {/* Main Heading with Gradient */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-primary dark:from-white dark:to-primary-light">
            Find Your Dream Remote Job
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            RemoteChakri.com connects talented professionals with the best remote opportunities worldwide.
          </p>
          
          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="flex w-full max-w-xl mx-auto mb-10 relative">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search jobs by title, skills or keywords..."
                className="pl-10 pr-4 h-12 text-base rounded-lg rounded-r-none border-r-0 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 rounded-l-none px-6 text-base font-medium"
            >
              Search
            </Button>
          </form>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
            <div className="flex items-center justify-center space-x-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Top Remote Companies</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Work From Anywhere</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Updated Daily</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mt-10">
            <Link href="/jobs">
              <Button 
                size="lg" 
                variant="outline" 
                className="group text-base font-medium px-8 py-6 border-primary/20 hover:border-primary transition-all"
              >
                Browse All Jobs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
