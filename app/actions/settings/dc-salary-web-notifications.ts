"use server";

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { getOrgMappings } from '@/app/utils/org-utils';
import { logger } from '@/utils/logger';

export interface WebNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: JSON;
  created_at: string;
}

/**
 * Fetches all notifications from the dearcare_web_notifications table.
 *
 * @returns An object with:
 *   - success: true if fetch succeeded, false otherwise
 *   - notifications: array of WebNotification if successful
 *   - error: error message if failed
 */
export async function getAllNotifications(): Promise<{
  success: boolean;
  notifications?: WebNotification[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { nursesOrg } = getOrgMappings(organization);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data, error } = await supabase
      .from('dearcare_web_notifications')
      .select('*')
      .or(`organization.eq.${nursesOrg},organization.is.null`)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching notifications:', error);
      return { success: false, error: error.message };
    }

    return { success: true, notifications: data as WebNotification[] };
  } catch (error) {
    logger.error('Unexpected error fetching notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications'
    };
  }
}