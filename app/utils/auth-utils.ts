import { createSupabaseServerClient } from '@/app/actions/authentication/auth';

/**
 * Retrieves the authenticated Supabase client and user ID.
 * Throws an error if the user is not authenticated.
 *
 * @returns Promise<{ supabase: SupabaseClient<any>; userId: string }>
 * @throws Error if user is not authenticated
 */
export async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return { supabase, userId };
}