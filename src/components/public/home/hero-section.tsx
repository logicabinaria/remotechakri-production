import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 py-16 md:py-24">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 dark:text-white">
            Find Your Dream Remote Job
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            RemoteChakri.com connects talented professionals with the best remote opportunities worldwide.
          </p>
          
          <div className="flex justify-center mb-12">
            <Link href="/jobs">
              <Button size="lg" className="text-lg px-8 py-6">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
