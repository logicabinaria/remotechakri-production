"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { preprocessTextForSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JobType } from "@/lib/supabase";
import { Edit, Trash2, Plus, Save } from "lucide-react";

export default function JobTypesPage() {
  const supabase = useSupabase();
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newJobType, setNewJobType] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchJobTypes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_types')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setJobTypes(data || []);
    } catch (error) {
      console.error('Error fetching job types:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchJobTypes();
  }, [fetchJobTypes]);

  const handleAddJobType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobType.name.trim()) return;

    try {
      // Preprocess the job type name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(newJobType.name);
      
      // Generate slug for the job type name
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'job_types',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then insert the new job type with the generated slug
      const { error } = await supabase
        .from('job_types')
        .insert([{ 
          name: newJobType.name,
          slug: slugData
        }]);

      if (error) throw error;
      setNewJobType({ name: "" });
      fetchJobTypes();
    } catch (error) {
      console.error('Error adding job type:', error);
    }
  };

  const handleEditStart = (jobType: JobType) => {
    setEditingId(jobType.id);
    setEditName(jobType.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;

    try {
      // Preprocess the job type name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(editName);
      
      // Get the slug from the database function
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'job_types',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then update the job type with the generated slug
      const { error } = await supabase
        .from('job_types')
        .update({ 
          name: editName,
          slug: slugData 
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchJobTypes();
    } catch (error) {
      console.error('Error updating job type:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job type?")) return;

    try {
      // Soft delete by updating the deleted_at field
      const { error } = await supabase
        .from('job_types')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchJobTypes();
    } catch (error) {
      console.error('Error deleting job type:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Types</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Job Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddJobType} className="flex space-x-2">
            <div className="flex-1">
              <Input
                value={newJobType.name}
                onChange={(e) => setNewJobType({ name: e.target.value })}
                placeholder="Enter job type name"
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
          <CardTitle>Manage Job Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading job types...</div>
          ) : jobTypes.length === 0 ? (
            <div className="text-center py-4">No job types found. Add your first job type!</div>
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
                  {jobTypes.map((jobType) => (
                    <tr key={jobType.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        {editingId === jobType.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          <div className="font-medium">{jobType.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{jobType.slug}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {editingId === jobType.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSave(jobType.id)}
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
                              onClick={() => handleEditStart(jobType)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(jobType.id)}
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
