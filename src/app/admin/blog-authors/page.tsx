"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Heading } from "../../../components/ui/heading";
import { Separator } from "../../../components/ui/separator";
import { AuthorList } from "./components";

export default function BlogAuthorsPage() {
  const router = useRouter();
  
  return (
    <div className="flex-col">
      <div className="flex items-center justify-between">
        <Heading
          title="Blog Authors"
          description="Manage authors for blog posts"
        />
        <Button onClick={() => router.push("/admin/blog-authors/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>
      <Separator className="my-4" />
      <AuthorList />
    </div>
  );
}
