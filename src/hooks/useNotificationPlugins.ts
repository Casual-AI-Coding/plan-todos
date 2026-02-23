"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationPlugins,
  createNotificationPlugin,
  updateNotificationPlugin,
  deleteNotificationPlugin,
  type NotificationPlugin,
} from "@/lib/api";

export function useNotificationPlugins() {
  return useQuery({
    queryKey: ["notificationPlugins"],
    queryFn: getNotificationPlugins,
  });
}

export function useCreateNotificationPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      plugin_type: string;
      config: string;
    }) => createNotificationPlugin(data.name, data.plugin_type, data.config),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notificationPlugins"],
      });
    },
  });
}

export function useUpdateNotificationPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      enabled: boolean;
      config: string;
    }) =>
      updateNotificationPlugin(
        data.id,
        data.name,
        data.enabled,
        data.config,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notificationPlugins"],
      });
    },
  });
}

export function useDeleteNotificationPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotificationPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notificationPlugins"],
      });
    },
  });
}
