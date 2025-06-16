import { Metadata } from "next";
import { PublicLayout } from "@/components/public/layout/public-layout";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms and Conditions | RemoteChakri",
  description: "Read the terms and conditions for using the RemoteChakri.com platform.",
};

export default function TermsAndConditionsPage() {
  return (
    <PublicLayout>
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Card className="border border-border shadow-sm">
            <CardContent className="p-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Terms and Conditions</h1>
                
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Welcome to RemoteChakri.com. These Terms and Conditions govern your use of our website and services. By accessing or using RemoteChakri.com, you agree to be bound by these Terms and Conditions.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Please read these Terms and Conditions carefully before using our platform. If you do not agree with any part of these terms, you may not use our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Definitions</h2>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li><strong>&quot;Company&quot;</strong> refers to RemoteChakri.com, its owners, operators, and affiliates.</li>
                    <li><strong>&quot;Platform&quot;</strong> refers to the RemoteChakri.com website and all related services.</li>
                    <li><strong>&quot;User&quot;</strong> refers to any individual or entity that accesses or uses the Platform.</li>
                    <li><strong>&quot;Job Seeker&quot;</strong> refers to Users who use the Platform to search for and apply to jobs.</li>
                    <li><strong>&quot;Employer&quot;</strong> refers to Users who use the Platform to post job listings and recruit candidates.</li>
                    <li><strong>&quot;Content&quot;</strong> refers to any information, data, text, graphics, images, videos, or other materials submitted, posted, or displayed on the Platform.</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To access certain features of the Platform, you may be required to register for an account. When registering, you agree to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Keep your account credentials confidential</li>
                    <li>Be responsible for all activities that occur under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We reserve the right to suspend or terminate accounts that violate these Terms and Conditions or that have been inactive for an extended period.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">User Conduct</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    When using our Platform, you agree not to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others, including intellectual property rights</li>
                    <li>Post false, misleading, or fraudulent content</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Distribute malware or engage in any activity that could damage or impair the Platform</li>
                    <li>Attempt to gain unauthorized access to any part of the Platform</li>
                    <li>Use automated methods to scrape or extract data from the Platform</li>
                    <li>Interfere with the proper functioning of the Platform</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Job Listings and Applications</h2>
                  <h3 className="text-xl font-medium mb-3">For Employers</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    When posting job listings, Employers agree to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Provide accurate and complete information about the position</li>
                    <li>Have actual job opportunities available</li>
                    <li>Not discriminate against applicants based on protected characteristics</li>
                    <li>Comply with all applicable employment laws and regulations</li>
                    <li>Respect the privacy of Job Seekers and use their information only for recruitment purposes</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">For Job Seekers</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    When applying for jobs, Job Seekers agree to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Provide accurate information about their qualifications and experience</li>
                    <li>Apply only for positions they are genuinely interested in</li>
                    <li>Not misrepresent their skills, education, or employment history</li>
                    <li>Respect the confidentiality of any information provided by Employers</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    The Platform and its original content, features, and functionality are owned by RemoteChakri.com and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    By submitting Content to the Platform, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute the Content in connection with the Platform and our business operations.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To the maximum extent permitted by law, RemoteChakri.com shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Your use or inability to use the Platform</li>
                    <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                    <li>Any interruption or cessation of transmission to or from the Platform</li>
                    <li>Any bugs, viruses, or other harmful code that may be transmitted through the Platform</li>
                    <li>Any content or conduct of any third party on the Platform</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    The Platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. RemoteChakri.com expressly disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We do not guarantee that the Platform will be uninterrupted, secure, or error-free, or that defects will be corrected. We are not responsible for the accuracy, quality, or reliability of any content obtained through the Platform.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Modifications to Terms</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We reserve the right to modify or replace these Terms and Conditions at any time. The most current version will be posted on the Platform with the effective date. Your continued use of the Platform after any changes constitutes your acceptance of the new Terms and Conditions.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    These Terms and Conditions shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    If you have any questions about these Terms and Conditions, please contact us at:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Email: legal@remotechakri.com<br />
                    Address: Dhaka, Bangladesh
                  </p>
                </section>

                <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">
                  Last Updated: June 15, 2025
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
