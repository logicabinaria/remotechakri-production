"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { preprocessTextForSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Label is not used in this component
import { Tag } from "@/lib/supabase";
import { Edit, Trash2, Plus, Save } from "lucide-react";

export default function TagsPage() {
  const supabase = useSupabase();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    try {
      // Preprocess the tag name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(newTag.name);
      
      // Get the slug from the database function
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'tags',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then insert the new tag with the generated slug
      const { error } = await supabase
        .from('tags')
        .insert([{ 
          name: newTag.name,
          slug: slugData
        }]);

      if (error) throw error;
      setNewTag({ name: "" });
      fetchTags();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleEditStart = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;

    try {
      // Preprocess the tag name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(editName);
      
      // Get the slug from the database function
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'tags',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then update the tag with the generated slug
      const { error } = await supabase
        .from('tags')
        .update({ 
          name: editName,
          slug: slugData 
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchTags();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      // Soft delete by updating the deleted_at field
      const { error } = await supabase
        .from('tags')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tags</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTag} className="flex space-x-2">
            <div className="flex-1">
              <Input
                value={newTag.name}
                onChange={(e) => setNewTag({ name: e.target.value })}
                placeholder="Enter tag name"
                required
              />
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="text-center py-4">No tags found. Add your first tag!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm dark:text-gray-200">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Slug</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        {editingId === tag.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          <div className="font-medium">{tag.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{tag.slug}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {editingId === tag.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSave(tag.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleEditCancel}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditStart(tag)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(tag.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
