"use client";

import React from "react";
import { Category } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ categories, loading, onEdit, onDelete }: CategoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4">No categories found. Add your first category!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm dark:text-gray-200">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Slug</th>
                  <th className="text-left py-3 px-4">Icon</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="font-medium">{category.name}</div>
                    </td>
                    <td className="py-3 px-4">{category.slug}</td>
                    <td className="py-3 px-4">
                      <div>
                        {category.icon_url ? (
                          <Image 
                            src={category.icon_url} 
                            alt={`${category.name} icon`} 
                            width={24}
                            height={24}
                            className="h-6 w-6" 
                          />
                        ) : (
                          <span className="text-gray-400">No icon</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this category?")) {
                            onDelete(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
