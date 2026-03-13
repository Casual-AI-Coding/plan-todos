import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsAboutView } from "@/app/views/SettingsAboutView";

describe("SettingsAboutView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings about view with title", () => {
    render(<SettingsAboutView />);
    expect(screen.getByText("设置 > 关于")).toBeInTheDocument();
  });

  it("renders project name", () => {
    render(<SettingsAboutView />);
    expect(screen.getByText("Plan Todos")).toBeInTheDocument();
  });

  it("renders tech stack section", () => {
    render(<SettingsAboutView />);
    expect(screen.getByText("技术栈")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Tauri")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("renders check update button", () => {
    render(<SettingsAboutView />);
    expect(screen.getByText("检查更新")).toBeInTheDocument();
  });

  it("renders other section", () => {
    render(<SettingsAboutView />);
    expect(screen.getByText("其他")).toBeInTheDocument();
  });
});
