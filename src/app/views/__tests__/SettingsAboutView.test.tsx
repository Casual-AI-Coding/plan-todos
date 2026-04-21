import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsAboutView } from "@/app/views/SettingsAboutView";
import { ToastProvider } from "@/components/ui/Toast";

describe("SettingsAboutView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  it("renders settings about view with title", () => {
    renderWithProvider(<SettingsAboutView />);
    expect(screen.getByText("设置 > 关于")).toBeInTheDocument();
  });

  it("renders project name", () => {
    renderWithProvider(<SettingsAboutView />);
    expect(screen.getByText("Plan Todos")).toBeInTheDocument();
  });

  it("renders tech stack section", () => {
    renderWithProvider(<SettingsAboutView />);
    expect(screen.getByText("技术栈")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Tauri")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("renders check update button", () => {
    renderWithProvider(<SettingsAboutView />);
    expect(screen.getByText("检查更新")).toBeInTheDocument();
  });

  it("renders links section", () => {
    renderWithProvider(<SettingsAboutView />);
    expect(screen.getByText("链接")).toBeInTheDocument();
    expect(screen.getByText("GitHub 仓库")).toBeInTheDocument();
    expect(screen.getByText("更新日志")).toBeInTheDocument();
  });
});
