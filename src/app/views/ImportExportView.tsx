"use client";

import { useState, useRef } from "react";
import { Button, Card } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
import {
  exportData,
  importData,
  ExportData,
  ImportMode,
  ImportResult,
} from "@/lib/api";

interface ImportModeOption {
  value: ImportMode;
  label: string;
  description: string;
}

const importModes: ImportModeOption[] = [
  { value: "merge", label: "合并", description: "跳过重复数据，保留现有数据" },
  { value: "replace", label: "替换", description: "清空现有数据后导入" },
  { value: "update", label: "更新", description: "存在则更新，不存在则添加" },
];

export function ImportExportView() {
  const [mode, setMode] = useState<ImportMode>("update");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setMessage(null);
    try {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan-todos-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({
        type: "success",
        text: `导出成功！共 ${data.data.todos.length + data.data.tasks.length + data.data.plans.length} 条数据`,
      });
    } catch (e) {
      console.error(e);
      setMessage({
        type: "error",
        text: `导出失败: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
    setExporting(false);
  }

  async function handleImport(file: File) {
    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      const result = (await importData(data, mode)) as ImportResult;

      if (result.errors && result.errors.length > 0) {
        setMessage({
          type: "error",
          text: `导入完成: ${result.imported} 条, 跳过: ${result.skipped} 条, 错误: ${result.errors.length} 个`,
        });
      } else {
        setMessage({
          type: "success",
          text: `导入完成: ${result.imported} 条, 跳过: ${result.skipped} 条`,
        });
      }

      // Reload the page to refresh data
      if (result.imported > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      console.error(e);
      setMessage({
        type: "error",
        text: `导入失败: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
    setImporting(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}
            >
              <Icons.Download
                className="w-6 h-6"
                style={{ color: "#14b8a6" }}
              />
            </div>
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--color-text)" }}
              >
                导出数据
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                备份所有数据到本地
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-lg mb-4 text-sm"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          >
            <div className="flex items-start gap-2">
              <Icons.Info
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              />
              <span style={{ color: "var(--color-text-secondary)" }}>
                导出包含：Todos, Tasks, Plans, Targets, Steps, Milestones, Tags,
                Settings
              </span>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="primary"
            className="w-full gap-2"
          >
            <Icons.Download className="w-4 h-4" />
            {exporting ? "导出中..." : "导出数据"}
          </Button>
        </Card>

        {/* Import Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <Icons.Upload className="w-6 h-6" style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--color-text)" }}
              >
                导入数据
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                从备份文件恢复数据
              </p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={(e) =>
              e.target.files?.[0] && handleImport(e.target.files[0])
            }
            className="hidden"
          />

          {/* Import Mode Selection */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              导入模式
            </label>
            <div className="space-y-2">
              {importModes.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    mode === m.value
                      ? "border-teal-500"
                      : "border-transparent hover:border-gray-200"
                  }`}
                  style={{
                    backgroundColor:
                      mode === m.value
                        ? "rgba(20, 184, 166, 0.05)"
                        : "var(--color-bg-hover)",
                  }}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={mode === m.value}
                    onChange={() => setMode(m.value)}
                    className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${mode === m.value ? "text-teal-700" : ""}`}
                      style={{
                        color:
                          mode === m.value ? "#0d9488" : "var(--color-text)",
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {m.description}
                    </div>
                  </div>
                  {mode === m.value && (
                    <Icons.Check className="w-5 h-5 text-teal-500" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full gap-2"
          >
            <Icons.Upload className="w-4 h-4" />
            {importing ? "导入中..." : "选择文件导入"}
          </Button>
        </Card>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {message.type === "success" ? (
              <Icons.Check className="w-5 h-5" />
            ) : (
              <Icons.AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>{message.text}</div>
        </div>
      )}
    </div>
  );
}
