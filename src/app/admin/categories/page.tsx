"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { preprocessTextForSlug } from "@/lib/utils";
import { Category } from "@/lib/supabase";
import { CategoryList } from "./components/category-list";
import { AddCategoryForm } from "./components/add-category-form";
import { EditCategoryForm } from "./components/edit-category-form";

export default function CategoriesPage() {
  const supabase = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (name: string, iconUrl: string) => {
    try {
      // Preprocess the category name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(name);
      
      // Get the slug from the database function
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'categories',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then insert the new category with the generated slug
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: name,
          slug: slugData,
          icon_url: iconUrl || null
        }]);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const handleEditCategory = async (id: string, name: string, iconUrl: string, originalName: string) => {
    try {
      // Check if the name has changed
      const nameChanged = name !== originalName;
      let slugToUse;
      
      // Only generate a new slug if the name has changed
      if (nameChanged) {
        // Preprocess the category name to ensure proper spacing for slug generation
        const processedName = preprocessTextForSlug(name);
        
        // Get the slug from the database function
        const { data: slugData, error: slugError } = await supabase
          .rpc('generate_slug', {
            input_text: processedName,
            table_name: 'categories',
            column_name: 'slug'
          });

        if (slugError) throw slugError;
        slugToUse = slugData;
        
        // Update the category with a new slug
        const { error } = await supabase
          .from('categories')
          .update({ 
            name: name,
            slug: slugToUse,
            icon_url: iconUrl || null
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Only update name and icon_url, preserve the existing slug
        const { error } = await supabase
          .from('categories')
          .update({ 
            name: name,
            icon_url: iconUrl || null
          })
          .eq('id', id);

        if (error) throw error;
      }
      
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      // Soft delete by updating the deleted_at field
      const { error } = await supabase
        .from('categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
      </div>

      {selectedCategory ? (
        <EditCategoryForm 
          category={selectedCategory} 
          onSubmit={handleEditCategory}
          onCancel={() => setSelectedCategory(null)}
        />
      ) : (
        <AddCategoryForm onSubmit={handleAddCategory} />
      )}

      <CategoryList 
        categories={categories} 
        loading={loading} 
        onEdit={setSelectedCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
}