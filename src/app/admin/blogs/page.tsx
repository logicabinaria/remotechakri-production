"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { BlogList } from "./components/blog-list";
import { Heading } from "../../../components/ui/heading";
import { Separator } from "../../../components/ui/separator";

export default function BlogsPage() {
  const router = useRouter();
  
  return (
    <div className="flex-col">
      <div className="flex items-center justify-between">
        <Heading
          title="Blog Management"
          description="Create and manage blog posts for RemoteChakri.com"
        />
        <Button onClick={() => router.push("/admin/blogs/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator className="my-4" />
      <BlogList />
    </div>
  );
}
