"use server";

import { createSupabaseServerClient } from "@/app/actions/authentication/auth";
import { logger } from "@/utils/logger";

export interface SalaryNotificationInput {
  initial_date: string; // ISO date string, e.g. "2025-08-14"
  salary_interval_days: number;
  notification_days: number[];
  is_active?: boolean;
}

export async function saveSalaryNotification(
  input: SalaryNotificationInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("salary_notifications")
      .upsert(
        [{
          user_id: userId,
          initial_date: input.initial_date,
          salary_interval_days: input.salary_interval_days,
          notification_days: input.notification_days,
          is_active: input.is_active ?? true,
        }],
        { onConflict: "user_id" }
      );

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    logger.error("Error saving salary notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}