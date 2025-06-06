"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Category } from "@/lib/supabase";

interface EditCategoryFormProps {
  category: Category | null;
  onSubmit: (id: string, name: string, iconUrl: string, originalName: string) => Promise<void>;
  onCancel: () => void;
}

export function EditCategoryForm({ category, onSubmit, onCancel }: EditCategoryFormProps) {
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setIconUrl(category.icon_url || "");
      setOriginalName(category.name);
    } else {
      setName("");
      setIconUrl("");
      setOriginalName("");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(category.id, name, iconUrl, originalName);
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Category: {originalName}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Category Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="edit-icon">Category Icon</Label>
            <div className="mt-2">
              <ImageUpload
                value={iconUrl}
                onChange={setIconUrl}
                folder="category-icons"
                label="Update Category Icon"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
