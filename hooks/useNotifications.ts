"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getTodaysSalaryReminders } from "@/app/actions/settings/salary-notification"


export function useNotifications() {
  const queryClient = useQueryClient();

  const defaultOptions = {
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    throwOnError: false,
  };


  const todaysReminders = useQuery({
    queryKey: ["notifications", "salary", "reminders"],
    queryFn: getTodaysSalaryReminders,
    ...defaultOptions,
  });

  const invalidateNotifications = (type?: string) => {
    if (type) {
      queryClient.invalidateQueries({ queryKey: ["notifications", type] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  return {
    todaysReminders,
    
    invalidateNotifications,
    
    invalidateSalaryNotifications: () => invalidateNotifications("salary"),
  };
}