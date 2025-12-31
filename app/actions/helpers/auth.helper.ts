"use server";

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { getOrgMappings } from '@/app/utils/org-utils';

export async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!user.user_metadata?.role || user.user_metadata.role !== 'admin') {
    throw new Error("Access denied: Admin privileges required");
  }

  const web_user_id = user.user_metadata.user_id

  const organization = user?.user_metadata?.organization;

  const { nursesOrg, clientsOrg } = getOrgMappings(organization);

  return { supabase, userId: web_user_id, nursesOrg, clientsOrg };
}