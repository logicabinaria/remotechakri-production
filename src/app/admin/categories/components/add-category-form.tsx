"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface AddCategoryFormProps {
  onSubmit: (name: string, iconUrl: string) => Promise<void>;
}

export function AddCategoryForm({ onSubmit }: AddCategoryFormProps) {
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name, iconUrl);
      // Reset form after successful submission
      setName("");
      setIconUrl("");
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="icon_url">Category Icon (optional)</Label>
            <div className="mt-2">
              <ImageUpload
                value={iconUrl}
                onChange={setIconUrl}
                folder="category-icons"
                label="Upload Category Icon"
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
