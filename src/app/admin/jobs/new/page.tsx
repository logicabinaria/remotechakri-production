"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { preprocessTextForSlug, generateSlug } from "@/lib/utils";
import { TagSelector } from "@/components/ui/tag-selector";
import { ImageUpload } from "@/components/ui/image-upload";
import { Combobox } from "@/components/ui/combobox";
import { JobType, Category, Location, Tag } from "@/lib/supabase";

// Simple inline Alert component to avoid module resolution issues
const Alert = ({ children, variant = "default", className = "", ...props }: {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
  [key: string]: React.HTMLAttributes<HTMLDivElement>[keyof React.HTMLAttributes<HTMLDivElement>];
}) => {
  const variantClasses = {
    default: "bg-blue-50 text-blue-800 border-blue-200",
    destructive: "bg-red-50 text-red-800 border-red-200"
  };

  return (
    <div
      className={`border rounded-md p-4 ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = "", ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: React.HTMLAttributes<HTMLDivElement>[keyof React.HTMLAttributes<HTMLDivElement>];
}) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "", // Will store HTML content from rich text editor
    company_name: "",
    company_website: "",
    company_logo_url: "",
    location_id: "",
    job_type_id: "",
    category_id: "",
    salary_min: "",
    salary_max: "",
    salary_type: "Yearly", // Default to Yearly
    external_url: "",
    is_published: true,
    is_featured: false,
    expires_at: "", // Default empty, will be set to 30 days from now
  });

  useEffect(() => {
    // Set default expiry date to 30 days from now
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      expires_at: defaultExpiry.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }));
    
    const fetchMetadata = async () => {
      try {
        // Fetch job types
        const { data: jobTypesData } = await supabase
          .from('job_types')
          .select('*')
          .is('deleted_at', null)
          .order('name');
        
        setJobTypes(jobTypesData || []);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .is('deleted_at', null)
          .order('name');
        
        setCategories(categoriesData || []);

        // Fetch locations
        const { data: locationsData } = await supabase
          .from('locations')
          .select('*')
          .is('deleted_at', null)
          .order('name');
        
        setLocations(locationsData || []);

        // Fetch tags
        const { data: tagsData } = await supabase
          .from('tags')
          .select('*')
          .is('deleted_at', null)
          .order('name');
        
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRichTextChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Tag selection is now handled by the TagSelector component

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSlugError(null);

    try {
      // Check if slug already exists
      const { data: existingJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('slug', formData.slug)
        .limit(1);

      if (existingJobs && existingJobs.length > 0) {
        setSlugError(`A job with the slug "${formData.slug}" already exists. Please modify the title or slug.`);
        setLoading(false);
        return;
      }
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // We're now using the client-side generated slug from formData.slug
      // No need to generate the slug server-side anymore

      // Set default expiry date to 30 days from now if not provided
      let expiryDate = formData.expires_at;
      if (!expiryDate) {
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 30); // 30 days from now
        expiryDate = defaultExpiry.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
      
      // Format the data
      const jobData = {
        ...formData,
        // Use the client-side slug directly from formData
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        expires_at: expiryDate,
        posted_by: user.id,
      };

      // Insert the job
      const { data: job, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      // Insert job tags
      if (selectedTags.length > 0) {
        const jobTagsData = selectedTags.map((tagId) => ({
          job_id: job.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('job_tags')
          .insert(jobTagsData);

        if (tagsError) throw tagsError;
      }

      router.push('/admin/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Job</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const newSlug = generateSlug(preprocessTextForSlug(newTitle));
                    setFormData({
                      ...formData,
                      title: newTitle,
                      slug: newSlug
                    });
                  }}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        slug: e.target.value
                      });
                      setSlugError(null);
                    }}
                    className={`flex-1 ${slugError ? 'border-red-500' : ''}`}
                    placeholder="job-title-slug"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        slug: generateSlug(preprocessTextForSlug(formData.title))
                      });
                      setSlugError(null);
                    }}
                  >
                    Regenerate
                  </Button>
                </div>
                {slugError ? (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{slugError}</AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">This will be used in the job URL. Edit if needed.</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.description}
                    onChange={handleRichTextChange}
                    className="min-h-[200px]"
                    placeholder="Describe the job position, requirements, benefits, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company_website">Company Website</Label>
                  <Input
                    id="company_website"
                    name="company_website"
                    value={formData.company_website}
                    onChange={handleChange}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company_logo_url">Company Logo</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company_logo_url" className="text-sm text-gray-500">Option 1: Enter Logo URL</Label>
                    <Input
                      id="company_logo_url"
                      name="company_logo_url"
                      value={formData.company_logo_url}
                      onChange={handleChange}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Option 2: Upload Logo</Label>
                    <div className="mt-1">
                      <ImageUpload
                        value={formData.company_logo_url}
                        onChange={(url) => setFormData({ ...formData, company_logo_url: url })}
                        folder="company-logos"
                        maxWidth={400}
                        maxHeight={400}
                        label="Upload Company Logo"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Note: If both options are provided, the URL will take precedence.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <div className="mt-1">
                    <Combobox
                      items={categories.map(category => ({ value: category.id, label: category.name }))}
                      value={formData.category_id}
                      onChange={(value: string) => setFormData(prev => ({ ...prev, category_id: value }))}
                      placeholder="Select Category"
                      emptyMessage="No categories found"
                      createNew={async (name: string) => {
                        try {
                          const slug = name.toLowerCase().replace(/\s+/g, '-');
                          const { data, error } = await supabase
                            .from('categories')
                            .insert([{ name, slug }])
                            .select()
                            .single();
                          
                          if (error) throw error;
                          
                          // Add the new category to the list
                          setCategories(prev => [...prev, data]);
                          return data.id;
                        } catch (error) {
                          console.error('Error creating category:', error);
                          throw error;
                        }
                      }}
                      createNewPlaceholder="Create category"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="job_type_id">Job Type</Label>
                  <div className="mt-1">
                    <Combobox
                      items={jobTypes.map(jobType => ({ value: jobType.id, label: jobType.name }))}
                      value={formData.job_type_id}
                      onChange={(value: string) => setFormData(prev => ({ ...prev, job_type_id: value }))}
                      placeholder="Select Job Type"
                      emptyMessage="No job types found"
                      createNew={async (name: string) => {
                        try {
                          const slug = name.toLowerCase().replace(/\s+/g, '-');
                          const { data, error } = await supabase
                            .from('job_types')
                            .insert([{ name, slug }])
                            .select()
                            .single();
                          
                          if (error) throw error;
                          
                          // Add the new job type to the list
                          setJobTypes(prev => [...prev, data]);
                          return data.id;
                        } catch (error) {
                          console.error('Error creating job type:', error);
                          throw error;
                        }
                      }}
                      createNewPlaceholder="Create job type"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location_id">Location</Label>
                  <div className="mt-1">
                    <Combobox
                      items={locations.map(location => ({ value: location.id, label: location.name }))}
                      value={formData.location_id}
                      onChange={(value: string) => setFormData(prev => ({ ...prev, location_id: value }))}
                      placeholder="Select Location"
                      emptyMessage="No locations found"
                      createNew={async (name: string) => {
                        try {
                          const slug = name.toLowerCase().replace(/\s+/g, '-');
                          const { data, error } = await supabase
                            .from('locations')
                            .insert([{ name, slug }])
                            .select()
                            .single();
                          
                          if (error) throw error;
                          
                          // Add the new location to the list
                          setLocations(prev => [...prev, data]);
                          return data.id;
                        } catch (error) {
                          console.error('Error creating location:', error);
                          throw error;
                        }
                      }}
                      createNewPlaceholder="Create location"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary</Label>
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_max">Maximum Salary</Label>
                  <Input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_type">Salary Type</Label>
                  <select
                    id="salary_type"
                    name="salary_type"
                    value={formData.salary_type}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Yearly">Yearly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="external_url">Application URL</Label>
                <Input
                  id="external_url"
                  name="external_url"
                  value={formData.external_url}
                  onChange={handleChange}
                  placeholder="https://"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <TagSelector
                  tags={tags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  createNew={async (name) => {
                    try {
                      const slug = name.toLowerCase().replace(/\s+/g, '-');
                      const { data, error } = await supabase
                        .from('tags')
                        .insert([{ name, slug }])
                        .select()
                        .single();
                      
                      if (error) throw error;
                      
                      // Add the new tag to the list
                      setTags(prev => [...prev, data]);
                      return data;
                    } catch (error) {
                      console.error('Error creating tag:', error);
                      throw error;
                    }
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_published" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Publish immediately
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Feature this job
                </Label>
              </div>
              
              <div>
                <Label htmlFor="expires_at">Expiry Date</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Job will be automatically hidden after this date</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/jobs')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
