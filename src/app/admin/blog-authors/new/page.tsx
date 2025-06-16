"use client";

import { AuthorForm } from "../components/author-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function NewAuthorPage() {
  return (
    <div className="flex-col">
      <div className="flex items-center justify-between">
        <Heading
          title="Add New Author"
          description="Create a new blog author"
        />
      </div>
      <Separator className="my-4" />
      <AuthorForm />
    </div>
  );
}
