"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobType, Category, Location, Tag, Job } from "@/lib/supabase";
import { preprocessTextForSlug, generateSlug } from "@/lib/utils";
import { LexicalEditor } from "@/components/ui/lexical-editor";

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
import { ImageUpload } from "@/components/ui/image-upload";

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    description: "",
    company_name: "",
    company_website: "",
    company_logo_url: "",
    location_id: "",
    job_type_id: "",
    category_id: "",
    salary_min: null,
    salary_max: null,
    salary_type: "Yearly", // Default to Yearly
    external_url: "",
    is_published: true,
    is_featured: false,
    expires_at: null,
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // Fetch job details
        const { data: job, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (!job) {
          router.push('/admin/jobs');
          return;
        }

        // Fetch job tags
        const { data: jobTags } = await supabase
          .from('job_tags')
          .select('tag_id')
          .eq('job_id', job.id);

        setSelectedTags((jobTags || []).map((jt: { tag_id: string }) => jt.tag_id));
        
        // Set form data
        setFormData({
          ...job,
          salary_min: job.salary_min || '',
          salary_max: job.salary_max || '',
        });
      } catch (error) {
        console.error('Error fetching job:', error);
        router.push('/admin/jobs');
      }
    };

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

    fetchJob();
    fetchMetadata();
  }, [supabase, params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSlugError(null);

    try {
      // Check if slug already exists (but not for this job)
      const { data: existingJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('slug', formData.slug)
        .neq('id', params.id) // Exclude current job
        .limit(1);

      if (existingJobs && existingJobs.length > 0) {
        setSlugError(`A job with the slug "${formData.slug}" already exists. Please modify the title or slug.`);
        setLoading(false);
        return;
      }
      // Preprocess the job title to ensure proper spacing for slug generation
      const processedTitle = preprocessTextForSlug(formData.title || '');
      
      if (!processedTitle) {
        throw new Error('Job title cannot be empty');
      }
      
      // We're now using the client-side generated slug from formData.slug
      // No need to generate the slug server-side anymore
      
      // Format the data - explicitly extract only the fields we want to update
      // This avoids issues with generated columns like search_vector
      const jobData = {
        title: formData.title,
        slug: formData.slug, // Use the client-side slug directly from formData
        description: formData.description,
        company_name: formData.company_name,
        company_website: formData.company_website,
        company_logo_url: formData.company_logo_url,
        location_id: formData.location_id,
        job_type_id: formData.job_type_id,
        category_id: formData.category_id,
        salary_min: formData.salary_min ? parseInt(String(formData.salary_min)) : null,
        salary_max: formData.salary_max ? parseInt(String(formData.salary_max)) : null,
        external_url: formData.external_url,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        expires_at: formData.expires_at,
        updated_at: new Date().toISOString(),
      };

      // Update the job
      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', params.id);

      if (error) throw error;

      // Delete existing job tags
      await supabase
        .from('job_tags')
        .delete()
        .eq('job_id', params.id);

      // Insert new job tags
      if (selectedTags.length > 0) {
        const jobTagsData = selectedTags.map((tagId) => ({
          job_id: params.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('job_tags')
          .insert(jobTagsData);

        if (tagsError) throw tagsError;
      }

      router.push('/admin/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Job</h1>
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
                    value={formData.slug || ''}
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
                        slug: generateSlug(preprocessTextForSlug(formData.title || ''))
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
                  <LexicalEditor
                    value={formData.description || ''}
                    onChange={(html) => setFormData({ ...formData, description: html })}
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
                    value={formData.company_website || ''}
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
                      value={formData.company_logo_url || ''}
                      onChange={handleChange}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Option 2: Upload Logo</Label>
                    <div className="mt-1">
                      <ImageUpload
                        value={formData.company_logo_url || ''}
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
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="job_type_id">Job Type</Label>
                  <select
                    id="job_type_id"
                    name="job_type_id"
                    value={formData.job_type_id || ''}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select Job Type</option>
                    {jobTypes.map((jobType) => (
                      <option key={jobType.id} value={jobType.id}>
                        {jobType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="location_id">Location</Label>
                  <select
                    id="location_id"
                    name="location_id"
                    value={formData.location_id || ''}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary</Label>
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min || ''}
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
                    value={formData.salary_max || ''}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_type">Salary Type</Label>
                  <select
                    id="salary_type"
                    name="salary_type"
                    value={formData.salary_type || 'Yearly'}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 text-gray-800"
                      } cursor-pointer`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagChange(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_published" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Published
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Featured
                </Label>
              </div>
              
              <div>
                <Label htmlFor="expires_at">Expiry Date</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  value={formData.expires_at ? new Date(formData.expires_at).toISOString().split('T')[0] : ''}
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
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
