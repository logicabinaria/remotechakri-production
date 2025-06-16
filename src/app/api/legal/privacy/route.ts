import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Static HTML content for privacy policy
    const content = `
      <div class="max-w-3xl mx-auto">
        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
          <p class="mb-4">
            At RemoteChakri, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
          </p>
          <p class="mb-4">
            Please read this Privacy Policy carefully. By using our platform, you consent to the practices described in this policy.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p class="mb-4">We may collect the following types of information:</p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, resume, work history, and other information you provide when creating an account or applying for jobs.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and interactions.</li>
            <li><strong>Device Information:</strong> Browser type, IP address, device type, and operating system.</li>
            <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience and collect usage data.</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p class="mb-4">We use your information for the following purposes:</p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li>To provide and maintain our services</li>
            <li>To match job seekers with relevant job opportunities</li>
            <li>To communicate with you about our services</li>
            <li>To improve our website and user experience</li>
            <li>To analyze usage patterns and trends</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          <p class="mb-4">We may share your information with:</p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Employers:</strong> If you are a job seeker, we share your profile and application information with employers you apply to.</li>
            <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
          </ul>
          <p class="mb-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
          <p class="mb-4">You have the right to:</p>
          <ul class="list-disc pl-6 mb-4 space-y-2">
            <li>Access, update, or delete your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Disable cookies through your browser settings</li>
            <li>Request a copy of your data</li>
          </ul>
          <p class="mb-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Data Security</h2>
          <p class="mb-4">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p class="mb-4">
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date and the updated version will be effective as soon as it is accessible.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Contact Us</h2>
          <p class="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p class="font-medium">
            Email: privacy@remotechakri.com<br />
            Address: Dhaka, Bangladesh
          </p>
        </section>

        <div class="text-sm text-gray-500 text-center mt-12">
          Last Updated: June 15, 2025
        </div>
      </div>
    `;
    
    return NextResponse.json({ 
      content,
      success: true 
    });
  } catch (error) {
    console.error("Error serving privacy policy:", error);
    return NextResponse.json(
      { error: "Failed to load privacy policy", success: false },
      { status: 500 }
    );
  }
}
