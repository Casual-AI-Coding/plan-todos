"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui";

export interface DataBackupSettingsProps {
  onExport?: () => Promise<void>;
  onImport?: (file: File) => Promise<void>;
}

export function DataBackupSettings({
  onExport,
  onImport,
}: DataBackupSettingsProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    if (!onExport || exporting) return;
    setExporting(true);
    setMessage(null);
    try {
      await onExport();
      setMessage({ type: "success", text: "导出成功" });
    } catch (e) {
      setMessage({
        type: "error",
        text: `导出失败: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
    setExporting(false);
  }

  async function handleImport(file: File) {
    if (!onImport || importing) return;
    setImporting(true);
    setMessage(null);
    try {
      await onImport(file);
      setMessage({ type: "success", text: "导入成功" });
    } catch (e) {
      setMessage({
        type: "error",
        text: `导入失败: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
        className="hidden"
      />

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleExport}
          disabled={exporting || !onExport}
        >
          {exporting ? "导出中..." : "导出数据 (JSON)"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing || !onImport}
        >
          {importing ? "导入中..." : "导入数据"}
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
