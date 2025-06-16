"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Input } from "./input";
import { uploadToCloudinary, CloudinaryUploadOptions } from "@/lib/cloudinary";
import { Loader2, X, Link, ImagePlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  label?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  className = "",
  label = "Upload Image",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setIsUploading(true);
    setError(null);

    try {
      // Get image format settings from environment variables
      const imageQuality = Number(process.env.NEXT_PUBLIC_IMAGE_QUALITY || 80);
      const imageFormat = process.env.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT || 'webp';
      const maxWidth = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_WIDTH || 1200);
      const maxHeight = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_HEIGHT || 800);
      
      // Convert image to WebP format on the client side
      let fileToUpload = file;
      
      // Only convert if the file is an image and not already in WebP format
      if (file.type.startsWith('image/') && !file.type.includes('webp') && imageFormat === 'webp') {
        try {
          // Create a canvas element to convert the image
          const img = new window.Image() as HTMLImageElement;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Create a promise to handle the image loading
          fileToUpload = await new Promise<File>((resolve) => {
            img.onload = () => {
              // Calculate dimensions while maintaining aspect ratio
              let width = img.width;
              let height = img.height;
              
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
              
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
              
              // Set canvas dimensions
              canvas.width = width;
              canvas.height = height;
              
              // Draw image on canvas
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to WebP
                canvas.toBlob((blob) => {
                  if (blob) {
                    // Create a new file with WebP type
                    const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
                      type: 'image/webp',
                    });
                    resolve(webpFile);
                  } else {
                    // If conversion fails, use original file
                    resolve(file);
                  }
                }, 'image/webp', imageQuality / 100);
              } else {
                // If canvas context is not available, use original file
                resolve(file);
              }
            };
            
            img.onerror = () => {
              // If image loading fails, use original file
              resolve(file);
            };
            
            // Load the image from file
            img.src = URL.createObjectURL(file);
          });
        } catch (conversionError) {
          console.error('Error converting image to WebP:', conversionError);
          // If conversion fails, use original file
          fileToUpload = file;
        }
      }
      
      // Map folder names to environment variables
      let folderPath = folder;
      
      // Use environment variables for specific folders if available
      if (folder === 'company-logos') {
        folderPath = process.env.NEXT_PUBLIC_CLOUDINARY_COMPANY_LOGOS_FOLDER || 'company_logos';
      } else if (folder === 'category-icons') {
        folderPath = process.env.NEXT_PUBLIC_CLOUDINARY_CATEGORY_ICONS_FOLDER || 'category_icons';
      }
      
      console.log('Environment folder path:', folderPath);
      console.log('Environment variables:', {
        COMPANY_LOGOS: process.env.NEXT_PUBLIC_CLOUDINARY_COMPANY_LOGOS_FOLDER,
        CATEGORY_ICONS: process.env.NEXT_PUBLIC_CLOUDINARY_CATEGORY_ICONS_FOLDER
      });
      
      // Configure upload options - only use folder since we're handling transformations client-side
      const options: CloudinaryUploadOptions = {
        folder: folderPath
      };

      // Upload to Cloudinary
      const result = await uploadToCloudinary(fileToUpload, options);
      
      // Call onChange with the secure URL
      onChange(result.secure_url);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      // Display a more specific error message if available
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image. Please try again.";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const [directUrl, setDirectUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");

  const handleUrlSubmit = () => {
    if (directUrl) {
      onChange(directUrl);
      setDirectUrl("");
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative border rounded-md overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-6">
          <Tabs 
            defaultValue="upload" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "upload" | "url")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Direct URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="flex flex-col items-center justify-center">
              <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isUploading}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Select File"
                  )}
                </Button>
              </div>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-gray-500 mb-2">Enter image URL</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    onClick={handleUrlSubmit}
                    disabled={!directUrl}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
