import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { GoogleDriveStatus, DriveFile } from "@/lib/api/googleDrive";
import {
  getGoogleDriveAuthUrl,
  exchangeGoogleDriveCode,
  getGoogleDriveStatus,
  googleDriveDisconnect,
  googleDriveSync,
  googleDriveRestore,
  googleDriveListBackups,
} from "@/lib/api/googleDrive";

// Query Keys
export const googleDriveQueryKeys = {
  status: ["googleDrive", "status"] as const,
  backups: ["googleDrive", "backups"] as const,
};

// ============================================================================
// Status Hooks
// ============================================================================

/**
 * Get Google Drive connection status
 */
export function useGoogleDriveStatus(
  options?: Omit<
    UseQueryOptions<GoogleDriveStatus, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<GoogleDriveStatus, Error>({
    queryKey: googleDriveQueryKeys.status,
    queryFn: getGoogleDriveStatus,
    ...options,
  });
}

// ============================================================================
// Authentication Hooks
// ============================================================================

/**
 * Get Google OAuth URL for connection
 */
export function useGoogleDriveAuthUrl(
  options?: Omit<UseMutationOptions<string, Error, void>, "mutationFn">,
) {
  return useMutation<string, Error, void>({
    mutationFn: () => getGoogleDriveAuthUrl(),
    ...options,
  });
}

/**
 * Exchange OAuth code for tokens
 */
export function useExchangeGoogleDriveCode(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (code) => exchangeGoogleDriveCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleDriveQueryKeys.status });
    },
    ...options,
  });
}

/**
 * Disconnect Google Drive
 */
export function useGoogleDriveDisconnect(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: googleDriveDisconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleDriveQueryKeys.status });
      queryClient.invalidateQueries({ queryKey: googleDriveQueryKeys.backups });
    },
    ...options,
  });
}

// ============================================================================
// Sync Hooks
// ============================================================================

/**
 * Sync to Google Drive
 */
export function useGoogleDriveSync(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: googleDriveSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleDriveQueryKeys.backups });
    },
    ...options,
  });
}

// ============================================================================
// Backup Management Hooks
// ============================================================================

/**
 * List backup files in Google Drive
 */
export function useGoogleDriveBackups(
  options?: Omit<UseQueryOptions<DriveFile[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<DriveFile[], Error>({
    queryKey: googleDriveQueryKeys.backups,
    queryFn: googleDriveListBackups,
    ...options,
  });
}

/**
 * Restore from Google Drive backup
 */
export function useGoogleDriveRestore(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (fileId) => googleDriveRestore(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleDriveQueryKeys.backups });
    },
    ...options,
  });
}
