"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { preprocessTextForSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Label is not used in this component
import { Location } from "@/lib/supabase";
import { Edit, Trash2, Plus, Save } from "lucide-react";

export default function LocationsPage() {
  const supabase = useSupabase();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.name.trim()) return;

    try {
      // Preprocess the location name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(newLocation.name);
      
      // Get the slug from the database function
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'locations',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then insert the new location with the generated slug
      const { error } = await supabase
        .from('locations')
        .insert([{ 
          name: newLocation.name,
          slug: slugData
        }]);

      if (error) throw error;
      setNewLocation({ name: "" });
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleEditStart = (location: Location) => {
    setEditingId(location.id);
    setEditName(location.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;

    try {
      // Preprocess the location name to ensure proper spacing for slug generation
      const processedName = preprocessTextForSlug(editName);
      
      // Get the slug from the database function
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_slug', {
          input_text: processedName,
          table_name: 'locations',
          column_name: 'slug'
        });

      if (slugError) throw slugError;
      
      // Then update the location with the generated slug
      const { error } = await supabase
        .from('locations')
        .update({ 
          name: editName,
          slug: slugData 
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      // Soft delete by updating the deleted_at field
      const { error } = await supabase
        .from('locations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Locations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLocation} className="flex space-x-2">
            <div className="flex-1">
              <Input
                value={newLocation.name}
                onChange={(e) => setNewLocation({ name: e.target.value })}
                placeholder="Enter location name"
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
          <CardTitle>Manage Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="text-center py-4">No locations found. Add your first location!</div>
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
                  {locations.map((location) => (
                    <tr key={location.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        {editingId === location.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          <div className="font-medium">{location.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{location.slug}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {editingId === location.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSave(location.id)}
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
                              onClick={() => handleEditStart(location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(location.id)}
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
