import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches a signed URL for a nurse document from a protected bucket.
 * @param supabase Supabase client instance
 * @param nurseId Nurse ID
 * @param folder Document folder name
 * @returns Signed URL string or null
 */
export const getProtectedDocumentUrl = async (
  supabase: SupabaseClient,
  nurseId: number,
  folder: string
): Promise<string | null> => {
  const { data: files } = await supabase
    .storage
    .from('DearCare')
    .list(`Nurses/${folder}`, {
      limit: 1,
      search: nurseId.toString(),
    });

  if (files && files.length > 0) {
    const filePath = `Nurses/${folder}/${files[0].name}`;
    const { data, error } = await supabase
      .storage
      .from('DearCare')
      .createSignedUrl(filePath, 60 * 30);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }
  return null;
};