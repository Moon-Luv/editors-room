import { supabase } from './supabase';

/**
 * Uploads a file to a Supabase Storage bucket and returns the public URL.
 * 
 * @param bucket - The storage bucket name (e.g., 'projects', 'team', 'testimonials')
 * @param filePath - The path within the bucket (e.g., 'avatars/user-1.png')
 * @param file - The File object to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucket: string, filePath: string, file: File): Promise<string> {
  try {
    // 1. Upload the file
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true, // Overwrite if exists
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading file to ${bucket}:`, error);
    throw error;
  }
}

/**
 * Generates a unique file path for a file to avoid collisions.
 * 
 * @param fileName - The original file name
 * @param folder - Optional folder path
 * @returns A unique file path
 */
export function generateUniqueFilePath(fileName: string, folder: string = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  const uniqueName = `${baseName}_${timestamp}_${randomString}.${extension}`;
  return folder ? `${folder}/${uniqueName}` : uniqueName;
}

/**
 * Deletes a file from a Supabase Storage bucket.
 * 
 * @param bucket - The storage bucket name
 * @param filePath - The path within the bucket
 */
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting file from ${bucket}:`, error);
    throw error;
  }
}

/**
 * Extracts the file path from a Supabase public URL.
 * 
 * @param url - The public URL of the file
 * @param bucket - The bucket name
 * @returns The file path within the bucket, or null if it cannot be extracted
 */
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  if (!url) return null;
  
  // Supabase public URL format:
  // https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
  const searchString = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(searchString);
  
  if (index !== -1) {
    return url.substring(index + searchString.length);
  }
  
  return null;
}

/**
 * Returns an optimized image URL using Supabase's image transformation API.
 * 
 * @param url - The original public URL
 * @param options - Transformation options (width, height, quality, format)
 * @returns The optimized URL
 */
export function getOptimizedImageUrl(
  url: string, 
  options: { width?: number; height?: number; quality?: number; format?: 'webp' | 'avif' | 'origin' } = {}
): string {
  if (!url) return url;
  
  // Handle picsum.photos URLs
  if (url.includes('picsum.photos')) {
    const { width = 800, height = 800 } = options;
    // Picsum format: https://picsum.photos/seed/{seed}/{width}/{height}
    // or https://picsum.photos/{width}/{height}
    const parts = url.split('/');
    // Try to find if it has a seed
    const seedIndex = parts.indexOf('seed');
    if (seedIndex !== -1 && parts.length > seedIndex + 1) {
      const seed = parts[seedIndex + 1];
      return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }
    return `https://picsum.photos/${width}/${height}`;
  }

  // Only optimize Supabase storage URLs if transformation is explicitly enabled
  // Note: Supabase Image Transformation requires a Pro or Enterprise plan.
  // If you are on a Free plan, this will return a 404 or 403 error.
  const ENABLE_SUPABASE_OPTIMIZATION = false; // Set to true if you have a Pro/Enterprise plan

  if (!ENABLE_SUPABASE_OPTIMIZATION || !url.includes('.supabase.co/storage/v1/object/public/')) {
    return url;
  }

  const { width, height, quality = 80, format = 'webp' } = options;
  
  // Replace 'object/public' with 'render/image/public' for transformation API
  let optimizedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('format', format);
  
  return `${optimizedUrl}?${params.toString()}`;
}
