import { Metadata } from "next";
import { PublicLayout } from "@/components/public/layout/public-layout";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy | RemoteChakri",
  description: "Learn how RemoteChakri.com collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Card className="border border-border shadow-sm">
            <CardContent className="p-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
                
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    At RemoteChakri.com, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site or use our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We collect information that you provide directly to us when you:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Create an account or profile</li>
                    <li>Post job listings as an employer</li>
                    <li>Contact our customer support</li>
                    <li>Subscribe to our newsletters</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Personal Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    The personal information we collect may include:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Name, email address, and contact details</li>
                    <li>Professional information such as resume, work history, and skills</li>
                    <li>Account login credentials</li>
                    <li>Profile information and preferences</li>
                    <li>Payment information (for premium services)</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Automatically Collected Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    When you access our website, we may automatically collect certain information about your device and usage, including:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>IP address and device identifiers</li>
                    <li>Browser type and operating system</li>
                    <li>Pages you view and links you click</li>
                    <li>Time spent on our website and services</li>
                    <li>Referring website or application</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We use the information we collect for various purposes, including to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Communicate with you about our services, updates, and promotions</li>
                    <li>Personalize your experience and deliver relevant content</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Detect, prevent, and address technical issues and security breaches</li>
                    <li>Comply with legal obligations and enforce our terms of service</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Information Sharing and Disclosure</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li><strong>With Employers and Job Seekers:</strong> When you apply for a job or post a job listing, relevant information is shared between employers and job seekers.</li>
                    <li><strong>Service Providers:</strong> We may share information with third-party vendors who provide services on our behalf.</li>
                    <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                    <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    You have certain rights regarding your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Accessing, updating, or deleting your personal information</li>
                    <li>Opting out of marketing communications</li>
                    <li>Setting browser cookies preferences</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date and the updated version will be effective as soon as it is accessible.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    If you have questions or concerns about this Privacy Policy, please contact us at:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Email: privacy@remotechakri.com<br />
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
