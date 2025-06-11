"use client";

import { redirect } from "next/navigation";

export default function AnalyticsRedirectPage() {
  redirect("/admin/reports/analytics");
  
  // This code will never execute due to the redirect above
  return null;
}
