import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 bg-primary/10 dark:bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
            Ready to Find Your Next Remote Opportunity?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Browse thousands of hand-picked remote jobs from top companies around the world.
          </p>
          <Link href="/jobs">
            <Button size="lg">
              Start Exploring Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
