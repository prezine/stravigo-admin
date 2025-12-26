
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vzfwbaxcrxojvnmoqjqm.supabase.co';
// Use the Service Role Key for the Admin Portal to bypass RLS policies
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZndiYXhjcnhvanZubW9xanFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY5OTI5MywiZXhwIjoyMDgyMjc1MjkzfQ.rzO9pEeCFGniefJvHsIwwr-YkjnhGescemUXcKXEFxA';

// Initialize the Supabase client with the service role key for administrative access
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false // Recommended for admin/server environments
  }
});

/**
 * Uploads a file to the 'stravigo-storage' bucket and returns the public URL.
 * Bypasses RLS by using the Service Role Key.
 */
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Ensure the bucket 'stravigo-storage' is created in your Supabase dashboard
    const { error: uploadError } = await supabase.storage
      .from('stravigo-storage')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('stravigo-storage')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
