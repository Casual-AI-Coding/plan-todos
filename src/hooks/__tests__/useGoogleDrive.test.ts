import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  googleDriveQueryKeys,
  useExchangeGoogleDriveCode,
  useGoogleDriveAuthUrl,
  useGoogleDriveBackups,
  useGoogleDriveDisconnect,
  useGoogleDriveRestore,
  useGoogleDriveStatus,
  useGoogleDriveSync,
} from "../useGoogleDrive";
import type { DriveFile, GoogleDriveStatus } from "@/lib/api/googleDrive";

vi.mock("@/lib/api/googleDrive", () => ({
  getGoogleDriveAuthUrl: vi.fn(),
  exchangeGoogleDriveCode: vi.fn(),
  getGoogleDriveStatus: vi.fn(),
  googleDriveDisconnect: vi.fn(),
  googleDriveSync: vi.fn(),
  googleDriveRestore: vi.fn(),
  googleDriveListBackups: vi.fn(),
}));

import {
  exchangeGoogleDriveCode,
  getGoogleDriveAuthUrl,
  getGoogleDriveStatus,
  googleDriveDisconnect,
  googleDriveListBackups,
  googleDriveRestore,
  googleDriveSync,
} from "@/lib/api/googleDrive";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const mockStatus: GoogleDriveStatus = {
  connected: true,
  email: "user@example.com",
  expires_at: 1_717_171_717,
};

const mockBackups: DriveFile[] = [
  {
    id: "file-1",
    name: "backup-1.db",
    mime_type: "application/octet-stream",
    modified_at: "2026-04-28T10:00:00Z",
    size: 1024,
  },
];

describe("useGoogleDrive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes the expected query keys", () => {
    expect(googleDriveQueryKeys.status).toEqual(["googleDrive", "status"]);
    expect(googleDriveQueryKeys.backups).toEqual(["googleDrive", "backups"]);
  });

  it("fetches Google Drive status", async () => {
    vi.mocked(getGoogleDriveStatus).mockResolvedValue(mockStatus);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useGoogleDriveStatus(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStatus);
    expect(getGoogleDriveStatus).toHaveBeenCalledTimes(1);
  });

  it("fetches backups", async () => {
    vi.mocked(googleDriveListBackups).mockResolvedValue(mockBackups);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useGoogleDriveBackups(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockBackups);
    expect(googleDriveListBackups).toHaveBeenCalledTimes(1);
  });

  it("gets the OAuth URL", async () => {
    vi.mocked(getGoogleDriveAuthUrl).mockResolvedValue(
      "https://accounts.google.com/o/oauth2/auth",
    );
    const queryClient = new QueryClient();

    const { result } = renderHook(() => useGoogleDriveAuthUrl(), {
      wrapper: createWrapper(queryClient),
    });

    let authUrl: string | undefined;
    await act(async () => {
      authUrl = await result.current.mutateAsync();
    });

    expect(getGoogleDriveAuthUrl).toHaveBeenCalledTimes(1);
    expect(authUrl).toBe("https://accounts.google.com/o/oauth2/auth");
  });

  it("exchanges the OAuth code and invalidates status", async () => {
    vi.mocked(exchangeGoogleDriveCode).mockResolvedValue(undefined);
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useExchangeGoogleDriveCode(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync("oauth-code");
    });

    expect(exchangeGoogleDriveCode).toHaveBeenCalledWith("oauth-code");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: googleDriveQueryKeys.status,
    });
  });

  it("disconnects and invalidates status and backups", async () => {
    vi.mocked(googleDriveDisconnect).mockResolvedValue(undefined);
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useGoogleDriveDisconnect(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(googleDriveDisconnect).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(1, {
      queryKey: googleDriveQueryKeys.status,
    });
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(2, {
      queryKey: googleDriveQueryKeys.backups,
    });
  });

  it("syncs and invalidates backups", async () => {
    vi.mocked(googleDriveSync).mockResolvedValue(undefined);
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useGoogleDriveSync(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(googleDriveSync).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: googleDriveQueryKeys.backups,
    });
  });

  it("restores from a backup and invalidates backups", async () => {
    vi.mocked(googleDriveRestore).mockResolvedValue(undefined);
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useGoogleDriveRestore(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync("file-1");
    });

    expect(googleDriveRestore).toHaveBeenCalledWith("file-1");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: googleDriveQueryKeys.backups,
    });
  });
});
