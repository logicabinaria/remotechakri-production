"use client";

import Link from "next/link";
import Image from "next/image";
// import { Github, Linkedin, Twitter } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <Image 
                src={process.env.NEXT_PUBLIC_LOGO_DARK_URL || ''}
                alt="RemoteChakri.com"
                width={180}
                height={40}
                className="hidden dark:block"
              />
              <Image 
                src={process.env.NEXT_PUBLIC_LOGO_LIGHT_URL || ''}
                alt="RemoteChakri.com"
                width={180}
                height={40}
                className="block dark:hidden"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The premier platform for finding remote job opportunities worldwide. 
              Connect with top companies hiring remote talent.
            </p>
            {/* <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/jobs" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Job Categories
                </Link>
              </li>
              <li>
                <Link 
                  href="/locations" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Remote Locations
                </Link>
              </li>
              <li>
                <Link 
                  href="/job-types" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Job Types
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/tags" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Popular Tags
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-and-conditions" 
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} RemoteChakri.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
