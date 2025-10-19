"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNotifications } from "@/app/actions/settings/dc-salary-web-notifications";

export function useDcWebNotifications() {
  const queryClient = useQueryClient();

  const defaultOptions = {
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    throwOnError: false,
  };

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "web"],
    queryFn: getAllNotifications,
    ...defaultOptions,
  });

  const invalidateWebNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "web"] });
  };

  return {
    notificationsQuery,
    invalidateWebNotifications,
  };
}