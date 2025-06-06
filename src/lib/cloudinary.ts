/**
 * Cloudinary utilities for image uploads and transformations
 */

// Default Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
// Note: We're using unsigned uploads with a preset, so API key and secret aren't needed client-side

/**
 * Interface for upload response from Cloudinary
 */
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  created_at: string;
  bytes: number;
  folder: string;
  original_filename: string;
  [key: string]: string | number | boolean | object;
}

/**
 * Interface for upload options
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: string;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Upload an image to Cloudinary
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise with the upload response
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing');
  }

  // Create form data for the upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  // For unsigned uploads, we need to handle folders differently
  if (options.folder) {
    console.log('Using folder:', options.folder);
    
    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}`;
    
    // Include the folder in the public_id parameter
    // This is an alternative way to specify the folder that works with unsigned uploads
    formData.append('public_id', `${options.folder}/${fileName}`);
  }
  
  // Note: When using unsigned uploads with an upload preset, we can't include transformation parameters
  // directly in the request. Instead, configure these in the upload preset settings in Cloudinary dashboard.
  // Transformations like format, quality, and resizing should be defined in the upload preset.

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns The transformed image URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryUploadOptions = {}
): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary configuration is missing');
  }

  const transformations = [];
  
  // Format (webp by default for better compression)
  if (options.format) {
    transformations.push(`f_${options.format}`);
  } else {
    transformations.push('f_auto');
  }
  
  // Quality
  transformations.push(`q_${options.quality || 'auto'}`);
  
  // Resize if needed
  if (options.maxWidth || options.maxHeight) {
    const width = options.maxWidth ? `w_${options.maxWidth}` : '';
    const height = options.maxHeight ? `h_${options.maxHeight}` : '';
    const resize = [width, height].filter(Boolean).join(',');
    if (resize) {
      transformations.push(`c_limit,${resize}`);
    }
  }
  
  // Custom transformations
  if (options.transformation) {
    transformations.push(options.transformation);
  }
  
  const transformationString = transformations.join(',');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Create an image upload component
 * @param onUploadComplete - Callback when upload is complete
 * @param options - Upload options
 * @returns JSX element
 */
export function createImageUploader(
  onUploadComplete: (url: string) => void,
  options: CloudinaryUploadOptions = {}
) {
  return async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await uploadToCloudinary(file, options);
      onUploadComplete(result.secure_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    }
  };
}
