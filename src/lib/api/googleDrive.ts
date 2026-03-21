/**
 * Google Drive API
 *
 * API functions for Google Drive cloud sync with OAuth 2.0 authentication.
 */

import { invoke, withTauriError } from "./utils";

// ============================================================================
// Types
// ============================================================================

export interface GoogleDriveStatus {
  connected: boolean;
  email: string | null;
  expires_at: number | null;
}

export interface DriveFile {
  id: string;
  name: string;
  mime_type: string;
  modified_at: string;
  size: number | null;
}

// ============================================================================
// Authentication APIs
// ============================================================================

/**
 * Get Google OAuth authorization URL
 * Opens this URL in browser to initiate OAuth flow
 */
export async function getGoogleDriveAuthUrl(): Promise<string> {
  return withTauriError("获取 Google Drive 授权 URL", async () => {
    return invoke<string>("get_google_drive_auth_url");
  });
}

/**
 * Exchange authorization code for tokens
 * Called after OAuth callback with the code parameter
 */
export async function exchangeGoogleDriveCode(code: string): Promise<void> {
  return withTauriError("交换 Google Drive 授权码", async () => {
    return invoke<void>("exchange_google_drive_code", { code });
  });
}

/**
 * Get Google Drive connection status
 */
export async function getGoogleDriveStatus(): Promise<GoogleDriveStatus> {
  return withTauriError("获取 Google Drive 连接状态", async () => {
    return invoke<GoogleDriveStatus>("get_google_drive_status");
  });
}

/**
 * Disconnect Google Drive (clear stored tokens)
 */
export async function googleDriveDisconnect(): Promise<void> {
  return withTauriError("断开 Google Drive 连接", async () => {
    return invoke<void>("google_drive_disconnect");
  });
}

// ============================================================================
// Sync APIs
// ============================================================================

/**
 * Upload current database to Google Drive
 * Creates a backup with timestamp
 */
export async function googleDriveSync(): Promise<void> {
  return withTauriError("同步到 Google Drive", async () => {
    return invoke<void>("google_drive_sync");
  });
}

/**
 * Restore database from Google Drive backup
 */
export async function googleDriveRestore(fileId: string): Promise<void> {
  return withTauriError("从 Google Drive 恢复", async () => {
    return invoke<void>("google_drive_restore", { fileId });
  });
}

// ============================================================================
// File Management APIs
// ============================================================================

/**
 * List backup files in Google Drive
 */
export async function googleDriveListBackups(): Promise<DriveFile[]> {
  return withTauriError("列出 Google Drive 备份文件", async () => {
    return invoke<DriveFile[]>("google_drive_list_files");
  });
}

/**
 * Download a specific file from Google Drive
 */
export async function googleDriveDownload(fileId: string): Promise<string> {
  return withTauriError("下载 Google Drive 文件", async () => {
    return invoke<string>("google_drive_download", { fileId });
  });
}

/**
 * Upload a file to Google Drive
 */
export async function googleDriveUpload(
  filename: string,
  content: string,
): Promise<string> {
  return withTauriError("上传文件到 Google Drive", async () => {
    return invoke<string>("google_drive_upload", { filename, content });
  });
}
