/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImportExportView } from "@/app/views/ImportExportView";

vi.mock("@/lib/api", () => ({
  exportData: vi.fn(),
  importData: vi.fn(),
}));

describe("ImportExportView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders import/export view", () => {
    render(<ImportExportView />);
    expect(screen.getByText("导入数据")).toBeInTheDocument();
    expect(screen.getByText("导出数据")).toBeInTheDocument();
  });

  it("renders import mode options", () => {
    render(<ImportExportView />);
    expect(screen.getByText("合并")).toBeInTheDocument();
    expect(screen.getByText("替换")).toBeInTheDocument();
    expect(screen.getByText("更新")).toBeInTheDocument();
  });

  it("renders export button", () => {
    render(<ImportExportView />);
    expect(screen.getByText("导出")).toBeInTheDocument();
  });

  it("renders import button", () => {
    render(<ImportExportView />);
    expect(screen.getByText("导入")).toBeInTheDocument();
  });
});
