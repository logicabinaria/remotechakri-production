import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Admin Login - RemoteChakri.com',
  description: 'Login to access the RemoteChakri.com admin dashboard',
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
