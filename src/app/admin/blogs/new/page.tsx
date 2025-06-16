"use client";

import { BlogForm } from "../components/blog-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function NewBlogPage() {
  return (
    <div className="flex-col">
      <div className="flex items-center justify-between">
        <Heading
          title="Create Blog Post"
          description="Write a new blog post"
        />
      </div>
      <Separator className="my-4" />
      <BlogForm />
    </div>
  );
}
