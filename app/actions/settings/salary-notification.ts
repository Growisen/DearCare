"use server";

import { createSupabaseServerClient } from "@/app/actions/authentication/auth";
import { logger } from "@/utils/logger";

export interface SalaryNotificationInput {
  title: string;
  initial_date: string;
  salary_interval_days: number;
  notification_days: number[];
  is_active: boolean;
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
      .from("scheduled_notifications")
      .upsert(
        [{
          user_id: userId,
          title: input.title,
          start_date: input.initial_date,
          interval_days: input.salary_interval_days,
          notify_before_days: input.notification_days,
          is_active: input.is_active,
        }],
      );

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    logger.error("Error saving scheduled notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleSalaryNotificationStatus(
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("scheduled_notifications")
      .update({ is_active: isActive })
      .eq("user_id", userId)
      .eq("title", "salary_notification");

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    logger.error("Error toggling salary notification status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


export async function getCurrentSalaryNotification(): Promise<{
  success: boolean;
  notification?: {
    id: string;
    title: string;
    start_date: string;
    interval_days: number;
    notify_before_days: number;
    is_active: boolean;
  };
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("scheduled_notifications")
      .select("id, title, start_date, interval_days, notify_before_days, is_active")
      .eq("user_id", userId)
      .eq("title", "salary_notification")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      notification: data || undefined,
    };
  } catch (error) {
    logger.error("Error fetching current salary notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


export async function getTodaysSalaryReminders(): Promise<{
  success: boolean;
  reminders?: Array<{
    id: string;
    title: string;
    start_date: string;
    interval_days: number;
    notify_before_days: number;
    next_reminder_date: string;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');

    const { data: notifications, error } = await supabase
      .from("scheduled_notifications")
      .select("id, title, start_date, interval_days, notify_before_days")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error('Database query error:', error);
      throw new Error(error.message);
    }

    if (!notifications || notifications.length === 0) {
      return { success: true, reminders: [] };
    }

    const todaysReminders = notifications.flatMap((notification) => {
      
      const startDate = new Date(notification.start_date);
      const todayDate = new Date(todayString);

      startDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);

      const daysSinceStart = Math.floor(
        (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      
      if (daysSinceStart < 0) {
        return [];
      }

      let notifyBeforeDaysArr: number[];
      if (Array.isArray(notification.notify_before_days)) {
        notifyBeforeDaysArr = notification.notify_before_days;
      } else if (typeof notification.notify_before_days === 'string') {
        try {
          const parsed = JSON.parse(notification.notify_before_days);
          notifyBeforeDaysArr = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          notifyBeforeDaysArr = [parseInt(notification.notify_before_days) || 0];
        }
      } else {
        notifyBeforeDaysArr = [notification.notify_before_days || 0];
      }

      const validReminders = [];
      
      const currentCycle = Math.floor(daysSinceStart / notification.interval_days);
      
      for (let cycle = currentCycle; cycle <= currentCycle + 1; cycle++) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(startDate.getDate() + cycle * notification.interval_days);
        scheduledDate.setHours(0, 0, 0, 0);

        for (const beforeDays of notifyBeforeDaysArr) {
          const reminderDate = new Date(scheduledDate);
          reminderDate.setDate(reminderDate.getDate() - beforeDays);
          reminderDate.setHours(0, 0, 0, 0);
          
          if (todayDate.getTime() === reminderDate.getTime()) {
            const reminder = {
              id: notification.id,
              title: notification.title,
              start_date: notification.start_date,
              interval_days: notification.interval_days,
              notify_before_days: beforeDays,
              next_reminder_date: scheduledDate.toISOString().split("T")[0],
            };
            validReminders.push(reminder);
          } else {
            console.log(`      ✗ No match`);
          }
        }
      }
      return validReminders;
    });

    return {
      success: true,
      reminders: todaysReminders as Array<{
        id: string;
        title: string;
        start_date: string;
        interval_days: number;
        notify_before_days: number;
        next_reminder_date: string;
      }>,
    };
  } catch (error) {
    console.error("Error fetching today's reminders:", error);
    logger?.error?.("Error fetching today's reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}