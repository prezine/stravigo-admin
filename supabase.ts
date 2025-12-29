
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vzfwbaxcrxojvnmoqjqm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZndiYXhjcnhvanZubW9xanFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY5OTI5MywiZXhwIjoyMDgyMjc1MjkzfQ.rzO9pEeCFGniefJvHsIwwr-YkjnhGescemUXcKXEFxA';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit matching environment config

/**
 * Uploads a file to the 'stravigo-storage' bucket.
 * Includes validation for size and explicit content-type headers.
 */
export const uploadImage = async (file: File): Promise<{ url?: string; error?: string }> => {
  try {
    // 1. Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      return { error: `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 5MB.` };
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Upload with explicit contentType to handle webp and other formats
    const { error: uploadError } = await supabase.storage
      .from('stravigo-storage')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // Explicitly setting this helps with MIME type support
      });

    if (uploadError) {
      // Handle specific Supabase error messages for better UX
      let errorMessage = uploadError.message;
      if (errorMessage.includes('mime type')) {
        errorMessage = `The format "${file.type}" is restricted by the storage policy. Please use JPG or PNG, or enable this type in Supabase settings.`;
      } else if (errorMessage.includes('exceeded the maximum allowed size')) {
        errorMessage = "The file exceeds the storage bucket's limit. Please compress the image.";
      }
      return { error: errorMessage };
    }

    const { data } = supabase.storage
      .from('stravigo-storage')
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return { error: error.message || 'An unexpected error occurred during upload.' };
  }
};
